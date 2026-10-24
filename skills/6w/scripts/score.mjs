#!/usr/bin/env node
// Compute each W score from its ratings and active caps, then print the scoreboard.
//   node score.mjs <state.json>            print the scoreboard
//   node score.mjs <state.json> --write    validate, then write ws[w].score and overall back atomically
//   node score.mjs <state.json> --json     print the computed scores as JSON
//   node score.mjs - < draft.json          score a state piped on stdin; writes nothing
// Writing is idempotent: a second run produces identical bytes.

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { computeScores, renderScoreboard, applyScores, isMainModule } from "./scoring.mjs";
import { validateState } from "./validate.mjs";

export * from "./scoring.mjs";

function main(argv) {
	const [file, ...flags] = argv;
	if (!file || file === "--help" || file === "-h") {
		console.error("usage: node score.mjs <state.json|-> [--write] [--json]\n  Compute each W score from its ratings and active caps and print the scoreboard.\n  -        read the state from stdin and write nothing, for sessions that must not create files\n  --write  validate, then write ws[w].score and overall back atomically\n  --json   print the computed scores as JSON");
		process.exit(file ? 0 : 2);
	}
	const fromStdin = file === "-";
	if (fromStdin && flags.includes("--write")) {
		console.error("score.mjs: --write needs a file; stdin input is scored and printed only");
		process.exit(2);
	}
	let state;
	try {
		state = JSON.parse(readFileSync(fromStdin ? 0 : file, "utf8"));
	} catch (err) {
		console.error(`${fromStdin ? "stdin" : file}: ${err.code === "ENOENT" ? "file not found" : `not valid JSON (${err.message})`}`);
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
