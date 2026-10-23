import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateState, validateExportManifest, checkSchema, assertSupportedKeywords, SCHEMA } from "./validate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));
const script = join(here, "validate.mjs");

test("every example state validates", () => {
	const dirs = readdirSync(examples, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
	assert.ok(dirs.length >= 2);
	for (const name of dirs) {
		const errors = validateState(load(name));
		assert.deepEqual(errors, [], `${name}: ${errors.join("; ")}`);
	}
});

test("the CLI exits 0 with ok on a valid file and 1 with the problems on a broken one", () => {
	const ok = spawnSync("node", [script, join(examples, "menulens-complete/state.json")], { encoding: "utf8" });
	assert.equal(ok.status, 0, ok.stderr);
	assert.match(ok.stdout, /ok \(27 records, scores consistent\)/);

	const dir = mkdtempSync(join(tmpdir(), "6w-"));
	const file = join(dir, "state.json");
	const bad = load("menulens-complete");
	bad.records.requirements[0].links.push("PERSONA-999");
	writeFileSync(file, JSON.stringify(bad));
	const r = spawnSync("node", [script, file], { encoding: "utf8" });
	assert.equal(r.status, 1);
	assert.match(r.stderr, /PERSONA-999 does not resolve/);

	const missing = spawnSync("node", [script, join(dir, "nope.json")], { encoding: "utf8" });
	assert.equal(missing.status, 1);
	assert.match(missing.stderr, /file not found/);
});

test("a link to a missing record is reported with its path, including the single persona field on an edge case", () => {
	const state = load("menulens-complete");
	state.records.requirements[0].links.push("PERSONA-999");
	state.records.edges[0].persona = "PERSONA-998";
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("records.requirements[0].links") && e.includes("PERSONA-999")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("records.edges[0].persona") && e.includes("PERSONA-998")), errors.join("\n"));
});

test("a duplicate ID and a wrong prefix are both reported", () => {
	const state = load("menulens-complete");
	state.records.risks.push({ ...state.records.risks[0] });
	state.records.tasks.push({ id: "REQ-900", title: "misfiled" });
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("is not unique")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("REQ-900") && e.includes("must start with TASK-")), errors.join("\n"));
});

test("caps: foreign id, duplicate id and an active cap without a reason are rejected", () => {
	const state = load("menulens-partial");
	state.ws.why.caps.push({ id: "who-everyone", active: true, reason: "x" });
	state.ws.who.caps.push({ id: "who-everyone", active: false });
	delete state.ws.what.caps[0].reason;
	const errors = validateState(state, { scores: false });
	assert.ok(errors.some((e) => e.includes("ws.why.caps[1].id who-everyone is not a cap")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("ws.who.caps[1].id who-everyone appears more than once")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("ws.what.caps[0]: an active cap needs a reason")), errors.join("\n"));
});

test("criteria must match the rubric exactly and in order", () => {
	const state = load("menulens-partial");
	const r = state.ws.when.ratings;
	[r[0], r[1]] = [r[1], r[0]];
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.startsWith("ws.when.ratings")), errors.join("\n"));
});

test("a stored score that disagrees with the ratings is rejected, unless scores are skipped", () => {
	const state = load("menulens-complete");
	state.ws.why.score = 12;
	assert.ok(validateState(state).some((e) => e.includes("ws.why.score 12")));
	assert.deepEqual(validateState(state, { scores: false }), []);
});

test("schema violations name the path for every implemented keyword", () => {
	const state = load("menulens-partial");
	state.ws.why.ratings[0].rating = 7;
	state.session.mode = "turbo";
	state.metadata.extra = true;
	state.schemaVersion = "9";
	state.metadata.projectId = "Bad Id";
	state.metadata.title = "";
	state.ws.who.ratings.pop();
	state.session.gate = "90";
	delete state.capabilities;
	const errors = validateState(state);
	const expect = [
		["state.ws.why.ratings[0].rating", "maximum"],
		["state.session.mode", "turbo"],
		["state.metadata: unknown property extra"],
		["state.schemaVersion", 'must be "0.1"'],
		["state.metadata.projectId", "does not match"],
		["state.metadata.title", "shorter than"],
		["state.ws.who.ratings", "at least 4"],
		["state.session.gate", "expected integer"],
		["state: missing required capabilities"],
	];
	for (const parts of expect) assert.ok(errors.some((e) => parts.every((p) => e.includes(p))), `${parts.join(" + ")}\n${errors.join("\n")}`);
});

test("inherited object members cannot bypass additionalProperties or satisfy required", () => {
	const state = load("menulens-partial");
	state.metadata.constructor = "x";
	state.metadata.toString = "y";
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("unknown property constructor")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("unknown property toString")), errors.join("\n"));

	const errs2 = [];
	checkSchema({ type: "object", required: ["toString"], properties: {} }, {}, "x", errs2);
	assert.ok(errs2.some((e) => e.includes("missing required toString")));
});

test("the validator refuses a schema keyword it does not implement", () => {
	assert.throws(() => assertSupportedKeywords({ type: "array", uniqueItems: true }), /unsupported schema keyword uniqueItems/);
	assert.throws(() => assertSupportedKeywords({ properties: { a: { oneOf: [] } } }), /properties\.a: unsupported schema keyword oneOf/);
	assert.doesNotThrow(() => assertSupportedKeywords(SCHEMA));
});

test("export manifest schema accepts a well-formed manifest and rejects a bad hash", () => {
	const manifest = {
		schemaVersion: "0.1",
		projectId: "menulens",
		blueprintVersion: "0.0.2",
		stateHash: `sha256:${"a".repeat(64)}`,
		generatedAt: "2026-10-23T00:00:00Z",
		files: [{ path: "6w-blueprint.html", sha256: "b".repeat(64), kind: "html" }],
	};
	assert.deepEqual(validateExportManifest(manifest), []);
	manifest.stateHash = "md5:abc";
	assert.ok(validateExportManifest(manifest).some((e) => e.includes("manifest.stateHash")));
});
