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

test("sanitizeSvg accepts a clean diagram unchanged and rejects every known bypass", () => {
	const clean = `<html><body><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><marker id="m"><path d="M0 0"/></marker></defs><g><rect width="1" height="1" fill="#fff" marker-end="url(#m)"/><use href="#m"/><text>a &amp; b &apos;c&apos;</text><svg viewBox="0 0 1 1"><circle r="1"/></svg></g></svg></body></html>`;
	const ok = sanitizeSvg(clean);
	assert.deepEqual(ok.problems, []);
	assert.ok(ok.svg.startsWith("<svg") && ok.svg.endsWith("</svg>"));
	assert.match(ok.svg, /<circle r="1"\/><\/svg><\/g><\/svg>$/, "nested svg is closed at the right depth");

	const vectors = {
		"handler after slash": `<svg/onload=alert(1)></svg>`,
		"handler without space": `<svg><rect x="1"onclick="alert(1)"/></svg>`,
		"script": `<svg><script>alert(1)</script></svg>`,
		"script end tag with space": `<svg><script>alert(1)</script ></svg>`,
		"self-closing script": `<svg><script href='data:text/javascript,alert(1)'/></svg>`,
		"entity-encoded javascript": `<svg><a href='jav&#x61;script:alert(1)'><rect/></a></svg>`,
		"unquoted encoded href": `<svg><a href=&#106;avascript:alert(1)><rect/></a></svg>`,
		"xlink href with spaces": `<svg><a xlink:href = 'javascript:alert(1)'><rect/></a></svg>`,
		"smil animation": `<svg><set attributeName="href" to="javascript:alert(1)"/></svg>`,
		"img breakout": `<svg><img src="https://evil"onerror="alert(1)"></svg>`,
		"style import": `<svg><style>@import "https://evil/x.css";</style></svg>`,
		"style url escape": `<svg><rect style="fill:url(ht\\74ps://evil)"/></svg>`,
		"style attr url": `<svg><rect style="fill:url(&quot;https://evil&quot;)"/></svg>`,
		"foreignObject": `<svg><foreignObject><div>x</div></foreignObject ></svg>`,
		"global style": `<svg><style>body{display:none}</style></svg>`,
		"nested unclosed": `<svg><svg></svg><script>alert(1)</script></svg>`,
		"external image": `<svg><image href="https://x/y.png"/></svg>`,
		"external use": `<svg><use href="https://x/y.svg#a"/></svg>`,
		"comment": `<svg><!-- --><rect/></svg>`,
		"cdata": `<svg><![CDATA[x]]></svg>`,
		"numeric entity in text": `<svg><text>&#x3c;script&#x3e;</text></svg>`,
		"unclosed svg": `<svg><rect/>`,
		"no svg": `<p>no svg</p>`,
	};
	for (const [name, input] of Object.entries(vectors)) {
		const r = sanitizeSvg(input);
		assert.equal(r.svg, null, `${name} must be rejected`);
		assert.ok(r.problems.length > 0, `${name} names a problem`);
	}
});

test("every fallback SVG passes the sanitizer unchanged, even with hostile text in state", () => {
	const state = load("menulens-complete");
	state.ws.why.summary = `<script>x</script> & "q" 'a' <img src=x>`;
	const spec = diagramSpec(state);
	for (const t of ["workflow", "architecture", "sequence"]) {
		const { svg } = fallbackSvg(t, spec);
		const r = sanitizeSvg(svg);
		assert.deepEqual(r.problems, [], `${t}: ${r.problems.join("; ")}`);
		assert.equal(r.svg, svg);
	}
});

test("detectArchify honors ARCHIFY_BIN and the known install paths, and returns null otherwise", () => {
	const dir = mkdtempSync(join(tmpdir(), "6w-arch-"));
	assert.equal(detectArchify({ env: {}, home: dir }), null);
	const fake = join(dir, "archify.mjs");
	writeFileSync(fake, "");
	assert.equal(detectArchify({ env: { ARCHIFY_BIN: fake }, home: dir }), fake);
});

test("loadDiagrams prefers a clean archify output, falls back on a rejected one, labels the source, and ignores an ERD when state has no entities", () => {
	const state = load("menulens-complete");
	const dir = mkdtempSync(join(tmpdir(), "6w-diag-"));
	writeFileSync(join(dir, "workflow.html"), `<html><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect id="from-archify"/></svg></html>`);
	writeFileSync(join(dir, "sequence.svg"), `<svg xmlns="http://www.w3.org/2000/svg"><image href="https://x/y.png"/></svg>`);
	writeFileSync(join(dir, "erd.html"), `<html><svg xmlns="http://www.w3.org/2000/svg"><rect id="invented-table"/></svg></html>`);
	const d = loadDiagrams(state, { dir });
	assert.equal(d.workflow.source, "archify");
	assert.match(d.workflow.svg, /from-archify/);
	assert.equal(d.sequence.source, "fallback");
	assert.match(d.sequence.rejected, /not allowed/);
	assert.equal(d.architecture.source, "fallback");
	assert.equal(d.erd.source, "none");
	assert.equal(d.erd.svg, null, "an archify ERD is ignored while state records no entities");
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
