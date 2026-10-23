import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { renderHtml, stateHash, esc } from "./render.mjs";
import { buildBundle, HTML_NAME } from "./export.mjs";
import { loadDiagrams } from "./diagrams.mjs";
import { DEMO_GENERATED_AT } from "../../../scripts/build-demo.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../../..");
const load = (name) => JSON.parse(readFileSync(join(root, "examples", name, "state.json"), "utf8"));

test("escapes every string from state, including script-like source content", () => {
	const state = load("menulens-partial");
	state.ws.why.summary = `<script>alert(1)</script><img src=x onerror=alert(2)>`;
	state.records.sources[0].title = `javascript:alert(3)`;
	state.records.sources[0].locator = `javascript:alert(4)`;
	const html = renderHtml(state, { generatedAt: "2026-01-01T00:00:00Z" });
	assert.doesNotMatch(html, /<script>alert\(1\)/);
	assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
	assert.doesNotMatch(html, /<img[^>]*onerror/, "an attachment string must never become a live tag");
	assert.match(html, /&lt;img src=x onerror=alert\(2\)&gt;/);
	assert.doesNotMatch(html, /href="javascript:/);
});

test("has no external reference: no http(s) src, no link rel=stylesheet, no @import, no external font", () => {
	const st = load("menulens-complete");
	const html = renderHtml(st, { generatedAt: "2026-01-01T00:00:00Z", diagrams: loadDiagrams(st) });
	assert.match(html, /<figure class="diagram" id="diagram-workflow">/);
	assert.doesNotMatch(html, /<(?:script|img|link|iframe|image|use)[^>]+(?:src|href)="https?:/i);
	assert.doesNotMatch(html, /@import|url\(https?:/i);
	assert.doesNotMatch(html, /fonts\.googleapis|cdn\./i);
});

test("every record ID has an anchor and every section is in the DOM without scripts", () => {
	const state = load("menulens-complete");
	const html = renderHtml(state, { generatedAt: "2026-01-01T00:00:00Z" });
	for (const list of Object.values(state.records)) for (const r of list) assert.ok(html.includes(`id="${r.id}"`), `anchor for ${r.id}`);
	for (const id of ["overview", "readiness", "canvas", "audience", "marketing", "scope", "viability", "delivery", "risks", "technical", "decisions", "sources"]) assert.ok(html.includes(`<section id="${id}">`), id);
	const noScript = html.replace(/<script>[\s\S]*?<\/script>/g, "");
	assert.ok(noScript.includes("PERSONA-001") && noScript.includes("Allergy traveler"));
});

test("empty collections render an explicit status note instead of invented content", () => {
	const html = renderHtml(load("menulens-partial"), { generatedAt: "2026-01-01T00:00:00Z" });
	assert.match(html, /No personas recorded in this state/);
	assert.match(html, /No requirements recorded in this state/);
	assert.doesNotMatch(html, /Allergy traveler/);
});

test("the state hash ignores updatedAt and export metadata but changes with content", () => {
	const a = load("menulens-complete");
	const b = load("menulens-complete");
	b.metadata.updatedAt = "2099-01-01T00:00:00Z";
	b.export = { files: ["x"] };
	assert.equal(stateHash(a), stateHash(b));
	b.ws.why.summary += "!";
	assert.notEqual(stateHash(a), stateHash(b));
	assert.match(stateHash(a), /^sha256:[0-9a-f]{64}$/);
});

test("rendering is deterministic for a fixed generatedAt", () => {
	const s = load("menulens-complete");
	assert.equal(renderHtml(s, { generatedAt: "2026-01-01T00:00:00Z" }), renderHtml(load("menulens-complete"), { generatedAt: "2026-01-01T00:00:00Z" }));
});

test("the committed demo page and handoff are the current export of the complete example", () => {
	const demo = join(root, "docs/demo/menulens");
	assert.ok(existsSync(join(demo, "index.html")), "docs/demo/menulens/index.html missing; run: node scripts/build-demo.mjs");
	const { files } = buildBundle(load("menulens-complete"), { generatedAt: DEMO_GENERATED_AT });
	assert.equal(readFileSync(join(demo, "index.html"), "utf8"), files.get(HTML_NAME), "demo page is stale; run: node scripts/build-demo.mjs");
	for (const [path, content] of files) {
		if (path === HTML_NAME) continue;
		const name = path.split("/").pop();
		assert.equal(readFileSync(join(demo, "handoff", name), "utf8"), content, `demo handoff ${name} is stale; run: node scripts/build-demo.mjs`);
	}
});

test("esc covers the five HTML special characters", () => {
	assert.equal(esc(`<a href="x">&'</a>`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
});
