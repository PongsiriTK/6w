# Changelog

All notable changes to this repository are recorded here. The format follows Keep a Changelog, and the project uses semantic versioning.

## [Unreleased]

## [0.0.4] - 2026-10-24

### Added

- `skills/6w/references/persona-edge-matrix.md`: the four roles, card fields, scope decisions, and the behavior-to-product-decision table.
- `skills/6w/references/interview-examples.md`: a weak and a strong question for all 24 sub-criteria in the three-options shape.
- `skills/6w/references/stack-archetypes.md`: fast stack and scale stack by form factor, the model-dependency rules, and the unit-economics table.
- Six behavioral fixtures under `tests/fixtures/` (vague idea, polished unsupported pitch, finish immediately, override a score, late audience change, impossible date), each with input, review notes, expected state and deterministic invariants. `tests/fixtures.test.mjs` checks them and `build-fixtures.mjs` regenerates them.
- The skill now describes revision propagation: a changed decision becomes a new proposed `DEC-` with `affects`, the old one is superseded, dependent Ws are re-rated and marked for review.

- `skills/6w/references/pricing-models.md`, adapted from the MIT-licensed `pricing-strategy` skill in phuryn/pm-skills and credited in `THIRD_PARTY_NOTICES.md`. The skill reads it for commercial projects when value capture is weak: choose the value metric first, then the model, record the result as a proposed decision, assumptions, experiments and dated sources.
- Rubric 0.2: the Why value-capture anchor for a 4 names the value metric and a falsifying experiment. Weights, caps and formula unchanged. Both examples re-rated, no rating changed.

### Fixed

- The SVG sanitizer was a blocklist and could be bypassed (handlers after a slash, entity-encoded `javascript:`, CSS `@import`, nested `<svg>`, `<img>` breakout, SMIL). It is now an allowlist tokenizer that rejects any element, attribute, entity or non-fragment reference it does not recognize, and never strips. The HTML page also carries a Content Security Policy that allows only the inline search script and no network source.
- `export.mjs` swapped the handoff and the HTML in two steps with no rollback. A failure now restores both previous copies, a crash between the steps is recovered on the next run, and the new bundle must pass its own consistency check before the previous one is removed.
- `migrate` overwrote an existing `extensions` entry on a name collision and only looked two levels deep. It now walks the whole schema and parks every unknown field under its JSON path without overwriting.
- Free text from state could inject headings, links, HTML and duplicate anchors into the Markdown handoff. Every state string is now escaped for Markdown, and missing statuses print as unspecified instead of an invented default.
- `saveState` now holds a lock file, writes a unique fsynced temp file, defaults the expected revision to the one the state was loaded with, and checkpoints the previous file before replacing it.
- The state hash is canonical: sorted keys, independent of `revision`, `updatedAt`, `extensions` and `export`.
- An archify ERD is ignored while state records no entities, so the page cannot show tables the handoff says do not exist.
- `scripts/build-demo.mjs` uses the shared main-module check and stages the new demo before replacing the old one.

## [0.0.3] - 2026-10-23

### Added

- `state.mjs`: validated atomic save with a revision check, checkpoints under `.6w/checkpoints/`, migration of unknown fields into `extensions`.
- `diagrams.mjs`: diagram specs derived from state, archify detection and ingestion with an SVG sanitizer that refuses scripts and external references, and a monoline inline-SVG fallback for workflow, architecture and sequence.
- `handoff.mjs` and `export.mjs`: the ten Markdown handoff files and `export-manifest.json`, exported with the HTML as one checked bundle. A failed export leaves the previous bundle intact.
- `scripts/build-demo.mjs` rebuilds the published demo, now including its handoff. A test fails when the demo is stale.
- First compatibility row: Claude Code 2.1.282, scripts and export verified, install and activation untested.

- `skills/6w/scripts/render.mjs` and `templates/blueprint.css`: the first HTML blueprint renderer. One offline file, inline CSS and SVG, escaped content, deterministic for a fixed timestamp.
- Live demo of the complete MenuLens state at https://pongsiritk.github.io/6w/demo/menulens/ (GitHub Pages from `docs/`). A test fails when the page drifts from the state.
- `scoring.mjs` holds the pure scoring functions; `score.mjs` is the CLI.
- README flow diagram as an image generated with GPT Image 2.

### Fixed

- Main-module detection in the CLIs used a hand-built file URL and skipped `main()` under a symlinked install or a path with `#` or `%`, so `validate.mjs` could exit 0 without checking anything. Now compares real paths.
- Schema validation could be bypassed with inherited property names such as `constructor`. Uses own-property checks.
- The validator now refuses schema keywords it does not implement, checks the `persona` field on edge cases, rejects duplicate cap ids and active caps without a reason.
- `score.mjs --write` validates first and writes atomically.
- The repository gate resolves links relative to their file, checks HTML `src` and `srcset`, reference-style links and `~~~` fences, and requires every manifest in `.version-bump.json`.
- The scoreboard examples in the blueprint, skill and README showed a capped W above its cap. Evidence vocabulary unified on the five statuses from section 5.

## [0.0.2] - 2026-10-23

### Added

- `skills/6w/schemas/state.schema.json` and `export-manifest.schema.json`.
- `skills/6w/scripts/rubric.mjs`, `score.mjs` (scores, caps, scoreboard, idempotent `--write`) and `validate.mjs` (schema, rubric, linked IDs, score consistency), with `node --test` suites.
- MenuLens demo under `examples/`: a naive state that trips every cap and a refined state that clears them, with a turn log.
- Lineage note on the Five Ws in the README and blueprint.
- Mermaid flow diagram in the README.

### Changed

- `SKILL.md` now calls `score.mjs` and `validate.mjs` instead of asking for hand arithmetic.
- `npm test` runs the repository gate and the script tests.

## [0.0.1] - 2026-10-23

### Added

- Master blueprint merged from the two source specifications.
- Portable skill draft at `skills/6w/SKILL.md` and the scoring rubric reference.
- Per-host manifests for Claude Code, Cursor, Codex and Hermes.
- Repository gate `scripts/check-repo.mjs` and GitHub Actions workflow.
- The 6W mark in light, dark and icon variants.
- v0.1 implementation plan under `docs/plans/`.
