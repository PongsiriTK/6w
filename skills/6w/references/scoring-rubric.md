# Scoring rubric

Rubric version 0.1. This file defines how a W earns its score. The agent reads it before rating anything and shows its arithmetic until the scoring script ships.

## Formula

Each W has four sub-criteria with weights 30, 25, 25 and 20. Each sub-criterion is rated 0 to 4.

```text
raw   = 30 × r1 / 4 + 25 × r2 / 4 + 25 × r3 / 4 + 20 × r4 / 4
score = min(round_half_up(raw), active_cap)
```

A cap applies only while its condition holds. When the condition clears, the raw score returns. The gate is 90 unless state sets another value. The overall number is the mean of the six scores and is a summary only.

Worked example for What: ratings 4, 3, 0, 3 give raw 30 + 18.75 + 0 + 15 = 63.75, rounded to 64. The anti-scope list is missing, so the cap of 65 is also active. Score 64. Adding a credible anti-scope list rated 3 gives raw 82.5, rounded to 83, cap lifted. Score 83.

## Rating anchors

| Rating | Meaning |
| --- | --- |
| 0 | Missing or unusable |
| 1 | Vague, with major unresolved choices |
| 2 | Partially defined, with consequential gaps |
| 3 | Mostly usable, with bounded remaining gaps |
| 4 | Specific and usable for the selected stage |

Rate against the selected target stage. A 4 at the explore stage is a clear hypothesis and a test. A 4 at the build MVP stage is a decision a developer can act on today.

## Why

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Pain severity | 30 | "It is annoying" with no frequency or cost | How often it happens, what it costs in time or money, what breaks when it is ignored |
| 2 | Broken workaround | 25 | A competitor is named but not why people still use the workaround | The current manual process or tool, why it fails, and why the pain has not been solved already |
| 3 | Value capture | 25 | "Subscription" with no price logic or cost side | A revenue or value model with a price hypothesis, a cost assumption, and the support burden, or for internal tools the measurable organizational benefit |
| 4 | Success metric | 20 | "Users will love it" | One measurable outcome for v1 and the evidence that would weaken the proposition |

Cap 60: the user cannot say how people work around the problem today.

## Who

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Beachhead persona | 30 | "Small businesses" | A role, their context, their daily workflow and the moment in it where the product appears |
| 2 | Switching trigger and objections | 25 | A trigger with no objection, or objections with no trigger | The event that makes them look, and the two or three reasons they hesitate |
| 3 | Distribution | 25 | "Social media" | Named communities or channels where the first fifty users can be reached, and whether the builder has access |
| 4 | Buyer, user and anti-persona | 20 | Buyer and user are assumed to be the same without saying so | Who pays, who uses, who approves, and the segment deliberately excluded with the reason |

Cap 55: the audience is "everyone" or "general consumers" with no named segment.

## What

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Core loop | 30 | A list of features with no single action | The product in one sentence and the repeatable action from entry to value |
| 2 | v1 must-haves | 25 | Six or more features, or features without acceptance criteria | At most five features, each with an observable acceptance criterion |
| 3 | Explicit anti-scope | 25 | "We will add more later" | Named features cut from v1 with the reason, and whether an existing product could serve instead |
| 4 | Day-one inputs | 20 | Inputs implied but not listed | What the user brings or connects before value appears, and the business rules that apply |

Cap 65: v1 lists more than five features or has no anti-scope list.

## Which

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Primary form factor | 30 | "An app" | One form factor named, with the rejected alternatives |
| 2 | Workflow fit | 25 | The form factor matches the builder's preference | The form factor matches where and how the beachhead persona already works |
| 3 | Device and environment constraints | 25 | Not considered | Offline, hardware, latency, accessibility and connectivity needs stated, or stated as not applicable with the reason |
| 4 | Integration boundary | 20 | "We will integrate with everything" | The external APIs, webhooks, MCP servers and existing workflows the product must fit, and the ones it will not |

Cap 70: a native app store download is chosen with no hardware, notification or habit reason over the web.

## Whether

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Unit economics | 30 | Costs acknowledged but not estimated | Cost per active user for inference, API and infrastructure against price or budget, at 100, 1,000 and 10,000 users |
| 2 | Technical bottlenecks | 25 | "Should scale fine" | Rate limits, latency, context limits and dependency availability named with their effect on the core loop |
| 3 | Legal, privacy and security | 25 | "We will handle GDPR" | Authentication, personal data, terms of service and jurisdiction listed as issues to investigate, with owners |
| 4 | Persona and UX edge cases | 20 | Happy path only | At least one behavioral or technical edge case per persona, with the product response and remaining exposure |

Cap 50: the product depends on paid model or API calls and no cost per active user has been estimated.

## When

| # | Sub-criterion | Weight | Looks like a 2 | Looks like a 4 |
| --- | --- | ---: | --- | --- |
| 1 | Builder bandwidth | 30 | "Evenings and weekends" | Hours per week, skills available, budget, and external dependencies with dates |
| 2 | Proof of concept | 25 | No intermediate milestone | The core loop testable within roughly 48 to 72 hours of effort, with what will be observed |
| 3 | MVP date | 25 | A date with no buffer and no definition of done | A date, a buffer, and acceptance criteria that define done |
| 4 | Cut line | 20 | "We will see" | What is dropped first when behind, and why the timing matters now |

Cap 65: the What and Which cannot be built within the stated bandwidth and date.

## Stage modifiers

The same rating scale is read against the target stage.

| Stage | What a 4 requires across the Ws |
| --- | --- |
| Explore | A problem hypothesis and an experiment that could falsify it |
| Prototype | A named audience, the core workflow, a learning goal, and what success and failure would look like |
| Build MVP | Bounded scope, acceptance criteria, credible delivery assumptions, critical dependencies addressed |
| Pilot | Onboarding, operating responsibilities, measurement, recovery behavior, and unresolved approvals identified |

A 4 at prototype never implies production readiness.

## Change rules

A score changes only when its content, its evidence, the rubric version or the target stage changes. Record the reason with the new rating. A user override records the decision and leaves the score where it is.

## Roast mode

In roast mode the anchors do not change. The agent reads every claim as a skeptical investor, a growth marketer and a principal engineer would, asks for the evidence behind any 3 or 4, and rates a 3 as a 2 when the evidence status is unknown.
