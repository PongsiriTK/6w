<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo/6w-mark-dark.svg" />
    <img src="assets/logo/6w-mark.svg" alt="6W" width="318" height="170" />
  </picture>
</p>

<h3 align="center">Give your idea a foundation before you build.</h3>

<p align="center">An open-source agent skill that walks you through Why, Who, What, Which, Whether and When before any code, scores your readiness without flattering you, and hands your coding agent a plan it can execute.</p>

## Status

This repository holds the master blueprint and a working draft of the skill. The renderer, validator, schemas and host adapters have not been built yet. The skill already works as a conversational guide. Deterministic scoring and the HTML export arrive with the phases in `docs/plans/0001-v0.1-implementation.md`. No host is listed as tested in `docs/compatibility.md` yet.

## What it does

You bring an idea, some notes, a brief or a repository. 6W reads it, drafts six decisions with their provenance, shows you a scoreboard, and asks one or two questions per turn with concrete options. You can skip, go deeper, change your mind, or finish at any time. Finishing early gives you an honest partial package, never an invented complete one.

Two outputs come from one state file:

- `6w-blueprint.html`. One offline file for people. Readiness, canvas, persona and edge-case cards, marketing hypotheses, scope, unit economics, delivery plan, risks, stack options and diagrams. No CDN, readable without JavaScript, prints cleanly.
- `.6w/handoff/`. Token-dense Markdown for your coding agent. Requirements with acceptance criteria, architecture, an ordered task list, decisions, risks and a guardrail file.

The scoreboard you see every turn:

```text
6W PRODUCT FOUNDATION                      gate 90   stage: build MVP   mode: quick
overall 62/100  [############........]

  W        score  status  evidence     note
  WHY       94    OK      untested     Invoice reconciliation for boutique agencies
  WHO       91    OK      user         Agencies of 5 to 20 staff on Xero
  WHAT      72    ..      assumption   No anti-scope list yet (cap 65 lifts when added)
  WHICH     85    ..      assumption   Web dashboard plus Slack approval bot
  WHETHER   40    CAP     unknown      Paid OCR with no cost per active user
  WHEN      30    ..      unknown      Two weeks, not mapped to scope
```

Each W is scored on four named sub-criteria. Hard caps stop a vague idea from scoring 95. Evidence is tracked separately from the score, so "the user agreed" never turns into "this is proven".

## Install

These commands follow each host's documented convention. None has been recorded as tested yet. See `docs/compatibility.md` and please report what you find.

Claude Code:

```text
/plugin marketplace add PongsiriTK/6w
/plugin install 6w@6w
```

Cursor, Codex and other hosts that read the Agent Skills convention:

```bash
npx skills add PongsiriTK/6w
```

Manual: copy `skills/6w/` into your host's skills directory.

## Use

Say any of these to your agent:

- "Use 6W to help me develop this idea."
- "Review this brief with 6W."
- "Resume the 6W foundation for this project."
- "Finish now and export the blueprint."

Or, where the host supports commands, `/6w`, `/6w quick`, `/6w deep`, `/6w roast`, `/6w personas`, `/6w skip`, `/6w finish`, `/6w audit`.

## What is inside

| Path | Content |
| --- | --- |
| `BLUEPRINT.md` | The master specification: framework, conversation design, rubric, outputs, system design, repository layout, acceptance criteria and open decisions |
| `skills/6w/SKILL.md` | The portable skill every host loads |
| `skills/6w/references/scoring-rubric.md` | Sub-criteria, anchors, caps and the formula |
| `docs/plans/` | Implementation plans with checklists |
| `docs/compatibility.md` | Tested-host matrix |
| `docs/porting-to-a-new-host.md` | How to add a host |
| `docs/sources/` | The two documents this blueprint was merged from |
| `assets/logo/` | The 6W mark in SVG and PNG |
| `scripts/check-repo.mjs` | Repository gate, run with `npm test` |

## Where the structure comes from

The repository layout borrows from four open-source agent plugins: one skill tree shared by every host behind thin per-host manifests (obra/superpowers), manifest fields and a skill folder with references and scripts (cursor/plugins `pstack`), the minimum viable plugin shape (cursor/plugins `create-plugin`), and a zero-dependency Node toolchain with schemas and examples shipped inside the skill (tt-a1i/archify). Section 12 of `BLUEPRINT.md` attributes each convention.

## Contributing

Read `CONTRIBUTING.md`. Run `npm test` before opening a pull request. Rubric changes carry a version and evaluation results.

## License

MIT. See `LICENSE`.
