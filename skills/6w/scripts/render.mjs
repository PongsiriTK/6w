#!/usr/bin/env node
// Render 6w-blueprint.html from one validated state file.
//   node render.mjs <state.json> <out.html> [--generated-at <iso>]
// One self-contained file: inline CSS from ../templates/blueprint.css, inline SVG, no CDN,
// no external font, no network fetch. Every string from state is escaped. The optional
// search script only opens <details> and highlights; all content is in the DOM without it.
// Sections that have no records say so instead of being filled.

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WS } from "./rubric.mjs";
import { computeScores, renderScoreboard, isMainModule } from "./scoring.mjs";
import { validateState } from "./validate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(join(here, "../templates/blueprint.css"), "utf8");
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318 170" role="img" aria-label="6W"><g fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"><path d="M 116 30 C 82 42, 56 72, 56 106"/><circle cx="88" cy="106" r="32"/><polyline points="162,30 186,138 212,60 238,138 262,30"/></g></svg>`;

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SAFE_URL = /^(https?:|mailto:|#)/i;
const link = (id) => `<a href="#${esc(id)}"><code>${esc(id)}</code></a>`;
const links = (ids) => (ids ?? []).map(link).join(" ");
const list = (items) => (items?.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "");
const kv = (pairs) => `<dl class="kv">${pairs.filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${Array.isArray(v) ? esc(v.join(", ")) : v}</dd>`).join("")}</dl>`;
const none = (what) => `<p class="status-note">No ${esc(what)} recorded in this state. The section stays empty rather than invented.</p>`;
const stageLabel = { explore: "explore", prototype: "prototype", "build-mvp": "build MVP", pilot: "pilot" };

// Canonical content hash: sorted keys, without export metadata, extensions, the revision
// counter and the save timestamp, so a save that changes no content keeps the same hash.
function canonical(value) {
	if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
	if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
	return JSON.stringify(value);
}
export function stateHash(state) {
	const { export: _e, extensions: _x, ...rest } = state;
	const meta = { ...rest.metadata };
	delete meta.updatedAt;
	delete meta.revision;
	return "sha256:" + createHash("sha256").update(canonical({ ...rest, metadata: meta })).digest("hex");
}

const SEARCH_SCRIPT = `(function(){var q=document.getElementById('q');if(!q)return;q.hidden=false;var blocks=Array.prototype.slice.call(document.querySelectorAll('main section'));q.addEventListener('input',function(){var t=q.value.trim().toLowerCase();blocks.forEach(function(s){var hit=!t||s.textContent.toLowerCase().indexOf(t)>-1;s.classList.toggle('hidden-by-search',!hit);if(hit&&t){s.querySelectorAll('details').forEach(function(d){if(d.textContent.toLowerCase().indexOf(t)>-1)d.open=true;});}});});})();`;
const SEARCH_SCRIPT_HASH = createHash("sha256").update(SEARCH_SCRIPT).digest("base64");
// The policy forbids every network fetch and every script except the inline search script,
// so a diagram that slipped past the sanitizer still cannot execute or load anything.
export const CSP = `default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${SEARCH_SCRIPT_HASH}'; base-uri 'none'; form-action 'none'`;

function gauge(w, r) {
	const c = 2 * Math.PI * 42;
	const cls = r.status === "OK" ? "ok" : r.status === "CAP" ? "cap" : r.status === "LOCKED" ? "locked" : "";
	return `<div class="gauge ${cls}"><svg viewBox="0 0 100 100" aria-label="${esc(w.label)} ${r.score} of 100"><circle class="ring" cx="50" cy="50" r="42"/><circle class="val" cx="50" cy="50" r="42" stroke-dasharray="${(c * r.score) / 100} ${c}"/><text class="num" x="50" y="56" text-anchor="middle">${r.score}</text></svg><div class="lbl">${esc(w.label)}</div><div class="ev">${esc(r.status)} &middot; ${esc(r.evidence)}</div></div>`;
}

function ratingRows(w, ws) {
	return ws.ratings.map((r) => {
		const c = w.criteria.find((x) => x.key === r.criterion);
		return `<details><summary>${esc(r.criterion)} <span class="tag">${r.rating}/4 &times; ${c?.weight ?? "?"}</span> <span class="tag">${esc(r.evidence)}</span></summary><p>${esc(r.rationale)}</p>${r.sources?.length ? `<p class="meta">Sources: ${links(r.sources)}</p>` : ""}${r.links?.length ? `<p class="meta">Links: ${links(r.links)}</p>` : ""}</details>`;
	}).join("");
}

function wCard(w, ws, r) {
	const caps = (ws.caps ?? []).map((c) => `<span class="tag ${c.active ? "cap" : ""}">${c.active ? "cap active" : "cap clear"}: ${esc(c.id)}</span>${c.reason ? `<span class="meta"> ${esc(c.reason)}</span>` : ""}`).join("<br>");
	return `<article class="card" id="w-${w.key}"><h3>${esc(w.label)} <span class="tag ${r.status === "OK" ? "ok" : r.status === "CAP" ? "cap" : r.status === "LOCKED" ? "locked" : ""}">${r.score}/100 ${esc(r.status)}</span></h3><p>${esc(ws.summary)}</p>${ratingRows(w, ws)}${caps ? `<p>${caps}</p>` : ""}${ws.openQuestions?.length ? `<h4>Open questions</h4>${list(ws.openQuestions)}` : ""}${ws.links?.length ? `<p class="meta">Links: ${links(ws.links)}</p>` : ""}</article>`;
}

function recordCard(rec, fields) {
	const pairs = fields.map(([label, key]) => [label, Array.isArray(rec[key]) ? (key === "links" || key === "sources" || key === "affects" ? links(rec[key]) : list(rec[key])) : key === "persona" && rec[key] ? link(rec[key]) : esc(rec[key])]);
	return `<article class="card" id="${esc(rec.id)}"><h4>${esc(rec.title)}</h4><div class="meta"><code>${esc(rec.id)}</code>${rec.status ? ` <span class="tag">${esc(rec.status)}</span>` : ""}${rec.evidence ? ` <span class="tag">${esc(rec.evidence)}</span>` : ""}${rec.priority ? ` <span class="tag">${esc(rec.priority)}</span>` : ""}${rec.severity ? ` <span class="tag cap">${esc(rec.severity)}</span>` : ""}</div>${kv(pairs)}</article>`;
}

function table(rows, cols) {
	if (!rows?.length) return "";
	return `<div class="table-wrap"><table><thead><tr>${cols.map(([h]) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map(([, f]) => `<td>${f(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

export function renderHtml(state, { generatedAt = new Date().toISOString(), blueprintVersion = "0.1.0", diagrams = {}, hash = stateHash(state) } = {}) {
	const computed = computeScores(state);
	const R = state.records ?? {};
	const stage = stageLabel[state.session.stage] ?? state.session.stage;
	const primary = (R.personas ?? []).find((p) => p.priority === "primary") ?? (R.personas ?? [])[0];
	const nextAction = computed.focus
		? `Continue discovery on ${computed.focus.toUpperCase()} (${computed.ws[computed.focus].score}/100, needs +${computed.gate - computed.ws[computed.focus].score}).`
		: `All six Ws are at the gate of ${computed.gate} for the ${esc(stage)} stage. ${R.tasks?.[0] ? `Start with ${link(R.tasks[0].id)}: ${esc(R.tasks[0].title)}.` : "Begin implementation from the handoff."}`;
	const whatAnti = state.ws.what.ratings.find((r) => r.criterion === "explicit-anti-scope");
	const whyValue = state.ws.why.ratings.find((r) => r.criterion === "value-capture");
	const whetherEcon = state.ws.whether.ratings.find((r) => r.criterion === "unit-economics");
	const whichForm = state.ws.which.ratings.find((r) => r.criterion === "primary-form-factor");
	const whichIntegration = state.ws.which.ratings.find((r) => r.criterion === "integration-boundary");

	const sections = [
		["overview", "Overview"], ["readiness", "Readiness"], ["canvas", "Six-W canvas"], ["audience", "Audience"], ["marketing", "Marketing"],
		["scope", "Scope"], ["viability", "Viability"], ["delivery", "Delivery"], ["risks", "Risks"], ["technical", "Technical"], ["decisions", "Decisions"], ["sources", "Sources"],
	];

	return `<!doctype html>
<html lang="${esc(state.metadata.language ?? "en")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="6w-generated-at" content="${esc(generatedAt)}">
<meta name="6w-state-hash" content="${esc(hash)}">
<meta name="6w-blueprint-version" content="${esc(blueprintVersion)}">
<title>${esc(state.metadata.title)} &middot; 6W product blueprint</title>
<style>${CSS}</style>
</head>
<body>
<header class="top">${MARK}<div><h1>${esc(state.metadata.title)}</h1><p class="sub">6W product blueprint &middot; stage ${esc(stage)} &middot; ${esc(state.session.mode)} mode &middot; generated ${esc(generatedAt)}</p></div></header>
<nav class="sticky"><div class="in">${sections.map(([id, label]) => `<a href="#${id}">${label}</a>`).join("")}<input type="search" id="q" placeholder="Search this blueprint" aria-label="Search this blueprint" hidden></div></nav>
<main>

<section id="overview"><h2>Overview</h2>
<p class="lead">Readers: <a href="#scope">product</a> &middot; <a href="#audience">marketing</a> &middot; <a href="#technical">engineering</a></p>
<div class="flow">
<div class="step"><b>Problem</b>${esc(state.ws.why.summary)}</div><div class="arrow">&rarr;</div>
<div class="step"><b>Trigger</b>${esc(primary?.trigger ?? state.ws.who.summary)}</div><div class="arrow">&rarr;</div>
<div class="step"><b>Core loop</b>${esc(state.ws.what.summary)}</div><div class="arrow">&rarr;</div>
<div class="step"><b>Value</b>${esc(whyValue?.rationale ?? "")}</div>
</div>
<div class="card"><h3>Recommended next action</h3><p>${nextAction}</p><p class="meta">Overall ${computed.overall}/100 is a summary only. A weak W or an open critical risk is not cancelled by a strong average. Readiness measures decision clarity for the ${esc(stage)} stage, not the probability of success.</p></div>
</section>

<section id="readiness"><h2>Readiness</h2>
<p class="lead">Each W is scored on four sub-criteria rated 0 to 4, weighted 30/25/25/20, then limited by any active cap. Evidence is the weakest status among the four ratings.</p>
<div class="gauges">${WS.map((w) => gauge(w, computed.ws[w.key])).join("")}</div>
<details><summary>Scoreboard as the agent shows it</summary><pre>${esc(renderScoreboard(state, computed))}</pre></details>
</section>

<section id="canvas"><h2>Six-W canvas</h2>
<p class="lead">Order: Why, Who, What, Which, Whether, When. Expand a sub-criterion for its rationale, evidence and sources.</p>
<div class="grid">${WS.map((w) => wCard(w, state.ws[w.key], computed.ws[w.key])).join("")}</div>
</section>

<section id="audience"><h2>Audience</h2>
<p class="lead">Personas carry their evidence status. A card is produced only when context supports it. The anti-persona records who is excluded.</p>
${R.personas?.length ? `<div class="grid">${R.personas.map((p) => recordCard(p, [["Role", "role"], ["Priority", "priority"], ["Situation", "situation"], ["Desired outcome", "outcome"], ["Workaround today", "workaround"], ["Trigger", "trigger"], ["Objections", "objections"], ["Channels", "channels"], ["First value", "firstValue"], ["Why excluded", "reason"], ["Links", "links"], ["Sources", "sources"]])).join("")}</div>` : none("personas")}
<h3>Edge cases</h3>
${R.edges?.length ? table(R.edges, [["ID", (e) => `<a id="${esc(e.id)}"></a><code>${esc(e.id)}</code>`], ["Scenario", (e) => `<b>${esc(e.title)}</b><br><span class="meta">${esc(e.impact ?? "")}</span>`], ["Persona", (e) => (e.persona ? link(e.persona) : "")], ["Severity", (e) => esc(e.severity)], ["Frequency", (e) => esc(e.frequency)], ["Response", (e) => esc(e.response)], ["Decision", (e) => esc(e.scopeDecision)], ["Test", (e) => esc(e.test)]]) : none("edge cases")}
</section>

<section id="marketing"><h2>Marketing</h2>
<p class="lead">Hypotheses to test, not claims. Hypothetical copy is never a customer quote.</p>
${primary ? `<div class="grid"><div class="card"><h3>Positioning hypothesis</h3>${kv([["Audience", esc(primary.situation)], ["Problem", esc(state.ws.why.summary)], ["Benefit", esc(primary.outcome)], ["Alternative", esc(primary.workaround)]])}</div><div class="card"><h3>Objections</h3>${list(primary.objections)}</div><div class="card"><h3>Channels</h3>${list(primary.channels)}</div></div>` : none("positioning (no primary persona)")}
<h3>Experiments</h3>
${R.experiments?.length ? table(R.experiments, [["ID", (e) => `<a id="${esc(e.id)}"></a><code>${esc(e.id)}</code>`], ["Experiment", (e) => esc(e.title)], ["Measure", (e) => esc(e.measure)], ["Timebox", (e) => esc(e.timebox)], ["Decision rule", (e) => esc(e.decisionRule)], ["Status", (e) => esc(e.status)], ["Links", (e) => links(e.links)]]) : none("experiments")}
</section>

<section id="scope"><h2>Scope</h2>
<p class="lead">${esc(state.ws.what.summary)}</p>
<h3>Requirements</h3>
${R.requirements?.length ? `<div class="grid">${R.requirements.map((q) => `<article class="card" id="${esc(q.id)}"><h4>${esc(q.title)}</h4><div class="meta"><code>${esc(q.id)}</code> <span class="tag">${esc(q.priority)}</span> <span class="tag">${esc(q.status)}</span></div><p>${esc(q.outcome)}</p><h5>Acceptance</h5>${list(q.acceptance)}<p class="meta">Links: ${links(q.links)}</p></article>`).join("")}</div>` : none("requirements")}
<h3>Anti-scope</h3><p>${esc(whatAnti?.rationale ?? "Not yet recorded.")}</p>
</section>

<section id="viability"><h2>Viability</h2>
<p class="lead">${esc(state.ws.whether.summary)}</p>
<div class="card"><h3>Unit economics</h3><p>${esc(whetherEcon?.rationale ?? "Not yet estimated.")}</p><p class="meta">Evidence: ${esc(whetherEcon?.evidence ?? "unknown")}. Figures labeled provisional need re-verification before launch.</p></div>
</section>

<section id="delivery"><h2>Delivery</h2>
<p class="lead">${esc(state.ws.when.summary)}</p>
${R.tasks?.length ? table(R.tasks, [["ID", (t) => `<a id="${esc(t.id)}"></a><code>${esc(t.id)}</code>`], ["Task", (t) => esc(t.title)], ["Milestone", (t) => esc(t.milestone)], ["Verification", (t) => esc(t.verification)], ["Links", (t) => links(t.links)]]) : none("tasks")}
</section>

<section id="risks"><h2>Risks, assumptions and blockers</h2>
${R.risks?.length ? `<h3>Risks</h3>${table(R.risks, [["ID", (r) => `<a id="${esc(r.id)}"></a><code>${esc(r.id)}</code>`], ["Risk", (r) => esc(r.title)], ["Severity", (r) => esc(r.severity)], ["Status", (r) => esc(r.status ?? "unspecified")], ["Mitigation", (r) => esc(r.mitigation)], ["Remaining exposure", (r) => esc(r.exposure)], ["Links", (r) => links(r.links)]])}` : none("risks")}
${R.assumptions?.length ? `<h3>Assumptions</h3>${table(R.assumptions, [["ID", (a) => `<a id="${esc(a.id)}"></a><code>${esc(a.id)}</code>`], ["Assumption", (a) => esc(a.title)], ["Status", (a) => esc(a.status)], ["If false", (a) => esc(a.implication)], ["Links", (a) => links(a.links)]])}` : none("assumptions")}
</section>

<section id="technical"><h2>Technical direction</h2>
<p class="lead">${esc(state.ws.which.summary)}</p>
<div class="grid"><div class="card"><h3>Form factor</h3><p>${esc(whichForm?.rationale ?? "")}</p></div><div class="card"><h3>Integration boundary</h3><p>${esc(whichIntegration?.rationale ?? "")}</p></div></div>
<h3>Diagrams</h3>
<p class="meta">Diagrams are derived from the records above and introduce no new decision. Each says whether archify or the built-in fallback drew it. Designs are proposed until implemented.</p>
${["workflow", "architecture", "sequence", "erd"].map((t) => {
	const d = diagrams[t];
	if (!d) return `<p class="status-note">${esc(t)}: not generated.</p>`;
	if (!d.svg) return `<p class="status-note">${esc(t)}: ${esc(d.description)}</p>`;
	return `<figure class="diagram" id="diagram-${t}"><figcaption><b>${esc(t)}</b> <span class="tag">${esc(d.source)}</span></figcaption>${d.svg}<details><summary>Text description</summary><p>${esc(d.description)}</p>${d.rejected ? `<p class="meta">An archify output was rejected: ${esc(d.rejected)}</p>` : ""}</details></figure>`;
}).join("")}
</section>

<section id="decisions"><h2>Decisions</h2>
${R.decisions?.length ? table(R.decisions, [["ID", (d) => `<a id="${esc(d.id)}"></a><code>${esc(d.id)}</code>`], ["Decision", (d) => esc(d.title)], ["Status", (d) => `<span class="tag">${esc(d.status)}</span>`], ["Rationale", (d) => esc(d.rationale)], ["Alternatives", (d) => list(d.alternatives)], ["Evidence", (d) => esc(d.evidence)], ["Affects", (d) => links(d.affects)]]) : none("decisions")}
</section>

<section id="sources"><h2>Sources and export metadata</h2>
${R.sources?.length ? table(R.sources, [["ID", (s) => `<a id="${esc(s.id)}"></a><code>${esc(s.id)}</code>`], ["Source", (s) => esc(s.title)], ["Origin", (s) => esc(s.origin)], ["Locator", (s) => (s.locator && SAFE_URL.test(s.locator) && /^https?:/i.test(s.locator) ? `<a href="${esc(s.locator)}" rel="noopener">${esc(s.locator)}</a>` : esc(s.locator))], ["Coverage", (s) => esc(s.coverage)], ["Limitations", (s) => esc(s.limitations)]]) : none("sources")}
${kv([["Project", esc(state.metadata.projectId)], ["Schema version", esc(state.schemaVersion)], ["Rubric version", esc(state.rubricVersion)], ["Blueprint version", esc(blueprintVersion)], ["State hash", `<code>${esc(hash)}</code>`], ["Generated", esc(generatedAt)], ["Turns", esc(state.session.turns ?? "")]])}
<footer>Generated by 6W from <code>.6w/state.json</code>. Readiness is decision clarity for the selected stage, not a prediction of success. Nothing in this file was fetched from the network. Evidence labeled assumption or unknown has not been validated.</footer>
</section>
</main>
<script>${SEARCH_SCRIPT}</script>
</body>
</html>
`;
}

function main(argv) {
	const [file, out, ...flags] = argv;
	if (!file || !out) {
		console.error("usage: node render.mjs <state.json> <out.html> [--generated-at <iso>]");
		process.exit(2);
	}
	const gi = flags.indexOf("--generated-at");
	const generatedAt = gi >= 0 ? flags[gi + 1] : new Date().toISOString();
	let state;
	try {
		state = JSON.parse(readFileSync(file, "utf8"));
	} catch (err) {
		console.error(`${file}: ${err.code === "ENOENT" ? "file not found" : `not valid JSON (${err.message})`}`);
		process.exit(1);
	}
	const errors = validateState(state);
	if (errors.length) {
		console.error(`${file}: not rendered, ${errors.length} problem(s)`);
		for (const e of errors) console.error(`  - ${e}`);
		process.exit(1);
	}
	const html = renderHtml(state, { generatedAt });
	writeFileSync(`${out}.tmp`, html);
	renameSync(`${out}.tmp`, out);
	console.log(`${out}: ${html.length} bytes, state ${stateHash(state)}`);
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
