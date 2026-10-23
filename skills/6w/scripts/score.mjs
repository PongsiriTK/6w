#!/usr/bin/env node
// Compute each W score from its ratings and active caps, then print the scoreboard.
//   node score.mjs <state.json>            print the scoreboard
//   node score.mjs <state.json> --write    also write ws[w].score and overall back
//   node score.mjs <state.json> --json     print the computed scores as JSON
// Writing is idempotent: a second run produces identical bytes.

import { readFileSync, writeFileSync } from "node:fs";
import { WS, EVIDENCE_LEVELS, DEFAULT_GATE } from "./rubric.mjs";

export function roundHalfUp(n) {
	return Math.floor(n + 0.5);
}

export function scoreW(w, wState) {
	let raw = 0;
	for (const c of w.criteria) {
		const r = wState.ratings.find((x) => x.criterion === c.key);
		raw += (c.weight * (r?.rating ?? 0)) / 4;
	}
	const activeCaps = (wState.caps ?? []).filter((c) => c.active).map((c) => w.caps.find((rc) => rc.id === c.id)?.max).filter((m) => m !== undefined);
	const rounded = roundHalfUp(raw);
	const score = activeCaps.length ? Math.min(rounded, ...activeCaps) : rounded;
	return { raw, score, capped: activeCaps.length > 0 && score < rounded };
}

export function weakestEvidence(wState) {
	let worst = EVIDENCE_LEVELS.length - 1;
	for (const r of wState.ratings) {
		const i = EVIDENCE_LEVELS.indexOf(r.evidence ?? "unknown");
		if (i >= 0 && i < worst) worst = i;
	}
	return EVIDENCE_LEVELS[worst];
}

export function computeScores(state) {
	const gate = state.session?.gate ?? DEFAULT_GATE;
	const locked = new Set((state.session?.overrides ?? []).map((o) => o.w));
	const result = { gate, ws: {}, overall: 0, focus: null };
	let sum = 0;
	for (const w of WS) {
		const wState = state.ws[w.key];
		const { raw, score, capped } = scoreW(w, wState);
		let status = "..";
		if (locked.has(w.key)) status = "LOCKED";
		else if (score >= gate) status = "OK";
		else if (capped || (wState.caps ?? []).some((c) => c.active)) status = "CAP";
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
	const filled = Math.round(computed.overall / 5);
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

function main(argv) {
	const [file, ...flags] = argv;
	if (!file) {
		console.error("usage: node score.mjs <state.json> [--write] [--json]");
		process.exit(2);
	}
	const state = JSON.parse(readFileSync(file, "utf8"));
	const computed = computeScores(state);
	if (flags.includes("--write")) {
		applyScores(state, computed);
		writeFileSync(file, JSON.stringify(state, null, 2) + "\n");
	}
	if (flags.includes("--json")) console.log(JSON.stringify(computed, null, 2));
	else console.log(renderScoreboard(state, computed));
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) main(process.argv.slice(2));
