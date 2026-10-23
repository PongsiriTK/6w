# MenuLens: agent rules

<!-- 6W handoff. project menulens. blueprint 0.0.3. state sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.1. -->

Guardrails for the coding agent. Keep this file in context while implementing. Your project's root rules file may point here; 6W never writes that file itself.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.3 | `sha256:c1c84c716c1070c38594bd0e6f45c9fb40e4884a1fe98cc959fd263f7eabbc0d` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.1 |

## Locked decisions

- Mobile web app first, native deferred ([DEC-001](DECISIONS.md#dec-001))
- Beachhead is the allergy traveler, not all travelers ([DEC-002](DECISIONS.md#dec-002))
- No recommendations, reviews, sharing, favorites sync, live translation or offline recognition in v1 ([DEC-003](DECISIONS.md#dec-003))

## Form factor and integrations

- DEC-001: a mobile web app with camera access and add-to-home-screen. Rejected: native iOS and Android for v1 \(store review and two codebases in six weeks\), a Telegram bot \(no camera flow\), a desktop site \(wrong moment\).
- One vision model API behind a thin server. No restaurant data, maps or payment APIs in v1. Provider choice is open until EXP-002 measures accuracy and latency.

## Anti-scope. Do not build these in v1

Cut from v1 \(DEC-003\): dish recommendations and ranking, restaurant reviews, social sharing, favorites sync across devices, live camera translation, fully offline recognition. Google Lens remains the right tool for a traveler who only needs literal translation.

## Mandatory edge-case handling

- [EDGE-001](AUDIENCE.md#edge-001) Handwritten or chalkboard menu: Show a confidence state per card. Below the threshold, show the local-language question card only and say the menu could not be read.
- [EDGE-002](AUDIENCE.md#edge-002) No connectivity at the table: Keep the last 20 scanned menus and the question cards available offline. Compress images before upload so one bar is enough when there is signal.
- [EDGE-003](AUDIENCE.md#edge-003) Cross-contamination is invisible on a menu: Every card says that flags are a warning to confirm, not a clearance. The question card asks about preparation, not only ingredients.
- [EDGE-004](AUDIENCE.md#edge-004) Several severe allergies and low trust in any app: Profile supports multiple allergens. Cards show the ingredient that triggered the flag, so the user can judge it, not only a red icon.

## Working rules

- Build in the order of [DELIVERY.md](DELIVERY.md). Each task names how it is verified.
- Acceptance criteria in [REQUIREMENTS.md](REQUIREMENTS.md) define done.
- A contradiction between records is a question for the user, not a decision for you.
- Record consequential technical choices in [DECISIONS.md](DECISIONS.md) as proposed.
- Nothing here authorizes deploying, buying services, contacting people or publishing.
