# 6W Open-Source Agent Skill: Full Architecture, Scoring Rubric & Implementation Blueprint

## 1. Cross-Agent Plugin Repository Structure Ensures Universal Compatibility

To make **6W** installable across **Claude Code**, **OpenAI Codex CLI**, **Hermes**, **Cursor**, and standard **MCP / Agent Skills** runtimes, package the open-source repository using a modular, multi-file skill layout centered around a **Dual-Track Output** (1 interactive HTML Master Hub for humans + lean `.md` specs for coding agents):

```text
6w-skill/
├── SKILL.md                          # Core entry point & state-machine instructions (<500 lines)
├── plugin.json                       # Metadata & dependency manifest (declares `archify` dependency)
├── references/
│   ├── scoring-rubric.md             # Detailed 100-point rubric and deduction rules for all 6 Ws
│   ├── persona-edge-matrix.md        # Framework linking WHO (marketing personas) to WHETHER (edge cases)
│   ├── stack-archetypes.md           # Opinionated tech stack matrices & unit-economics formulas
│   └── archify-bridge.md             # Input/output schema contract for invoking the `archify` skill
├── assets/
│   ├── 6w-state.template.json        # Persistent session state tracker (survives context compaction)
│   ├── master-hub.template.html      # Self-contained single-file HTML dashboard (Mermaid + Tailwind CDN)
│   ├── implementation-plan.template.md # Token-optimized build spec & test cases for coding agents
│   └── agent-rules.template.md       # Generates root CLAUDE.md / AGENTS.md / .cursorrules guardrails
└── scripts/
    └── score_validator.py            # Optional deterministic rubric calculator & HTML/Mermaid bundler
```

## 2. State Machine & Interactive Loop Prevent Context Drift

Vibe coders frequently lose track of product decisions across long terminal sessions. **6W** solves this by maintaining a lightweight `.6w/state.json` file in the project workspace and moving through five deterministic phases:

| Phase | Trigger / Entry Condition | Core Agent Action | Exit Criteria |
| :--- | :--- | :--- | :--- |
| **Phase 0: Context Ingestion** | User invokes `/6w` with optional files, links, voice notes, or existing code | Parses all attached files, extracts implicit answers across all 6 Ws, writes initial `.6w/state.json`, and prints the baseline scoreboard | Baseline scoreboard displayed; lowest-scoring W in sequence selected |
| **Phase 1: Socratic Walkthrough** | Any W score is `< 90/100` (ordered: Why → Who → What → Which → Whether → When) | Evaluates current W against its 4 sub-criteria, identifies the biggest blind spot, and asks **1–2 targeted questions** with 3 concrete options | All 6 Ws reach `>= 90/100`, OR user triggers `/6w skip` / `/6w finish` |
| **Phase 2: Assumption Lock** | Any W was skipped below `90/100` | Converts every unanswered sub-criterion into an explicit `[ASSUMPTION]` or `[RISK]` tag so downstream architecture accounts for it | User confirms or edits the assumption register |
| **Phase 3: Master HTML Hub Synthesis** | Discovery locked | Invokes **`archify`** for UML/C4/ERD diagrams and compiles everything (Scorecard, Pitch Flow, Persona Cards, Tech Stack, Diagrams, Roadmap) into **1 self-contained `6w-master-hub.html` file** | `6w-master-hub.html` verified and ready to open in browser |
| **Phase 4: Agent `.md` Handoff** | HTML Hub complete | Generates token-optimized `.md` implementation files (`IMPLEMENTATION-PLAN.md` + root `CLAUDE.md` / `AGENTS.md`) so the coding agent can start building immediately | Handoff summary presented with recommended first coding prompt |

## 3. Granular 100-Point Scoring Rubric Stops Polite AI Grade Inflation

To prevent the LLM from giving generous 95/100 scores to vague ideas, the skill enforces **hard score caps** (penalty ceilings) whenever critical business, marketing, or technical realities are missing:

| W Dimension | Sub-Criterion 1 (30 pts) | Sub-Criterion 2 (25 pts) | Sub-Criterion 3 (25 pts) | Sub-Criterion 4 (20 pts) | Hard Cap Rule (Automatic Ceiling) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Why** *(Problem & Value)* | **Pain Severity:** Frequency and cost of the problem today | **Broken Workaround:** Why current tools/spreadsheets fail | **Value Capture:** Revenue model, time saved, or strategic hook | **Kill Metric:** One measurable KPI that proves v1 succeeded | Capped at **60/100** if the user cannot name how users currently solve or work around the problem |
| **2. Who** *(Audience & Reach)* | **Beachhead Persona:** Specific role, context, and daily workflow | **Switching Trigger & Objections:** Exact event that makes them switch + why they hesitate | **Distribution Watering Holes:** Where to find and message the first 50 users | **Buyer vs. User & Anti-Persona:** Who pays vs. who uses, and who to exclude | Capped at **55/100** if the target user is described as "everyone" or "general consumers" without a niche wedge |
| **3. What** *(MVP & Anti-Scope)* | **Core Value Loop:** The single repeatable user action (Input → Magic → Output) | **v1 Must-Haves:** Maximum 3–5 essential features for launch | **Explicit Anti-Scope:** Features intentionally cut from v1 | **Data/Asset Inputs:** What the user must bring or connect on Day 1 | Capped at **65/100** if v1 contains more than 5 distinct features or lacks an explicit "Not Building in v1" list |
| **4. Which** *(Platform & Surface)* | **Primary Form Factor:** Web, Mobile, CLI, Extension, Bot, or Desktop | **Workflow Fit:** Why this surface matches the *Who*'s habits | **Device/OS Constraints:** Offline needs, hardware access, latency | **Integration Surface:** External APIs, webhooks, or MCP servers | Capped at **70/100** if a native mobile app is chosen without a clear hardware or push-notification justification over web |
| **5. Whether** *(Risks & Economics)* | **Unit Economics:** Inference/API/infra cost per user vs. price | **Technical Bottlenecks:** Rate limits, latency, context limits | **Legal & Privacy:** Auth, PII/GDPR, ToS scraping risks | **Persona & UX Edge Cases:** How real human behavior breaks the happy path | Capped at **50/100** if the product uses paid LLM/API calls without an estimated cost-per-active-user calculation |
| **6. When** *(Timeline & Phasing)* | **Builder Bandwidth:** Realistic hours/week available | **Phase 1 (PoC):** Core loop testable in 48–72 hours | **Phase 2 (MVP):** Shippable v1 date with buffer | **Cut-Line Trigger:** What gets dropped if behind schedule | Capped at **65/100** if the estimated build effort exceeds the user's stated timeframe and bandwidth |

## 4. Terminal UX & Scoreboard Format Keeps Vibe Coders Engaged

Every turn during Phase 1 renders a compact HUD (Heads-Up Display) in the terminal so the developer sees their real-time progress without scrolling through walls of text:

```markdown
╭─── 6W PRODUCT FOUNDATION ─────────────────────────────────────────╮
│ Overall Readiness: 68/100  [█████████████░░░░░░░]  Gate: 90/100   │
│                                                                   │
│ 1. WHY     [94/100] ✅  B2B invoice reconciliation for agencies   │
│ 2. WHO     [91/100] ✅  Boutique agencies (5-20 staff) on Xero    │
│ 3. WHAT    [72/100] 🔄  Missing explicit Anti-Scope (v1 cuts)     │
│ 4. WHICH   [85/100] ⏳  Web dashboard + Slack approval bot        │
│ 5. WHETHER [40/100] ⚠️  Unverified OCR token cost & Xero rate cap │
│ 6. WHEN    [30/100] ⏳  Target: 2 weeks (unmapped to scope)       │
╰───────────────────────────────────────────────────────────────────╯

### Focusing on WHAT (Currently 72/100 — Need +18 pts)
You've nailed the core loop (auto-matching PDFs to Xero bills), but your feature list currently includes **multi-currency tax filing**, **client portal logins**, and **custom role permissions**. Building all three will blow past your 2-week target.

**Question:** Which of these should we move to the **"Not in v1 (Anti-Scope)"** list so you can ship on time?
1. **Cut Client Portal & Custom Roles** (Keep only internal agency admin view + Slack alerts for v1)
2. **Cut Multi-Currency & Client Portal** (Support single domestic currency only in v1)
3. **Cut all three** (Strict v1: Upload PDF → Match Xero Bill → Approve in Slack)
4. **Custom answer** (Tell me what to cut or why they must stay)

*(Reply with `1-4`, attach a doc, or type `next` to lock at 72/100 and move to WHICH)*
```

## 5. Dual-Track Output Architecture: 1 Master HTML Hub + Agent-Ready `.md` Files

Splitting human presentation from machine context gives every stakeholder exactly what they need without file clutter:

* **For Humans (Founders, Marketers, Investors, Product Leads):** **One self-contained HTML file (`6w-master-hub.html`)** that opens offline/online in any browser with zero build step, interactive tabs, visual trading cards, rendered Mermaid/SVG architecture diagrams, and print-to-PDF styling.
* **For Coding Agents (Claude Code, Codex, Hermes, Cursor):** **Clean, token-dense Markdown files (`IMPLEMENTATION-PLAN.md` + `CLAUDE.md` / `AGENTS.md`)** stripped of UI styling so the coding agent doesn't waste context window tokens parsing HTML/CSS when writing code.

```text
project-root/
├── 6w-master-hub.html                # 🌟 CORE HUMAN OUTPUT: Single-file interactive visual command center
├── CLAUDE.md                         # 🤖 AGENT GUARDRAILS: Root rules (or AGENTS.md / .cursorrules)
└── .6w/
    ├── state.json                    # Session scores, raw answers, and assumption log
    ├── IMPLEMENTATION-PLAN.md        # 🤖 AGENT BUILD SPEC: Step-by-step tasks, DB schema, & edge-case tests
    └── ARCHITECTURE-SPEC.md          # 🤖 AGENT ARCH SPEC: Raw Mermaid C4/UML/ERD & API contracts from `archify`
```

### Inside `6w-master-hub.html`: The 5 Interactive Views

The generated `6w-master-hub.html` bundles **Tailwind CSS** and **Mermaid.js** in a single portable file with five switchable views (plus a "Print / Export PDF" view that renders all sections cleanly):

| HTML Tab / Section | Target Audience | Visual Components Embedded in `6w-master-hub.html` |
| :--- | :--- | :--- |
| **Tab 1: 6W Scorecard & Pitch Flow** | Founders & Investors | • **6W Readiness Gauges:** Color-coded progress rings (`Why`, `Who`, `What`, `Which`, `Whether`, `When`)<br>• **Pitch Flowchart:** Rendered interactive Mermaid diagram (`Problem → Trigger → Core Loop → Value Capture`)<br>• **Anti-Scope Firewall Card:** Explicit "Not Building in v1" list + logged `[ASSUMPTION]` badges |
| **Tab 2: Audience Persona & Edge-Case Cards** | **Marketing Experts, GTM & UX** | • **4 Visual Persona Cards:** *Beachhead Champion*, *Skeptical Buyer/Gatekeeper*, *Chaos/Boundary User*, and *Anti-Persona*<br>• **1-Click Copy GTM Hooks:** Scroll-stopping ad copy, watering holes (subreddits/communities), and pricing sweet spots<br>• **Persona Edge-Case Matrix:** Maps each persona's psychological/behavioral quirk (e.g., OAuth hesitation, dirty WhatsApp uploads, token abuse) directly to its UI/product fix |
| **Tab 3: Tech Stack & Unit Economics** | Product & Technical Leads | • **Tiered Stack Comparison:** *Weekend Vibe Stack* (ship fast) vs. *Scale Stack* (long-term)<br>• **Interactive Cost Estimator:** Slider/table showing monthly infra + LLM/API token burn vs. revenue at **100 / 1,000 / 10,000 users** |
| **Tab 4: System Architecture (`archify`)** | Engineers & Architects | • **C4 Container Diagram:** High-level system blocks matching the chosen tech stack<br>• **Edge-Case Sequence Diagram:** Core user loop including fallback branches from the Persona Edge Cases<br>• **v1 Entity-Relationship Diagram (ERD):** Minimal database tables required for v1 MVP |
| **Tab 5: Phased Ship Roadmap (`When`)** | Vibe Coders & PMs | • **Timeline & Cut-Lines:** 48-Hour PoC checklist, Week 1 MVP milestones, and automatic scope cut-triggers if behind schedule |

### Inside the Agent `.md` Pack: Ready for Immediate Implementation

While humans explore `6w-master-hub.html`, the coding agent reads two focused Markdown files designed to prevent hallucination and scope creep:

| Agent Markdown File | What It Enforces During Coding |
| :--- | :--- |
| **`CLAUDE.md` / `AGENTS.md`** *(Root Guardrails)* | 1. **Locked Tech Stack:** Exact framework versions, DB, auth, and styling rules.<br>2. **Strict Anti-Scope Rules:** Explicit list of features the agent is forbidden from scaffolding in v1.<br>3. **Mandatory Edge-Case Handlers:** Requires the agent to implement the exact UX/system fallbacks identified in *Whether* and the Persona Cards (e.g., file-type validation, API rate-limit queues, sandbox preview mode). |
| **`.6w/IMPLEMENTATION-PLAN.md`** *(Phased Execution Checklist)* | 1. **Database Schema & Types:** Exact SQL/Prisma/Drizzle models derived from the `archify` ERD.<br>2. **Ordered Task Checklist:** Granular `[ ]` tasks broken into *Milestone 1 (48h Core Loop PoC)*, *Milestone 2 (Persona Edge-Case Guardrails)*, and *Milestone 3 (Launch Polish)*.<br>3. **Verification Commands:** Automated test criteria for every core loop step and persona edge case. |

## 6. Dependency Contract with the `archify` Skill

Before compiling `6w-master-hub.html` and `.6w/IMPLEMENTATION-PLAN.md`, **6W** passes the validated state into **`archify`** (or generates fallback Mermaid diagrams if `archify` is not installed) so the same verified diagrams populate both the HTML visual viewer and the agent Markdown spec:

```yaml
archify_handoff_payload:
  product_name: "<Extracted from What>"
  target_platform: "<Extracted from Which>"
  personas_and_actors:
    - "<Beachhead Champion from Who>"
    - "<Skeptical Gatekeeper from Who>"
    - "<Chaos/Boundary Actor from Whether>"
  core_loop_steps:
    - "<Step 1: Trigger & Sandbox Entry>"
    - "<Step 2: Core Action>"
    - "<Step 3: Value Delivery>"
  external_dependencies:
    - "<APIs / Auth / DBs from Which & Whether>"
  critical_edge_cases:
    - "<Persona Activation / Dirty-Data Edge Cases>"
    - "<Unit Economic / Rate-Limit Edge Cases>"
  requested_diagrams:
    - type: "c4_container"
      purpose: "High-level system architecture matching the chosen tech stack"
    - type: "sequence_diagram"
      purpose: "Core user loop including Persona Edge-Case fallback branches"
    - type: "er_diagram"
      purpose: "Minimal v1 database schema (excluding Anti-Scope features)"
```

## 7. Production-Ready `SKILL.md` Draft

Below is the complete, drop-in `SKILL.md` file updated for the **Single HTML Master Hub + Agent `.md` Implementation Pack** workflow:

```markdown
---
name: 6w
description: Interactive product discovery, marketing persona & edge-case generator, and system architecture planner for developers, marketers, and vibe coders. Use when the user wants to brainstorm a new app/product, validate a startup or side-project idea, create audience persona cards with behavioral edge cases, define MVP scope before coding, run the "6W" framework (Why, Who, What, Which, Whether, When), or generate a single all-in-one HTML product hub plus agent-ready Markdown implementation specs (with archify).
---

# 6W — Product Foundation, GTM Persona & Vibe-Coding Architect

Guide developers, product creators, and marketers through a structured 6-dimension discovery loop (**Why, Who, What, Which, Whether, When**) before writing application code. Stop premature implementation by scoring each dimension out of 100, challenging blind spots until each reaches **90/100** (or the user chooses to bypass), and outputting:

1. **One All-in-One Interactive HTML File (`6w-master-hub.html`)** containing the 6W Scorecard, Pitch Flowchart, Audience Persona & Edge-Case Cards, Tech Stack & Cost Calculator, and `archify` System Architecture Diagrams (C4, Sequence, ERD).
2. **Agent-Ready Markdown Files (`CLAUDE.md` / `AGENTS.md` & `.6w/IMPLEMENTATION-PLAN.md`)** optimized for Claude Code, Codex, Hermes, and Cursor to implement the MVP immediately without context bloat.

## When to Use

- The user invokes `/6w` or asks to run the 6W framework on an idea, repo, or attached document.
- The user says "I want to build X" and asks to plan, validate, position, scope, or architect the business/product foundation before coding.
- The user wants an all-in-one visual HTML pitch/architecture hub alongside clean `.md` build specs for their coding agent.

## Core Commands & Modes

- `/6w [idea or files]` — Start or resume the standard 6W walkthrough.
- `/6w roast` — Switch to Devil's Advocate mode (skeptical investor, growth marketer, and principal engineer tone; stricter scoring).
- `/6w personas` — Preview or regenerate the 4 Audience Persona & Edge-Case Cards at any point.
- `/6w skip` or `next` — Lock the current W at its current score, log missing items as explicit assumptions, and move to the next W.
- `/6w finish` — Immediately generate `6w-master-hub.html` and the agent `.md` implementation files using current scores and logged assumptions.
- `/6w audit` — Reverse-engineer an existing codebase into `6w-master-hub.html` and agent `.md` specs to expose scope creep, positioning gaps, or unaddressed edge cases.

## Step-by-Step Workflow

### Step 1: Ingest Context & Initialize State

1. Check if `.6w/state.json` already exists in the workspace to resume an active session.
2. If starting fresh, inspect all user-provided text, attached files, images, or existing repository files.
3. Evaluate all six dimensions simultaneously based on the initial context and assign baseline scores (0-100) using the rubric below.
4. Save or update `.6w/state.json` and display the **6W Scoreboard HUD**.

### Step 2: Score & Walk Through the 6Ws in Sequence

Walk through the dimensions in strict order of foundational dependency:

1. **WHY (Problem, Pain & Value Model)**
   - Sub-criteria: Pain Severity (30), Broken Existing Workaround (25), Value/Revenue Model (25), Single Success KPI (20).
   - Hard Cap: Max 60/100 if the current user workaround is unknown.
2. **WHO (Target Personas, Watering Holes & Anti-Persona)**
   - Sub-criteria: Beachhead Persona & Daily Workflow (30), Switching Trigger & Buying Objections (25), First-50-Users Watering Holes (25), Buyer vs. User Alignment & Anti-Persona (20).
   - Hard Cap: Max 55/100 if the audience is "everyone" without a specific beachhead segment.
3. **WHAT (Core Loop, MVP Scope & Anti-Scope)**
   - Sub-criteria: Repeatable Core Loop (30), Max 3-5 v1 Features (25), Explicit Anti-Scope / "Not in v1" List (25), Day-1 User Input Requirements (20).
   - Hard Cap: Max 65/100 if no explicit "Not Building in v1" list is defined.
4. **WHICH (Platform, Surface & Ecosystem Fit)**
   - Sub-criteria: Primary Form Factor — Web/App/CLI/Extension/Bot (30), Workflow Fit for the *Who* (25), Device/Latency/Offline Constraints (25), External Integrations (20).
   - Hard Cap: Max 70/100 if the chosen platform adds high friction (e.g. native app store download) without a clear habit or hardware reason.
5. **WHETHER (Feasibility, Unit Economics, Legal & Persona Edge Cases)**
   - Sub-criteria: Unit Economics / API & LLM Cost vs. Price (30), Technical Bottlenecks & Rate Limits (25), Legal/Privacy/Auth Compliance (25), Behavioral & UX Edge Cases per Persona (20).
   - Hard Cap: Max 50/100 if the product relies on paid AI/API calls without estimating cost per active user.
6. **WHEN (Timeframe, Bandwidth & Phased Cut-Lines)**
   - Sub-criteria: Builder Weekly Bandwidth (30), 48-Hour PoC Milestone (25), Target MVP Ship Date (25), Scope Cut-Line if Delayed (20).
   - Hard Cap: Max 65/100 if the *What* and *Which* cannot realistically be built within the stated *When*.

### Interaction Rules During Step 2

- Focus on the first W in sequence that is below **90/100**.
- Always render the compact **6W Scoreboard HUD** at the top of your reply.
- Explain in 1-2 sentences why the current W is below 90/100.
- Ask **at most 1-2 high-leverage questions** per turn. Always provide **3 concrete multiple-choice options** tailored to their project plus Option 4 ("Custom answer") so the user can reply with a single number or short phrase.
- Whenever a W reaches **>= 90/100**, celebrate briefly, lock it as `✅`, and immediately present the first question for the next W under 90/100.
- Respect user overrides immediately: if the user says "skip", "move on", or "good enough", mark that W as `⚠️ Locked by User`, record the missing rubric items in the `assumptions_and_risks` list, and advance.

### Step 3: Synthesize Architecture via `archify` & Generate Dual-Track Outputs

Once all 6 Ws reach `>= 90/100` (or the user triggers `/6w finish`), execute the synthesis pipeline:

1. **Generate Architecture Diagrams via `archify`:**
   - Check if the `archify` skill is installed. If available, invoke `archify` with the locked 6W state and persona edge cases to produce the **C4 Container Diagram**, **Core Loop & Persona Edge-Case Sequence Diagram**, and **v1 Database ERD**. If unavailable, generate validated Mermaid.js diagrams directly.
2. **Build the Core Human Output (`./6w-master-hub.html`):**
   - Generate a single, self-contained, responsive HTML file (using Tailwind CSS and Mermaid.js CDN + print stylesheet) containing 5 interactive tabs:
     - **Tab 1 — 6W Scorecard & Pitch Flowchart:** Visual score gauges, executive summary, rendered Pitch Flowchart (`Problem -> Trigger -> Core Loop -> Value Capture`), Anti-Scope firewall, and Assumption Register.
     - **Tab 2 — Audience Persona & Edge-Case Cards:** 4 visual cards (*Beachhead Champion*, *Skeptical Buyer/Gatekeeper*, *Chaos/Boundary User*, *Anti-Persona*) combining GTM hooks, watering holes, willingness to pay, and concrete behavioral/UX edge cases with their product fixes.
     - **Tab 3 — Tech Stack & Unit Economics Calculator:** Side-by-side *Weekend Vibe Stack* vs. *Scale Stack* plus interactive monthly cost projections at 100, 1,000, and 10,000 users.
     - **Tab 4 — System Architecture & UML Suite:** Rendered C4 Container, Edge-Case Sequence, and v1 ERD diagrams from `archify`.
     - **Tab 5 — Phased Ship Roadmap (`When`):** 48-hour PoC milestone, MVP launch schedule, and scope cut-line triggers.
3. **Build the Agent Implementation Pack (`CLAUDE.md` / `AGENTS.md` & `.6w/IMPLEMENTATION-PLAN.md`):**
   - Write `.6w/IMPLEMENTATION-PLAN.md` with the exact v1 database schema, API contracts, ordered `[ ]` build tasks, and edge-case test assertions.
   - Write or update `CLAUDE.md` and `AGENTS.md` (and `.cursorrules` if requested) with strict scope guardrails, locked stack rules, Anti-Scope prohibitions, and links to `.6w/IMPLEMENTATION-PLAN.md`.

## Gotchas

- Never split the human-facing visual deliverables across multiple fragmented HTML or image files; keep every human/marketing/pitch view unified inside `6w-master-hub.html`.
- Never tell coding agents to parse `6w-master-hub.html` for implementation instructions; keep all coding instructions clean and token-efficient inside `.6w/IMPLEMENTATION-PLAN.md` and `CLAUDE.md` / `AGENTS.md`.
- Do not inflate scores to be polite. Apply hard caps strictly and always include concrete behavioral/technical edge cases on every Persona Card.
```
