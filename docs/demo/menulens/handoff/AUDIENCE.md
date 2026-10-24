# MenuLens: audience

<!-- 6W handoff. project menulens. blueprint 0.0.4. state sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.2. -->

Personas with their evidence status, the buyer and user relationship, and the edge cases that change product decisions.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.4 | `sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.2 |

## Personas

### <a id="persona-001"></a>PERSONA-001. Allergy traveler

Role beachhead champion. Priority primary. Evidence user.

| Field | Value |
| --- | --- |
| Situation | English speaker with celiac disease or a severe allergy, 2 or more trips a year to countries whose script they cannot read, already carries a printed allergy card |
| Desired outcome | Order a meal with confidence that it does not contain their allergen, and confirm it with staff in their language |
| Workaround today | Google Lens for literal translation, printed cards, packaged food |
| Trigger | Booking a trip to a non-Latin-script country |
| Objections | Can I trust a flag with my health; Roaming data cost; I already use Google Translate |
| Channels | r/Celiac; r/JapanTravel; Facebook celiac travel groups; allergy travel bloggers |
| First value | First scan shows a dish they would not have risked, flagged, with the question to ask |

Links: [EDGE-001](AUDIENCE.md#edge-001), [EDGE-002](AUDIENCE.md#edge-002), [EDGE-003](AUDIENCE.md#edge-003), [EDGE-004](AUDIENCE.md#edge-004), [REQ-001](REQUIREMENTS.md#req-001), [REQ-002](REQUIREMENTS.md#req-002), [REQ-003](REQUIREMENTS.md#req-003). Sources: [SRC-001](START-HERE.md#src-001), [SRC-002](START-HERE.md#src-002).

### <a id="persona-002"></a>PERSONA-002. Blind-ordering foodie and the hotel business traveler

Role anti-persona. Priority excluded. Evidence assumption.

| Field | Value |
| --- | --- |
| Situation | Enjoys ordering without knowing, or eats where English menus exist |
| Why excluded | Neither has the allergen pain. Both would judge the product on recommendations and reviews, which are out of scope. |

Links: [DEC-002](DECISIONS.md#dec-002), [DEC-003](DECISIONS.md#dec-003). Sources: none.

## Edge cases

### <a id="edge-001"></a>EDGE-001. Handwritten or chalkboard menu

Persona [PERSONA-001](AUDIENCE.md#persona-001). Severity high. Frequency common in Italy and Japan izakaya. Scope decision support-now.

- Impact: Recognition fails or invents dishes
- Response: Show a confidence state per card. Below the threshold, show the local-language question card only and say the menu could not be read.
- Test: Given a photo the model cannot parse, when scanned, then no dish cards appear and the question card and an honest message do.
- Links: [PERSONA-001](AUDIENCE.md#persona-001), [REQ-002](REQUIREMENTS.md#req-002), [RISK-002](RISKS-AND-ASSUMPTIONS.md#risk-002)

### <a id="edge-002"></a>EDGE-002. No connectivity at the table

Persona [PERSONA-001](AUDIENCE.md#persona-001). Severity medium. Frequency frequent in basements and rural areas. Scope decision support-now.

- Impact: Scan cannot run
- Response: Keep the last 20 scanned menus and the question cards available offline. Compress images before upload so one bar is enough when there is signal.
- Test: Given airplane mode, when the app opens, then cached menus and question cards are readable.
- Links: [PERSONA-001](AUDIENCE.md#persona-001), [REQ-004](REQUIREMENTS.md#req-004)

### <a id="edge-003"></a>EDGE-003. Cross-contamination is invisible on a menu

Persona [PERSONA-001](AUDIENCE.md#persona-001). Severity critical. Frequency always. Scope decision support-now.

- Impact: A dish with no flagged ingredient can still be unsafe \(shared fryer, soy sauce with wheat\)
- Response: Every card says that flags are a warning to confirm, not a clearance. The question card asks about preparation, not only ingredients.
- Test: Given any dish card, then the confirm-with-staff line and the preparation question are present.
- Links: [PERSONA-001](AUDIENCE.md#persona-001), [RISK-001](RISKS-AND-ASSUMPTIONS.md#risk-001), [REQ-003](REQUIREMENTS.md#req-003)

### <a id="edge-004"></a>EDGE-004. Several severe allergies and low trust in any app

Persona [PERSONA-001](AUDIENCE.md#persona-001). Severity high. Frequency a minority of the segment. Scope decision support-now.

- Impact: User ignores flags or abandons
- Response: Profile supports multiple allergens. Cards show the ingredient that triggered the flag, so the user can judge it, not only a red icon.
- Test: Given a profile with three allergens, when a dish contains two, then both ingredients are named on the card.
- Links: [PERSONA-001](AUDIENCE.md#persona-001), [REQ-001](REQUIREMENTS.md#req-001), [REQ-002](REQUIREMENTS.md#req-002)
