# Personas and edge cases

Read this before producing a persona card or an edge-case card. It fixes the roles to consider, the fields each card carries, and the link between a persona's behavior and a product decision.

## Four roles to consider, not four cards to fill

| Role | What it records | Produce it when |
| --- | --- | --- |
| Beachhead champion | The first segment, in its own context and workflow, and the moment the product appears in it | Always, as `priority: primary` |
| Skeptical buyer or gatekeeper | Who pays or approves when that is not the user, and what they need to see | The buyer, approver or administrator differs from the user |
| Chaos or boundary user | A real user whose behavior breaks the happy path: wrong inputs, no connectivity, misuse, several needs at once | Context names such behavior. If it does not, the edge-case cards carry it instead |
| Anti-persona | The segment the product is not for, and why | Always, as `priority: excluded`, because it records an exclusion decision |

A card exists only when context supports it. Three cards with honest evidence beat four with one invented. The anti-persona is the exception: naming who is excluded is a decision, and a decision costs nothing to record.

## Persona card fields

`id` (`PERSONA-nnn`), `title`, `role`, `priority` (`primary`, `secondary`, `excluded`), `evidence` (unknown, assumption, user, source, observed), `situation`, `outcome` (the job to be done), `workaround` (what they do today), `trigger` (the event that makes them look), `objections` (a list), `channels` (where the first fifty can be reached), `firstValue` (the moment the product proves itself), `reason` (for the anti-persona: why excluded), `links`, `sources`.

Rules:

- No decorative demographics. Age, gender, income and location appear only when a concrete product or marketing decision depends on them, and then with a source.
- Never infer a sensitive trait (health, religion, orientation, ethnicity, finances) that the user did not state. MenuLens records celiac disease because the user said the beachhead has it and the product exists for it.
- Each objection needs a proof the product can show. Record proofs as `firstValue` or as a `REQ-`.
- `channels` are places the builder can actually post or reach. "Social media" is not a channel. "r/Celiac, where the builder already posts" is.

## Edge-case card fields

`id` (`EDGE-nnn`), `title`, `persona` (one `PERSONA-` id), `severity` (`critical`, `high`, `medium`, `low`), `frequency` (an estimate with its basis, or `unknown`), `impact` (what breaks for the user or the business), `response` (what the product does), `scopeDecision`, `test` (one observable Given, when, then), `links`.

Scope decisions: `support-now`, `workaround`, `defer`, `exclude`, `investigate-segment`. An `exclude` or `defer` on a `critical` edge case needs a `RISK-` that says what exposure remains.

Frequency never outranks severity. An accessibility need that affects few users is not dismissed because it affects few users. A `critical` edge case is one where the product's core promise fails or a user is harmed.

## From behavior to product decision

Each edge case links a persona's real behavior to one product response and one test. Examples of the shape, not facts to copy:

| Behavior seen in the segment | Edge case | Product response | Scope |
| --- | --- | --- | --- |
| Hesitates to grant OAuth access to a work account | Sign-up abandons at the permission screen | A read-only scope first, and a sandbox mode with sample data before any connection | support-now |
| Uploads photos of receipts taken in a moving car | Blurry, rotated, partial images | Confidence per field, a retake prompt below a threshold, never a silent guess | support-now |
| Shares one paid seat with a whole team | Seat sharing | Per-workspace pricing instead of per-seat, or activity-based detection with a nudge, not a lockout | investigate-segment |
| Runs the free tier in a loop to avoid paying for API calls | Token abuse | A per-account cap on the value metric, visible before it is hit | support-now |
| Needs the output in a second language | Localization | Deferred to v2 with the string table isolated now so it is cheap later | defer |
| Cannot see color differences in status badges | Color-only status | Text labels alongside color, tested with a screen reader | support-now |

## Cover these when they apply

Conflicting goals between user and buyer. Confidential context the user cannot share. Limited connectivity or an integration that is down. Accessibility and language. An existing product being reassessed rather than built. No access to customers. Unsupported devices. Failure, misuse, duplicate actions and partial completion.

## Where the cards go

Personas and edge cases render into the Audience section of the HTML and into `AUDIENCE.md`. Every `support-now` edge case also appears in `AGENT-RULES.md` as a mandatory handler, so the coding agent cannot skip it.
