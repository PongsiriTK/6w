#!/usr/bin/env node
// Repository gate. Run with `npm test`.
// Checks: manifests parse, every path a manifest names exists and is relative,
// one version string across .version-bump.json, SKILL.md frontmatter and size,
// every relative Markdown link resolves, and no em dash in authored Markdown.

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const fail = (msg) => failures.push(msg);
const rel = (p) => relative(root, p).split(sep).join("/");

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (err) {
		fail(`${rel(path)}: not valid JSON (${err.message})`);
		return null;
	}
}

function isRelativePath(p) {
	return typeof p === "string" && !p.startsWith("/") && !p.includes("..") && !/^[a-z]+:/i.test(p);
}

function requirePath(manifestPath, field, value) {
	if (value === undefined) return;
	if (!isRelativePath(value)) {
		fail(`${rel(manifestPath)}: ${field} must be a relative path without "..", got ${JSON.stringify(value)}`);
		return;
	}
	if (!existsSync(join(dirname(manifestPath), value)) && !existsSync(join(root, value))) {
		fail(`${rel(manifestPath)}: ${field} points at missing path ${value}`);
	}
}

function getField(obj, path) {
	return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		if (name === ".git" || name === "node_modules") continue;
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}

// 1. Manifests
const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
for (const m of [".claude-plugin/plugin.json", ".cursor-plugin/plugin.json", ".codex-plugin/plugin.json"]) {
	const p = join(root, m);
	if (!existsSync(p)) { fail(`${m}: missing`); continue; }
	const j = readJson(p);
	if (!j) continue;
	if (!kebab.test(j.name ?? "")) fail(`${m}: name must be kebab-case, got ${JSON.stringify(j.name)}`);
	for (const k of ["description", "version", "license"]) if (!j[k]) fail(`${m}: missing ${k}`);
	requirePath(p, "skills", j.skills);
	requirePath(p, "logo", j.logo);
	requirePath(p, "interface.logo", j.interface?.logo);
	requirePath(p, "hooks", typeof j.hooks === "string" ? j.hooks : undefined);
}
{
	const p = join(root, ".claude-plugin/marketplace.json");
	const j = readJson(p);
	if (j) {
		if (!Array.isArray(j.plugins) || j.plugins.length === 0) fail("marketplace.json: plugins must be a non-empty array");
		for (const [i, pl] of (j.plugins ?? []).entries()) {
			requirePath(p, `plugins.${i}.source`, pl.source);
			const pluginJson = readJson(join(root, ".claude-plugin/plugin.json"));
			if (pluginJson && pl.name !== pluginJson.name) fail(`marketplace.json: plugins.${i}.name ${pl.name} differs from plugin.json name ${pluginJson.name}`);
		}
	}
}
{
	const p = join(root, ".hermes-plugin/plugin.yaml");
	if (!existsSync(p)) fail(".hermes-plugin/plugin.yaml: missing");
	else if (!/^name:\s*\S+/m.test(readFileSync(p, "utf8"))) fail(".hermes-plugin/plugin.yaml: missing name");
}

// 2. One version string
{
	const bump = readJson(join(root, ".version-bump.json"));
	const versions = new Map();
	for (const { path, field } of bump?.files ?? []) {
		const p = join(root, path);
		if (!existsSync(p)) { fail(`.version-bump.json: ${path} does not exist`); continue; }
		let v;
		if (path.endsWith(".yaml") || path.endsWith(".yml")) {
			v = readFileSync(p, "utf8").match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1]?.trim();
		} else {
			v = getField(readJson(p), field);
		}
		if (!v) fail(`${path}: no ${field}`);
		else versions.set(path, v);
	}
	const distinct = new Set(versions.values());
	if (distinct.size > 1) {
		fail(`version mismatch: ${[...versions].map(([p, v]) => `${p}=${v}`).join(", ")}`);
	}
}

// 3. Skills
{
	const skillsDir = join(root, "skills");
	const names = existsSync(skillsDir) ? readdirSync(skillsDir).filter((n) => statSync(join(skillsDir, n)).isDirectory()) : [];
	if (names.length === 0) fail("skills/: no skill directories");
	for (const name of names) {
		const p = join(skillsDir, name, "SKILL.md");
		if (!existsSync(p)) { fail(`skills/${name}/SKILL.md: missing`); continue; }
		const text = readFileSync(p, "utf8");
		const fm = text.match(/^---\n([\s\S]*?)\n---/);
		if (!fm) { fail(`skills/${name}/SKILL.md: no frontmatter`); continue; }
		const fmName = fm[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
		if (fmName !== name) fail(`skills/${name}/SKILL.md: frontmatter name ${JSON.stringify(fmName)} must equal directory name ${name}`);
		if (!/^description:\s*\S/m.test(fm[1])) fail(`skills/${name}/SKILL.md: frontmatter needs a description`);
		const lines = text.split("\n").length;
		if (lines > 500) fail(`skills/${name}/SKILL.md: ${lines} lines, limit is 500`);
	}
}

// 4. Markdown links and em dashes
const mdFiles = walk(root).filter((p) => p.endsWith(".md"));
const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
for (const p of mdFiles) {
	const r = rel(p);
	let text = readFileSync(p, "utf8");
	if (!r.startsWith("docs/sources/") && text.includes("—")) {
		const line = text.split("\n").findIndex((l) => l.includes("—")) + 1;
		fail(`${r}:${line}: em dash (U+2014) in authored Markdown`);
	}
	text = text.replace(/```[\s\S]*?```/g, "").replace(/`[^`\n]*`/g, "");
	for (const m of text.matchAll(linkRe)) {
		let target = m[1];
		if (/^(https?:|mailto:|#)/.test(target)) continue;
		target = target.split("#")[0];
		if (!target) continue;
		const candidates = [join(dirname(p), target), join(root, target)];
		if (!candidates.some((c) => existsSync(c))) fail(`${r}: link target not found: ${m[1]}`);
	}
}

if (failures.length) {
	console.error(`check-repo: ${failures.length} problem(s)`);
	for (const f of failures) console.error(`  - ${f}`);
	process.exit(1);
}
console.log(`check-repo: ok (${mdFiles.length} markdown files, manifests valid, versions aligned)`);
