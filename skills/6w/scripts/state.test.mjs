import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadState, saveState, checkpoint, migrate, StateError } from "./state.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));
const tmpFile = (state) => {
	const dir = mkdtempSync(join(tmpdir(), "6w-state-"));
	const file = join(dir, "state.json");
	writeFileSync(file, JSON.stringify(state, null, 2) + "\n");
	return file;
};

test("loadState validates and reports revision 0 for a file without one", () => {
	const { state, revision } = loadState(tmpFile(load("menulens-complete")));
	assert.equal(revision, 0);
	assert.equal(state.metadata.projectId, "menulens");
	const bad = load("menulens-complete");
	bad.ws.why.ratings[0].rating = 9;
	assert.throws(() => loadState(tmpFile(bad)), (e) => e instanceof StateError && e.problems.some((p) => p.includes("rating")));
});

test("saveState bumps the revision, stamps updatedAt, recomputes scores and writes atomically", () => {
	const file = tmpFile(load("menulens-partial"));
	const { state } = loadState(file);
	state.ws.who.ratings[0].rating = 4;
	state.ws.who.caps[0].active = false;
	const rev = saveState(file, state, { expectedRevision: 0, now: "2026-10-24T00:00:00Z" });
	assert.equal(rev, 1);
	const saved = JSON.parse(readFileSync(file, "utf8"));
	assert.equal(saved.metadata.revision, 1);
	assert.equal(saved.metadata.updatedAt, "2026-10-24T00:00:00Z");
	assert.equal(saved.ws.who.score, 36, "score recomputed on save: 30 + 6.25 + 0 + 0 = 36.25");
	assert.ok(!existsSync(`${file}.tmp`));
});

test("saveState refuses to overwrite a revision the caller did not load", () => {
	const file = tmpFile(load("menulens-partial"));
	const a = loadState(file);
	const b = loadState(file);
	saveState(file, a.state, { expectedRevision: a.revision });
	assert.throws(() => saveState(file, b.state, { expectedRevision: b.revision }), /revision is 1, expected 0/);
	assert.equal(JSON.parse(readFileSync(file, "utf8")).metadata.revision, 1);
});

test("saveState refuses an invalid state and leaves the file untouched", () => {
	const file = tmpFile(load("menulens-partial"));
	const before = readFileSync(file, "utf8");
	const { state } = loadState(file);
	state.session.mode = "turbo";
	assert.throws(() => saveState(file, state), (e) => e instanceof StateError && e.problems.length > 0);
	assert.equal(readFileSync(file, "utf8"), before);
});

test("checkpoint copies the file, names it by time and revision, and keeps only the last N", () => {
	const file = tmpFile(load("menulens-partial"));
	const dir = join(dirname(file), "checkpoints");
	for (let i = 0; i < 4; i++) checkpoint(file, { dir, keep: 3, now: `2026-10-24T00:00:0${i}.000Z` });
	const names = readdirSync(dir).sort();
	assert.equal(names.length, 3);
	assert.match(names[0], /^2026-10-24T00-00-01-000Z-rev0\.json$/);
	assert.equal(readFileSync(join(dir, names[2]), "utf8"), readFileSync(file, "utf8"));
});

test("migrate moves unknown top-level and per-W fields into extensions and leaves known fields alone", () => {
	const raw = load("menulens-partial");
	raw.futureField = { a: 1 };
	raw.ws.why.mood = "tense";
	const { state, moved } = migrate(raw);
	assert.deepEqual(moved.sort(), ["futureField", "ws.why.mood"]);
	assert.deepEqual(state.extensions, { futureField: { a: 1 } });
	assert.deepEqual(state.ws.why.extensions, { mood: "tense" });
	assert.equal(state.futureField, undefined);
	assert.equal(raw.futureField.a, 1, "input is not mutated");
	assert.throws(() => migrate({ ...raw, schemaVersion: "0.2" }), /not one this version can migrate/);
	assert.deepEqual(migrate(load("menulens-complete")).moved, []);
});

test("the CLI shows, checkpoints and migrates", () => {
	const script = join(here, "state.mjs");
	const raw = load("menulens-partial");
	raw.extra = true;
	const file = tmpFile(raw);
	const show = spawnSync("node", [script, "show", file], { encoding: "utf8" });
	assert.equal(show.status, 1, "unknown field fails validation before migration");
	const mig = spawnSync("node", [script, "migrate", file, "--write"], { encoding: "utf8" });
	assert.equal(mig.status, 0, mig.stderr);
	assert.match(mig.stdout, /moved into extensions: extra/);
	const show2 = spawnSync("node", [script, "show", file], { encoding: "utf8" });
	assert.equal(show2.status, 0, show2.stderr);
	assert.match(show2.stdout, /6W PRODUCT FOUNDATION/);
	const cp = spawnSync("node", [script, "checkpoint", file], { encoding: "utf8" });
	assert.equal(cp.status, 0, cp.stderr);
	assert.match(cp.stdout, /checkpoint written: .*rev0\.json/);
});
