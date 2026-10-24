import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CLIS = ["score.mjs", "validate.mjs", "render.mjs", "export.mjs", "state.mjs", "diagrams.mjs"];

for (const cli of CLIS) {
	test(`${cli} prints usage: exit 0 on --help, exit 2 with no arguments`, () => {
		const help = spawnSync("node", [join(here, cli), "--help"], { encoding: "utf8" });
		assert.equal(help.status, 0, `${cli} --help: ${help.stderr}`);
		assert.match(help.stderr, new RegExp(`usage: node ${cli.replace(".", "\\.")}`));
		const none = spawnSync("node", [join(here, cli)], { encoding: "utf8" });
		assert.equal(none.status, 2, `${cli} with no args`);
		assert.match(none.stderr, /usage:/);
	});
}

test("validate.mjs --json reports ok and a problem list", () => {
	const example = join(here, "../../../examples/menulens-complete/state.json");
	const r = spawnSync("node", [join(here, "validate.mjs"), example, "--json"], { encoding: "utf8" });
	assert.equal(r.status, 0, r.stderr);
	const j = JSON.parse(r.stdout);
	assert.equal(j.ok, true);
	assert.deepEqual(j.problems, []);
	assert.equal(j.records, 27);
});

test("score.mjs - scores a state from stdin, matches the file result, and refuses --write", () => {
	const example = join(here, "../../../examples/menulens-partial/state.json");
	const input = readFileSync(example, "utf8");
	const piped = spawnSync("node", [join(here, "score.mjs"), "-", "--json"], { input, encoding: "utf8" });
	assert.equal(piped.status, 0, piped.stderr);
	const fromFile = spawnSync("node", [join(here, "score.mjs"), example, "--json"], { encoding: "utf8" });
	assert.deepEqual(JSON.parse(piped.stdout), JSON.parse(fromFile.stdout));
	assert.equal(JSON.parse(piped.stdout).overall, 24);
	const refused = spawnSync("node", [join(here, "score.mjs"), "-", "--write"], { input, encoding: "utf8" });
	assert.equal(refused.status, 2);
	assert.match(refused.stderr, /--write needs a file/);
	const bad = spawnSync("node", [join(here, "score.mjs"), "-"], { input: "{not json", encoding: "utf8" });
	assert.equal(bad.status, 1);
	assert.match(bad.stderr, /stdin: not valid JSON/);
});
