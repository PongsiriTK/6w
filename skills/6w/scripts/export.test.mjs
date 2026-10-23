import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, readdirSync, chmodSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBundle, exportBundle, bundleIsConsistent, HANDOFF_DIR, HTML_NAME } from "./export.mjs";
import { HANDOFF_FILES } from "./handoff.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));
const AT = "2026-10-24T00:00:00Z";

test("buildBundle produces the HTML, ten Markdown files and a manifest that validates, all carrying one state hash", () => {
	const { files, manifest, hash } = buildBundle(load("menulens-complete"), { generatedAt: AT });
	assert.equal(files.size, 12);
	for (const name of HANDOFF_FILES) {
		const content = files.get(join(HANDOFF_DIR, name));
		assert.ok(content, name);
		assert.ok(content.includes(hash), `${name} carries the state hash`);
		assert.match(content, /^# MenuLens: /, `${name} title`);
	}
	assert.ok(files.get(HTML_NAME).includes(`content="${hash}"`));
	assert.equal(manifest.files.length, 11);
	assert.equal(manifest.validation.diagrams.workflow, "fallback");
	assert.equal(manifest.validation.diagrams.erd, "none");
});

test("the handoff links resolve to anchors in the named files and contain no HTML styling", () => {
	const { files } = buildBundle(load("menulens-complete"), { generatedAt: AT });
	const mdFiles = new Map([...files].filter(([p]) => p.endsWith(".md")).map(([p, c]) => [p.split("/").pop(), c]));
	for (const [name, content] of mdFiles) {
		assert.doesNotMatch(content, /<style|<div|class="/, `${name} has styling`);
		for (const m of content.matchAll(/\]\(([A-Z-]+\.md)#([a-z]+-\d+)\)/g)) {
			const target = mdFiles.get(m[1]);
			assert.ok(target, `${name} links to ${m[1]}`);
			assert.ok(target.includes(`id="${m[2]}"`), `${name}: ${m[1]}#${m[2]} has no anchor`);
		}
	}
	const rules = mdFiles.get("AGENT-RULES.md");
	assert.match(rules, /## Anti-scope\. Do not build these in v1/);
	assert.match(rules, /EDGE-001/);
	assert.match(mdFiles.get("DELIVERY.md"), /- \[ \] .*TASK-001/);
	assert.match(mdFiles.get("START-HERE.md"), /grants no permission to deploy/);
});

test("the partial state exports with explicit empty-section notes instead of invented content", () => {
	const { files } = buildBundle(load("menulens-partial"), { generatedAt: AT });
	const aud = files.get(join(HANDOFF_DIR, "AUDIENCE.md"));
	assert.match(aud, /No personas recorded/);
	assert.doesNotMatch(aud, /Allergy traveler/);
	assert.match(files.get(join(HANDOFF_DIR, "START-HERE.md")), /Below the gate: WHY/);
});

test("exportBundle writes the bundle, the manifest matches the files on disk, and a re-export is byte-identical", () => {
	const root = mkdtempSync(join(tmpdir(), "6w-export-"));
	const r1 = exportBundle(load("menulens-complete"), root, { generatedAt: AT });
	assert.ok(existsSync(join(root, HTML_NAME)));
	assert.equal(readdirSync(join(root, HANDOFF_DIR)).length, 11);
	const check = bundleIsConsistent(root);
	assert.deepEqual(check.problems, []);
	const before = readFileSync(join(root, HTML_NAME), "utf8");
	exportBundle(load("menulens-complete"), root, { generatedAt: AT });
	assert.equal(readFileSync(join(root, HTML_NAME), "utf8"), before);
	assert.equal(r1.hash, check.manifest.stateHash);
	assert.ok(!readdirSync(join(root, ".6w")).some((n) => n.startsWith(".export-")), "temp dir cleaned");
});

test("a failed export leaves the previous bundle intact and consistent", () => {
	const root = mkdtempSync(join(tmpdir(), "6w-export-"));
	exportBundle(load("menulens-complete"), root, { generatedAt: AT });
	const before = Object.fromEntries(readdirSync(join(root, HANDOFF_DIR)).map((n) => [n, readFileSync(join(root, HANDOFF_DIR, n), "utf8")]));
	const bad = load("menulens-complete");
	bad.records.tasks[0].links.push("REQ-999");
	assert.throws(() => exportBundle(bad, root, { generatedAt: AT }), /invalid state/);
	const after = Object.fromEntries(readdirSync(join(root, HANDOFF_DIR)).map((n) => [n, readFileSync(join(root, HANDOFF_DIR, n), "utf8")]));
	assert.deepEqual(after, before);
	assert.ok(bundleIsConsistent(root).ok);
	assert.ok(!existsSync(join(root, `${HANDOFF_DIR}.prev`)));
});

test("a bundle whose files were edited by hand is reported as inconsistent", () => {
	const root = mkdtempSync(join(tmpdir(), "6w-export-"));
	exportBundle(load("menulens-complete"), root, { generatedAt: AT });
	writeFileSync(join(root, HANDOFF_DIR, "PRODUCT.md"), "# edited\n");
	writeFileSync(join(root, HANDOFF_DIR, "NOTES.md"), "stray\n");
	const check = bundleIsConsistent(root);
	assert.ok(check.problems.some((p) => p.includes("PRODUCT.md: content differs")), check.problems.join("\n"));
	assert.ok(check.problems.some((p) => p.includes("NOTES.md: not in the manifest")), check.problems.join("\n"));
});

test("archify output in --diagrams-dir is embedded when clean and the manifest says so", () => {
	const root = mkdtempSync(join(tmpdir(), "6w-export-"));
	const dir = join(root, "diagrams");
	mkdirSync(dir);
	writeFileSync(join(dir, "architecture.html"), `<html><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect id="archify-arch"/></svg></html>`);
	const { manifest } = exportBundle(load("menulens-complete"), root, { generatedAt: AT, diagramsDir: dir });
	assert.equal(manifest.validation.diagrams.architecture, "archify");
	assert.match(readFileSync(join(root, HTML_NAME), "utf8"), /archify-arch/);
	assert.match(readFileSync(join(root, HANDOFF_DIR, "ARCHITECTURE.md"), "utf8"), /architecture \(archify\)/);
});

test("the CLI exports and reports, and exits 1 on an invalid state", () => {
	const root = mkdtempSync(join(tmpdir(), "6w-export-"));
	const script = join(here, "export.mjs");
	const ok = spawnSync("node", [script, join(examples, "menulens-complete/state.json"), root, "--generated-at", AT], { encoding: "utf8" });
	assert.equal(ok.status, 0, ok.stderr);
	assert.match(ok.stdout, /exported 12 files/);
	const badFile = join(root, "bad.json");
	const bad = load("menulens-complete");
	bad.session.gate = 1000;
	writeFileSync(badFile, JSON.stringify(bad));
	const r = spawnSync("node", [script, badFile, root], { encoding: "utf8" });
	assert.equal(r.status, 1);
	assert.match(r.stderr, /not exported/);
});
