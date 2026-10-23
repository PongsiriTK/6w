# Changelog

All notable changes to this repository are recorded here. The format follows Keep a Changelog, and the project uses semantic versioning.

## [Unreleased]

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
