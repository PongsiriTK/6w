# Pricing models and the value metric

Read this when the project is commercial, the session is in deep mode or the user asks about pricing, and Why's value-capture rating is below 3. Skip it for internal tools and community projects unless the user asks: blueprint section 7.4 says never to force revenue projections on a project that does not need them.

Adapted from the `pricing-strategy` skill in Pawel Huryn's pm-skills repository (MIT, see `THIRD_PARTY_NOTICES.md`). The steps are his. The rules about evidence, records and what not to invent are 6W's.

## What this step produces

The goal is a price hypothesis the user can test, not a price. Record the result as:

- One `DEC-` with status `proposed`: the pricing model and the value metric, with the rejected models as alternatives.
- One `ASM-` per price point or tier price, status `untested`, with what happens if it is wrong.
- One `EXP-` per test from the experiments section, with measure, timebox and decision rule.
- A `RISK-` for each pricing risk the user accepts (underpricing against cost per active user, a value metric that punishes the user's best behavior, a free tier that never converts).
- Competitor prices only as `SRC-` records with origin `external`, an access date and a locator. A price from memory is not a source.

## Step 1. Start from value, not from a number

Pull these from state before asking anything. Ask only for what is missing.

- The core value proposition: Why summary and the value-capture rationale.
- The customer's alternative and what it costs them today: Why broken-workaround.
- The quantifiable outcome: time saved, revenue gained, cost removed, risk avoided. The Why success metric usually names it.
- Who pays and who approves: Who buyer-user-anti-persona. A buyer who is not the user changes the model.
- Cost per active user: Whether unit-economics. Price must clear it with room for support and failed payments.

If the quantifiable outcome is unknown, stop here and record that as the open question. A pricing model built on an unmeasured outcome is an assumption stacked on an assumption.

## Step 2. Choose the value metric first

The value metric is the unit the price scales with. Pick it before the model. A good metric grows when the customer gets more value, is easy for the customer to predict, and is cheap for the product to count.

| Metric | Fits when | Watch out |
| --- | --- | --- |
| Per seat | Value comes from people using it together | Punishes adoption inside a team; invites shared logins |
| Per unit of work (scan, document, run, message) | Each unit has a clear cost and a clear value | A metric that also drives cost needs a ceiling or a plan tier |
| Per outcome (booking, order, trip) | The customer thinks in that unit already | Needs a reliable way to count the outcome |
| Flat per period | Usage varies little between customers | Heavy users are subsidized by light ones |
| Per capacity (storage, projects, environments) | Capacity maps to how serious the customer is | Capacity ceilings feel arbitrary unless tied to value |

Write the chosen metric into the `DEC-` title, as in "Price per trip pass, not per scan".

## Step 3. Pick the model that fits the metric and the buyer

| Model | Fits when | Typical examples (for shape, not as evidence) |
| --- | --- | --- |
| Flat rate | Simple product, predictable cost, one segment | Basecamp |
| Per seat | Collaboration tools, team products | Slack, Figma |
| Usage based | Infrastructure, APIs, cost that scales with use | AWS, Twilio |
| Tiered | Distinct segments with distinct needs | Most SaaS: free, pro, team |
| Freemium | A free tier that spreads the product through network or viral effects | Spotify, Notion |
| Freemium plus usage | Platforms with a free floor and metered growth | Vercel, OpenAI API |
| Value based | High-impact enterprise tools sold with a sales conversation | Salesforce, Palantir |

Reject models explicitly and record why in the `DEC-` alternatives. A freemium tier for a product with no network effect is a cost with no distribution benefit. Usage pricing on a metric the customer cannot predict creates a bill-shock objection; expect it in Who's objections list.

## Step 4. Map competitor pricing only from sources

When browsing is available, record each competitor's tiers, prices and what each includes as `SRC-` records with the URL and the access date. Then place the product: premium, mid-market or budget, and name the gap it occupies. When browsing is not available, write the competitor set as an open question and do not fill in prices.

## Step 5. Design the structure

- Two to four tiers at most. Each tier must differ on the value metric or on a feature the segment needs, never on an arbitrary limit.
- Make the tier most customers should choose the obvious one: it anchors the others.
- An annual price below the monthly total is common. Treat any specific discount percentage as a provisional assumption until a test shows what converts.
- Check every tier against cost per active user from Whether. A tier that loses money per user needs a reason and a `RISK-`.

## Step 6. Estimate price sensitivity honestly

With survey data, use the Van Westendorp price sensitivity meter: the four questions (too cheap, cheap, expensive, too expensive) give an acceptable range. Record the survey as a `SRC-` with its sample size and date, and its limitations: a stated willingness to pay is not a purchase.

Without survey data, estimate from the alternative's cost and the quantifiable outcome, and label the estimate `assumption`. Do not invent a range.

## Step 7. Plan the experiments

Each experiment becomes an `EXP-` with a measure, a timebox and a decision rule.

- Landing page with the price shown: sign-ups or pre-orders at one or two price points.
- Founder-led sales conversations: ask for the order and record the objection when it is not placed.
- Cohort conversion by price point when a product already has traffic.
- A/B of tier names and bundles only after the metric and model are settled.

Numbers in a decision rule are the user's or labeled provisional.

## Step 8. Write the recommendation into state

Fill the `DEC-` rationale with this shape:

```text
Model: <model>. Value metric: <metric>.
Tiers: <name, price hypothesis, segment, what it includes> per tier.
Why this model over the alternatives: <one sentence per rejected model>.
Clears cost per active user by: <margin or the RISK- that says it does not>.
```

Then re-rate Why value-capture and Whether unit-economics. A 4 on value capture needs the value metric named, a price hypothesis with its cost side, and at least one `EXP-` that can falsify it.

## What not to do

- Do not run this step for an internal tool or a community project unless the user asks. Record organizational value or sustainability instead.
- Do not state a competitor's price without a dated source.
- Do not turn hypothetical pricing copy into a customer quote.
- Do not let the model drive the metric. Choose the metric from value, then the model.
