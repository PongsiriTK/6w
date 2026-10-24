# MenuLens: product

<!-- 6W handoff. project menulens. blueprint 0.1.0. state sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440. generated 2026-10-23T16:00:00+07:00. schema 0.1. rubric 0.2. -->

The six decisions, the problem, the value, the scope and the anti-scope.

| Project | Blueprint | State hash | Generated | Schema | Rubric |
| --- | --- | --- | --- | --- | --- |
| `menulens` | 0.1.0 | `sha256:56da7ccf225e6a14c2b2305b25a6b97fb86fbf9c6d77f68e020f17645488b440` | 2026-10-23T16:00:00+07:00 | 0.1 | 0.2 |

## WHY. Allergy travelers cannot tell what is safe to order from a menu they cannot read

Readiness 94/100, OK. Evidence: assumption.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| pain-severity | 4/4 | user | For a traveler with celiac disease or a nut allergy, every restaurant meal abroad is a risk decision. The user eats out 2 to 3 times a day on a trip and reports skipping meals or eating only packaged food on past trips. One bad dish costs a day of the trip. |
| broken-workaround | 4/4 | source | Google Lens translates words literally: it renders a dish name but not what is in it. Printed allergy cards get a nod from staff who do not read them carefully. Asking the waiter fails across the language barrier. Three linked r/Celiac threads describe the same pattern. |
| value-capture | 3/4 | assumption | Hypothesis: a one-trip pass at 4.99 USD or 19.99 USD a year. The allergy traveler already spends on cards and apps. Cost per trip estimated at roughly 0.14 USD in model calls \(see ASM-002\). Willingness to pay is untested. |
| success-metric | 4/4 | user | Success: at least 60 percent of scans end with the user tapping "I ordered this" within the session. Kill signal: under 20 percent after the first 200 users, or more than two reports of a flagged dish that was unsafe. |


## WHO. English-speaking travelers with celiac disease or a severe food allergy, 2 or more trips a year to a country whose script they cannot read

Readiness 94/100, OK. Evidence: user.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| beachhead-persona | 4/4 | user | PERSONA-001: an English-speaking traveler with celiac disease or a severe allergy, planning a trip to Japan, Thailand or Italy, who already carries a printed allergy card. The product appears when they sit down and open the menu. |
| switching-trigger-and-objections | 4/4 | source | Trigger: booking a trip to a non-Latin-script country. Objections: can I trust an allergen flag with my health, what does it cost in roaming data, and "I already use Google Translate". |
| distribution | 3/4 | user | r/Celiac, r/JapanTravel, two Facebook celiac travel groups and three allergy travel bloggers. The builder has celiac disease and posts in two of these communities, so the first fifty are reachable. No channel has been tested. |
| buyer-user-anti-persona | 4/4 | user | Buyer and user are the same person. Anti-persona PERSONA-002: foodies without restrictions who enjoy ordering blind, and business travelers eating at hotels with English menus. Both excluded from v1 messaging and features. |


## WHAT. Photo of a menu to dish cards with allergen flags for the user's profile, plus a local-language question card

Readiness 95/100, OK. Evidence: user.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| core-loop | 4/4 | user | MenuLens turns a photo of a menu into dish cards that say what each dish is, its main ingredients, and which of the user's allergens it may contain, then gives a phrase in the local language to confirm with staff. One photo, one answer, one question to ask. |
| v1-must-haves | 4/4 | user | Four features with acceptance criteria: allergy profile setup \(REQ-001\), menu photo to dish cards with flags \(REQ-002\), local-language confirmation card \(REQ-003\), cache of the last 20 scanned menus for offline re-reading \(REQ-004\). |
| explicit-anti-scope | 4/4 | user | Cut from v1 \(DEC-003\): dish recommendations and ranking, restaurant reviews, social sharing, favorites sync across devices, live camera translation, fully offline recognition. Google Lens remains the right tool for a traveler who only needs literal translation. |
| day-one-inputs | 3/4 | user | The user brings an allergy profile, a destination language and a camera. Business rule: a flag is a warning to confirm, never a clearance. Profile edge cases \(multiple severe allergies, cross-contamination\) are recorded as EDGE-003 and EDGE-004. |


## WHICH. Mobile web app installed to the home screen; native deferred until retention is shown

Readiness 95/100, OK. Evidence: assumption.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| primary-form-factor | 4/4 | user | DEC-001: a mobile web app with camera access and add-to-home-screen. Rejected: native iOS and Android for v1 \(store review and two codebases in six weeks\), a Telegram bot \(no camera flow\), a desktop site \(wrong moment\). |
| workflow-fit | 4/4 | assumption | The traveler already has the phone out to photograph the menu. A link on the home screen that opens the camera matches that moment with no store download on hotel Wi-Fi. |
| device-and-environment-constraints | 4/4 | user | Restaurants abroad mean roaming data and basements with one bar of signal. Images are compressed on the device before upload, results are cached, and the app degrades to the cached menus when offline \(EDGE-002\). Large text and labeled controls for one-handed use at a table. |
| integration-boundary | 3/4 | assumption | One vision model API behind a thin server. No restaurant data, maps or payment APIs in v1. Provider choice is open until EXP-002 measures accuracy and latency. |


## WHETHER. Provisional 0.012 USD per scan against a 4.99 USD trip pass; allergen liability handled as a confirm-with-staff flow, not a clearance

Readiness 94/100, OK. Evidence: assumption.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| unit-economics | 4/4 | assumption | ASM-002: one scan is one image plus about 1,500 output tokens, roughly 0.012 USD at the provider's listed vision pricing as of 2026-10 \(needs re-verification before launch\). At 12 scans a trip that is about 0.14 USD against a 4.99 USD pass. Monthly model cost at 100, 1,000 and 10,000 active users with one trip each: about 14, 140 and 1,400 USD, before hosting. |
| technical-bottlenecks | 3/4 | assumption | Scan latency of 6 to 10 seconds at a table is tolerable once, painful three times. Handwritten and chalkboard menus fail often \(EDGE-001\). Provider rate limits at launch are untested. |
| legal-privacy-security | 4/4 | user | RISK-001: allergen flags are informational, never a clearance. Every card carries "confirm with staff" and the local-language question. Photos are processed and not stored. Issues to investigate before launch: consumer-protection wording for health information in the user's jurisdiction \(Australia\) and the EU for European users, and the model provider's terms on food images. Owner: the builder, before the first fifty users. |
| persona-ux-edge-cases | 4/4 | user | EDGE-001 handwritten menu, EDGE-002 no connectivity, EDGE-003 cross-contamination invisible on a menu, EDGE-004 user with several severe allergies who distrusts any flag. Each has a product response and a remaining exposure. |


## WHEN. 15 hours a week for six weeks: 48-hour proof of concept, MVP in five weeks, one week of buffer before the trip

Readiness 94/100, OK. Evidence: user.

| Sub-criterion | Rating | Evidence | Rationale |
| --- | --- | --- | --- |
| builder-bandwidth | 4/4 | user | Solo builder, about 15 hours a week \(weeknights and one weekend day\) for six weeks until departure. Comfortable with web frontends and a small Node server. No budget beyond model calls and a 20 USD hosting plan. |
| proof-of-concept | 4/4 | user | TASK-001: within 48 hours of effort, photograph ten real menus from the user's last trip and get dish cards with a hardcoded allergy profile. Observe accuracy against a native speaker's reading \(EXP-002\). |
| mvp-date | 3/4 | user | MVP by the end of week five, one week of buffer before departure. Done means REQ-001 to REQ-004 pass their acceptance criteria on the builder's phone and two allergy travelers from r/Celiac have used it on a real menu photo. |
| cut-line | 4/4 | user | Behind by the end of week three: drop the offline cache \(REQ-004\) first, then the confirmation card \(REQ-003\). Never drop the allergen flags. Timing matters because the trip is the first real test and the next one is months away. |


## Anti-scope

Cut from v1 \(DEC-003\): dish recommendations and ranking, restaurant reviews, social sharing, favorites sync across devices, live camera translation, fully offline recognition. Google Lens remains the right tool for a traveler who only needs literal translation.

## Success metric

Success: at least 60 percent of scans end with the user tapping "I ordered this" within the session. Kill signal: under 20 percent after the first 200 users, or more than two reports of a flagged dish that was unsafe.
