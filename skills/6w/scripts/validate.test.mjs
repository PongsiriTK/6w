import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateState } from "./validate.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const examples = join(here, "../../../examples");
const load = (name) => JSON.parse(readFileSync(join(examples, name, "state.json"), "utf8"));

test("every example state validates", () => {
	const dirs = readdirSync(examples, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
	assert.ok(dirs.length >= 2, "expected at least two example packages");
	for (const name of dirs) {
		const errors = validateState(load(name));
		assert.deepEqual(errors, [], `${name}: ${errors.join("; ")}`);
	}
});

test("a link to a missing record is reported with its path", () => {
	const state = load("menulens-complete");
	state.records.requirements[0].links.push("PERSONA-999");
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("records.requirements[0].links") && e.includes("PERSONA-999")), errors.join("\n"));
});

test("a duplicate ID and a wrong prefix are both reported", () => {
	const state = load("menulens-complete");
	state.records.risks.push({ ...state.records.risks[0] });
	state.records.tasks.push({ id: "REQ-900", title: "misfiled" });
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("is not unique")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("REQ-900") && e.includes("must start with TASK-")), errors.join("\n"));
});

test("a cap id from another W is rejected", () => {
	const state = load("menulens-partial");
	state.ws.why.caps.push({ id: "who-everyone", active: true });
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("ws.why.caps") && e.includes("who-everyone")), errors.join("\n"));
});

test("criteria must match the rubric exactly and in order", () => {
	const state = load("menulens-partial");
	const r = state.ws.when.ratings;
	[r[0], r[1]] = [r[1], r[0]];
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.startsWith("ws.when.ratings")), errors.join("\n"));
});

test("a stored score that disagrees with the ratings is rejected", () => {
	const state = load("menulens-complete");
	state.ws.why.score = 12;
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("ws.why.score 12")), errors.join("\n"));
});

test("schema violations name the path: rating out of range, bad enum, unknown property", () => {
	const state = load("menulens-partial");
	state.ws.why.ratings[0].rating = 7;
	state.session.mode = "turbo";
	state.metadata.extra = true;
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("state.ws.why.ratings[0].rating") && e.includes("maximum")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("state.session.mode")), errors.join("\n"));
	assert.ok(errors.some((e) => e.includes("state.metadata: unknown property extra")), errors.join("\n"));
});

test("an override naming a non-W is rejected", () => {
	const state = load("menulens-partial");
	state.session.overrides = [{ w: "where", reason: "x" }];
	const errors = validateState(state);
	assert.ok(errors.some((e) => e.includes("session.overrides") || e.includes("overrides[0].w")), errors.join("\n"));
});
