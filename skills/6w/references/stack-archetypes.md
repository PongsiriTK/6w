# Stack archetypes and the unit-economics table

Read this when the stage is build MVP, Which and Whether are at or near the gate, and no technical direction has been recorded yet. Record the result as a proposed `DEC-` with the fast stack as the recommendation and the scale stack as the named alternative, plus the conditions that would switch them.

Patterns here are categories, not vendor choices. Name a vendor only when the user already uses it or when the Which decision depends on it. Every price or limit you cite needs a dated `SRC-`; otherwise mark it provisional.

## Two stacks, one decision

| | Fast stack | Scale stack |
| --- | --- | --- |
| Optimizes for | Shipping the core loop in weeks with one builder | Many users, several builders, uptime and cost control |
| Choose when | Stage is build MVP or earlier, the value is unproven, bandwidth is small | Retention and payment are observed, or a pilot has contractual uptime |
| Cost shape | Low fixed cost, variable cost per unit of work | Higher fixed cost, lower variable cost per unit |
| Typical risk | A ceiling on scale or on customization, paid for later | Weeks spent on infrastructure before anyone has used the product |

Never choose the scale stack because the agent can generate it. The blueprint records the fast stack and the trigger that would justify the switch.

## By form factor

| Form factor | Fast stack pattern | Scale stack pattern | What usually forces the switch |
| --- | --- | --- | --- |
| Mobile web app or PWA | One web framework, hosted static with a thin serverless or single-process API, a managed database, hosted auth | Separate API service, a queue for slow work, a CDN in front, observability | Latency of model calls, offline sync conflicts, or an app-store requirement |
| Native mobile | One cross-platform toolkit, a backend-as-a-service for auth, data and push | Native per platform, a dedicated API, feature flags | A hardware capability the cross-platform layer lacks, or performance on old devices |
| Desktop app | A web-technology shell around the web app | Native per platform | Deep OS integration or a need to avoid the shell's memory footprint |
| CLI or developer tool | One binary or script, no server, config in a file | A service behind it for shared state, auth tokens, telemetry opt-in | Team features or shared state |
| Browser extension | Content script plus a small popup, settings in extension storage | A backend for sync and accounts | Sync across devices, paid features |
| Bot in chat (Slack, Discord, LINE, Telegram) | One webhook handler on a serverless function, a managed database | A worker queue, retries, per-workspace isolation | Rate limits of the chat platform, slow model calls past the platform's timeout |
| API or service | One process on a managed host, one database, keys in a managed secret store | Horizontal scaling, rate limiting per key, usage metering | Paying customers who need SLAs, or metered pricing |
| Internal tool | A low-code builder or a single-page app on the company's existing auth | The same, hardened for audit and access control | Audit requirements, or more than one team depending on it |

## Choosing the model or AI dependency, when there is one

- Pick the provider the builder already has an account and a budget with, unless Whether's unit economics rule it out.
- Put every model call behind one thin module so the provider can change without touching the product.
- Record the latency the persona will tolerate at the moment of use, and the fallback when the call fails or times out. This is a `REQ-`, not a note.
- Estimate cost per unit of work from the provider's listed pricing with a date, then multiply by the units per active user per month from the core loop.

## The unit-economics table

Fill this with the Whether unit-economics rationale. Every number is provisional until a dated source or an observed bill backs it.

| Monthly active users | 100 | 1,000 | 10,000 |
| --- | ---: | ---: | ---: |
| Fixed infrastructure (hosting, database, auth, domains) | | | |
| Variable: model or API calls (units per user × cost per unit) | | | |
| Variable: storage, bandwidth, email, SMS | | | |
| Support hours × loaded hourly cost | | | |
| Total cost | | | |
| Revenue at the price hypothesis × paying share | | | |
| Margin | | | |

Rules for the table:

- Units per user come from the core loop, not from a growth wish. MenuLens used twelve scans per trip because that is how many menus a traveler meets in a week.
- Paying share is an assumption until observed. Label it.
- If margin is negative at 1,000 users, the Whether W cannot pass its gate without a `RISK-` and a decision to change the price, the metric or the cost.
- Keep the table in the Whether rationale so the HTML viability section and `ARCHITECTURE.md` render the same numbers.

## What the decision record looks like

```text
DEC-nnn, proposed. Fast stack: <pattern for the form factor>, because <bandwidth, stage, cost>.
Alternative: <scale stack pattern>. Switch when: <observed trigger, such as retention after two trips or a paying customer with an uptime clause>.
Model dependency: <provider> behind one module, <latency budget>, fallback <behavior>.
Verify before build: <prices and limits that need a dated source>.
```
