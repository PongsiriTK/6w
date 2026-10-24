# MenuLens: delivery

<!-- 6W handoff. project menulens. blueprint 0.1.0. state sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.2. -->

Milestones, capacity, the ordered task checklist and how each task is verified.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.1.0 | `sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.2 |

## Capacity and dates

Solo builder, about 15 hours a week \(weeknights and one weekend day\) for six weeks until departure. Comfortable with web frontends and a small Node server. No budget beyond model calls and a 20 USD hosting plan.

MVP by the end of week five, one week of buffer before departure. Done means REQ-001 to REQ-004 pass their acceptance criteria on the builder's phone and two allergy travelers from r/Celiac have used it on a real menu photo.

## Cut line

Behind by the end of week three: drop the offline cache \(REQ-004\) first, then the confirmation card \(REQ-003\). Never drop the allergen flags. Timing matters because the trip is the first real test and the next one is months away.

## Tasks

- [ ] <a id="task-001"></a>**TASK-001** Proof of concept: ten menu photos to dish cards with a hardcoded profile. Milestone: 48 hours. Verify: EXP-002 recorded. Links: [REQ-002](REQUIREMENTS.md#req-002), [EXP-002](MARKETING.md#exp-002).
- [ ] <a id="task-002"></a>**TASK-002** Web app with camera capture, profile, dish cards and confirmation cards. Milestone: Week 4. Verify: REQ-001, REQ-002 and REQ-003 acceptance criteria pass on the builder's phone. Links: [REQ-001](REQUIREMENTS.md#req-001), [REQ-002](REQUIREMENTS.md#req-002), [REQ-003](REQUIREMENTS.md#req-003), [DEC-001](DECISIONS.md#dec-001).
- [ ] <a id="task-003"></a>**TASK-003** Offline cache and two external testers. Milestone: Week 5. Verify: REQ-004 passes in airplane mode. Two r/Celiac testers scan a real menu.. Links: [REQ-004](REQUIREMENTS.md#req-004), [PERSONA-001](AUDIENCE.md#persona-001).
- [ ] <a id="task-004"></a>**TASK-004** Investigate health-information wording and provider terms. Milestone: Before the first external tester. Verify: Notes recorded with sources and dates in RISK-001. Links: [RISK-001](RISKS-AND-ASSUMPTIONS.md#risk-001).
