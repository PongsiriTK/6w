import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, symlinkSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { roundHalfUp, scoreW, computeScores, renderScoreboard, applyScores, weakestEvidence } from "./score.mjs";
import { wByKey } from "./rubric.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));

// Expected scores computed by hand from the ratings in each example. If the formula drifts,
// these fail even though --write would have "fixed" the stored numbers.
const EXPECTED = {
	"menulens-partial": { why: 28, who: 14, what: 39, which: 33, whether: 18, when: 14, overall: 24 },
	"menulens-complete": { why: 94, who: 94, what: 95, which: 95, whether: 94, when: 94, overall: 94 },
};

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
	assert.equal(r.capActive, true);
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

test("an unknown cap id neither changes the score nor counts as active", () => {
	const w = wByKey("what");
	const r = scoreW(w, wState([4, 4, 4, 4], [{ id: "nonsense", active: true }]));
	assert.equal(r.score, 100);
	assert.equal(r.capActive, false);
});

test("a missing rating counts as 0, empty ratings give 0 and evidence unknown, all fours give 100", () => {
	const w = wByKey("what");
	assert.equal(scoreW(w, { ratings: [] }).score, 0);
	assert.equal(weakestEvidence({ ratings: [] }), "unknown");
	assert.equal(scoreW(w, wState([4, 4, 4, 4])).score, 100);
});

test("example scores match the hand-computed expectations", () => {
	for (const [name, want] of Object.entries(EXPECTED)) {
		const c = computeScores(load(name));
		for (const k of ["why", "who", "what", "which", "whether", "when"]) assert.equal(c.ws[k].score, want[k], `${name} ${k}`);
		assert.equal(c.overall, want.overall, `${name} overall`);
	}
});

test("statuses: OK at the gate, LOCKED only below the gate, CAP below the gate, .. otherwise, focus skips locked", () => {
	const state = load("menulens-partial");
	state.session.overrides = [{ w: "why", reason: "test" }];
	const c = computeScores(state);
	assert.equal(c.ws.why.status, "LOCKED");
	assert.equal(c.ws.who.status, "CAP");
	assert.equal(c.focus, "who");

	state.ws.who.caps[0].active = false;
	assert.equal(computeScores(state).ws.who.status, "..");

	const done = load("menulens-complete");
	done.session.gate = 94;
	const cd = computeScores(done);
	for (const k of Object.keys(cd.ws)) assert.equal(cd.ws[k].status, "OK", `${k} at or above gate 94`);
	assert.equal(cd.focus, null);

	done.session.gate = 95;
	done.session.overrides = [{ w: "why", reason: "x" }];
	const c95 = computeScores(done);
	assert.equal(c95.ws.why.status, "LOCKED");
	assert.equal(c95.ws.what.status, "OK");
	assert.equal(c95.ws.who.status, "..");
	assert.equal(c95.focus, "who");

	done.session.gate = 90;
	done.session.overrides = [{ w: "why", reason: "x" }];
	assert.equal(computeScores(done).ws.why.status, "OK", "an override on a W above the gate does not show LOCKED");
});

test("weakest evidence across the four ratings is shown per W", () => {
	const c = computeScores(load("menulens-partial"));
	assert.equal(c.ws.whether.evidence, "unknown");
	assert.equal(computeScores(load("menulens-complete")).ws.who.evidence, "user");
});

test("scoreboard renders every W, the gate, and the focus line, ASCII only", () => {
	const out = renderScoreboard(load("menulens-partial"));
	for (const label of ["WHY", "WHO", "WHAT", "WHICH", "WHETHER", "WHEN"]) assert.match(out, new RegExp(`^  ${label}\\s+\\d+`, "m"));
	assert.match(out, /gate 90/);
	assert.match(out, /^Focus: WHY, 28\/100\. Needs \+62\.$/m);
	assert.doesNotMatch(out, /[^\x00-\x7F]/);
	assert.match(renderScoreboard(load("menulens-complete")), /^All six Ws are at the gate or locked by the user\.$/m);
});

test("--write is idempotent, atomic on failure, and refuses an invalid state", () => {
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
	assert.equal(once, readFileSync(file, "utf8"));
	const written = JSON.parse(once);
	for (const k of Object.keys(EXPECTED["menulens-partial"])) {
		if (k === "overall") assert.equal(written.overall, 24);
		else assert.equal(written.ws[k].score, EXPECTED["menulens-partial"][k]);
	}

	const bad = JSON.parse(once);
	bad.ws.why.ratings[0].rating = 40;
	writeFileSync(file, JSON.stringify(bad, null, 2) + "\n");
	const before = readFileSync(file, "utf8");
	const r = spawnSync("node", [script, file, "--write"], { encoding: "utf8" });
	assert.equal(r.status, 1);
	assert.match(r.stderr, /not written/);
	assert.equal(readFileSync(file, "utf8"), before, "file untouched after a refused write");
});

test("the CLI runs through a symlinked directory and a path containing # and %", () => {
	const dir = mkdtempSync(join(tmpdir(), "6w #100% "));
	symlinkSync(here, join(dir, "scripts"));
	const r = spawnSync("node", [join(dir, "scripts", "score.mjs"), "/nonexistent.json"], { encoding: "utf8" });
	assert.equal(r.status, 1, `expected exit 1, got ${r.status}; stderr: ${r.stderr}`);
	assert.match(r.stderr, /file not found/);
});

test("applyScores writes only score fields", () => {
	const strip = (s) => JSON.stringify({ ...s, overall: undefined, ws: Object.fromEntries(Object.entries(s.ws).map(([k, v]) => [k, { ...v, score: undefined }])) });
	const state = load("menulens-partial");
	const before = strip(state);
	applyScores(state);
	assert.equal(strip(state), before);
});
