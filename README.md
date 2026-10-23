<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo/6w-mark-dark.svg" />
    <img src="assets/logo/6w-mark.svg" alt="6W" width="318" height="170" />
  </picture>
</p>

<h3 align="center">Give your idea a foundation before you build.</h3>

<p align="center">An open-source agent skill that walks you through Why, Who, What, Which, Whether and When before any code, scores your readiness without flattering you, and hands your coding agent a plan it can execute.</p>

## Status

This repository holds the master blueprint, the skill, its scoring, validation and HTML rendering scripts, and a worked demo with a live rendered page. The skill works today as a conversational guide, the scripts make its scores deterministic, and the renderer produces the offline blueprint. The Markdown handoff export, the diagram adapter and the host tests are the next phases in `docs/plans/0001-v0.1-implementation.md`. No host is listed as tested in `docs/compatibility.md` yet.

## What it does

You bring an idea, some notes, a brief or a repository. 6W reads it, drafts six decisions with their provenance, shows you a scoreboard, and asks one or two questions per turn with concrete options. You can skip, go deeper, change your mind, or finish at any time. Finishing early gives you an honest partial package, never an invented complete one.

<p align="center"><img src="assets/readme/flow.png" alt="Flow: idea, notes, brief or repo; ingest and rate all six Ws; while any W is below the gate, ask one or two questions with three options, record the answer and rescore; then lock assumptions and risks into .6w/state.json, which produces 6w-blueprint.html for people and .6w/handoff/ for the coding agent" width="900" /></p>

Two outputs come from one state file:

- `6w-blueprint.html`. One offline file for people. Readiness, canvas, persona and edge-case cards, marketing hypotheses, scope, unit economics, delivery plan, risks, stack options and diagrams. No CDN, readable without JavaScript, prints cleanly. [See the MenuLens example](https://pongsiritk.github.io/6w/demo/menulens/).
- `.6w/handoff/`. Token-dense Markdown for your coding agent. Requirements with acceptance criteria, architecture, an ordered task list, decisions, risks and a guardrail file.

The scoreboard you see every turn:

```text
6W PRODUCT FOUNDATION                      gate 90   stage: build MVP   mode: quick
overall 61/100  [############........]

  W        score  status  evidence     note
  WHY       94    OK      assumption   Invoice reconciliation for boutique agencies
  WHO       91    OK      user         Agencies of 5 to 20 staff on Xero
  WHAT      65    CAP     assumption   Seven features and no anti-scope list (capped at 65)
  WHICH     85    ..      assumption   Web dashboard plus Slack approval bot
  WHETHER   40    CAP     unknown      Paid OCR with no cost per active user
  WHEN      30    ..      unknown      Two weeks, not mapped to scope
```

Each W is scored on four named sub-criteria. Hard caps stop a vague idea from scoring 95. Evidence is tracked separately from the score, so "the user agreed" never turns into "this is proven".

## Demo

**Open the rendered blueprint: [pongsiritk.github.io/6w/demo/menulens](https://pongsiritk.github.io/6w/demo/menulens/)**

That page is `6w-blueprint.html` rendered by `skills/6w/scripts/render.mjs` from `examples/menulens-complete/state.json`. It is one file with inline CSS, no CDN, no font download, readable with JavaScript disabled, and it prints. A test fails if the page ever drifts from the state that produced it.

`examples/` holds the worked session behind it: MenuLens, a menu scanner for travelers with food allergies. The naive version trips every hard cap. The refined version clears them in eleven turns. Both state files validate and their scores are produced by the scripts, so you can rerun them:

```bash
node skills/6w/scripts/score.mjs examples/menulens-partial/state.json
node skills/6w/scripts/score.mjs examples/menulens-complete/state.json
node skills/6w/scripts/validate.mjs examples/menulens-complete/state.json
node skills/6w/scripts/render.mjs examples/menulens-complete/state.json /tmp/6w-blueprint.html
```

The session is synthetic, authored to exercise the rubric. `examples/README.md` has both scoreboards, the turn log and what the demo does and does not show.

## Where the name comes from

6W adapts the Five Ws, the Who, What, When, Where, Why and How that journalists and Kipling's "six honest serving-men" have used for over a century. Two of the six change and one is added. Where becomes Which, because for a product the question is which platform and channel, not which place. How is dropped, because how to build it is the coding agent's job after the handoff. Whether is added, because a product plan needs a go or no-go gate that the original set never had.

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
| `skills/6w/scripts/` | `score.mjs` computes scores and prints the scoreboard, `validate.mjs` checks a state file, `render.mjs` produces the HTML blueprint, `rubric.mjs` holds the numbers, tests next to them |
| `skills/6w/templates/` | `blueprint.css`, inlined into every rendered page |
| `docs/demo/` | The rendered MenuLens blueprint served by GitHub Pages |
| `skills/6w/schemas/` | JSON Schema for the state file and the export manifest |
| `examples/` | The MenuLens demo: a naive state and a refined state |
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
