#!/usr/bin/env node
// Validate a 6W state file.
//   node validate.mjs <state.json>
// Checks the state against schemas/state.schema.json (a hand-written validator over the
// schema subset the file uses, which refuses any keyword it does not implement), that every
// W carries exactly the rubric's four criteria, that every cap id belongs to its W and appears
// once with a reason when active, that every linked ID resolves to a record, that IDs are
// unique and carry the right prefix, and that stored scores match the computed ones.
// Exit 1 with one line per problem.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { WS, W_KEYS } from "./rubric.mjs";
import { computeScores, isMainModule } from "./scoring.mjs";

const here = dirname(fileURLToPath(import.meta.url));
export const SCHEMA = JSON.parse(readFileSync(join(here, "../schemas/state.schema.json"), "utf8"));
export const EXPORT_MANIFEST_SCHEMA = JSON.parse(readFileSync(join(here, "../schemas/export-manifest.schema.json"), "utf8"));

const ID_PREFIX = { sources: "SRC", personas: "PERSONA", edges: "EDGE", decisions: "DEC", requirements: "REQ", risks: "RISK", assumptions: "ASM", experiments: "EXP", tasks: "TASK" };
const ID_RE = /^(SRC|PERSONA|EDGE|DEC|REQ|RISK|ASM|EXP|TASK)-\d{3,}$/;
const LINK_KEYS = new Set(["links", "sources", "affects"]);
const SINGLE_LINK_KEYS = new Set(["persona"]);

// Keywords the validator implements. Any other keyword in a schema is an error, so a schema
// edit can never turn into a silent pass.
const SUPPORTED = new Set(["$schema", "$id", "$ref", "$defs", "title", "description", "type", "enum", "const", "required", "properties", "additionalProperties", "items", "minItems", "maxItems", "minimum", "maximum", "pattern", "minLength"]);

export function assertSupportedKeywords(schema, path = "schema") {
	if (!schema || typeof schema !== "object" || Array.isArray(schema)) return;
	for (const k of Object.keys(schema)) {
		if (!SUPPORTED.has(k)) throw new Error(`${path}: unsupported schema keyword ${k}`);
	}
	for (const [k, v] of Object.entries(schema.properties ?? {})) assertSupportedKeywords(v, `${path}.properties.${k}`);
	for (const [k, v] of Object.entries(schema.$defs ?? {})) assertSupportedKeywords(v, `${path}.$defs.${k}`);
	if (schema.items) assertSupportedKeywords(schema.items, `${path}.items`);
	if (typeof schema.additionalProperties === "object") assertSupportedKeywords(schema.additionalProperties, `${path}.additionalProperties`);
}

function typeOf(v) {
	if (v === null) return "null";
	if (Array.isArray(v)) return "array";
	return typeof v;
}

function resolveRef(root, ref) {
	if (!ref.startsWith("#/")) throw new Error(`unsupported $ref ${ref}: only local #/ references are implemented`);
	const target = ref.slice(2).split("/").reduce((o, k) => (o == null ? undefined : o[k]), root);
	if (!target) throw new Error(`$ref ${ref} does not resolve`);
	return target;
}

export function checkSchema(schema, value, path, errors, root = schema) {
	if (schema.$ref) schema = resolveRef(root, schema.$ref);
	const t = typeOf(value);
	if (schema.type) {
		const types = Array.isArray(schema.type) ? schema.type : [schema.type];
		const ok = types.some((want) => (want === "integer" ? t === "number" && Number.isInteger(value) : want === t));
		if (!ok) { errors.push(`${path}: expected ${types.join(" or ")}, got ${t}`); return; }
	}
	if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
	if (schema.const !== undefined && value !== schema.const) errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
	if (t === "number") {
		if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: ${value} is below minimum ${schema.minimum}`);
		if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: ${value} is above maximum ${schema.maximum}`);
	}
	if (t === "string") {
		if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: ${JSON.stringify(value)} does not match ${schema.pattern}`);
		if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength}`);
	}
	if (t === "array") {
		if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} items`);
		if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: allows at most ${schema.maxItems} items`);
		if (schema.items) value.forEach((v, i) => checkSchema(schema.items, v, `${path}[${i}]`, errors, root));
	}
	if (t === "object") {
		const props = schema.properties ?? {};
		for (const k of schema.required ?? []) if (!Object.hasOwn(value, k)) errors.push(`${path}: missing required ${k}`);
		for (const k of Object.keys(value)) {
			const v = value[k];
			if (Object.hasOwn(props, k)) checkSchema(props[k], v, `${path}.${k}`, errors, root);
			else if (schema.additionalProperties === false) errors.push(`${path}: unknown property ${k}`);
			else if (typeof schema.additionalProperties === "object") checkSchema(schema.additionalProperties, v, `${path}.${k}`, errors, root);
		}
	}
}

function collectIds(records, errors) {
	const ids = new Set();
	for (const [collection, list] of Object.entries(records ?? {})) {
		for (const [i, rec] of (list ?? []).entries()) {
			const id = rec?.id;
			if (typeof id !== "string") continue;
			if (!id.startsWith(`${ID_PREFIX[collection]}-`)) errors.push(`records.${collection}[${i}].id ${id} must start with ${ID_PREFIX[collection]}-`);
			if (ids.has(id)) errors.push(`records.${collection}[${i}].id ${id} is not unique`);
			ids.add(id);
		}
	}
	return ids;
}

function checkLink(id, path, ids, errors) {
	if (!ID_RE.test(id)) errors.push(`${path}: ${JSON.stringify(id)} is not a record ID`);
	else if (!ids.has(id)) errors.push(`${path}: ${id} does not resolve to a record`);
}

function walkLinks(value, path, ids, errors) {
	if (Array.isArray(value)) {
		value.forEach((v, i) => walkLinks(v, `${path}[${i}]`, ids, errors));
	} else if (value && typeof value === "object") {
		for (const [k, v] of Object.entries(value)) {
			if (LINK_KEYS.has(k) && Array.isArray(v) && v.every((x) => typeof x === "string")) {
				v.forEach((id, i) => checkLink(id, `${path}.${k}[${i}]`, ids, errors));
			} else if (SINGLE_LINK_KEYS.has(k) && typeof v === "string") {
				checkLink(v, `${path}.${k}`, ids, errors);
			} else {
				walkLinks(v, `${path}.${k}`, ids, errors);
			}
		}
	}
}

export function validateState(state, { scores = true } = {}) {
	const errors = [];
	assertSupportedKeywords(SCHEMA);
	checkSchema(SCHEMA, state, "state", errors);
	if (errors.length) return errors;

	for (const w of WS) {
		const ws = state.ws[w.key];
		const got = ws.ratings.map((r) => r.criterion);
		const want = w.criteria.map((c) => c.key);
		if (got.length !== want.length || want.some((k, i) => got[i] !== k)) {
			errors.push(`ws.${w.key}.ratings: criteria must be exactly [${want.join(", ")}] in order, got [${got.join(", ")}]`);
		}
		const seen = new Set();
		for (const [i, cap] of (ws.caps ?? []).entries()) {
			if (!w.caps.some((rc) => rc.id === cap.id)) errors.push(`ws.${w.key}.caps[${i}].id ${cap.id} is not a cap of ${w.key}`);
			if (seen.has(cap.id)) errors.push(`ws.${w.key}.caps[${i}].id ${cap.id} appears more than once`);
			seen.add(cap.id);
			if (cap.active && !cap.reason) errors.push(`ws.${w.key}.caps[${i}]: an active cap needs a reason`);
		}
	}
	for (const k of Object.keys(state.ws)) if (!W_KEYS.includes(k)) errors.push(`ws.${k}: unknown W`);

	const ids = collectIds(state.records, errors);
	walkLinks(state.ws, "ws", ids, errors);
	walkLinks(state.records, "records", ids, errors);

	if (scores) {
		const computed = computeScores(state);
		for (const w of WS) {
			const stored = state.ws[w.key].score;
			if (stored !== undefined && stored !== computed.ws[w.key].score) errors.push(`ws.${w.key}.score ${stored} does not match computed ${computed.ws[w.key].score}; run score.mjs --write`);
		}
		if (state.overall !== undefined && state.overall !== computed.overall) errors.push(`overall ${state.overall} does not match computed ${computed.overall}; run score.mjs --write`);
	}
	return errors;
}

export function validateExportManifest(manifest) {
	const errors = [];
	assertSupportedKeywords(EXPORT_MANIFEST_SCHEMA);
	checkSchema(EXPORT_MANIFEST_SCHEMA, manifest, "manifest", errors);
	return errors;
}

function main(argv) {
	const [file] = argv;
	if (!file) {
		console.error("usage: node validate.mjs <state.json>");
		process.exit(2);
	}
	let state;
	try {
		state = JSON.parse(readFileSync(file, "utf8"));
	} catch (err) {
		console.error(`${file}: ${err.code === "ENOENT" ? "file not found" : `not valid JSON (${err.message})`}`);
		process.exit(1);
	}
	const errors = validateState(state);
	if (errors.length) {
		console.error(`${file}: ${errors.length} problem(s)`);
		for (const e of errors) console.error(`  - ${e}`);
		process.exit(1);
	}
	const n = Object.values(state.records ?? {}).reduce((a, l) => a + (l?.length ?? 0), 0);
	console.log(`${file}: ok (${n} records, scores consistent)`);
}

if (isMainModule(import.meta.url)) main(process.argv.slice(2));
