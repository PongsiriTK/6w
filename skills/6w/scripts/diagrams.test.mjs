import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { diagramSpec, fallbackSvg, sanitizeSvg, detectArchify, loadDiagrams, writeDiagramSpecs, DIAGRAM_TYPES } from "./diagrams.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const load = (name) => JSON.parse(readFileSync(join(here, "../../../examples", name, "state.json"), "utf8"));

test("the spec is derived from state and introduces no entities", () => {
	const spec = diagramSpec(load("menulens-complete"));
	assert.equal(spec.product_name, "MenuLens");
	assert.equal(spec.workflow.steps.length, 4);
	assert.ok(spec.architecture.actors.some((a) => a.id === "PERSONA-001"));
	assert.ok(!spec.architecture.actors.some((a) => a.id === "PERSONA-002"), "the anti-persona is not an actor");
	assert.ok(spec.architecture.externals.some((e) => /vision model API/i.test(e.label)), JSON.stringify(spec.architecture.externals));
	assert.equal(spec.sequence.branches.length, 3);
	assert.equal(spec.erd, null);
});

test("fallback SVGs are self-contained, escaped, and come with a text description", () => {
	const state = load("menulens-complete");
	state.ws.why.summary = `<script>x</script> & "quotes"`;
	const spec = diagramSpec(state);
	for (const t of ["workflow", "architecture", "sequence"]) {
		const { svg, description } = fallbackSvg(t, spec);
		assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
		assert.doesNotMatch(svg, /<script>x/);
		assert.doesNotMatch(svg, /https?:\/\/(?!www\.w3\.org\/2000\/svg)/, `${t} has an external reference`);
		assert.ok(description.length > 20, `${t} description`);
		assert.ok(svg.includes("<title"), `${t} has a title for screen readers`);
	}
	assert.match(fallbackSvg("workflow", spec).svg, /&lt;script&gt;x&lt;\/script&gt; &amp; &quot;quotes&quot;/);
	const erd = fallbackSvg("erd", spec);
	assert.equal(erd.svg, null);
	assert.match(erd.description, /No data entities/);
});

test("sanitizeSvg strips scripts, handlers and external hrefs, and rejects external resources", () => {
	const dirty = `<html><body><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)"><script>alert(2)</script><a href="https://evil.example"><rect width="1" height="1" onclick="x()"/></a><use href="#ok"/></svg></body></html>`;
	const { svg, problems } = sanitizeSvg(dirty);
	assert.deepEqual(problems, []);
	assert.doesNotMatch(svg, /<script|onload|onclick|evil\.example/);
	assert.match(svg, /<use href="#ok"\/>/);
	const external = `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://x/y.png"/></svg>`;
	assert.equal(sanitizeSvg(external).svg, null);
	const css = `<svg xmlns="http://www.w3.org/2000/svg"><style>text{font-family:url(https://fonts.example/f.woff)}</style></svg>`;
	assert.equal(sanitizeSvg(css).svg, null);
	assert.equal(sanitizeSvg("<p>no svg</p>").svg, null);
});

test("detectArchify honors ARCHIFY_BIN and the known install paths, and returns null otherwise", () => {
	const dir = mkdtempSync(join(tmpdir(), "6w-arch-"));
	assert.equal(detectArchify({ env: {}, home: dir }), null);
	const fake = join(dir, "archify.mjs");
	writeFileSync(fake, "");
	assert.equal(detectArchify({ env: { ARCHIFY_BIN: fake }, home: dir }), fake);
});

test("loadDiagrams prefers a clean archify output, falls back on a rejected one, and labels the source", () => {
	const state = load("menulens-complete");
	const dir = mkdtempSync(join(tmpdir(), "6w-diag-"));
	writeFileSync(join(dir, "workflow.html"), `<html><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect id="from-archify"/></svg></html>`);
	writeFileSync(join(dir, "sequence.svg"), `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://x/y.png"/></svg>`);
	const d = loadDiagrams(state, { dir });
	assert.equal(d.workflow.source, "archify");
	assert.match(d.workflow.svg, /from-archify/);
	assert.equal(d.sequence.source, "fallback");
	assert.match(d.sequence.rejected, /embedded external resource/);
	assert.equal(d.architecture.source, "fallback");
	assert.equal(d.erd.source, "none");
	const none = loadDiagrams(state);
	for (const t of DIAGRAM_TYPES) assert.ok(none[t].description);
});

test("writeDiagramSpecs writes one spec per requested type", () => {
	const dir = mkdtempSync(join(tmpdir(), "6w-spec-"));
	const files = writeDiagramSpecs(load("menulens-complete"), dir);
	assert.equal(files.length, 3);
	const wf = JSON.parse(readFileSync(files[0], "utf8"));
	assert.equal(wf.type, "workflow");
	assert.equal(wf.product_name, "MenuLens");
});
