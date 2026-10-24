# MenuLens: risks and assumptions

<!-- 6W handoff. project menulens. blueprint 0.0.3. state sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.2. -->

Blockers, assumptions, evidence gaps and the validation tasks that close them.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.3 | `sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.2 |

## Risks

### <a id="risk-001"></a>RISK-001. A flagged-safe dish harms a user

Severity critical. Status open.

- Mitigation: Flags are warnings, never clearances. Confirm-with-staff on every card. Preparation question included. Wording for health information to be investigated in Australia and the EU before launch.
- Remaining exposure: Residual. The app cannot see the kitchen.
- Links: [EDGE-003](AUDIENCE.md#edge-003), [REQ-003](REQUIREMENTS.md#req-003), [TASK-004](DELIVERY.md#task-004)

### <a id="risk-002"></a>RISK-002. The model invents ingredients

Severity high. Status open.

- Mitigation: Confidence state per card. Accuracy test against a native speaker on ten real menus before anyone else uses it.
- Remaining exposure: Residual for rare dishes.
- Links: [EDGE-001](AUDIENCE.md#edge-001), [EXP-002](MARKETING.md#exp-002), [REQ-002](REQUIREMENTS.md#req-002)

### <a id="risk-003"></a>RISK-003. Vision pricing changes or rate limits bite

Severity medium. Status open.

- Mitigation: Re-verify pricing before launch. Thin server so the provider can be swapped.
- Remaining exposure: Cost per trip could double and still be under 0.30 USD.
- Links: [ASM-002](RISKS-AND-ASSUMPTIONS.md#asm-002)

## Assumptions

### <a id="asm-001"></a>ASM-001. Allergy travelers will pay 4.99 USD for a trip pass

Status untested. If false: If false, the yearly option or a free tier with a scan limit is the fallback. Links: [DEC-004](DECISIONS.md#dec-004), [EXP-001](MARKETING.md#exp-001).

### <a id="asm-002"></a>ASM-002. One scan costs about 0.012 USD and a trip takes about 12 scans

Status untested. If false: If cost is 5 times higher the trip pass still covers it. Pricing is provisional and dated 2026-10. Links: [RISK-003](RISKS-AND-ASSUMPTIONS.md#risk-003), [EXP-002](MARKETING.md#exp-002).

## Evidence gaps

- WHY value-capture: assumption
- WHICH workflow-fit: assumption
- WHICH integration-boundary: assumption
- WHETHER unit-economics: assumption
- WHETHER technical-bottlenecks: assumption
