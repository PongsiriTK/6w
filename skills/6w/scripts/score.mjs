#!/usr/bin/env node
// Compute each W score from its ratings and active caps, then print the scoreboard.
//   node score.mjs <state.json>            print the scoreboard
//   node score.mjs <state.json> --write    validate, then write ws[w].score and overall back atomically
//   node score.mjs <state.json> --json     print the computed scores as JSON
// Writing is idempotent: a second run produces identical bytes.

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { computeScores, renderScoreboard, applyScores, isMainModule } from "./scoring.mjs";
import { validateState } from "./validate.mjs";

export * from "./scoring.mjs";

function main(argv) {
	const [file, ...flags] = argv;
	if (!file) {
		console.error("usage: node score.mjs <state.json> [--write] [--json]");
		process.exit(2);
	}
	let state;
	try {
		state = JSON.parse(readFileSync(file, "utf8"));
	} catch (err) {
		console.error(`${file}: ${err.code === "ENOENT" ? "file not found" : `not valid JSON (${err.message})`}`);
		process.exit(1);
	}
	if (flags.includes("--write")) {
		const errors = validateState(state, { scores: false });
		if (errors.length) {
			console.error(`${file}: not written, ${errors.length} problem(s)`);
			for (const e of errors) console.error(`  - ${e}`);
			process.exit(1);
		}
	}
	const computed = computeScores(state);
	if (flags.includes("--write")) {
		applyScores(state, computed);
		const tmp = `${file}.tmp`;
		writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
		renameSync(tmp, file);
	}
	if (flags.includes("--json")) console.log(JSON.stringify(computed, null, 2));
	else console.log(renderScoreboard(state, computed));
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
