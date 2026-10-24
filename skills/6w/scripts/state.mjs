#!/usr/bin/env node
// Load, save, checkpoint and migrate .6w/state.json.
//   node state.mjs show <state.json>              validate and print the scoreboard
//   node state.mjs checkpoint <state.json>        copy to <dir>/checkpoints/, keep the last 10
//   node state.mjs migrate <state.json> [--write]  move fields the schema does not know into extensions
// A save holds a lock file, refuses to overwrite a revision other than the one the state was
// loaded with, validates, checkpoints the current file, writes a unique temp file, fsyncs it
// and renames it into place.

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, readdirSync, unlinkSync, openSync, closeSync, fsyncSync, statSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { computeScores, applyScores, renderScoreboard, isMainModule } from "./scoring.mjs";
import { validateState, SCHEMA, resolveRef } from "./validate.mjs";

export class StateError extends Error {
	constructor(message, problems = []) {
		super(message);
		this.problems = problems;
	}
}

const STALE_LOCK_MS = 30_000;

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

function acquireLock(file) {
	const lock = `${file}.lock`;
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const fd = openSync(lock, "wx");
			writeFileSync(fd, String(process.pid));
			closeSync(fd);
			return () => rmSync(lock, { force: true });
		} catch (err) {
			if (err.code !== "EEXIST") throw err;
			const age = Date.now() - statSync(lock).mtimeMs;
			if (age > STALE_LOCK_MS) { rmSync(lock, { force: true }); continue; }
			throw new StateError(`${file}: another save holds ${lock}; retry in a moment`);
		}
	}
	throw new StateError(`${file}: could not acquire ${lock}`);
}

export function saveState(file, state, { expectedRevision, now = new Date().toISOString(), keep = 10 } = {}) {
	const expected = expectedRevision ?? state.metadata.revision ?? 0;
	const release = acquireLock(file);
	const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2, 8)}.tmp`;
	try {
		let currentText = null;
		if (existsSync(file)) {
			currentText = readFileSync(file, "utf8");
			let current;
			try {
				current = JSON.parse(currentText).metadata?.revision ?? 0;
			} catch {
				current = undefined;
			}
			if (current !== expected) throw new StateError(`${file}: revision is ${current}, expected ${expected}; reload before saving`);
		}
		const problems = validateState(state, { scores: false });
		if (problems.length) throw new StateError(`${file}: not saved, invalid state`, problems);
		if (currentText !== null) writeCheckpoint(file, currentText, expected, { now, keep });
		state.metadata.revision = expected + 1;
		state.metadata.updatedAt = now;
		applyScores(state, computeScores(state));
		const fd = openSync(tmp, "w");
		writeFileSync(fd, JSON.stringify(state, null, 2) + "\n");
		fsyncSync(fd);
		closeSync(fd);
		renameSync(tmp, file);
		return state.metadata.revision;
	} finally {
		rmSync(tmp, { force: true });
		release();
	}
}

const CHECKPOINT_RE = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z-rev\d{6}\.json$/;

function writeCheckpoint(file, text, revision, { dir = join(dirname(file), "checkpoints"), keep = 10, now = new Date().toISOString() } = {}) {
	mkdirSync(dir, { recursive: true });
	const stamp = new Date(now).toISOString().replace(/[:.]/g, "-");
	const name = `${stamp}-rev${String(revision).padStart(6, "0")}.json`;
	writeFileSync(join(dir, name), text);
	const all = readdirSync(dir).filter((f) => CHECKPOINT_RE.test(f)).sort();
	for (const old of all.slice(0, Math.max(0, all.length - keep))) unlinkSync(join(dir, old));
	return join(dir, name);
}

export function checkpoint(file, opts = {}) {
	const text = readFileSync(file, "utf8");
	const { revision } = loadState(file);
	return writeCheckpoint(file, text, revision, opts);
}

// The only schema version so far is 0.1, so migration means tidying a file written by a
// newer or looser writer: every field the schema does not know, at any depth, moves into
// top-level extensions under its JSON path. Nothing is dropped and nothing is overwritten.
export function migrate(input) {
	const state = structuredClone(input);
	if (state.schemaVersion !== undefined && state.schemaVersion !== "0.1") {
		throw new StateError(`schemaVersion ${JSON.stringify(state.schemaVersion)} is not one this version can migrate`);
	}
	const moved = [];
	const park = (path, value) => {
		state.extensions = state.extensions ?? {};
		let key = path;
		for (let n = 1; Object.hasOwn(state.extensions, key); n++) key = `${path}~${n}`;
		state.extensions[key] = value;
		moved.push(path);
	};
	const walk = (schema, value, path) => {
		if (schema.$ref) schema = resolveRef(SCHEMA, schema.$ref);
		if (!value || typeof value !== "object") return;
		if (Array.isArray(value)) {
			if (schema.items) value.forEach((v, i) => walk(schema.items, v, `${path}[${i}]`));
			return;
		}
		const props = schema.properties ?? {};
		for (const k of Object.keys(value)) {
			const childPath = path ? `${path}.${k}` : k;
			if (Object.hasOwn(props, k)) walk(props[k], value[k], childPath);
			else if (schema.additionalProperties === false && !(path === "" && k === "extensions")) { park(childPath, value[k]); delete value[k]; }
		}
	};
	const top = { ...SCHEMA, properties: { ...SCHEMA.properties } };
	walk(top, state, "");
	return { state, moved };
}

function main(argv) {
	const [cmd, file, ...flags] = argv;
	const usage = () => {
		console.error("usage: node state.mjs show|checkpoint|migrate <state.json> [--write]");
		process.exit(2);
	};
	if (cmd === "--help" || cmd === "-h") {
		console.error("usage: node state.mjs show|checkpoint|migrate <state.json> [--write]\n  show        validate and print the scoreboard\n  checkpoint  copy the file to checkpoints/, keep the last 10\n  migrate     move unknown fields into extensions; --write saves");
		process.exit(0);
	}
	if (!cmd || !file) usage();
	try {
		if (cmd === "show") {
			const { state } = loadState(file);
			console.log(renderScoreboard(state));
		} else if (cmd === "checkpoint") {
			console.log(`checkpoint written: ${checkpoint(file)}`);
		} else if (cmd === "migrate") {
			let raw;
			try {
				raw = JSON.parse(readFileSync(file, "utf8"));
			} catch (err) {
				throw new StateError(err.code === "ENOENT" ? `${file}: file not found` : `${file}: not valid JSON (${err.message})`);
			}
			const { state, moved } = migrate(raw);
			if (!moved.length) console.log(`${file}: nothing to migrate`);
			else console.log(`${file}: moved into extensions: ${moved.join(", ")}`);
			const problems = validateState(state, { scores: false });
			if (problems.length) throw new StateError(`${file}: still invalid after migration, not written`, problems);
			if (flags.includes("--write") && moved.length) {
				const tmp = `${file}.${process.pid}.tmp`;
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
