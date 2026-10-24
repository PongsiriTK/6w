# 6W master blueprint

Version 0.0.3. 23 October 2026. Status: specification, skill, state schema, and scripts for scoring, validation, state, diagrams and the full export, with a worked demo published from them. Marketplace install and activation are untested on every host. Requirements written as MUST are release requirements. Thresholds, runtimes and estimates are proposals to validate during implementation.

Tagline: give your idea a foundation before you build.

Core promise: know what you are building, for whom, and why. Then give your agent a clear plan.

## 1. What this document is

This blueprint merges two earlier documents into one specification:

- `docs/sources/chatgpt-6w-project-specification.md`, a full product specification with an emphasis on evidence, provenance, state and host compatibility.
- `docs/sources/gemini-6w-plugin-architecture-and-skill-blueprint.md`, a plugin architecture with a concrete scoring rubric, a terminal scoreboard, and a dual-track output design.

Where the two disagreed, this document records the decision and the reason. The repository layout follows four open-source agent plugins that were read for this merge: obra/superpowers, cursor/plugins (the `pstack` and `create-plugin` plugins) and tt-a1i/archify. Section 12 names which convention came from which repository.

### 1.1 Reconciliation decisions

| Topic | Source A (specification) | Source B (plugin blueprint) | Decision | Why |
| --- | --- | --- | --- | --- |
| Rubric | Four generic criteria (clarity, completeness, consistency, actionability), each 0 to 4, score = round(100 × sum / 16) | Four W-specific sub-criteria weighted 30/25/25/20, with hard caps | W-specific sub-criteria from B, rated 0 to 4 with A's anchors, weighted 30/25/25/20, then capped. Formula in section 6. | B's criteria tell a builder what is missing. A's anchors and deterministic arithmetic stop inflation. Both survive. |
| Discovery order | Why, Who, What, Which, When, Whether | Why, Who, What, Which, Whether, When | Why, Who, What, Which, Whether, When. Risk screening runs from the first turn. | The When cap depends on knowing the technical bottlenecks found under Whether. |
| Threshold | 90 per W, configurable | 90 per W, fixed | 90 per W, configurable in state | Same number. A's configurability is needed for pilots. |
| Human output | `6W-Blueprint.html`, offline, no CDN, readable without JavaScript | `6w-master-hub.html` with Tailwind and Mermaid from CDN, five tabs | `6w-blueprint.html`, offline, no CDN, inline CSS and inline SVG, sections with sticky navigation rather than tabs. B's components become content inside A's sections. | A CDN dependency breaks the "opens anywhere" promise. Tabs hide content when JavaScript is off. |
| Agent output | Nine Markdown files in a handoff directory, root `AGENTS.md` never overwritten automatically | `IMPLEMENTATION-PLAN.md`, `ARCHITECTURE-SPEC.md`, and a generated root `CLAUDE.md` or `AGENTS.md` | Nine files under `.6w/handoff/`, plus `AGENT-RULES.md`. The agent offers to append a pointer block to the root rules file and does so only on confirmation. | Overwriting a project's existing rules file destroys user work. A pointer block gives B's guardrails without the risk. |
| Personas | One primary persona plus genuinely distinct others, buyer and influencer cards when relevant | Four fixed archetypes: beachhead champion, skeptical buyer, chaos user, anti-persona | The four archetypes are the default roles to consider. Generate a card only when context supports it. The anti-persona is always produced because it records an exclusion decision. | Fixed counts invent people. Fixed roles still make sure the buyer and the excluded segment are considered. |
| Phases | Ten-step discovery loop | Five phases: ingest, walkthrough, assumption lock, HTML synthesis, Markdown handoff | B's five phases as the state machine, A's loop as the body of the walkthrough phase | A state machine survives context compaction. The loop defines what one turn does. |
| Scoreboard | Textual readiness with evidence shown separately | Terminal HUD with bars and status glyphs | B's HUD with an evidence column and a cap marker added, ASCII only | Builders need progress at a glance. Evidence must stay visible next to the score. |
| Runtime | TypeScript or Node.js, dependency-light | Optional Python validator | Node.js 18 or later, plain `.mjs`, no runtime dependencies | archify ships this way and is installed in the same hosts. One runtime is easier to test than two. |
| Diagrams | Optional archify adapter with SVG or text fallback | archify for C4, sequence and ERD; Mermaid fallback | archify is optional. Request `architecture`, `sequence`, `erd` and `workflow` types. Fallback is renderer-generated inline SVG plus a text description. Mermaid source may go in Markdown but is never rendered via CDN. | archify's real type list has no "C4" type. Mermaid rendering needs a network. |
| Modes | Quick and deep, with question budgets | Standard and roast | Quick and deep set the budget. Roast is a tone switch available in either. | They are different axes. |
| Hosts | Claude Code, Codex, Hermes | Claude Code, Codex, Hermes, Cursor, generic Agent Skills | All five. Support is claimed per host only after a recorded test. | Superpowers shows the per-host manifest pattern is cheap to carry. |

## 2. Problem, goals and users

### 2.1 Problem

Agent-assisted builders can move from an idea to working software before they have defined the customer, the value, the adoption path or the delivery constraints. The result is a working product with unclear demand, unnecessary scope, weak distribution and expensive rework. Free-form brainstorming also loses decisions across sessions, and implementation agents receive requirements without the business reasons behind them.

6W gives the builder a repeatable discovery conversation inside the development workflow, a clear line between decisions, evidence, hypotheses and unknowns, a shared foundation for product, marketing and engineering, traceability from audience need to implementation task, and portable state that survives a change of agent.

Value hypothesis: builders accept a small amount of structured discovery when it narrows scope, exposes consequential uncertainty, and reduces avoidable revisions. This hypothesis needs user testing.

### 2.2 Goals

1. Help the user state a specific problem, audience and value proposition.
2. Define an achievable first release with explicit non-goals.
3. Address viability, distribution, operations and major risks.
4. Produce useful personas and marketing hypotheses without inventing research.
5. Recommend a next action that fits the evidence and the target stage.
6. Export one offline HTML blueprint and a consistent Markdown handoff from the same state.
7. Run on several agent hosts through one portable skill and small manifests.
8. Resume without asking the user to repeat settled answers.
9. Leave depth, scope and the moment to finish in the user's hands.

### 2.3 Non-goals for v0.1

- Building or deploying the user's product.
- Guaranteeing product-market fit, profit, compliance or dates.
- A hosted service, accounts or a collaborative dashboard.
- An autonomous market-research pipeline.
- A universal file parser or OCR engine.
- Automatic publication, email or issue creation.
- Editing the blueprint in the browser.
- Full support for every host at launch.
- Treating every project as a venture-backed startup. Internal tools and community projects must fit.

### 2.4 Users of 6W

These segments are hypotheses, not research.

| Segment | Situation | Wants | Worries about |
| --- | --- | --- | --- |
| Solo vibe coder | Builds fast, unclear foundation | A bounded MVP and a next step | Discovery feeling slow |
| Technical founder | Can build, needs customer clarity | Evidence-aware priorities | Generic startup advice |
| Small product team | Scattered notes and opinions | Shared decisions, one handoff | Repeating work already done |
| Agency or consultant | Unclear client brief | Reviewable scope and boundaries | Changing requirements |
| Marketer or strategist | Needs audience and value | Personas, objections, positioning, experiments | Fabricated insight |
| Implementation agent | Receives the handoff | Stable requirements, explicit unknowns | Contradictory documents |

Initial focus: solo builders and small teams preparing an MVP with a coding agent.

## 3. The six Ws

6W adapts the Five Ws of journalism (Who, What, When, Where, Why, How). Where becomes Which, because a product chooses a platform and channel rather than a place. How is dropped, because implementation is the coding agent's job after the handoff. Whether is added as the go or no-go gate the original set lacks. The lineage is stated in the README so readers who know 5W1H see what changed.

The order is Why, Who, What, Which, Whether, When. The order adapts to what the user already knows. Risk screening starts on the first turn and does not wait for the Whether phase. Economics lives under Why and Whether. Distribution lives under Who and Why. Delivery capacity lives under When. Cross-links stop duplicated, inconsistent answers.

Each W has four sub-criteria. They are the content checklist and the scoring rubric at once. Weights are 30, 25, 25 and 20.

### 3.1 Why. Problem and value

Why is the problem worth solving, and why would someone choose this solution?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Pain severity | 30 | Frequency, cost and consequence of the problem today |
| Broken workaround | 25 | How people solve it now, including manual work and doing nothing, and why that fails |
| Value capture | 25 | Revenue model, time saved or organizational value, with cost and support assumptions where relevant. For commercial projects, the unit the price scales with (the value metric) and the pricing model, chosen with `pricing-models.md` |
| Success metric | 20 | One measurable outcome that shows v1 worked, and what evidence would weaken the proposition |

Cap: 60 when the user cannot name how people work around the problem today.

Outputs: problem statement, value proposition, alternatives, economics assumptions, validation experiments.

### 3.2 Who. Audience and adoption

Who experiences the problem, uses the product, pays, influences adoption and decides?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Beachhead persona | 30 | A specific role, context and daily workflow for the first priority segment |
| Switching trigger and objections | 25 | The event that makes them look for a solution, and why they hesitate |
| Distribution | 25 | Where the first fifty users can be found and reached, and whether the builder has access to them |
| Buyer, user and anti-persona | 20 | Who pays, who uses, who approves, and which segment is excluded |

Cap: 55 when the audience is "everyone" or "general consumers" with no named segment.

Outputs: persona cards, audience priority, buyer and user map, messaging hypotheses, adoption experiments.

### 3.3 What. Product and scope

What outcome are we creating, and what is the smallest product that delivers it?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Core loop | 30 | The product in one sentence and the single repeatable action from entry to value |
| v1 must-haves | 25 | At most five essential features, with acceptance criteria |
| Explicit anti-scope | 25 | Features deliberately cut from v1, and whether an existing product could serve instead |
| Day-one inputs | 20 | What the user must bring or connect before value appears, plus relevant business rules |

Cap: 65 when v1 lists more than five features or has no anti-scope list.

Outputs: product summary, scope boundary, journeys, requirements, non-goals.

### 3.4 Which. Platform and interaction

Which channels, devices and interaction methods fit the user's situation?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Primary form factor | 30 | Web, mobile, desktop, CLI, extension, bot, API, embedded or physical |
| Workflow fit | 25 | Why this form factor matches the audience's habits, and which alternatives were rejected |
| Device and environment constraints | 25 | Offline use, hardware access, latency, accessibility and connectivity |
| Integration boundary | 20 | External APIs, webhooks, MCP servers and existing workflows the product must fit |

Cap: 70 when a native app store download is chosen without a hardware, notification or habit reason over the web.

Frameworks are chosen after these constraints are known. A preference for a framework is not evidence that users need a platform.

Outputs: platform decision, interaction constraints, accessibility considerations, integration boundaries.

### 3.5 Whether. Viability and uncertainty

Is the product viable under its real constraints, and what could change the decision?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Unit economics | 30 | Inference, API and infrastructure cost per active user against price or budget |
| Technical bottlenecks | 25 | Rate limits, latency, context limits, dependency availability |
| Legal, privacy and security | 25 | Authentication, personal data, terms of service, jurisdiction. Framed as issues to investigate, never as assurances. |
| Persona and UX edge cases | 20 | How real behavior breaks the happy path, with mitigation and remaining exposure |

Cap: 50 when the product depends on paid model or API calls and no cost per active user has been estimated.

Outputs: risk register, blocker list, experiments, decision conditions (proceed, narrow, pivot, defer, stop), next-step recommendation.

### 3.6 When. Timing and delivery

When does value need to arrive, and what can ship with the available resources?

| Sub-criterion | Weight | Resolve |
| --- | ---: | --- |
| Builder bandwidth | 30 | Hours per week, skills, budget and external dependencies |
| Proof of concept | 25 | The core loop testable within roughly 48 to 72 hours of effort |
| MVP date | 25 | A shippable date with buffer, and acceptance criteria that define done |
| Cut line | 20 | What is dropped first when behind schedule, and why timing matters now |

Cap: 65 when the What and Which cannot be built within the stated bandwidth and date.

Outputs: phased plan, milestone dependencies, capacity assumptions, scope-versus-date tradeoffs.

## 4. Conversation design

### 4.1 Entry points

Natural language is the portable baseline. A host that supports commands may expose these:

| Command | Effect |
| --- | --- |
| `/6w [idea or files]` | Start or resume the walkthrough |
| `/6w resume` | Load `.6w/state.json` and continue at the current focus |
| `/6w quick` or `/6w deep` | Set the question budget |
| `/6w roast` | Switch to a skeptical investor, growth marketer and principal engineer tone with stricter ratings |
| `/6w personas` | Preview or regenerate the persona and edge-case cards |
| `/6w skip` or `next` | Lock the current W at its score, record missing items as assumptions, move on |
| `/6w finish` | Run assumption lock and export with the current state |
| `/6w audit` | Run the framework against an existing codebase or product |

Equivalent sentences work on every host: "Use 6W on this idea", "Resume the 6W foundation", "Update the audience and show what changes", "Finish now and export".

### 4.2 Initial setup

Collect or infer, and confirm only what is consequential: working title, starting idea and source material, maturity (idea, prototype, existing product), target stage (explore, prototype, build MVP, pilot), depth (quick or deep), language and major constraints. Never make the user answer every setup field before they get value.

### 4.3 The five phases

| Phase | Entry | Action | Exit |
| --- | --- | --- | --- |
| 0. Ingest | User invokes 6W with optional files, links or a repository | Detect host capabilities. Load `.6w/state.json` if present. Read supported material and record extraction coverage. Draft all six Ws with provenance labels. Rate each sub-criterion. Write state. Show the scoreboard. | Baseline scoreboard shown. First W below threshold selected. |
| 1. Walkthrough | Any W is below threshold | Run the discovery loop (4.4) on the selected W | Every W reaches threshold, or the user skips or finishes |
| 2. Assumption lock | Any W was locked below threshold, or the user chose to finish | Turn every unresolved sub-criterion into an `ASM-` or `RISK-` record with its implication. Show the register. | User confirms or edits the register |
| 3. HTML synthesis | Register confirmed | Request diagrams from archify or the fallback. Validate state. Render `6w-blueprint.html`. | File validated and opened or linked |
| 4. Markdown handoff | HTML complete | Render `.6w/handoff/`. Offer the root rules pointer block. Present the handoff summary and a recommended first coding prompt. | Summary presented |

### 4.4 Discovery loop

One turn of the walkthrough does the following:

1. Pick the W in sequence that is below threshold.
2. Find its lowest-rated sub-criterion or an open contradiction with another W.
3. Explain in one or two sentences why the W is below threshold.
4. Ask one or two focused questions. Offer three concrete options tailored to the project plus a custom answer. Explain why the question matters when that is not obvious.
5. Record the user's answer separately from the agent's recommendation.
6. Update ratings, linked records, evidence status and freshness markers. Recompute the score.
7. Recommend continuing, running an experiment, narrowing scope or exporting.
8. Checkpoint state after any accepted material change.

Avoid repeated questions, long questionnaires, unexplained scores and generic praise.

### 4.5 Quick and deep

Quick mode establishes a usable canvas, a priority audience, a bounded scope and the three most consequential uncertainties. It is a smaller question budget, not permission to hide gaps. Deep mode examines tradeoffs, evidence, edge cases and economics in detail and reuses earlier answers. Budgets live in state and are configurable. When progress stalls, offer an experiment, a provisional recommendation or export. Never require an indefinite conversation to reach a number.

### 4.6 User controls

Recommend an answer, explain a tradeoff, skip, mark unknown, revisit, change stage, change depth, finish now, resume later. A user may proceed below threshold. Record the override and its implications. Do not change the score to make the override look validated.

### 4.7 Scoreboard

Render this at the top of every walkthrough turn. ASCII only, so it survives every terminal.

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

Focus: WHAT, 65/100. Needs +25.
```

Status values: `OK` at or above threshold, `..` in progress, `CAP` a hard cap is active, `LOCKED` the user locked it below threshold.

### 4.8 Revision propagation

When a decision changes, list the affected records. Changing Who can affect Which, pricing, onboarding, scope, messaging and the delivery estimate. Mark dependents as needing review. Never overwrite an accepted decision silently and never keep a stale score. Explain what changed and what still holds.

## 5. Evidence and provenance

Two independent axes:

- Decision status: proposed, accepted, deferred, rejected, superseded.
- Evidence status: unknown, assumption, user-reported, source-supported, observed.

Acceptance records a choice. It does not prove a claim. An uploaded slide supports what a stakeholder said without proving demand.

Every consequential claim carries a stable ID, a short statement, an origin (user, attachment, repository, external source, agent inference), a source locator (file and page, URL and access date, or conversation note), an evidence status with limitations, links to related Ws, decisions, requirements and experiments, and a last-review timestamp.

Conflicting sources stay visible until resolved. Unsupported details stay hypotheses. Never invent interviews, market sizes, quotations, conversion rates, prices or competitor capabilities. Research is optional and depends on host capability. When browsing is unavailable, list the questions that need verification.

## 6. Readiness scoring

### 6.1 Meaning

Readiness measures whether the current decisions are clear, complete, consistent and actionable enough for the selected next stage. It is not a probability of success. The default threshold is 90 per W, stored in state and configurable. Evidence strength and critical blockers are shown separately.

### 6.2 Rubric

Each sub-criterion from section 3 is rated 0 to 4:

| Rating | Meaning |
| --- | --- |
| 0 | Missing or unusable |
| 1 | Vague, with major unresolved choices |
| 2 | Partially defined, with consequential gaps |
| 3 | Mostly usable, with bounded remaining gaps |
| 4 | Specific and usable for the selected stage |

Score for one W:

```text
raw   = sum over the four sub-criteria of (weight × rating / 4)
score = min(round_half_up(raw), active_cap)
```

Weights are 30, 25, 25 and 20, so the raw score is already out of 100. A cap applies only while its condition holds and is removed when the condition clears. The rationale for each rating and each active cap is stored with the rating. A deterministic script computes the score. The agent never adjusts a score by hand.

The overall number is the arithmetic mean of the six scores and is a summary only. A strong average does not cancel a weak W or a critical blocker.

### 6.3 Recommendation rule

Recommend progression when every relevant W is at or above threshold, no unresolved critical blocker stands in the way of the next action, the stage's evidence expectations are met or the next action is explicitly a validation exercise, and no consequential cross-W conflict remains open.

A lower score can still support a bounded experiment. Distinguish "ready to test this assumption" from "ready to implement this requirement". A score changes only when its content, evidence, rubric version or target stage changes. Record the reason for each change.

### 6.4 Stage expectations

| Stage | Expectation |
| --- | --- |
| Explore | A defined problem hypothesis and a useful experiment |
| Prototype | A named audience, the core workflow, a learning goal, and what success and failure look like |
| Build MVP | Bounded scope, acceptance criteria, credible delivery assumptions, critical dependencies addressed |
| Pilot | Onboarding, operating responsibilities, measurement, recovery behavior, and unresolved approvals identified |

The rubric reference gives W-specific and stage-specific examples for every rating. "Complete" for a prototype never implies production readiness.

### 6.5 Evidence summary

The scoreboard shows one evidence word per W: the weakest evidence status among its four ratings, using the five statuses from section 5 (unknown, assumption, user, source, observed). The blueprint's readiness text adds coverage and limitations, not just the label. Five interviews about a problem do not establish willingness to pay.

Example: "Why: 94/100 readiness. Evidence: assumption. The problem and experiment are defined. Demand is unknown. Next step: test the problem hypothesis with target users."

## 7. Audience and marketing deliverables

### 7.1 Persona cards

Default roles to consider: beachhead champion, skeptical buyer or gatekeeper, chaos or boundary user, anti-persona. Produce a card only when the project context supports it, except the anti-persona, which is always produced because it records an exclusion decision. Mark each card's evidence status. No decorative demographics and no inferred sensitive traits.

Each card carries: ID, label, priority, role, evidence status, situation, desired outcome, current workaround, pain with frequency and consequence, switching trigger, buying criteria and authority, objections, trust and proof needs, discovery channels, messaging angles, onboarding needs and first value moment, accessibility or environment constraints where relevant, and links to edge cases, requirements, sources and experiments.

### 7.2 Edge-case cards

Each card records the affected persona or journey, the scenario, what changes, severity, frequency or unknown, impact, response, scope decision (support now, workaround, defer, exclude, investigate as a segment) and a test criterion. Cover conflicting user and buyer goals, confidential context, limited connectivity, accessibility and language, existing-product reassessment, no customer access, unsupported devices, failure, misuse, duplicates and partial completion. An uncommon accessibility need is not dismissed because it is uncommon.

### 7.3 Messaging and experiment cards

For each priority audience: a positioning hypothesis (audience, problem, benefit, alternative), distinct message angles with rationale, objection, response and proof needed, channel, funnel stage and call to action, and an experiment with participants, measurement, timebox and decision rule. Numeric targets are user-supplied or labeled provisional. Hypothetical copy is never a customer quote.

### 7.4 Commercial, internal and community variants

Commercial products need buyer behavior, pricing hypotheses, costs, acquisition and retention. Internal tools need stakeholder ownership, adoption, process fit, operating cost and measurable benefit. Community projects may prioritize participation and sustainable maintenance. Do not force revenue projections on projects that do not need them.

## 8. Primary output: `6w-blueprint.html`

### 8.1 Contract

One offline, self-contained file written to the project root. It contains every substantive decision, requirement, persona, risk, source reference and diagram in the exported scope. The Markdown handoff contains no decision absent from the HTML. "All information" means the normalized foundation and evidence summaries, not raw attachments, credentials or conversation turns.

### 8.2 Sections

1. Executive overview, readiness gauges, recommended next action, and jump links for product, marketing and engineering readers.
2. Six-W canvas with rationale, readiness, evidence and open questions, plus the pitch flow (problem, trigger, core loop, value capture) as an inline diagram.
3. Personas, buyer and user relationships, edge-case matrix.
4. Marketing foundation: positioning, message angles, objections, channels, experiments, copyable hooks.
5. Product scope: journeys, requirements, acceptance criteria, anti-scope.
6. Viability: alternatives, unit economics table at 100, 1,000 and 10,000 users, distribution assumptions.
7. Delivery: milestones, capacity, dependencies, cut lines.
8. Risks, blockers, assumption register, validation plan, decision conditions.
9. Technical direction: tiered stack options (a fast stack and a scale stack) with rationale, architecture, sequence and ERD diagrams, uncertainties.
10. Decision history, sources, glossary, export metadata, limitations.

A section that is unresolved or inapplicable shows its status and reason. It is never filled with invented conclusions.

### 8.3 Presentation rules

- Sticky navigation, in-file text search that finds and reveals text inside collapsed blocks, collapsible details.
- Stable anchors on every card and cross-links between them.
- Readiness shown with its explanation, evidence shown independently.
- Accessible contrast, semantic headings, keyboard navigation, visible focus.
- Responsive layout and a print stylesheet that expands essential content.
- Every diagram has a text description and a table fallback.
- No CDN, external font, network fetch, analytics or hosted runtime. Core content is readable with JavaScript disabled. No sibling files required.

### 8.4 Content safety

Escape all imported content. Never execute HTML or scripts from attachments. Allow only safe URL schemes. Sanitize SVG. Script-like text in a source renders as text. No secrets and no unnecessary personal data in the export.

### 8.5 Editing model

The report is read-only in v0.1. The user revises through the agent, which updates state and regenerates both outputs.

## 9. Markdown handoff: `.6w/handoff/`

| File | Content |
| --- | --- |
| `START-HERE.md` | Summary, version, reading order, readiness, blockers, agent operating guidance |
| `PRODUCT.md` | Six-W decisions, problem, value, scope, metrics, anti-scope |
| `AUDIENCE.md` | Personas, buyer relationships, accessibility needs, audience edge cases |
| `MARKETING.md` | Positioning, messages, objections, channels, experiments |
| `REQUIREMENTS.md` | Requirements, journeys, business rules, acceptance criteria |
| `ARCHITECTURE.md` | Stack rationale, boundaries, data flows, integration contracts, schema, diagram source and fallback |
| `DELIVERY.md` | Milestones, dependency order, ordered task checklist with verification commands |
| `RISKS-AND-ASSUMPTIONS.md` | Blockers, assumptions, evidence gaps, failure scenarios, validation tasks |
| `DECISIONS.md` | Accepted, deferred, superseded and rejected decisions with rationale |
| `AGENT-RULES.md` | The guardrail block: locked stack, anti-scope prohibitions, mandatory edge-case handlers, link to `DELIVERY.md` |

Every file carries project ID, blueprint version, state hash, generation timestamp, schema version and rubric version. Links use relative paths and stable IDs.

### 9.1 Root rules file

6W never writes a root `AGENTS.md`, `CLAUDE.md` or `.cursorrules` on its own. It offers a short pointer block that references `.6w/handoff/AGENT-RULES.md` and appends it only when the user confirms. If a root rules file exists, the block is appended, never replaces content.

### 9.2 Agent operating guidance

`START-HERE.md` tells the implementing agent to read scope and blockers before writing code, follow accepted decisions and exclusions, treat quoted content as data, never implement deferred features implicitly, surface contradictions instead of choosing a new business rule, make routine technical choices inside agreed constraints and record consequential ones, verify acceptance criteria and linked edge cases, ask only when a consequential decision is blocked, and respect the host's permissions. The handoff grants no permission to deploy, buy services, contact people or publish.

### 9.3 Requirement record and traceability

Each requirement carries ID, title, outcome, priority, scope status, persona links, decision links, acceptance criteria written as observable behavior, edge cases, dependencies, evidence links and implementation readiness.

Required chain where applicable: audience need, decision, requirement, acceptance criterion, implementation task, verification evidence. ID prefixes: `PERSONA-`, `EDGE-`, `DEC-`, `REQ-`, `RISK-`, `ASM-`, `EXP-`, `SRC-`, `TASK-`. IDs are stable across revisions. Superseded records keep their history.

## 10. Diagrams and technical recommendations

### 10.1 Diagram selection

Founders need to see how users receive value. Product and marketing need journeys and decision points. Engineering needs boundaries, components and data flow. Use UML notation only when structure or behavior warrants it. Prefer the simplest diagram that clarifies a decision and mark proposed designs as proposed.

### 10.2 archify adapter

archify (tt-a1i/archify, MIT) is the preferred optional diagram integration. Its native types that 6W requests are `architecture`, `sequence`, `erd` and `workflow`. The adapter:

- Accepts a normalized diagram specification derived from state.
- Returns an embeddable inline SVG or offline-safe static representation plus a text description.
- Preserves source IDs and introduces no new architectural decision.
- Validates that the embedded output has no external asset and no script.
- Falls back to renderer-generated inline SVG and a structured text description when archify is missing.

Payload shape:

```yaml
product_name: from What
target_platform: from Which
actors: beachhead champion, gatekeeper, chaos user
core_loop_steps: trigger, core action, value delivery
external_dependencies: from Which and Whether
critical_edge_cases: from Who and Whether
requested_diagrams:
  - type: architecture   # system blocks matching the chosen stack
  - type: sequence       # core loop with edge-case fallback branches
  - type: erd            # minimal v1 schema, anti-scope excluded
  - type: workflow       # pitch flow for the overview
```

Discovery and export remain usable without archify. 6W never installs third-party code on its own.

### 10.3 Stack recommendations

Generate after audience, workflow, delivery constraints, team skills, operating costs, hosting and integrations are known. Offer a fast stack for shipping and a scale stack for growth, each with rationale, tradeoffs, assumptions and the conditions that would change the choice. Verify time-sensitive compatibility and pricing when tools allow, otherwise label them as needing verification. Never choose a complex architecture because the agent can generate it.

## 11. System design of 6W itself

### 11.1 Components

| Component | Responsibility | Lives in |
| --- | --- | --- |
| Core skill | Interview behavior, framework, decision rules, reference routing | `skills/6w/SKILL.md` |
| References | Anchored rubric by W and stage, persona and edge-case guidance, stack archetypes, archify bridge | `skills/6w/references/` |
| Templates | HTML and Markdown presentation templates | `skills/6w/templates/` |
| Scripts | Schema validation, scoring, state operations, rendering, export | `skills/6w/scripts/` |
| Schemas | Versioned state and export-manifest schemas | `skills/6w/schemas/` |
| Examples | Complete, partial and revised project packages | `examples/` |
| Tests | Unit tests next to scripts, fixtures and invariants under `tests/` | `tests/` |
| Host manifests | Capability detection, invocation, persistence path | `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.hermes-plugin/` |

6W uses the host agent's model and tools. It has no model API key and no central service.

### 11.2 Runtime

Node.js 18 or later, plain ES modules, no runtime dependencies. Scripts are invoked by the agent from the skill directory. If a host has no Node runtime, discovery continues in conversation, the agent says that deterministic validation and export are unavailable there, and offers a portable checkpoint.

### 11.3 State and persistence

The project-owned file `.6w/state.json` is the source of truth. HTML and Markdown are derived. State never lives inside the installed skill directory.

Top-level records, as `skills/6w/schemas/state.schema.json` defines them: `schemaVersion` and `rubricVersion`, `metadata` (project ID, title, language, timestamps, maturity), `session` (mode, tone, stage, gate, phase, focus, turn count, user overrides), `capabilities`, `ws` (per W: a summary, four ratings each with rationale, evidence status and source links, caps with active flag and reason, open questions, links), `overall`, `records` (sources, personas, edges, decisions, requirements, risks, assumptions, experiments, tasks, each with a prefixed stable ID), `export` metadata, and `extensions` for fields a migration did not recognize. Claims live as ratings and records with evidence status rather than as a separate collection.

Rules: save after accepted material changes and before export, write atomically and keep the last valid checkpoint, detect a changed revision before writing, reject invalid state with actionable diagnostics, migrate older schemas and move unrecognized fields into `extensions` rather than dropping them, redact sensitive content before rendering and record the omission, and offer a readable checkpoint when the filesystem is unavailable.

### 11.4 Export consistency

Render every output from one validated snapshot. Hash the canonical content, excluding volatile timestamps. Export to a temporary directory, validate, then finalize. A failed render leaves the previous bundle intact. Direct edits to generated files are not merged into state. On a requested revision, detect modified generated files and reconcile before regenerating.

## 12. Repository layout

The layout below is the target for v0.1. Items marked "planned" do not exist yet. The repository gate fails on any reference to a missing file, so this document names planned paths only in this section.

```text
6w/
├── .claude-plugin/
│   ├── plugin.json              # Claude Code manifest           (superpowers)
│   └── marketplace.json         # lets the repo act as a marketplace (superpowers)
├── .cursor-plugin/plugin.json   # Cursor manifest: skills, logo, tags (pstack, create-plugin)
├── .codex-plugin/plugin.json    # Codex manifest with interface block (superpowers)
├── .hermes-plugin/plugin.yaml   # Hermes manifest                (superpowers)
├── .github/
│   ├── ISSUE_TEMPLATE/          # bug report, host support       (superpowers, archify)
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/ci.yml         # runs the repository gate       (archify)
├── .version-bump.json           # one version across manifests  (superpowers)
├── AGENTS.md                    # agent-facing file map and rules (archify)
├── CLAUDE.md                    # points at AGENTS.md            (archify)
├── BLUEPRINT.md                 # this document
├── CHANGELOG.md                 # Keep a Changelog               (create-plugin, archify)
├── CONTRIBUTING.md
├── SECURITY.md                  # private vulnerability reporting (archify)
├── LICENSE                      # MIT
├── THIRD_PARTY_NOTICES.md       # credits for adapted material (archify)
├── README.md                    # logo lockup, install per host, what is inside
├── package.json                 # `npm test` runs the gate; no dependencies
├── assets/logo/                 # 6w-mark.svg, 6w-mark-dark.svg, PNG, icon (archify lockups)
├── docs/
│   ├── demo/menulens/           # exported MenuLens blueprint and handoff, served by GitHub Pages
│   ├── compatibility.md         # tested-host matrix
│   ├── porting-to-a-new-host.md # how to add a host              (superpowers)
│   ├── plans/                   # implementation plans, one file each
│   └── sources/                 # the two merged source documents
├── scripts/
│   ├── check-repo.mjs           # the repository gate
│   └── build-demo.mjs           # rebuilds docs/demo from the complete example
├── skills/6w/
│   ├── SKILL.md                 # the portable skill, under 500 lines
│   ├── references/
│   │   ├── scoring-rubric.md
│   │   ├── pricing-models.md          adapted from phuryn/pm-skills (MIT)
│   │   ├── persona-edge-matrix.md     (planned)
│   │   ├── stack-archetypes.md        (planned)
│   │   ├── interview-examples.md      (planned)
│   │   └── archify-bridge.md          (planned)
│   ├── schemas/                 state.schema.json, export-manifest.schema.json
│   ├── templates/blueprint.css  inlined into every rendered page
│   └── scripts/
│       ├── rubric.mjs           weights, criteria and caps
│       ├── scoring.mjs          pure scoring functions, scoreboard text
│       ├── score.mjs            CLI: scores, --write
│       ├── validate.mjs         schema, rubric, links, score consistency
│       ├── state.mjs            load, atomic save with revision check, checkpoint, migrate
│       ├── diagrams.mjs         specs, archify detection and ingestion, sanitizer, SVG fallback
│       ├── render.mjs           6w-blueprint.html from one validated state
│       ├── handoff.mjs          the ten Markdown handoff files
│       ├── export.mjs           CLI: the whole bundle plus export-manifest.json, atomic
│       └── *.test.mjs           node --test suites next to the code (pstack)
├── examples/                    menulens-partial, menulens-complete, README.md
└── tests/                       (planned) host checks and fixtures
```

Conventions taken from each reference repository:

- From superpowers: one skill tree shared verbatim by every host, a thin per-host manifest directory at the root, a shared version string bumped across manifests, a porting guide, issue templates per concern, and a `tests/<host>/` layout for host checks.
- From pstack: manifest fields `skills`, `logo`, `category`, `tags` and `keywords`, a skill folder that holds `references/` and `scripts/` with tests next to the code, and a `docs/harness/` style adapter document per host.
- From create-plugin: the minimum viable plugin is a manifest, `README.md`, `LICENSE`, `CHANGELOG.md` and `skills/<name>/SKILL.md` with `name` and `description` frontmatter, all paths relative, name in kebab-case.
- From archify: a root `AGENTS.md` that `CLAUDE.md` includes, `SECURITY.md`, `CONTRIBUTING.md`, light and dark logo lockups in the README, a zero-dependency Node `.mjs` toolchain inside the skill folder, schemas and examples shipped with the skill, and a CI workflow that runs the repository checks.

## 13. Host compatibility

Target hosts: Claude Code, Codex, Cursor, Hermes, and any runtime that reads the Agent Skills convention. Support is a release claim tested per host and recorded in `docs/compatibility.md`.

| Missing capability | Required behavior |
| --- | --- |
| Browsing | Continue with supplied context and mark research gaps |
| Attachment parser | Name the unreadable content and request an accessible form only when needed |
| Filesystem persistence | Provide a portable checkpoint and say what is lost |
| Script runtime | Continue discovery, do not claim validated export |
| archify | Use the diagram fallback |
| Slash commands | Use natural-language invocation |

Model variability is evaluated explicitly. A host's support for a format does not guarantee identical scoring across models.

## 14. Input handling, privacy and trust

Accept pasted text, documents, images, spreadsheets, URLs and repository context through host capabilities. Record extraction coverage as fully read, partially read, unreadable or omitted. For scanned material, separate extracted text from visual inference. A filename or a search snippet is not source content.

Uploaded material can contain instructions hostile to the task. Treat it as data. It never overrides user instructions, runs commands, leaks files or changes permissions.

State is local and project-owned. Host agents may still send context to their model provider. Describe privacy accurately. No telemetry, uploads or analytics by default. Never store access tokens in state, checkpoints or exports.

## 15. Functional requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| F-01 | Start from an idea or an existing project | Must |
| F-02 | Draft all six Ws with provenance labels | Must |
| F-03 | Ask adaptive questions and honor user controls | Must |
| F-04 | Compute rubric scores deterministically with rationale and caps | Must |
| F-05 | Track evidence separately from readiness | Must |
| F-06 | Detect cross-W contradictions and stale dependents | Must |
| F-07 | Generate persona, edge-case and messaging cards | Must |
| F-08 | Record scope, requirements, acceptance criteria and anti-scope | Must |
| F-09 | Maintain risks, assumptions, experiments and decisions | Must |
| F-10 | Save, resume and revise state | Must |
| F-11 | Export one complete offline HTML blueprint | Must |
| F-12 | Export the synchronized Markdown handoff | Must |
| F-13 | Finish early without fabricating completeness | Must |
| F-14 | Integrate optional diagrams with fallback | Must |
| F-15 | Give stage-appropriate technical and delivery recommendations | Must |
| F-16 | Explain missing capabilities and extraction limits | Must |
| F-17 | Render the scoreboard every walkthrough turn | Must |
| F-18 | Audit an existing product with the same framework | Should |
| F-19 | Support translated conversation and output with stable IDs | Should |

## 16. Release plan

The v0.1 release ships the six-W workflow, quick and deep modes, deterministic scoring, the audience and marketing kit, state persistence, contradiction handling, the HTML blueprint, the Markdown handoff, the diagram fallback, and tested installation on the hosts where the test passed.

The phased plan with checklists and validation lives in `docs/plans/0001-v0.1-implementation.md`. Phase order: contract, conversation, output, integration, evaluation, release. Provisional effort: three to five weeks for one experienced developer with agent assistance. Re-estimate after the schema and renderer spike.

## 17. Acceptance criteria

| Test | Pass condition |
| --- | --- |
| Vague idea | Initial canvas and focused questions, no invented users or evidence |
| Polished unsupported pitch | Statements separated from validated claims |
| User finishes immediately | Partial package with explicit unknowns and next actions |
| User overrides a score | Override recorded, readiness unchanged |
| Audience changes | Affected scope, platform, messaging and delivery flagged for review |
| Impossible date and scope | Conflict explained, alternatives offered |
| Buyer differs from user | Linked roles with distinct objections and value propositions |
| No browsing | Discovery completes, external claims marked unverified |
| Missing parser | Extraction limit reported, no claim of having read it |
| Missing archify | Readable fallback, export completes |
| Resume on another host | IDs, decisions, evidence and history preserved |
| HTML offline | Opens with network disabled, all content and diagrams present |
| JavaScript disabled | Core content and anchors readable |
| Unsafe source content | Script-like text renders inertly |
| Output consistency | HTML and Markdown share one state hash, no contradictory canonical field |
| Broken references | Validator catches missing IDs before finalization |
| Failed export | Previous bundle intact, no mixed-version package |
| Print and mobile | Essential content readable, nothing clipped or hidden |
| Cap arithmetic | A cap condition caps the score and clearing it restores the raw score |

Deterministic tests cover schema validation, scoring arithmetic, ID resolution, state transitions, export consistency and escaping. Browser checks cover offline rendering, keyboard behavior, responsive layout and printing. Structured human review covers question usefulness, assumption quality, persona relevance, unsupported claims and handoff usability, across several sessions and models.

Pilot measures: share of users who leave with a usable next step, time and question count to a first useful canvas, consequential scope changes attributable to discovery, user-rated usefulness of personas and messaging, clarification requests during implementation, unsupported-claim and missed-contradiction rate in reviewed samples, export and resume success rate. Readiness scores and conversation length are not success metrics.

## 18. Risks of 6W

| Risk | Consequence | Mitigation |
| --- | --- | --- |
| Score inflation | False confidence | Anchored rubric, deterministic arithmetic, caps, evidence shown separately |
| Endless discovery | Abandonment | Quick mode, budgets, early export, experiments |
| Generic personas | No marketing value | Context-driven cards, role separation, provenance |
| Overengineered handoff | Wasted implementation | Scope discipline, constraint-based stacks |
| Cross-host drift | Inconsistent experience | One skill tree, capability matrix, per-host tests |
| Prompt injection via attachments | Unauthorized behavior | Sources are data, tool authorization stays separate |
| Stale outputs | Contradictory guidance | One source of truth, hashes, freshness checks, atomic export |
| Diagram dependency failure | Broken report | Optional adapter, embeddability checks, fallback |
| Marketing overclaim | Misleading pitch | Hypothesis labels, proof requirements |
| Unverified legal conclusions | Wrong go or no-go | Issues to investigate, specialist review tasks |

## 19. Open-source distribution

License: MIT. Repository: `https://github.com/PongsiriTK/6w`. Install commands are documented per host in the README and marked untested until `docs/compatibility.md` records a pass.

Contribution categories: rubric examples and fixtures, host adapters with capability tests, translations and accessibility, industry-specific references, diagram adapters and templates. Extensions must not weaken the line between accepted decisions and validated evidence. Every rubric change carries a version and evaluation results.

## 20. Worked example

Input: "I want an open-source skill that helps vibe coders define a product before building."

Initial draft. What: guided discovery with HTML and Markdown outputs. Which: installed in agent hosts, offline browser deliverable. Why: reduce unclear scope and premature implementation, benefit is a hypothesis. Who: solo builders first, marketers and implementation agents consume the output. Whether: scoring credibility, conversation friction, host differences, export reliability. When: three to five weeks, pending capability checks.

High-value question: should the first release optimize for a quick solo-builder session or a detailed client discovery workflow? Recommendation: solo builders, with a schema flexible enough for richer stakeholder roles.

Persona hypothesis: a builder who can implement fast but cannot name a first user or say what to exclude. Anti-persona: a team that already has a product manager and a validated roadmap.

Edge case: the user stops before choosing a platform. Export the platform decision as unresolved and keep the handoff from implying an approved stack.

Experiment: observe a small group using 6W on real ideas. Compare before and after scope, unresolved assumptions and clarification requests. Report observations without claiming causal proof.

## 21. Decisions

### 21.1 Established

- Name: 6W. Six dimensions: Why, Who, What, Which, Whether, When, in that default order.
- Business and product foundation precedes implementation planning.
- Guided conversation with transparent readiness, a scoreboard every turn, and user-controlled exit.
- Persona cards, edge cases and marketing outputs are core deliverables.
- One self-contained offline HTML file carries the full normalized blueprint.
- Companion Markdown files under `.6w/handoff/` are written for implementation agents.
- Root rules files are never overwritten. A pointer block is appended only on confirmation.
- W-specific sub-criteria, 0 to 4 ratings, weights 30/25/25/20, deterministic caps.
- Node.js 18 or later with no runtime dependencies for scripts.
- archify is optional with an inline-SVG fallback.
- Hosts: Claude Code, Codex, Cursor, Hermes, generic Agent Skills.
- License MIT. Repository layout as in section 12.

### 21.2 Open, to validate during implementation

- The 90 threshold and the initial anchored rubric examples.
- Exact state schema fields and migration policy.
- Quick and deep question budgets.
- Whether `tests/` host checks run live agents or only static gates in CI.
- The first host versions recorded as tested.

## 22. References

- Agent Skills specification: https://agentskills.io/specification
- Agent Skills repository: https://github.com/agentskills/agentskills
- Hermes skills guide: https://hermes-agent.nousresearch.com/docs/guides/work-with-skills/
- archify: https://github.com/tt-a1i/archify
- superpowers: https://github.com/obra/superpowers
- pstack: https://github.com/cursor/plugins/tree/main/pstack
- create-plugin: https://github.com/cursor/plugins/tree/main/create-plugin

Product principle: every output helps someone make a decision, test an assumption, communicate the product or implement agreed behavior. Completeness never comes at the cost of invented certainty.
