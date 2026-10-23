#!/usr/bin/env node
// Rebuild the published MenuLens demo from the complete example state.
//   node scripts/build-demo.mjs
// Exports a full bundle into a temporary directory with a fixed timestamp, then copies the
// HTML to docs/demo/menulens/index.html and the handoff to docs/demo/menulens/handoff/.
// The render tests re-run this build in memory and fail when the committed demo is stale.

import { mkdtempSync, mkdirSync, copyFileSync, readdirSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { exportBundle, HANDOFF_DIR, HTML_NAME } from "../skills/6w/scripts/export.mjs";

export const DEMO_STATE = "examples/menulens-complete/state.json";
export const DEMO_DIR = "docs/demo/menulens";
export const DEMO_GENERATED_AT = "2026-10-23T16:00:00+07:00";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function buildDemo() {
	const state = JSON.parse(readFileSync(join(root, DEMO_STATE), "utf8"));
	const tmp = mkdtempSync(join(tmpdir(), "6w-demo-"));
	exportBundle(state, tmp, { generatedAt: DEMO_GENERATED_AT });
	const out = join(root, DEMO_DIR);
	mkdirSync(join(out, "handoff"), { recursive: true });
	copyFileSync(join(tmp, HTML_NAME), join(out, "index.html"));
	for (const n of readdirSync(join(out, "handoff"))) rmSync(join(out, "handoff", n));
	for (const n of readdirSync(join(tmp, HANDOFF_DIR))) copyFileSync(join(tmp, HANDOFF_DIR, n), join(out, "handoff", n));
	rmSync(tmp, { recursive: true, force: true });
	return out;
}

if (process.argv[1] && existsSync(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const out = buildDemo();
	console.log(`demo rebuilt at ${out}`);
}
