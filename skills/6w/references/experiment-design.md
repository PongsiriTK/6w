# Designing an experiment record

Read this before writing an `EXP-` record, and when the user asks how to test an assumption. Adapted from the `experiment-designer` and `product-discovery` skills in alirezarezvani/claude-skills (MIT, credited in `THIRD_PARTY_NOTICES.md`). The statistics are theirs. The rules about what an experiment may claim are 6W's.

## What an experiment is for

An experiment exists to change a decision. Before writing one, name the `DEC-` or `ASM-` it would confirm or kill, and what the user will do differently on each outcome. An experiment with no decision attached is research, and research goes in open questions, not in the register.

## Fields of an `EXP-` record

| Field | Rule |
| --- | --- |
| `title` | The intervention and the audience in one line |
| `hypothesis` | If we `<intervention>` for `<audience>`, then `<metric>` moves `<direction and size>`, because `<mechanism>` |
| `measure` | One primary metric that decides. Guardrail metrics that must not get worse. Nothing else counts. |
| `timebox` | A fixed sample or a fixed duration, chosen before the start, so the result is not read early |
| `decisionRule` | The threshold and what happens on each side of it, written before the data exists |
| `status` | `planned`, `running`, `done`, `abandoned` |
| `links` | The `ASM-`, `DEC-` or `RISK-` it tests, and the `PERSONA-` it recruits |

Numbers in `measure` and `decisionRule` are the user's or labeled provisional. 6W never supplies a conversion rate from memory.

## Order of testing

Score each open assumption on two axes: how much the plan breaks if it is false, and how little is known about it. Test the high-risk, low-certainty ones first. The four kinds, from the discovery literature:

| Kind | Question | Cheapest honest test |
| --- | --- | --- |
| Desirability | Do these people want this | Problem interviews about current behavior, a landing page with a real call to action |
| Viability | Does the value cover the cost | The unit-economics table, a price shown on the page, a founder-led sale |
| Feasibility | Can it be built and run | The 48-hour proof of concept on real inputs |
| Usability | Can they use it | A prototype task with time to completion and where they stalled |

A `What` or `When` assumption is usually feasibility. A `Who` or `Why` assumption is usually desirability. Pricing is viability.

## Choosing the test

- Measure behavior, not stated preference, whenever a behavior is observable. A sign-up, a pre-order, a repeated use beats "would you use this".
- A fake door (the button exists, the feature does not) measures demand cheaply. Say on the page what happened and offer the waitlist. Never charge for what does not exist.
- A concierge test (the builder does the job by hand for a few users) measures value before any code and often rewrites the core loop.
- For problem interviews, the evidence threshold is the same pain repeated by several target users, an observable workaround, and a cost the user can name. One enthusiastic interview is a story.

## Sample size and reading the result

When the test compares two variants on a rate, the sample needed depends on the baseline rate, the smallest effect worth acting on, and the error rates the user accepts. For early products the honest answer is usually that no statistically sound comparison is possible with the traffic available. Say so, and choose a behavioral threshold instead: "25 sign-ups from the first 200 visitors or we revisit Who".

Guardrails that survive any sample size:

- Decide the stopping point first. Reading the numbers daily and stopping on a good day is the most common way a false result is born.
- Change one thing. Two changes in one test leave both unexplained.
- A result that crosses the threshold by a hair with a small sample is a signal to repeat, not a decision.
- Significance is not business significance. Compare the size of the effect to the size that would change the plan.
- Watch for novelty: a first-week lift that fades is not a lift.

## When the result is in

Update the linked record: the assumption's `status` becomes `validated` or `invalidated`, the decision stays or is superseded, and the ratings whose evidence the result changes move from `assumption` to `observed`. Record the sample and the date on the `EXP-`. A completed experiment is the only thing that moves a rating's evidence to `observed`.
