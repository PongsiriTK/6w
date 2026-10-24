# MenuLens: architecture

<!-- 6W handoff. project menulens. blueprint 0.0.3. state sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.2. -->

Form factor, boundaries, integrations and diagram descriptions. Designs here are proposed until implemented.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.0.3 | `sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.2 |

## Form factor

DEC-001: a mobile web app with camera access and add-to-home-screen. Rejected: native iOS and Android for v1 \(store review and two codebases in six weeks\), a Telegram bot \(no camera flow\), a desktop site \(wrong moment\).

## Workflow fit and constraints

The traveler already has the phone out to photograph the menu. A link on the home screen that opens the camera matches that moment with no store download on hotel Wi-Fi.

Restaurants abroad mean roaming data and basements with one bar of signal. Images are compressed on the device before upload, results are cached, and the app degrades to the cached menus when offline \(EDGE-002\). Large text and labeled controls for one-handed use at a table.

## Integration boundary

One vision model API behind a thin server. No restaurant data, maps or payment APIs in v1. Provider choice is open until EXP-002 measures accuracy and latency.

## Technical bottlenecks

Scan latency of 6 to 10 seconds at a table is tolerable once, painful three times. Handwritten and chalkboard menus fail often \(EDGE-001\). Provider rate limits at launch are untested.

## Diagrams

The rendered diagrams are embedded in the HTML blueprint. Their text descriptions are here so you do not need to parse HTML.

- workflow (fallback): Pitch flow: Problem: Allergy travelers cannot tell what is safe to order from a menu they cannot read. Trigger: Booking a trip to a non-Latin-script country. Core loop: Photo of a menu to dish cards with allergen flags for the user's profile, plus a local-language question card. Value: Hypothesis: a one-trip pass at 4.99 USD or 19.99 USD a year..
- architecture (fallback): MenuLens sits between Allergy traveler and vision model API, thin server.
- sequence (fallback): Sequence between Allergy traveler, MenuLens, vision model API: Allergy traveler to MenuLens: Trigger: Booking a trip to a non-Latin-script country; MenuLens to vision model API: Photo of a menu to dish cards with allergen flags for the...; vision model API to MenuLens: Result; MenuLens to Allergy traveler: Value delivered. Branches: EDGE-001 Handwritten or chalkboard menu; EDGE-002 No connectivity at the table; EDGE-003 Cross-contamination is invisible on a menu.
- erd (none): No data entities are recorded in state. The v1 schema is an implementation task \(see DELIVERY.md\), not a planning decision.

## Data model

No data entities are recorded in state. The v1 schema is an implementation task \(see DELIVERY.md\), not a planning decision.
