// Pure scoring functions and the CLI helper. No I/O on state files here; score.mjs is the CLI.

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { WS, EVIDENCE_LEVELS, DEFAULT_GATE } from "./rubric.mjs";

export function roundHalfUp(n) {
	return Math.floor(n + 0.5);
}

export function scoreW(w, wState) {
	let raw = 0;
	for (const c of w.criteria) {
		const r = (wState.ratings ?? []).find((x) => x.criterion === c.key);
		raw += (c.weight * (r?.rating ?? 0)) / 4;
	}
	const activeCaps = (wState.caps ?? [])
		.filter((c) => c.active)
		.map((c) => w.caps.find((rc) => rc.id === c.id)?.max)
		.filter((m) => m !== undefined);
	const rounded = roundHalfUp(raw);
	const score = activeCaps.length ? Math.min(rounded, ...activeCaps) : rounded;
	return { raw, score, capActive: activeCaps.length > 0, capped: activeCaps.length > 0 && score < rounded };
}

export function weakestEvidence(wState) {
	const ratings = wState.ratings ?? [];
	if (ratings.length === 0) return "unknown";
	let worst = EVIDENCE_LEVELS.length - 1;
	for (const r of ratings) {
		const i = EVIDENCE_LEVELS.indexOf(r.evidence ?? "unknown");
		if (i >= 0 && i < worst) worst = i;
	}
	return EVIDENCE_LEVELS[worst];
}

// Status per BLUEPRINT 4.7: OK at or above the gate, LOCKED when the user locked a W below
// the gate, CAP when a resolved cap is active below the gate, otherwise in progress.
export function computeScores(state) {
	const gate = state.session?.gate ?? DEFAULT_GATE;
	const locked = new Set((state.session?.overrides ?? []).map((o) => o.w));
	const result = { gate, ws: {}, overall: 0, focus: null };
	let sum = 0;
	for (const w of WS) {
		const wState = state.ws?.[w.key] ?? { ratings: [] };
		const { raw, score, capActive } = scoreW(w, wState);
		let status = "..";
		if (score >= gate) status = "OK";
		else if (locked.has(w.key)) status = "LOCKED";
		else if (capActive) status = "CAP";
		result.ws[w.key] = { raw, score, status, evidence: weakestEvidence(wState), note: wState.summary ?? "" };
		sum += score;
		if (!result.focus && status !== "OK" && status !== "LOCKED") result.focus = w.key;
	}
	result.overall = roundHalfUp(sum / WS.length);
	return result;
}

const STAGE_LABEL = { explore: "explore", prototype: "prototype", "build-mvp": "build MVP", pilot: "pilot" };

export function renderScoreboard(state, computed = computeScores(state)) {
	const stage = STAGE_LABEL[state.session?.stage] ?? state.session?.stage ?? "unset";
	const mode = state.session?.mode ?? "quick";
	const filled = Math.min(20, Math.max(0, Math.round(computed.overall / 5)));
	const bar = "#".repeat(filled) + ".".repeat(20 - filled);
	const lines = [];
	lines.push(`6W PRODUCT FOUNDATION${" ".repeat(22)}gate ${computed.gate}   stage: ${stage}   mode: ${mode}`);
	lines.push(`overall ${String(computed.overall).padStart(2)}/100  [${bar}]`);
	lines.push("");
	lines.push("  W        score  status  evidence     note");
	for (const w of WS) {
		const r = computed.ws[w.key];
		const note = r.note.length > 58 ? r.note.slice(0, 55) + "..." : r.note;
		lines.push(`  ${w.label.padEnd(8)} ${String(r.score).padStart(3)}    ${r.status.padEnd(7)} ${r.evidence.padEnd(12)} ${note}`);
	}
	lines.push("");
	if (computed.focus) {
		const r = computed.ws[computed.focus];
		lines.push(`Focus: ${computed.focus.toUpperCase()}, ${r.score}/100. Needs +${computed.gate - r.score}.`);
	} else {
		lines.push("All six Ws are at the gate or locked by the user.");
	}
	return lines.join("\n");
}

export function applyScores(state, computed = computeScores(state)) {
	for (const w of WS) state.ws[w.key].score = computed.ws[w.key].score;
	state.overall = computed.overall;
	return state;
}

export function isMainModule(metaUrl, argv1 = process.argv[1]) {
	if (!argv1) return false;
	try {
		return realpathSync(argv1) === realpathSync(fileURLToPath(metaUrl));
	} catch {
		return false;
	}
}
