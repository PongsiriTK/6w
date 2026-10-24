# Agent instructions

This repository holds the 6W skill and its blueprint. Read [BLUEPRINT.md](BLUEPRINT.md) before changing behavior, and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## File map

| Path | Owns |
| --- | --- |
| `BLUEPRINT.md` | The master specification. Every behavior rule, output contract and open decision lives here. |
| `skills/6w/SKILL.md` | The portable skill. Hosts load this file. Keep it under 500 lines and keep every path it names real. |
| `skills/6w/references/` | Material the skill reads on demand: `scoring-rubric.md` always, `interview-examples.md` when forming a question, `persona-edge-matrix.md` before a card, `pricing-models.md` for commercial projects, `stack-archetypes.md` before a technical direction. |
| `tests/fixtures/` | Behavioral cases. `build-fixtures.mjs` generates them from the examples; edit the generator, not the JSON. `tests/fixtures.test.mjs` fails when they are stale. |
| `skills/6w/scripts/` | `rubric.mjs` holds the numbers, `scoring.mjs` the pure functions, `score.mjs` the scoring CLI, `validate.mjs` checks a state file, `state.mjs` saves and checkpoints, `diagrams.mjs` handles archify and the SVG fallback, `render.mjs` and `handoff.mjs` produce HTML and Markdown, `export.mjs` writes the bundle atomically. Tests sit next to them as `*.test.mjs`. |
| `skills/6w/templates/` | `blueprint.css`, inlined by `render.mjs`. |
| `docs/demo/menulens/` | The exported complete example (page plus handoff), served by GitHub Pages. Regenerate with `node scripts/build-demo.mjs` after changing any renderer or the example; a test fails when it is stale. |
| `skills/6w/schemas/` | `state.schema.json` is the shape of `.6w/state.json`. Change it together with `validate.mjs` and both examples. |
| `examples/` | The MenuLens demo states. Both must validate and their scores must match `score.mjs`. |
| `docs/plans/` | Implementation plans. One file per plan, with phases, checklists and validation. |
| `docs/sources/` | The two source documents the blueprint was merged from. Read-only history. |
| `docs/compatibility.md` | The tested-host matrix. A host is listed as supported only after a recorded test. |
| `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.hermes-plugin/` | Per-host manifests. All carry the same version string. |
| `scripts/check-repo.mjs` | The repository gate. Validates manifests, frontmatter and relative links. |
| `assets/logo/` | The 6W mark in SVG and PNG. |

## Rules

- `skills/6w/SKILL.md` is the single source of truth for behavior. Host manifests only point at it. Never fork skill text per host.
- Do not reference a file that does not exist. `npm test` fails on a broken relative link.
- Bump `BLUEPRINT_VERSION` in `export.mjs` and the default in `render.mjs` together with the manifest versions.
- Never write a score by hand. Ratings and active caps are judgments recorded in state. `score.mjs --write` produces the numbers and `validate.mjs` rejects a mismatch.
- The rubric numbers live in `rubric.mjs` and `references/scoring-rubric.md`. Change both together, bump the rubric version, add the new version to the schema enum, re-rate both examples and record the result under Versions in the rubric file.
- Adapted third-party text is credited in `THIRD_PARTY_NOTICES.md`.
- The version string is identical across every file listed in `.version-bump.json`.
- Project state produced by 6W lives in the user's project under `.6w/`, never in this repository.
- Do not claim a host is supported until `docs/compatibility.md` records the test.
