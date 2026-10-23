# MenuLens demo

Rendered blueprint of the complete state: https://pongsiritk.github.io/6w/demo/menulens/ (source file `../docs/demo/menulens/index.html`).

A worked 6W session on one idea, kept as two state files so the scripts have something real to score and validate. The idea: photograph a restaurant menu abroad and learn what each dish is and whether it is safe to order.

The session is synthetic. The ratings are the author's judgments, written to exercise every hard cap and then clear them. The scripts make the arithmetic deterministic and checkable. They do not make the judgments. Treat the numbers as a demonstration of the rubric, not as evidence about the product.

## Before: the opening message

Input, in full: "I want an app where you photograph a menu in a foreign country and it tells you what each dish is, flags allergens, and suggests what to order. Also save favorites, share with friends, work offline, show restaurant reviews. I want it before my trip in six weeks."

```text
6W PRODUCT FOUNDATION                      gate 90   stage: build MVP   mode: deep
overall 24/100  [#####...............]

  W        score  status  evidence     note
  WHY       28    CAP     unknown      Travelers cannot read foreign menus and order badly
  WHO       14    CAP     unknown      "All travelers" with no segment named
  WHAT      39    CAP     unknown      Photo of a menu to explained dishes, plus six more feat...
  WHICH     33    CAP     unknown      "An app", assumed native mobile
  WHETHER   18    CAP     unknown      Paid vision model with no cost estimate; allergen advic...
  WHEN      14    CAP     unknown      Wants it before a trip in six weeks; capacity unknown

Focus: WHY, 28/100. Needs +62.
```

Every cap is active. The Why cap because no workaround was named. The Who cap because the audience is "all travelers". The What cap because seven features and no anti-scope. The Which cap because "an app" meant a native download with no reason over the web. The Whether cap because every scan is a paid vision call and nobody has priced one. The When cap because seven features on a native app do not fit six weeks of unknown capacity.

## After: eleven turns later

```text
6W PRODUCT FOUNDATION                      gate 90   stage: build MVP   mode: deep
overall 94/100  [###################.]

  W        score  status  evidence     note
  WHY       94    OK      assumption   Allergy travelers cannot tell what is safe to order fro...
  WHO       94    OK      user         English-speaking travelers with celiac disease or a sev...
  WHAT      95    OK      user         Photo of a menu to dish cards with allergen flags for t...
  WHICH     95    OK      assumption   Mobile web app installed to the home screen; native def...
  WHETHER   94    OK      assumption   Provisional 0.012 USD per scan against a 4.99 USD trip ...
  WHEN      94    OK      user         15 hours a week for six weeks: 48-hour proof of concept...

All six Ws are at the gate or locked by the user.
```

## Turn log

| Turn | W | What the agent asked | What the user decided | Cap cleared |
| ---: | --- | --- | --- | --- |
| 1 | Why | How often does the problem bite on a trip, and what does one bad dish cost you? | Two or three meals a day, skipped meals on past trips, one lost day | |
| 2 | Why | What do you and others do today when you cannot read a menu? | Google Lens gives literal words, not what is in a dish. Printed cards get a nod. Pasted three r/Celiac threads showing the same pattern. | why-no-workaround |
| 3 | Who | Which traveler feels this most sharply? Options: all travelers, allergy travelers, vegetarians abroad | Allergy travelers. The user has celiac disease. | who-everyone |
| 4 | Who | Where are the first fifty, and who is this not for? | r/Celiac, r/JapanTravel, two Facebook groups, three bloggers. Not for blind-ordering foodies or hotel business travelers. | |
| 5 | What | Which of the seven features can wait until after the trip? Options: cut three, cut five, cut all but the core | Keep profile, scan to flagged cards, confirmation card, offline cache. Cut recommendations, reviews, sharing, favorites sync, live translation, offline recognition. | what-unbounded-scope |
| 6 | Which | Why native rather than a web page opened from the camera? Options: native, web app, Telegram bot | Web app with add-to-home-screen. Native deferred until retention is shown. | which-native-without-reason |
| 7 | Which | What breaks in a restaurant basement on roaming data? | Compress on device, cache results, degrade to cached menus offline, large text for one hand | |
| 8 | Whether | What does one scan cost at the provider's listed pricing, and how many scans per trip? | About 0.012 USD a scan, about 12 scans a trip, so about 0.14 USD against a 4.99 USD pass. Provisional, dated, to re-verify. | whether-no-unit-cost |
| 9 | Whether | What happens when a flagged-safe dish is not safe? | Flags are warnings, never clearances. Every card carries a confirm-with-staff question about preparation. Four edge cases recorded. | |
| 10 | When | How many hours a week until the trip, and what goes first if you fall behind? | 15 hours a week for six weeks. 48-hour proof of concept. MVP by week five. Drop the offline cache first, never the flags. | when-scope-exceeds-capacity |
| 11 | Why | How will you know v1 worked, and what would make you stop? | 60 percent of scans end in "I ordered this". Under 20 percent after 200 users, or two unsafe flags, means stop. Pricing recorded as an assumption. | |

After turn 11 the session enters assumption lock. Two assumptions (pricing, cost per scan) and three risks (liability, invented ingredients, pricing changes) are in the register with their experiments.

## What changed in the state

| Measure | Before | After |
| --- | ---: | ---: |
| Overall | 24 | 94 |
| Ws at the gate | 0 | 6 |
| Active caps | 6 | 0 |
| Records | 1 | 27 |
| Open questions | 7 | 0 |
| Ratings with evidence "unknown" | 13 | 0 |

The refined state still carries evidence labeled "assumption" on value capture, workflow fit, integration boundary, unit economics and technical bottlenecks. The scoreboard shows "assumption" as the weakest evidence for Why, Which and Whether. A 94 means the decisions are clear and consistent enough to build an MVP. It does not mean anyone has paid for a trip pass.

## Reproduce

```bash
node skills/6w/scripts/score.mjs examples/menulens-partial/state.json
node skills/6w/scripts/score.mjs examples/menulens-complete/state.json
node skills/6w/scripts/validate.mjs examples/menulens-complete/state.json
node skills/6w/scripts/render.mjs examples/menulens-complete/state.json /tmp/6w-blueprint.html
```

`validate.mjs` on the complete state takes 0.03 seconds wall clock on an Apple Silicon laptop (one run, Node 24). Change any rating in a state file and run `score.mjs --write` to see the arithmetic move. Add a link to an ID that does not exist and `validate.mjs` names the path.

## What this demo does not show

The Markdown handoff was not exported, because that renderer does not exist yet. The HTML page has no architecture diagrams, because the diagram adapter and its fallback are a later phase; the page says so in its Technical section. No real user took part. The accuracy, latency and cost figures are the hypotheses a real session would record, not measurements.
