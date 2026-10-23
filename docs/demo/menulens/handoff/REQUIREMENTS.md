# MenuLens: requirements

<!-- 6W handoff. project menulens. blueprint 0.0.3. state sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.1. -->

Requirements with observable acceptance criteria, their personas, decisions and edge cases.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.3 | `sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.1 |

## <a id="req-001"></a>REQ-001. Allergy profile

Priority must. Status in-scope.

Outcome: The user records one or more allergens and dietary rules once

Acceptance:
- Given a new user, when they open the app, then they can select allergens from a list and add a free-text rule before the first scan
- Given a saved profile, when the app reopens, then the profile is present without sign-in

Links: [PERSONA-001](AUDIENCE.md#persona-001), [DEC-002](DECISIONS.md#dec-002), [EDGE-004](AUDIENCE.md#edge-004)

## <a id="req-002"></a>REQ-002. Menu photo to dish cards with allergen flags

Priority must. Status in-scope.

Outcome: One photo becomes a list of dishes the user can judge

Acceptance:
- Given a legible printed menu photo, when scanned, then each dish shows its name, a one-line description, main ingredients and a flag per matching allergen within 15 seconds
- Given a flag, then the ingredient that caused it is named on the card

Links: [PERSONA-001](AUDIENCE.md#persona-001), [DEC-001](DECISIONS.md#dec-001), [DEC-003](DECISIONS.md#dec-003), [EDGE-001](AUDIENCE.md#edge-001), [EDGE-004](AUDIENCE.md#edge-004), [RISK-002](RISKS-AND-ASSUMPTIONS.md#risk-002)

## <a id="req-003"></a>REQ-003. Local-language confirmation card

Priority must. Status in-scope.

Outcome: The user can ask staff about ingredients and preparation

Acceptance:
- Given a dish card, when tapped, then a card in the destination language asks whether the dish contains the user's allergens and how it is prepared, with a transliteration

Links: [PERSONA-001](AUDIENCE.md#persona-001), [EDGE-003](AUDIENCE.md#edge-003), [RISK-001](RISKS-AND-ASSUMPTIONS.md#risk-001)

## <a id="req-004"></a>REQ-004. Offline cache of recent menus

Priority should. Status in-scope.

Outcome: Past scans are readable without signal

Acceptance:
- Given airplane mode, when the app opens, then the last 20 scanned menus and their question cards are readable

Links: [PERSONA-001](AUDIENCE.md#persona-001), [DEC-001](DECISIONS.md#dec-001), [EDGE-002](AUDIENCE.md#edge-002)

## Anti-scope

Cut from v1 \(DEC-003\): dish recommendations and ranking, restaurant reviews, social sharing, favorites sync across devices, live camera translation, fully offline recognition. Google Lens remains the right tool for a traveler who only needs literal translation.
