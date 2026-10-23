# MenuLens: marketing

<!-- 6W handoff. project menulens. blueprint 0.0.3. state sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.1. -->

Positioning, message hypotheses, objections, channels and experiments. Hypotheses to test, not claims. Hypothetical copy is never a customer quote.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.3 | `sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.1 |

## Positioning hypothesis

- Audience: English speaker with celiac disease or a severe allergy, 2 or more trips a year to countries whose script they cannot read, already carries a printed allergy card
- Problem: Allergy travelers cannot tell what is safe to order from a menu they cannot read
- Benefit: Order a meal with confidence that it does not contain their allergen, and confirm it with staff in their language
- Alternative today: Google Lens for literal translation, printed cards, packaged food

## Objections and the proof each needs

- Can I trust a flag with my health. Proof needed: not yet recorded.
- Roaming data cost. Proof needed: not yet recorded.
- I already use Google Translate. Proof needed: not yet recorded.

## Channels

- r/Celiac
- r/JapanTravel
- Facebook celiac travel groups
- allergy travel bloggers

## Experiments

### <a id="exp-001"></a>EXP-001. Landing page and waitlist posted in r/Celiac and one Facebook group

- Measure: Sign-ups and replies to a 4.99 USD price question
- Timebox: Week 1, 5 days
- Decision rule: Under 25 sign-ups means the channel or the pitch is wrong. Revisit Who before building REQ-003.
- Status: planned
- Links: [ASM-001](RISKS-AND-ASSUMPTIONS.md#asm-001), [DEC-004](DECISIONS.md#dec-004), [PERSONA-001](AUDIENCE.md#persona-001)

### <a id="exp-002"></a>EXP-002. Ten real menus scored against a native speaker

- Measure: Dishes correctly identified, allergens correctly flagged, latency per scan
- Timebox: Within the 48-hour proof of concept
- Decision rule: Under 80 percent correct flags means the core loop is not safe to ship. Stop or change approach.
- Status: planned
- Links: [RISK-002](RISKS-AND-ASSUMPTIONS.md#risk-002), [ASM-002](RISKS-AND-ASSUMPTIONS.md#asm-002), [TASK-001](DELIVERY.md#task-001)
