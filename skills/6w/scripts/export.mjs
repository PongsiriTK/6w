#!/usr/bin/env node
// Export the whole bundle from one validated state: 6w-blueprint.html at the project root,
// the ten Markdown files and export-manifest.json under .6w/handoff/.
//   node export.mjs <state.json> <project-root> [--generated-at <iso>] [--diagrams-dir <dir>]
// Everything renders into a temporary directory first and is checked (manifest schema, every
// file present and non-empty, one state hash everywhere). Only then does it replace the
// previous bundle, file by file through rename, so a failed export leaves the old bundle intact.

import { readFileSync, writeFileSync, mkdirSync, renameSync, rmSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, posix } from "node:path";
import { isMainModule } from "./scoring.mjs";
import { validateState, validateExportManifest } from "./validate.mjs";
import { renderHtml, stateHash } from "./render.mjs";
import { renderHandoff, HANDOFF_FILES } from "./handoff.mjs";
import { loadDiagrams } from "./diagrams.mjs";

export const BLUEPRINT_VERSION = "0.1.1";
export const HTML_NAME = "6w-blueprint.html";
export const HANDOFF_DIR = posix.join(".6w", "handoff");
export const MANIFEST_NAME = "export-manifest.json";

const sha = (s) => createHash("sha256").update(s).digest("hex");

export function buildBundle(state, { generatedAt = new Date().toISOString(), blueprintVersion = BLUEPRINT_VERSION, diagramsDir } = {}) {
	const problems = validateState(state);
	if (problems.length) throw Object.assign(new Error("invalid state"), { problems });
	const hash = stateHash(state);
	const diagrams = loadDiagrams(state, { dir: diagramsDir });
	const files = new Map();
	files.set(HTML_NAME, renderHtml(state, { generatedAt, blueprintVersion, diagrams, hash }));
	const md = renderHandoff(state, { generatedAt, blueprintVersion, hash, diagrams });
	for (const name of HANDOFF_FILES) {
		if (!md[name] || md[name].trim().length < 50) throw new Error(`${name}: empty render`);
		if (!md[name].includes(hash)) throw new Error(`${name}: missing state hash`);
		files.set(posix.join(HANDOFF_DIR, name), md[name]);
	}
	const manifest = {
		schemaVersion: "0.1",
		projectId: state.metadata.projectId,
		blueprintVersion,
		rubricVersion: state.rubricVersion,
		stateHash: hash,
		generatedAt,
		files: [...files].map(([path, content]) => ({ path, sha256: sha(content), kind: path.endsWith(".html") ? "html" : "markdown" })),
		validation: { ok: true, problems: [], diagrams: Object.fromEntries(Object.entries(diagrams).map(([t, d]) => [t, d.source])) },
	};
	const mp = validateExportManifest(manifest);
	if (mp.length) throw Object.assign(new Error("invalid manifest"), { problems: mp });
	files.set(posix.join(HANDOFF_DIR, MANIFEST_NAME), JSON.stringify(manifest, null, 2) + "\n");
	return { files, manifest, hash };
}

// If an earlier export died between its two swaps, the live copy may be missing while the
// .prev copy survives. Put it back before doing anything else.
export function recoverBundle(projectRoot) {
	const restored = [];
	for (const [live, prev] of [[join(projectRoot, HANDOFF_DIR), join(projectRoot, `${HANDOFF_DIR}.prev`)], [join(projectRoot, HTML_NAME), join(projectRoot, `${HTML_NAME}.prev`)]]) {
		if (!existsSync(live) && existsSync(prev)) {
			renameSync(prev, live);
			restored.push(live);
		}
	}
	return restored;
}

export function exportBundle(state, projectRoot, opts = {}) {
	const { files, manifest, hash } = buildBundle(state, opts);
	recoverBundle(projectRoot);
	const tmp = join(projectRoot, ".6w", `.export-${process.pid}-${Date.now()}`);
	mkdirSync(tmp, { recursive: true });
	const handoffLive = join(projectRoot, HANDOFF_DIR);
	const handoffPrev = `${handoffLive}.prev`;
	const htmlLive = join(projectRoot, HTML_NAME);
	const htmlPrev = `${htmlLive}.prev`;
	const moved = { handoff: false, html: false, newHandoff: false, newHtml: false };
	try {
		for (const [path, content] of files) {
			const abs = join(tmp, ...path.split("/"));
			mkdirSync(dirname(abs), { recursive: true });
			writeFileSync(abs, content);
		}
		for (const [path, content] of files) {
			if (readFileSync(join(tmp, ...path.split("/")), "utf8") !== content) throw new Error(`${path}: readback mismatch`);
		}
		mkdirSync(dirname(handoffLive), { recursive: true });
		for (const p of [handoffPrev, htmlPrev]) if (existsSync(p)) rmSync(p, { recursive: true, force: true });
		try {
			if (existsSync(handoffLive)) { renameSync(handoffLive, handoffPrev); moved.handoff = true; }
			if (existsSync(htmlLive)) { renameSync(htmlLive, htmlPrev); moved.html = true; }
			renameSync(join(tmp, ...HANDOFF_DIR.split("/")), handoffLive); moved.newHandoff = true;
			renameSync(join(tmp, HTML_NAME), htmlLive); moved.newHtml = true;
			const check = bundleIsConsistent(projectRoot);
			if (!check.ok) throw Object.assign(new Error("exported bundle failed its consistency check"), { problems: check.problems });
		} catch (err) {
			if (moved.newHtml) rmSync(htmlLive, { recursive: true, force: true });
			if (moved.newHandoff) rmSync(handoffLive, { recursive: true, force: true });
			if (moved.html) renameSync(htmlPrev, htmlLive);
			if (moved.handoff) renameSync(handoffPrev, handoffLive);
			throw err;
		}
		for (const p of [handoffPrev, htmlPrev]) if (existsSync(p)) rmSync(p, { recursive: true, force: true });
	} finally {
		rmSync(tmp, { recursive: true, force: true });
	}
	return { manifest, hash, written: [...files.keys()] };
}

export function bundleIsConsistent(projectRoot) {
	const manifestPath = join(projectRoot, ...HANDOFF_DIR.split("/"), MANIFEST_NAME);
	if (!existsSync(manifestPath)) return { ok: false, problems: ["no manifest"] };
	let manifest;
	try {
		manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	} catch (err) {
		return { ok: false, problems: [`manifest is not valid JSON (${err.message})`] };
	}
	const problems = validateExportManifest(manifest);
	if (problems.length) return { ok: false, problems, manifest };
	for (const f of manifest.files) {
		const p = join(projectRoot, ...f.path.split("/"));
		if (!existsSync(p)) problems.push(`${f.path}: missing`);
		else if (sha(readFileSync(p, "utf8")) !== f.sha256) problems.push(`${f.path}: content differs from the manifest`);
	}
	const html = join(projectRoot, HTML_NAME);
	if (existsSync(html)) {
		const h = readFileSync(html, "utf8").match(/name="6w-state-hash" content="([^"]+)"/)?.[1];
		if (h !== manifest.stateHash) problems.push(`${HTML_NAME}: state hash ${h} differs from manifest ${manifest.stateHash}`);
	}
	const handoffDir = join(projectRoot, ...HANDOFF_DIR.split("/"));
	const extra = existsSync(handoffDir) ? readdirSync(handoffDir).filter((n) => n !== MANIFEST_NAME && !manifest.files.some((f) => f.path.endsWith(`/${n}`))) : [];
	for (const n of extra) problems.push(`${HANDOFF_DIR}/${n}: not in the manifest`);
	return { ok: problems.length === 0, problems, manifest };
}

function main(argv) {
	const [file, root, ...flags] = argv;
	if (!file || file === "--help" || file === "-h" || !root) {
		console.error("usage: node export.mjs <state.json> <project-root> [--generated-at <iso>] [--diagrams-dir <dir>]\n  Export 6w-blueprint.html and .6w/handoff/ from one validated state, atomically.\n  --diagrams-dir  folder holding archify output as <type>.html or <type>.svg");
		process.exit(file === "--help" || file === "-h" ? 0 : 2);
	}
	const flag = (k) => (flags.indexOf(k) >= 0 ? flags[flags.indexOf(k) + 1] : undefined);
	let state;
	try {
		state = JSON.parse(readFileSync(file, "utf8"));
	} catch (err) {
		console.error(`${file}: ${err.code === "ENOENT" ? "file not found" : `not valid JSON (${err.message})`}`);
		process.exit(1);
	}
	try {
		const { written, hash, manifest } = exportBundle(state, root, { generatedAt: flag("--generated-at"), diagramsDir: flag("--diagrams-dir") });
		console.log(`exported ${written.length} files to ${root} (state ${hash})`);
		for (const w of written) console.log(`  ${w}`);
		console.log(`diagrams: ${Object.entries(manifest.validation.diagrams).map(([t, s]) => `${t}=${s}`).join(", ")}`);
	} catch (err) {
		console.error(`${file}: not exported, ${err.message}`);
		for (const p of err.problems ?? []) console.error(`  - ${p}`);
		process.exit(1);
	}
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
