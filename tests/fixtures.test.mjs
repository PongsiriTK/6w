import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { computeScores } from "../skills/6w/scripts/scoring.mjs";
import { validateState } from "../skills/6w/scripts/validate.mjs";
import { buildBundle } from "../skills/6w/scripts/export.mjs";
import { EVIDENCE_LEVELS } from "../skills/6w/scripts/rubric.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures");
const cases = readdirSync(fixtures, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const load = (name) => JSON.parse(readFileSync(join(fixtures, name, "state.json"), "utf8"));
const expected = (name) => JSON.parse(readFileSync(join(fixtures, name, "expected.json"), "utf8"));

test("there are six fixtures and each has input, notes, state and expectations", () => {
	assert.deepEqual(cases.sort(), ["finish-immediately", "impossible-date", "late-audience-change", "override-score", "polished-unsupported-pitch", "vague-idea"]);
	for (const c of cases) for (const f of ["input.md", "notes.md", "state.json", "expected.json"]) {
		assert.ok(existsSync(join(fixtures, c, f)), `${c}/${f}`);
		assert.ok(readFileSync(join(fixtures, c, f), "utf8").trim().length > 20, `${c}/${f} is empty`);
	}
});

for (const c of cases) {
	test(`fixture ${c} validates and meets its expectations`, () => {
		const state = load(c);
		const exp = expected(c);
		assert.deepEqual(validateState(state), []);
		const comp = computeScores(state);
		assert.equal(comp.overall, exp.overall);
		for (const [w, v] of Object.entries(exp.scores)) assert.equal(comp.ws[w].score, v, `${w} score`);
		for (const [w, v] of Object.entries(exp.statuses)) assert.equal(comp.ws[w].status, v, `${w} status`);
		for (const [w, v] of Object.entries(exp.evidence)) assert.equal(comp.ws[w].evidence, v, `${w} evidence`);

		if (exp.activeCaps !== undefined) assert.equal(Object.values(state.ws).flatMap((w) => (w.caps ?? []).filter((x) => x.active)).length, exp.activeCaps);
		if (exp.allStatuses) for (const w of Object.keys(comp.ws)) assert.equal(comp.ws[w].status, exp.allStatuses, w);
		if (exp.statusIs) for (const [w, v] of Object.entries(exp.statusIs)) assert.equal(comp.ws[w].status, v, w);
		if (exp.scoreAtMost) for (const [w, v] of Object.entries(exp.scoreAtMost)) assert.ok(comp.ws[w].score <= v, `${w} ${comp.ws[w].score} <= ${v}`);
		if (exp.scoreBelowGate) for (const w of exp.scoreBelowGate) assert.ok(comp.ws[w].score < comp.gate, w);
		if (exp.sameScoresAs) {
			const other = computeScores(load(exp.sameScoresAs));
			for (const w of Object.keys(comp.ws)) assert.equal(comp.ws[w].score, other.ws[w].score, `${w} unchanged by the override`);
		}
		if (exp.noEvidenceAbove) {
			const max = EVIDENCE_LEVELS.indexOf(exp.noEvidenceAbove);
			for (const w of Object.values(state.ws)) for (const r of w.ratings) assert.ok(EVIDENCE_LEVELS.indexOf(r.evidence) <= max, `${r.criterion} ${r.evidence}`);
		}
		if (exp.allEvidenceIn) for (const w of Object.values(state.ws)) for (const r of w.ratings) assert.ok(exp.allEvidenceIn.includes(r.evidence), `${r.criterion} ${r.evidence}`);
		if (exp.recordCounts) for (const [k, n] of Object.entries(exp.recordCounts)) assert.equal((state.records[k] ?? []).length, n, k);
		if (exp.minRecordCounts) for (const [k, n] of Object.entries(exp.minRecordCounts)) assert.ok((state.records[k] ?? []).length >= n, k);
		if (exp.recordIncludes) for (const [k, ids] of Object.entries(exp.recordIncludes)) for (const id of ids) assert.ok(state.records[k].some((r) => r.id === id), `${k} has ${id}`);
		if (exp.sourceCoverage) for (const [id, cov] of Object.entries(exp.sourceCoverage)) assert.equal(state.records.sources.find((s) => s.id === id).coverage, cov);
		if (exp.decisionStatus) for (const [id, st] of Object.entries(exp.decisionStatus)) assert.equal(state.records.decisions.find((d) => d.id === id).status, st, id);
		if (exp.affectsInclude) for (const [id, ids] of Object.entries(exp.affectsInclude)) for (const a of ids) assert.ok(state.records.decisions.find((d) => d.id === id).affects.includes(a), `${id} affects ${a}`);
		if (exp.openQuestionsAtLeast) for (const [w, n] of Object.entries(exp.openQuestionsAtLeast)) assert.ok((state.ws[w].openQuestions ?? []).length >= n, w);

		const { files } = buildBundle(state, { generatedAt: "2026-01-01T00:00:00Z" });
		const all = [...files.values()].join("\n");
		for (const s of exp.exportIncludes ?? []) assert.ok(all.includes(s), `export mentions ${JSON.stringify(s)}`);
		for (const s of exp.exportExcludes ?? []) assert.ok(!all.includes(s), `export must not mention ${JSON.stringify(s)}`);
	});
}

test("the committed fixtures are what build-fixtures.mjs produces", async () => {
	const before = Object.fromEntries(cases.map((c) => [c, readFileSync(join(fixtures, c, "state.json"), "utf8")]));
	const { buildFixtures } = await import("./fixtures/build-fixtures.mjs");
	buildFixtures();
	for (const c of cases) assert.equal(readFileSync(join(fixtures, c, "state.json"), "utf8"), before[c], `${c} is stale; run node tests/fixtures/build-fixtures.mjs`);
});
