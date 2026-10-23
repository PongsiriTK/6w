// Diagrams for the blueprint: a normalized spec derived from state, an archify adapter that
// detects an install and ingests its output, a sanitizer that refuses scripts and external
// references, and an inline-SVG fallback so export never depends on archify.
//
//   node diagrams.mjs spec <state.json> <dir>     write <dir>/<type>.spec.json for archify
//   node diagrams.mjs render <state.json> <dir>   write fallback <dir>/<type>.svg
//
// Types: workflow (pitch flow), architecture (actors, product, externals), sequence (core
// loop with edge-case branches). An ERD is produced only when state records entities; this
// schema version has none, so the ERD slot reports that instead of inventing tables.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { isMainModule } from "./scoring.mjs";

export const DIAGRAM_TYPES = ["workflow", "architecture", "sequence", "erd"];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
const short = (s, n = 80) => (String(s ?? "").length > n ? String(s).slice(0, n - 3).trimEnd() + "..." : String(s ?? ""));
const rationale = (state, w, key) => state.ws[w].ratings.find((r) => r.criterion === key)?.rationale ?? "";
const firstSentence = (s) => String(s ?? "").split(/(?<=[.!?])\s+/)[0];

export function diagramSpec(state) {
	const R = state.records ?? {};
	const primary = (R.personas ?? []).find((p) => p.priority === "primary") ?? (R.personas ?? [])[0];
	const product = state.metadata.title;
	const externals = extractExternals(rationale(state, "which", "integration-boundary"));
	const edges = (R.edges ?? []).filter((e) => e.scopeDecision === "support-now").slice(0, 3);

	return {
		product_name: product,
		target_platform: firstSentence(rationale(state, "which", "primary-form-factor")) || state.ws.which.summary,
		workflow: {
			title: "Pitch flow",
			steps: [
				{ id: "problem", label: "Problem", text: state.ws.why.summary },
				{ id: "trigger", label: "Trigger", text: primary?.trigger ?? state.ws.who.summary },
				{ id: "loop", label: "Core loop", text: state.ws.what.summary },
				{ id: "value", label: "Value", text: firstSentence(rationale(state, "why", "value-capture")) },
			],
		},
		architecture: {
			title: "System boundary",
			actors: (R.personas ?? []).filter((p) => p.priority !== "excluded").map((p) => ({ id: p.id, label: p.title })),
			system: [{ id: "product", label: product, text: firstSentence(rationale(state, "which", "primary-form-factor")) }],
			externals: externals.map((e, i) => ({ id: `ext-${i + 1}`, label: e })),
		},
		sequence: {
			title: "Core loop with edge-case branches",
			actors: [primary?.title ?? "User", product, ...externals.slice(0, 1)],
			steps: [
				{ from: 0, to: 1, label: primary?.trigger ? `Trigger: ${short(primary.trigger, 50)}` : "Starts the core loop" },
				{ from: 1, to: externals.length ? 2 : 1, label: short(state.ws.what.summary, 60) },
				{ from: externals.length ? 2 : 1, to: 1, label: "Result" },
				{ from: 1, to: 0, label: "Value delivered" },
			],
			branches: edges.map((e) => ({ id: e.id, label: e.title, response: short(e.response, 90) })),
		},
		erd: null,
		erd_status: "No data entities are recorded in state. The v1 schema is an implementation task (see DELIVERY.md), not a planning decision.",
		requested_diagrams: [
			{ type: "workflow", purpose: "Pitch flow for the overview" },
			{ type: "architecture", purpose: "System blocks matching the chosen form factor and integrations" },
			{ type: "sequence", purpose: "Core loop including edge-case fallback branches" },
		],
	};
}

function extractExternals(text) {
	const found = [];
	const m = String(text).match(/\b(?:one|a|the)\s+([A-Za-z][A-Za-z ]{2,40}?(?:API|model API|server|service|database|webhook))\b/gi) ?? [];
	for (const s of m) found.push(s.replace(/^(?:one|a|the)\s+/i, "").trim());
	return [...new Set(found)].slice(0, 4);
}

// Layout helpers for the fallback. Boxes are rounded rectangles with wrapped text, drawn in
// the same monoline style as the 6W mark. Width is fixed so the SVG scales with its container.
const FONT = `font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif"`;
function wrap(text, max = 24) {
	const words = String(text ?? "").split(/\s+/).filter(Boolean);
	const lines = [];
	let cur = "";
	for (const w of words) {
		if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
	}
	if (cur) lines.push(cur);
	return lines.slice(0, 6);
}
function box(x, y, w, h, title, text, { dashed = false } = {}) {
	const lines = wrap(text, Math.floor(w / 7.2));
	const titleLine = title ? `<text x="${x + 12}" y="${y + 22}" font-size="11" font-weight="700" letter-spacing="1" fill="#666" ${FONT}>${esc(title.toUpperCase())}</text>` : "";
	const ty = y + (title ? 42 : 24);
	return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" stroke="#111" stroke-width="3"${dashed ? ' stroke-dasharray="8 6"' : ""}/>${titleLine}${lines.map((l, i) => `<text x="${x + 12}" y="${ty + i * 17}" font-size="13" fill="#111" ${FONT}>${esc(l)}</text>`).join("")}`;
}
const arrowDefs = (t) => `<defs><marker id="arrow-${t}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#111"/></marker></defs>`;
const line = (t, x1, y1, x2, y2, label) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#111" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow-${t})"/>${label ? `<text x="${(x1 + x2) / 2}" y="${Math.min(y1, y2) - 8}" font-size="12" text-anchor="middle" fill="#333" ${FONT}>${esc(short(label, 40))}</text>` : ""}`;
const svgOpen = (t, w, h, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title-${t}"><title id="title-${t}">${esc(title)}</title>${arrowDefs(t)}`;

export function fallbackSvg(type, spec) {
	if (type === "workflow") {
		const steps = spec.workflow.steps;
		const w = 220, gap = 50, h = 150;
		const total = steps.length * w + (steps.length - 1) * gap + 40;
		let s = svgOpen("workflow", total, h + 40, spec.workflow.title);
		steps.forEach((st, i) => {
			const x = 20 + i * (w + gap);
			s += box(x, 20, w, h, st.label, st.text);
			if (i < steps.length - 1) s += line("workflow", x + w + 4, 20 + h / 2, x + w + gap - 4, 20 + h / 2);
		});
		return { svg: s + "</svg>", description: `Pitch flow: ${steps.map((st) => `${st.label}: ${st.text}`).join(". ")}.` };
	}
	if (type === "architecture") {
		const a = spec.architecture;
		const col = 230, rowH = 96, gapY = 18;
		const rows = Math.max(a.actors.length, 1, a.externals.length);
		const H = 40 + rows * (rowH + gapY);
		let s = svgOpen("architecture", 3 * col + 2 * 90 + 40, H, a.title);
		const yFor = (i, n) => 20 + i * (rowH + gapY) + ((rows - n) * (rowH + gapY)) / 2;
		a.actors.forEach((p, i) => (s += box(20, yFor(i, a.actors.length), col, rowH, "Actor", p.label)));
		const sysY = yFor(0, 1);
		s += box(20 + col + 90, sysY, col, rowH, "Product", a.system[0].text ? `${a.system[0].label}. ${a.system[0].text}` : a.system[0].label);
		a.externals.forEach((e, i) => (s += box(20 + 2 * (col + 90), yFor(i, a.externals.length), col, rowH, "External", e.label)));
		a.actors.forEach((p, i) => (s += line("architecture", 20 + col + 4, yFor(i, a.actors.length) + rowH / 2, 20 + col + 86, sysY + rowH / 2)));
		a.externals.forEach((e, i) => (s += line("architecture", 20 + 2 * col + 94, sysY + rowH / 2, 20 + 2 * (col + 90) - 4, yFor(i, a.externals.length) + rowH / 2)));
		const desc = `${a.system[0].label} sits between ${a.actors.map((p) => p.label).join(", ") || "its users"} and ${a.externals.map((e) => e.label).join(", ") || "no external services"}.`;
		return { svg: s + "</svg>", description: desc };
	}
	if (type === "sequence") {
		const q = spec.sequence;
		const colW = 240, top = 70, stepH = 54, n = q.actors.length;
		const branchH = q.branches.length ? 40 + q.branches.length * 44 : 0;
		const H = top + q.steps.length * stepH + branchH + 40;
		let s = svgOpen("sequence", n * colW + 40, H, q.title);
		q.actors.forEach((name, i) => {
			const x = 20 + i * colW + colW / 2;
			s += `<rect x="${x - 100}" y="14" width="200" height="40" rx="10" fill="#fff" stroke="#111" stroke-width="3"/><text x="${x}" y="39" font-size="13" font-weight="700" text-anchor="middle" fill="#111" ${FONT}>${esc(short(name, 28))}</text><line x1="${x}" y1="54" x2="${x}" y2="${H - 20}" stroke="#999" stroke-width="2" stroke-dasharray="6 6"/>`;
		});
		q.steps.forEach((st, i) => {
			const y = top + i * stepH + 20;
			const x1 = 20 + st.from * colW + colW / 2, x2 = 20 + st.to * colW + colW / 2;
			if (st.from === st.to) s += `<path d="M${x1} ${y} h40 v22 h-36" fill="none" stroke="#111" stroke-width="3" marker-end="url(#arrow-sequence)"/><text x="${x1 + 48}" y="${y + 16}" font-size="12" fill="#333" ${FONT}>${esc(short(st.label, 40))}</text>`;
			else s += line("sequence", x1, y, x2 + (x2 > x1 ? -6 : 6), y, st.label);
		});
		if (q.branches.length) {
			const y0 = top + q.steps.length * stepH + 10;
			s += `<rect x="30" y="${y0}" width="${n * colW - 20}" height="${branchH - 10}" rx="10" fill="none" stroke="#111" stroke-width="3" stroke-dasharray="8 6"/><text x="44" y="${y0 + 22}" font-size="11" font-weight="700" letter-spacing="1" fill="#666" ${FONT}>EDGE-CASE BRANCHES</text>`;
			q.branches.forEach((b, i) => (s += `<text x="44" y="${y0 + 48 + i * 44}" font-size="13" font-weight="700" fill="#111" ${FONT}>${esc(b.id)} ${esc(short(b.label, 48))}</text><text x="44" y="${y0 + 66 + i * 44}" font-size="12" fill="#333" ${FONT}>${esc(short(b.response, 110))}</text>`));
		}
		const desc = `Sequence between ${q.actors.join(", ")}: ${q.steps.map((st) => `${q.actors[st.from]} to ${q.actors[st.to]}: ${st.label}`).join("; ")}.${q.branches.length ? ` Branches: ${q.branches.map((b) => `${b.id} ${b.label}`).join("; ")}.` : ""}`;
		return { svg: s + "</svg>", description: desc };
	}
	if (type === "erd") return { svg: null, description: spec.erd_status };
	throw new Error(`unknown diagram type ${type}`);
}

export function detectArchify({ env = process.env, home = homedir() } = {}) {
	const candidates = [env.ARCHIFY_BIN, join(home, ".claude/skills/archify/bin/archify.mjs"), join(home, ".agents/skills/archify/bin/archify.mjs"), join(home, ".cursor/skills/archify/bin/archify.mjs"), join(home, ".codex/skills/archify/bin/archify.mjs")].filter(Boolean);
	return candidates.find((p) => existsSync(p)) ?? null;
}

// Accepts an archify-rendered HTML file or a bare SVG and returns the first <svg> element
// only if every tag, attribute and entity in it is on the allowlist below. Nothing is
// stripped or repaired: one unknown element, attribute, entity, comment or href that is not
// a fragment rejects the whole diagram, and the exporter uses the fallback instead.
const ALLOWED_ELEMENTS = new Set(["svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "title", "desc", "defs", "marker", "use", "lineargradient", "radialgradient", "stop", "clippath", "symbol"]);
const ALLOWED_ATTRS = new Set(["xmlns", "xmlns:xlink", "viewbox", "width", "height", "preserveaspectratio", "version", "xml:space", "lang", "id", "class", "role", "aria-label", "aria-labelledby", "aria-hidden", "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "stroke-dashoffset", "stroke-opacity", "stroke-miterlimit", "opacity", "transform", "d", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "dx", "dy", "points", "font-family", "font-size", "font-weight", "font-style", "text-anchor", "dominant-baseline", "letter-spacing", "text-decoration", "textlength", "lengthadjust", "href", "xlink:href", "refx", "refy", "markerwidth", "markerheight", "markerunits", "orient", "marker-start", "marker-mid", "marker-end", "offset", "stop-color", "stop-opacity", "gradientunits", "gradienttransform", "spreadmethod", "clip-path", "clip-rule", "vector-effect", "paint-order", "shape-rendering", "text-rendering", "visibility", "display", "pointer-events"]);
const URL_ATTRS = new Set(["marker-start", "marker-mid", "marker-end", "fill", "stroke", "clip-path"]);
const TAG_RE = /<\/?([A-Za-z][\w:-]*)((?:\s+[^\s=\/>"'<]+(?:\s*=\s*(?:"[^"<]*"|'[^'<]*'|[^\s"'<>\/]+))?)*)\s*(\/?)>/y;
const ATTR_RE = /\s+([^\s=\/>"'<]+)(?:\s*=\s*(?:"([^"<]*)"|'([^'<]*)'|([^\s"'<>\/]+)))?/g;
const TEXT_OK = /^(?:[^&<>]|&(?:amp|lt|gt|quot|apos);)*$/;
const FRAGMENT = /^#[A-Za-z][\w-]*$/;
const URL_VALUE = /^(?:none|currentColor|#[0-9A-Fa-f]{3,8}|[A-Za-z]+|url\(#[A-Za-z][\w-]*\)(?:\s+[A-Za-z#0-9]+)?)$/;

export function sanitizeSvg(input) {
	const text = String(input);
	const start = text.search(/<svg[\s>]/i);
	if (start < 0) return { svg: null, problems: ["no <svg> element found"] };
	const problems = [];
	let i = start;
	let depth = 0;
	let end = -1;
	const stack = [];
	while (i < text.length) {
		const lt = text.indexOf("<", i);
		if (lt < 0) break;
		const chunk = text.slice(i, lt);
		if (!TEXT_OK.test(chunk)) { problems.push(`text at ${i}: entity or stray character not allowed`); break; }
		TAG_RE.lastIndex = lt;
		const m = TAG_RE.exec(text);
		if (!m) { problems.push(`tag at ${lt}: could not be parsed (comments, CDATA, doctype, processing instructions and malformed tags are rejected)`); break; }
		const [whole, rawName, rawAttrs, selfClose] = m;
		const name = rawName.toLowerCase();
		const closing = whole.startsWith("</");
		if (!ALLOWED_ELEMENTS.has(name)) { problems.push(`element <${rawName}> not allowed`); break; }
		if (closing) {
			if (stack.pop() !== name) { problems.push(`unbalanced </${rawName}>`); break; }
			depth--;
		} else {
			for (const a of rawAttrs.matchAll(ATTR_RE)) {
				const attr = a[1].toLowerCase();
				const value = a[2] ?? a[3] ?? a[4] ?? "";
				if (attr.startsWith("on") || !ALLOWED_ATTRS.has(attr)) { problems.push(`attribute ${a[1]} on <${rawName}> not allowed`); break; }
				if (!TEXT_OK.test(value)) { problems.push(`attribute ${a[1]}: entity or stray character not allowed`); break; }
				if ((attr === "href" || attr === "xlink:href") && !FRAGMENT.test(value)) { problems.push(`${a[1]} must be a fragment reference, got ${JSON.stringify(value)}`); break; }
				if (URL_ATTRS.has(attr) && /url\(/i.test(value) && !URL_VALUE.test(value)) { problems.push(`${a[1]} may reference only a local id, got ${JSON.stringify(value)}`); break; }
				if (/url\(|@|\\|expression|javascript|data:/i.test(value) && !URL_VALUE.test(value)) { problems.push(`attribute ${a[1]} contains a url, escape or script-like value`); break; }
			}
			if (problems.length) break;
			if (!selfClose) { stack.push(name); depth++; }
		}
		i = lt + whole.length;
		if (depth === 0 && stack.length === 0) { end = i; break; }
	}
	if (!problems.length && end < 0) problems.push("<svg> never closed");
	if (problems.length) return { svg: null, problems };
	return { svg: text.slice(start, end), problems: [] };
}

export function writeDiagramSpecs(state, dir) {
	mkdirSync(dir, { recursive: true });
	const spec = diagramSpec(state);
	const written = [];
	for (const t of ["workflow", "architecture", "sequence"]) {
		const file = join(dir, `${t}.spec.json`);
		writeFileSync(file, JSON.stringify({ type: t, product_name: spec.product_name, target_platform: spec.target_platform, [t]: spec[t], purpose: spec.requested_diagrams.find((d) => d.type === t)?.purpose }, null, 2) + "\n");
		written.push(file);
	}
	return written;
}

// For each type: an archify output at <dir>/<type>.html or <type>.svg wins when it sanitizes
// cleanly; otherwise the fallback. Every entry says which it is.
export function loadDiagrams(state, { dir } = {}) {
	const spec = diagramSpec(state);
	const out = {};
	for (const t of DIAGRAM_TYPES) {
		let picked = null;
		if (dir && !(t === "erd" && spec.erd === null)) {
			for (const ext of ["html", "svg"]) {
				const f = join(dir, `${t}.${ext}`);
				if (existsSync(f)) {
					const { svg, problems } = sanitizeSvg(readFileSync(f, "utf8"));
					if (svg) picked = { svg, description: fallbackSvg(t, spec).description, source: "archify", file: f };
					else picked = { ...fallbackSvg(t, spec), source: "fallback", rejected: `${f}: ${problems.join(", ")}` };
					break;
				}
			}
		}
		out[t] = picked ?? { ...fallbackSvg(t, spec), source: t === "erd" ? "none" : "fallback" };
	}
	return out;
}

function main(argv) {
	const [cmd, file, dir] = argv;
	if (!cmd || !file || !dir) {
		console.error("usage: node diagrams.mjs spec|render <state.json> <dir>");
		process.exit(2);
	}
	const state = JSON.parse(readFileSync(file, "utf8"));
	if (cmd === "spec") {
		for (const f of writeDiagramSpecs(state, dir)) console.log(f);
		const bin = detectArchify();
		console.log(bin ? `archify found at ${bin}; hand each spec to the archify skill and save its HTML as <dir>/<type>.html` : "archify not found; export will use the fallback SVG");
	} else if (cmd === "render") {
		mkdirSync(dir, { recursive: true });
		const d = loadDiagrams(state);
		for (const t of DIAGRAM_TYPES) if (d[t].svg) { writeFileSync(join(dir, `${t}.svg`), d[t].svg); console.log(join(dir, `${t}.svg`)); }
	} else {
		console.error(`unknown command ${cmd}`);
		process.exit(2);
	}
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
