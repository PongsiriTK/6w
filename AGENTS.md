# Agent instructions

This repository holds the 6W skill and its blueprint. Read [BLUEPRINT.md](BLUEPRINT.md) before changing behavior, and [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## File map

| Path | Owns |
| --- | --- |
| `BLUEPRINT.md` | The master specification. Every behavior rule, output contract and open decision lives here. |
| `skills/6w/SKILL.md` | The portable skill. Hosts load this file. Keep it under 500 lines and keep every path it names real. |
| `skills/6w/references/` | Material the skill reads on demand: the scoring rubric and later the persona, risk and stack references. |
| `docs/plans/` | Implementation plans. One file per plan, with phases, checklists and validation. |
| `docs/sources/` | The two source documents the blueprint was merged from. Read-only history. |
| `docs/compatibility.md` | The tested-host matrix. A host is listed as supported only after a recorded test. |
| `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.hermes-plugin/` | Per-host manifests. All carry the same version string. |
| `scripts/check-repo.mjs` | The repository gate. Validates manifests, frontmatter and relative links. |
| `assets/logo/` | The 6W mark in SVG and PNG. |

## Rules

- `skills/6w/SKILL.md` is the single source of truth for behavior. Host manifests only point at it. Never fork skill text per host.
- Do not reference a file that does not exist. `npm test` fails on a broken relative link.
- The version string is identical across every file listed in `.version-bump.json`.
- Project state produced by 6W lives in the user's project under `.6w/`, never in this repository.
- Do not claim a host is supported until `docs/compatibility.md` records the test.
