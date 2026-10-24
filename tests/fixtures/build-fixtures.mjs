#!/usr/bin/env node
// Generate the behavioral fixtures under tests/fixtures/<case>/ from the two example states.
// Each case holds input.md (what the user said), notes.md (what the agent must and must not
// do, for human or LLM review), state.json (the state the session should reach) and
// expected.json (invariants that tests/fixtures.test.mjs checks deterministically).
// Rerun after changing the examples or the rubric: node tests/fixtures/build-fixtures.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeScores, applyScores, isMainModule } from "../../skills/6w/scripts/scoring.mjs";
import { validateState } from "../../skills/6w/scripts/validate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const load = (name) => JSON.parse(readFileSync(join(root, "examples", name, "state.json"), "utf8"));
const W = ["why", "who", "what", "which", "whether", "when"];

function finish(state) {
	applyScores(state, computeScores(state));
	const problems = validateState(state);
	if (problems.length) throw new Error(problems.join("\n"));
	return state;
}

function expectedFrom(state, extra) {
	const c = computeScores(state);
	return {
		overall: c.overall,
		scores: Object.fromEntries(W.map((w) => [w, c.ws[w].score])),
		statuses: Object.fromEntries(W.map((w) => [w, c.ws[w].status])),
		evidence: Object.fromEntries(W.map((w) => [w, c.ws[w].evidence])),
		...extra,
	};
}

export function buildFixtures() {
	const out = [];
	const write = (name, input, notes, state, extra) => {
		const dir = join(root, "tests/fixtures", name);
		mkdirSync(dir, { recursive: true });
		finish(state);
		writeFileSync(join(dir, "input.md"), input.trim() + "\n");
		writeFileSync(join(dir, "notes.md"), notes.trim() + "\n");
		writeFileSync(join(dir, "state.json"), JSON.stringify(state, null, 2) + "\n");
		writeFileSync(join(dir, "expected.json"), JSON.stringify(expectedFrom(state, extra), null, 2) + "\n");
		out.push(dir);
	};

	// 1. Vague idea: the opening message with nothing else.
	{
		const s = load("menulens-partial");
		write("vague-idea", `# Input

User, turn 1: "I want an app where you photograph a menu in a foreign country and it tells you what each dish is, flags allergens, and suggests what to order. Also save favorites, share with friends, work offline, show restaurant reviews. I want it before my trip in six weeks."

No attachments. Browsing unavailable.`, `# What the agent must do

- Draft all six Ws from the two sentences, every rating with evidence user, assumption or unknown. Nothing is source or observed.
- Mark every cap whose condition holds. All six hold here.
- Show the scoreboard, then ask about Why first: the workaround, because that cap is cheapest to clear.
- Produce no persona card. There is no context for one.

# What the agent must not do

- Invent a market size, a competitor price, a customer quote or a persona.
- Rate any sub-criterion above 2 on these two sentences except the core loop, which is clear.
- Ask more than two questions in the first turn.`, s, {
			activeCaps: 6,
			recordCounts: { personas: 0, requirements: 0, risks: 0 },
			noEvidenceAbove: "user",
			exportIncludes: ["No personas recorded", "Below the gate: WHY"],
			exportExcludes: ["Allergy traveler"],
		});
	}

	// 2. Polished unsupported pitch: confident claims, thin evidence.
	{
		const s = load("menulens-complete");
		s.metadata.projectId = "menulens-pitch";
		s.metadata.title = "MenuLens (pitch deck)";
		s.records.sources = [{ id: "SRC-001", title: "Twelve-slide pitch deck pasted as text", origin: "attachment", locator: "pasted text, turn 1", coverage: "partially-read", limitations: "Slides 9 to 12 were images and could not be read. Claims a 4 billion USD market and 'validated demand' with no method or sample described." }];
		for (const w of W) for (const r of s.ws[w].ratings) {
			if (r.evidence === "source" || r.evidence === "observed" || r.evidence === "user") r.evidence = "assumption";
			if (r.sources) r.sources = ["SRC-001"];
		}
		for (const list of Object.values(s.records)) for (const rec of list) {
			if (rec.evidence && rec.evidence !== "unknown") rec.evidence = "assumption";
			if (rec.sources) rec.sources = ["SRC-001"];
		}
		s.records.risks.push({ id: "RISK-004", title: "The deck's market size and 'validated demand' have no method behind them", severity: "high", status: "open", mitigation: "Treat both as hypotheses. Ask for the survey or interviews behind 'validated'. Run EXP-001 before pricing decisions.", exposure: "The whole Who and Why case rests on the founder's assertion.", evidence: "assumption", links: ["SRC-001", "EXP-001"] });
		s.ws.why.ratings[0].rationale = "The deck asserts the pain with a 4 billion USD market figure and no source. The claim is recorded as an assumption. The pain itself is plausible and clearly stated.";
		s.ws.why.links = [...(s.ws.why.links ?? []), "RISK-004"];
		write("polished-unsupported-pitch", `# Input

User, turn 1: pastes the text of a twelve-slide pitch deck for MenuLens. The deck states a 4 billion USD market, "validated demand", a 4.99 USD trip pass and a six-week plan. Slides 9 to 12 are images.

User, turn 1: "Review this with 6W. We're ready to build."`, `# What the agent must do

- Record the deck as one source with coverage partially-read and name the slides it could not read.
- Keep clarity ratings where the deck is clear, but mark every claim's evidence as assumption, because a deck is a claim, not a proof.
- Add a risk that the market size and "validated demand" have no method behind them, and link it to the source.
- Show the scoreboard with assumption in every evidence cell, so a high score is never read as a proven case.

# What the agent must not do

- Upgrade evidence to source because the claim appeared in a document.
- Repeat the 4 billion USD figure as a fact anywhere in the outputs.
- Treat "we're ready to build" as a reason to skip the walkthrough.`, s, {
			allEvidenceIn: ["assumption", "unknown"],
			recordIncludes: { risks: ["RISK-004"] },
			sourceCoverage: { "SRC-001": "partially-read" },
			exportIncludes: ["partially-read", "RISK-004"],
		});
	}

	// 3. Finish immediately: the user stops at turn 1.
	{
		const s = load("menulens-partial");
		s.session.phase = 2;
		s.session.turns = 1;
		s.session.overrides = W.map((w) => ({ w, reason: "User chose to finish at turn 1", at: "2026-10-23T14:05:00+07:00" }));
		s.records.assumptions = W.flatMap((w, i) => s.ws[w].ratings.filter((r) => r.rating <= 1).slice(0, 1).map((r) => ({ id: `ASM-${String(i + 1).padStart(3, "0")}`, title: `${w.toUpperCase()} ${r.criterion} is unresolved`, status: "untested", implication: `Any decision that depends on ${r.criterion} is provisional. Revisit before building on it.`, evidence: "unknown" })));
		write("finish-immediately", `# Input

User, turn 1: the vague-idea opening message.

User, turn 2: "Finish now and export."`, `# What the agent must do

- Run assumption lock: every unresolved sub-criterion becomes an assumption or a risk with its implication.
- Mark all six Ws LOCKED. Scores stay exactly where they were.
- Export a partial package. START-HERE.md says which Ws are below the gate and lists the assumptions. Empty sections say they are empty.
- Say in the reply that the package is partial and what the next three questions would have been.

# What the agent must not do

- Raise any score to make the export look complete.
- Fill personas, requirements or tasks with invented content.
- Refuse to export. Finishing is the user's call.`, s, {
			allStatuses: "LOCKED",
			sameScoresAs: "vague-idea",
			recordCounts: { personas: 0, requirements: 0 },
			minRecordCounts: { assumptions: 6 },
			exportIncludes: ["Below the gate: WHY", "No personas recorded", "No requirements recorded"],
		});
	}

	// 4. Override a score: the user locks What below the gate.
	{
		const s = load("menulens-complete");
		s.metadata.projectId = "menulens-override";
		const anti = s.ws.what.ratings.find((r) => r.criterion === "explicit-anti-scope");
		anti.rating = 2;
		anti.evidence = "assumption";
		anti.rationale = "The user named two features to cut and declined to decide on the other four. Recorded as partial.";
		s.ws.what.caps[0] = { id: "what-unbounded-scope", active: true, reason: "Six candidate features remain and the anti-scope list is partial" };
		s.session.overrides = [{ w: "what", reason: "User said 'good enough, move on' at turn 6", at: "2026-10-23T14:40:00+07:00" }];
		s.records.assumptions.push({ id: "ASM-003", title: "The four undecided features stay out of v1", status: "untested", implication: "If one of them turns out to be needed for the core loop, the When estimate is wrong.", evidence: "assumption", links: ["DEC-003"] });
		write("override-score", `# Input

Turn 6, agent asks which of six remaining features to cut.

User: "Good enough, move on."`, `# What the agent must do

- Mark WHAT as LOCKED with the user's words as the reason and the time.
- Leave the WHAT score where the ratings put it. The cap stays active because its condition still holds.
- Record the undecided features as an assumption with its implication.
- Move to WHICH in the same turn.

# What the agent must not do

- Raise the anti-scope rating to make the override look validated.
- Argue with the user or ask the same question again.
- Treat LOCKED as OK anywhere in the outputs.`, s, {
			statusIs: { what: "LOCKED" },
			scoreAtMost: { what: 65 },
			recordIncludes: { assumptions: ["ASM-003"] },
			exportIncludes: ["LOCKED"],
		});
	}

	// 5. Late audience change: Who is superseded, dependents flagged.
	{
		const s = load("menulens-complete");
		s.metadata.projectId = "menulens-pivot";
		s.session.phase = 1;
		s.session.turns = 12;
		s.records.decisions.find((d) => d.id === "DEC-002").status = "superseded";
		s.records.decisions.push({ id: "DEC-005", title: "Beachhead changes to vegetarians and vegans traveling abroad", status: "proposed", rationale: "At turn 12 the user said two friends who are vegan asked for it and that the allergy market felt too narrow. This is a new hypothesis, not evidence, so Who is re-rated and every record that depended on the allergy persona is flagged for review.", alternatives: ["Keep the allergy beachhead and add vegetarians as a second segment"], evidence: "user", affects: ["PERSONA-001", "PERSONA-002", "EDGE-003", "EDGE-004", "REQ-001", "REQ-003", "RISK-001", "EXP-001", "DEC-002"] });
		s.records.personas.find((p) => p.id === "PERSONA-001").evidence = "assumption";
		const who = s.ws.who;
		who.summary = "Beachhead under review: vegetarians and vegans abroad proposed at turn 12, replacing allergy travelers";
		who.ratings[0].rating = 2; who.ratings[0].evidence = "assumption"; who.ratings[0].rationale = "The new segment is named but its context, workflow and the moment the product appears are not yet described. PERSONA-001 describes the old segment.";
		who.ratings[1].rating = 1; who.ratings[1].evidence = "unknown"; who.ratings[1].rationale = "The allergy trigger and objections do not transfer. Vegans have a different trigger (menus that hide animal products) and a weaker safety motive.";
		who.ratings[2].rating = 1; who.ratings[2].evidence = "unknown"; who.ratings[2].rationale = "The r/Celiac channels do not reach the new segment.";
		who.ratings[3].rating = 2; who.ratings[3].evidence = "assumption"; who.ratings[3].rationale = "Anti-persona needs rework: allergy travelers may now be the secondary segment, not excluded.";
		who.openQuestions = ["Describe the vegan traveler's worst meal abroad. What did they do?", "Where do fifty of them talk to each other, and can you post there?"];
		who.links = [...(who.links ?? []), "DEC-005"];
		for (const w of ["what", "whether"]) {
			const n = `Needs review after DEC-005: the allergy flags and the confirm-with-staff flow were designed for the previous beachhead.`;
			s.ws[w].notes = n;
		}
		write("late-audience-change", `# Input

Turn 12, after all six Ws reached the gate.

User: "Actually, two vegan friends asked for this and the allergy thing feels too narrow. Let's make it for vegetarians and vegans instead."`, `# What the agent must do

- Record a new proposed decision that supersedes DEC-002, keeping DEC-002 in the history with status superseded.
- List every record that depended on the allergy persona in the new decision's affects, and mark the What and Whether Ws as needing review.
- Re-rate Who honestly. The new segment is a hypothesis, so Who drops below the gate and the next questions are about it.
- Explain what changed and what still holds: the core loop and the form factor survive, the flags, the confirmation flow and the channels do not.

# What the agent must not do

- Silently rewrite PERSONA-001 into a vegan persona and keep the Who score.
- Delete DEC-002 or reuse its ID.
- Keep the old success metric and experiments unchanged without flagging them.`, s, {
			statusIs: { who: "CAP" },
			scoreBelowGate: ["who"],
			decisionStatus: { "DEC-002": "superseded", "DEC-005": "proposed" },
			affectsInclude: { "DEC-005": ["PERSONA-001", "REQ-001", "EXP-001", "DEC-002"] },
			exportIncludes: ["superseded", "DEC-005"],
		});
		s.ws.who.caps[0] = { id: "who-everyone", active: true, reason: "New segment named without context, trigger or channel; treated as unnamed until described" };
		finish(s);
		writeFileSync(join(root, "tests/fixtures/late-audience-change/state.json"), JSON.stringify(s, null, 2) + "\n");
		writeFileSync(join(root, "tests/fixtures/late-audience-change/expected.json"), JSON.stringify(expectedFrom(s, {
			statusIs: { who: "CAP" },
			scoreBelowGate: ["who"],
			decisionStatus: { "DEC-002": "superseded", "DEC-005": "proposed" },
			affectsInclude: { "DEC-005": ["PERSONA-001", "REQ-001", "EXP-001", "DEC-002"] },
			exportIncludes: ["superseded", "DEC-005"],
		}), null, 2) + "\n");
	}

	// 6. Impossible date: the scope does not fit the capacity.
	{
		const s = load("menulens-complete");
		s.metadata.projectId = "menulens-rush";
		const when = s.ws.when;
		when.summary = "Five hours a week and a trip in two weeks: four features on a web app do not fit";
		when.ratings[0].rating = 4; when.ratings[0].rationale = "About 5 hours a week, stated plainly: evenings only, with a product launch at work in the same fortnight.";
		when.ratings[1].rating = 3; when.ratings[1].rationale = "A 48-hour proof of concept is still feasible: it is the whole budget.";
		when.ratings[2].rating = 1; when.ratings[2].rationale = "Departure in 14 days with 10 hours of capacity. REQ-001 to REQ-004 need roughly 60 to 75 hours. No buffer, no definition of done that fits.";
		when.ratings[2].evidence = "user";
		when.ratings[3].rating = 2; when.ratings[3].rationale = "The user has not chosen between cutting scope, moving the date or adding capacity. Three concrete alternatives were offered.";
		when.caps[0] = { id: "when-scope-exceeds-capacity", active: true, reason: "60 to 75 hours of scope against 10 hours of capacity before the date" };
		when.openQuestions = ["Cut to the proof of concept only (REQ-002 with a hardcoded profile) and use it on the trip as a test, not a product?", "Keep the scope and target the trip after this one?", "Add capacity: a weekend of focused time or a second builder?"];
		write("impossible-date", `# Input

Turn 10, When.

User: "I can do about five hours a week. The trip is in two weeks."`, `# What the agent must do

- Say plainly that the four requirements do not fit ten hours, with the arithmetic.
- Activate the When cap and show it on the scoreboard.
- Offer three alternatives: cut scope to the proof of concept, move the date to the next trip, or add capacity. Do not pick for the user.
- Record the chosen alternative as a decision when the user answers.

# What the agent must not do

- Pretend the date is fine or soften the arithmetic.
- Lower the When ratings for bandwidth: the user was clear about capacity, and clarity is what the rating measures.
- Cut requirements on the user's behalf.`, s, {
			statusIs: { when: "CAP" },
			scoreAtMost: { when: 65 },
			openQuestionsAtLeast: { when: 3 },
			exportIncludes: ["do not fit"],
		});
	}
	return out;
}

if (isMainModule(import.meta.url)) {
	for (const d of buildFixtures()) console.log(d);
}
