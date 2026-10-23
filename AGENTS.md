# Agent instructions

This repository holds the 6W skill and its blueprint. Read [BLUEPRINT.md](BLUEPRINT.md) before changing behavior, and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## File map

| Path | Owns |
| --- | --- |
| `BLUEPRINT.md` | The master specification. Every behavior rule, output contract and open decision lives here. |
| `skills/6w/SKILL.md` | The portable skill. Hosts load this file. Keep it under 500 lines and keep every path it names real. |
| `skills/6w/references/` | Material the skill reads on demand: the scoring rubric and later the persona, risk and stack references. |
| `skills/6w/scripts/` | `rubric.mjs` holds the numbers, `scoring.mjs` the pure functions, `score.mjs` the scoring CLI, `validate.mjs` checks a state file, `render.mjs` writes the HTML blueprint. Tests sit next to them as `*.test.mjs`. |
| `skills/6w/templates/` | `blueprint.css`, inlined by `render.mjs`. |
| `docs/demo/menulens/` | The rendered complete example, served by GitHub Pages. Regenerate with `render.mjs --generated-at <the meta value>` after changing the renderer or the example; a test fails when it is stale. |
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
- Never write a score by hand. Ratings and active caps are judgments recorded in state. `score.mjs --write` produces the numbers and `validate.mjs` rejects a mismatch.
- The rubric numbers live in `rubric.mjs` and `references/scoring-rubric.md`. Change both together and bump the rubric version.
- The version string is identical across every file listed in `.version-bump.json`.
- Project state produced by 6W lives in the user's project under `.6w/`, never in this repository.
- Do not claim a host is supported until `docs/compatibility.md` records the test.
