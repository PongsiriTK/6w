import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { roundHalfUp, scoreW, computeScores, renderScoreboard, applyScores } from "./score.mjs";
import { wByKey } from "./rubric.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));

function wState(ratings, caps = []) {
	const w = wByKey("what");
	return {
		summary: "",
		ratings: w.criteria.map((c, i) => ({ criterion: c.key, rating: ratings[i], rationale: "r", evidence: "user" })),
		caps,
	};
}

test("rounding is half up, not banker's", () => {
	assert.equal(roundHalfUp(62.5), 63);
	assert.equal(roundHalfUp(63.5), 64);
	assert.equal(roundHalfUp(63.75), 64);
	assert.equal(roundHalfUp(63.25), 63);
});

test("worked example from the rubric: 4,3,0,3 on What is 64 and stays 64 under the 65 cap", () => {
	const w = wByKey("what");
	const r = scoreW(w, wState([4, 3, 0, 3], [{ id: "what-unbounded-scope", active: true }]));
	assert.equal(r.raw, 63.75);
	assert.equal(r.score, 64);
	assert.equal(r.capped, false, "cap above the raw score does not bind");
});

test("a cap binds when raw exceeds it and lifts when cleared", () => {
	const w = wByKey("what");
	const capped = scoreW(w, wState([4, 3, 3, 3], [{ id: "what-unbounded-scope", active: true }]));
	assert.equal(capped.score, 65);
	assert.equal(capped.capped, true);
	const cleared = scoreW(w, wState([4, 3, 3, 3], [{ id: "what-unbounded-scope", active: false }]));
	assert.equal(cleared.score, 83);
	assert.equal(cleared.capped, false);
});

test("a missing rating counts as 0 and all fours give 100", () => {
	const w = wByKey("what");
	assert.equal(scoreW(w, { ratings: [] }).score, 0);
	assert.equal(scoreW(w, wState([4, 4, 4, 4])).score, 100);
});

test("statuses: OK at the gate, CAP when a cap is active below the gate, LOCKED on override, focus is the first open W", () => {
	const state = load("menulens-partial");
	state.session.gate = 90;
	state.session.overrides = [{ w: "why", reason: "test" }];
	const c = computeScores(state);
	assert.equal(c.ws.why.status, "LOCKED");
	assert.equal(c.ws.who.status, "CAP");
	assert.equal(c.focus, "who", "focus skips the locked W");
	const done = load("menulens-complete");
	const cd = computeScores(done);
	for (const k of Object.keys(cd.ws)) assert.equal(cd.ws[k].status, "OK", `${k} should be OK`);
	assert.equal(cd.focus, null);
});

test("weakest evidence across the four ratings is shown per W", () => {
	const state = load("menulens-partial");
	const c = computeScores(state);
	assert.equal(c.ws.whether.evidence, "unknown");
});

test("scoreboard renders every W, the gate, and the focus line", () => {
	const state = load("menulens-partial");
	const out = renderScoreboard(state);
	for (const label of ["WHY", "WHO", "WHAT", "WHICH", "WHETHER", "WHEN"]) assert.match(out, new RegExp(`^  ${label}\\s+\\d+`, "m"));
	assert.match(out, /gate 90/);
	assert.match(out, /^Focus: WHY, \d+\/100\. Needs \+\d+\.$/m);
	assert.doesNotMatch(out, /[^\x00-\x7F]/, "ASCII only");
});

test("--write is idempotent and matches the computed scores", () => {
	const dir = mkdtempSync(join(tmpdir(), "6w-"));
	const file = join(dir, "state.json");
	const state = load("menulens-partial");
	for (const k of Object.keys(state.ws)) delete state.ws[k].score;
	delete state.overall;
	writeFileSync(file, JSON.stringify(state, null, 2) + "\n");
	const script = join(here, "score.mjs");
	execFileSync("node", [script, file, "--write"]);
	const once = readFileSync(file, "utf8");
	execFileSync("node", [script, file, "--write"]);
	const twice = readFileSync(file, "utf8");
	assert.equal(once, twice);
	const written = JSON.parse(twice);
	const computed = computeScores(written);
	for (const k of Object.keys(computed.ws)) assert.equal(written.ws[k].score, computed.ws[k].score);
	assert.equal(written.overall, computed.overall);
});

test("applyScores writes only score fields", () => {
	const state = load("menulens-partial");
	const before = JSON.stringify({ ...state, overall: undefined, ws: Object.fromEntries(Object.entries(state.ws).map(([k, v]) => [k, { ...v, score: undefined }])) });
	applyScores(state);
	const after = JSON.stringify({ ...state, overall: undefined, ws: Object.fromEntries(Object.entries(state.ws).map(([k, v]) => [k, { ...v, score: undefined }])) });
	assert.equal(before, after);
});
