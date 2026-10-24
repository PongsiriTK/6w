# Legal, privacy and security: issues to investigate

Read this when rating Whether's legal-privacy-security sub-criterion, and whenever the product touches personal data, payments, health, minors, scraped content or a regulated industry. The forcing-question shape is adapted from the `gdpr-audit-prep` skill in alirezarezvani/claude-skills (MIT, credited in `THIRD_PARTY_NOTICES.md`). Everything here is an issue to investigate, with an owner and a date. 6W never states that a product is compliant, and neither does this file.

## How to record

Each item that applies becomes one `RISK-` (status `open`, severity by harm) or one `TASK-` (the investigation, with an owner and "before" a milestone). The Whether rationale lists them and says which jurisdictions were considered. A jurisdiction that was not considered is named as not considered.

A 4 on this sub-criterion means the issues are listed with owners and dates. It does not mean they are resolved.

## Personal data

Ask these in order. Stop asking when the answer is "no personal data at all", and record that as a claim to verify.

1. What personal data enters the product, including what users type, upload or photograph, and what the product infers? Photos of a menu can contain other diners. A support ticket contains the customer.
2. Where do users live? Residents of the EU, the UK, Brazil, California, Thailand and many other places have data-protection law that applies regardless of where the builder sits. Name the jurisdictions in scope and the ones not yet considered.
3. For each purpose, what is the lawful basis the builder will rely on? One basis per purpose. Consent needs a record and a way to withdraw. Legitimate interests need a written balancing note.
4. Does any data pass to a third party, including a model provider? Record the provider, the country, and whether a data-processing agreement exists. Say whether the provider trains on the data.
5. How long is data kept and how is it deleted on request? If photos or transcripts are processed and discarded, say so as a `REQ-` with a test.
6. Is any of it special-category data: health, biometrics, religion, sexual orientation, ethnicity, finances, minors? Each needs its own basis and usually a specialist review `TASK-`.
7. Is the processing high risk (profiling, large scale, vulnerable people, new technology)? A documented impact assessment may be required before launch. Record it as a `TASK-` with a date.
8. What happens on a breach? Who notices, who is told, within what time? A `REQ-` for logging and a `TASK-` for the notification plan.

## Information the product gives people

If the product tells people something they act on about health, money, safety, law or food, it carries liability whatever the disclaimer says. Record:

- The framing in the product: informational, never a clearance or a guarantee. A `REQ-` with the exact wording.
- The confirm-elsewhere step the product offers. In MenuLens, the question card for staff.
- The jurisdictions whose consumer-protection or professional-advice rules apply. A `TASK-` to check them.

## Terms of others

- Model and API providers: usage policies, data retention, whether outputs may be stored or resold. A `TASK-` to read them before the first external user, with the date read.
- Scraped or fetched content: the site's terms and robots rules. A `RISK-` until checked.
- App stores and platforms: review rules that can block the release. A `RISK-` with the When date it threatens.
- Open-source licenses of dependencies: a `TASK-` for the notices file.

## Security basics that become requirements

Authentication and session handling, secrets kept out of the client, rate limits per account, input validation on anything uploaded, encryption in transit and at rest where the host does not do it. Each one that applies is a `REQ-` with an acceptance test, not a sentence in a risk.

## When a specialist is needed

Health, finance, minors, biometrics, employment decisions, or any processing that could deny someone a service: record a `TASK-` to get a professional review before the first external user, and mark the related `RISK-` as critical until it is done. This file does not replace that review.
