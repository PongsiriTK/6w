#!/usr/bin/env node
// Load, save, checkpoint and migrate .6w/state.json.
//   node state.mjs show <state.json>              validate and print the scoreboard
//   node state.mjs checkpoint <state.json>        copy to <dir>/checkpoints/<time>-rev<n>.json, keep the last 10
//   node state.mjs migrate <state.json> [--write]  move fields the schema does not know into extensions
// Saves are atomic (write a temp file, rename), validated first, and refuse to overwrite a
// revision other than the one the caller loaded.

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, readdirSync, unlinkSync, copyFileSync } from "node:fs";
import { dirname, join, basename } from "node:path";
import { computeScores, applyScores, renderScoreboard, isMainModule } from "./scoring.mjs";
import { validateState, SCHEMA } from "./validate.mjs";
import { W_KEYS } from "./rubric.mjs";

export class StateError extends Error {
	constructor(message, problems = []) {
		super(message);
		this.problems = problems;
	}
}

export function loadState(file) {
	let state;
	try {
		state = JSON.parse(readFileSync(file, "utf8"));
	} catch (err) {
		throw new StateError(err.code === "ENOENT" ? `${file}: file not found` : `${file}: not valid JSON (${err.message})`);
	}
	const problems = validateState(state);
	if (problems.length) throw new StateError(`${file}: invalid state`, problems);
	return { state, revision: state.metadata.revision ?? 0 };
}

export function saveState(file, state, { expectedRevision, now = new Date().toISOString() } = {}) {
	if (existsSync(file) && expectedRevision !== undefined) {
		let current;
		try {
			current = JSON.parse(readFileSync(file, "utf8")).metadata?.revision ?? 0;
		} catch {
			current = undefined;
		}
		if (current !== expectedRevision) throw new StateError(`${file}: revision is ${current}, expected ${expectedRevision}; reload before saving`);
	}
	const problems = validateState(state, { scores: false });
	if (problems.length) throw new StateError(`${file}: not saved, invalid state`, problems);
	state.metadata.revision = (state.metadata.revision ?? 0) + 1;
	state.metadata.updatedAt = now;
	applyScores(state, computeScores(state));
	const tmp = `${file}.tmp`;
	writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
	renameSync(tmp, file);
	return state.metadata.revision;
}

export function checkpoint(file, { dir = join(dirname(file), "checkpoints"), keep = 10, now = new Date().toISOString() } = {}) {
	const { revision } = loadState(file);
	mkdirSync(dir, { recursive: true });
	const name = `${now.replace(/[:.]/g, "-")}-rev${revision}.json`;
	copyFileSync(file, join(dir, name));
	const all = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
	for (const old of all.slice(0, Math.max(0, all.length - keep))) unlinkSync(join(dir, old));
	return join(dir, name);
}

const KNOWN_TOP = new Set(Object.keys(SCHEMA.properties));
const KNOWN_W = new Set(Object.keys(SCHEMA.$defs.w.properties));

// The only schema version so far is 0.1, so migration means tidying a file written by a
// newer or looser writer: unknown fields move into extensions instead of failing validation.
export function migrate(input) {
	const state = structuredClone(input);
	const moved = [];
	if (state.schemaVersion !== undefined && state.schemaVersion !== "0.1") {
		throw new StateError(`schemaVersion ${JSON.stringify(state.schemaVersion)} is not one this version can migrate`);
	}
	for (const k of Object.keys(state)) {
		if (!KNOWN_TOP.has(k)) {
			state.extensions = { ...(state.extensions ?? {}), [k]: state[k] };
			delete state[k];
			moved.push(k);
		}
	}
	for (const w of W_KEYS) {
		const ws = state.ws?.[w];
		if (!ws || typeof ws !== "object") continue;
		for (const k of Object.keys(ws)) {
			if (!KNOWN_W.has(k)) {
				ws.extensions = { ...(ws.extensions ?? {}), [k]: ws[k] };
				delete ws[k];
				moved.push(`ws.${w}.${k}`);
			}
		}
	}
	return { state, moved };
}

function main(argv) {
	const [cmd, file, ...flags] = argv;
	const usage = () => {
		console.error("usage: node state.mjs show|checkpoint|migrate <state.json> [--write]");
		process.exit(2);
	};
	if (!cmd || !file) usage();
	try {
		if (cmd === "show") {
			const { state } = loadState(file);
			console.log(renderScoreboard(state));
		} else if (cmd === "checkpoint") {
			console.log(`checkpoint written: ${checkpoint(file)}`);
		} else if (cmd === "migrate") {
			const raw = JSON.parse(readFileSync(file, "utf8"));
			const { state, moved } = migrate(raw);
			if (!moved.length) console.log(`${file}: nothing to migrate`);
			else console.log(`${file}: moved into extensions: ${moved.join(", ")}`);
			if (flags.includes("--write") && moved.length) {
				const tmp = `${file}.tmp`;
				writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n");
				renameSync(tmp, file);
			}
		} else usage();
	} catch (err) {
		if (err instanceof StateError) {
			console.error(err.message);
			for (const p of err.problems) console.error(`  - ${p}`);
			process.exit(1);
		}
		throw err;
	}
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
