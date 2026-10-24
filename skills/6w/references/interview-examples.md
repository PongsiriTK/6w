# Interview examples

One weak question and one strong question per sub-criterion. A strong question names why it matters when that is not obvious, offers three concrete options built from this project's context, and leaves room for a custom answer. The options below are illustrations; build real ones from state.

The shape of every question:

```text
<why this matters, one sentence when needed>
<the question>
1. <option built from context>
2. <option built from context>
3. <option built from context>
4. Custom answer
```

## Why

**Pain severity.** Weak: "How painful is this problem?" Strong: "How often does this bite in a normal week, and what does one occurrence cost you? 1. Daily, and it costs under an hour. 2. Weekly, and it costs a half day or a missed deadline. 3. Rarely, but when it happens it costs money or a customer. 4. Custom."

**Broken workaround.** Weak: "Are there competitors?" Strong: "What do you and the people you know do about this today, and where does that fail? 1. A spreadsheet or document, and it breaks when two people edit it. 2. A general tool such as a translator or a search engine, and it answers the wrong question. 3. Nothing, people live with it. 4. Custom."

**Value capture.** Weak: "How will you make money?" Strong: "If this works, what unit does the value scale with, and who pays for it? 1. The user pays per period for unlimited use. 2. The user or team pays per unit of work done. 3. Nobody pays, the value is time saved inside the organization, measured in hours. 4. Custom."

**Success metric.** Weak: "What does success look like?" Strong: "What single number after the first month would make you continue, and what number would make you stop? 1. Share of sessions that end with the core action completed. 2. Returning users after the first use. 3. Hours saved, reported by the team. 4. Custom."

## Who

**Beachhead persona.** Weak: "Who is the target audience?" Strong: "Of everyone with this problem, who feels it so sharply they would try a rough first version this month? 1. <the narrowest segment the context suggests>. 2. <a broader adjacent segment>. 3. <a segment the user mentioned in passing>. 4. Custom."

**Switching trigger and objections.** Weak: "Why would people use this?" Strong: "What event makes this person go looking for a solution, and what would stop them trying yours once they find it? 1. A deadline or a trip or a new role, and they hesitate over trust. 2. A failure of their current tool, and they hesitate over cost. 3. A recommendation from a peer, and they hesitate over setup time. 4. Custom."

**Distribution.** Weak: "How will you market it?" Strong: "Name a place where fifty of these people already talk to each other, and say whether you can post there yourself. 1. A community you belong to. 2. A newsletter or creator who covers this problem. 3. A colleague network or a professional body. 4. Custom."

**Buyer, user and anti-persona.** Weak: "Who is this not for?" Strong: "Who pays, who uses, and who would judge the product by features you are not building? 1. Same person pays and uses; exclude people who want the deluxe version. 2. A manager pays, the team uses; exclude solo users. 3. The organization pays, everyone uses; exclude anyone outside it. 4. Custom."

## What

**Core loop.** Weak: "What are the features?" Strong: "Describe one use from the moment the person opens it to the moment they got what they came for, in one sentence. 1. <input> becomes <output> and the person does <action>. 2. The person asks <question> and gets <answer> they act on. 3. The person records <thing> and later retrieves <thing> when they need it. 4. Custom."

**v1 must-haves.** Weak: "Which features are important?" Strong: "If the first version had only three things, which three let the core loop happen at all? 1. <the three the loop needs>. 2. Those three plus <one the user keeps mentioning>. 3. Only <one thing> and manual steps for the rest. 4. Custom."

**Explicit anti-scope.** Weak: "Anything you don't want?" Strong: "Which of the features you have listed would you cut to ship a month earlier, knowing they can come back later? 1. Cut <features that do not reduce the core risk>. 2. Cut everything except the core loop. 3. Cut <the hardest feature> and do it by hand for the first users. 4. Custom."

**Day-one inputs.** Weak: "What data do you need?" Strong: "What must the person bring or connect before they get any value, and what happens if they do not have it? 1. One file or photo and nothing else. 2. An account connection, with a sample mode if they refuse. 3. A profile they fill once. 4. Custom."

## Which

**Primary form factor.** Weak: "App or website?" Strong: "Where is this person, and what is in their hand, at the moment the problem bites? 1. On a phone, standing up, so a web page they can open from the camera. 2. At a desk inside another tool, so an extension or an integration. 3. In a terminal, so a CLI. 4. Custom."

**Workflow fit.** Weak: "Will it fit their workflow?" Strong: "What does the person already do right before and right after the moment your product appears, and does your form factor sit between those without a detour? 1. Yes, it replaces a step they already take. 2. It adds one step they will accept because <reason>. 3. It needs a habit change, so it needs a trigger. 4. Custom."

**Device and environment constraints.** Weak: "Any technical constraints?" Strong: "Think about the worst place this gets used. What is missing there: signal, battery, a big screen, two hands, quiet? 1. No signal, so results must be cached. 2. One hand and a small screen, so large targets and few steps. 3. A locked-down corporate device, so no installs. 4. Custom."

**Integration boundary.** Weak: "What integrations do you need?" Strong: "Which external systems must this talk to for the core loop, and which can wait? 1. One model or data API now, nothing else. 2. The system of record the person already uses, read-only at first. 3. Nothing external in v1. 4. Custom."

## Whether

**Unit economics.** Weak: "What are your costs?" Strong: "For one active user doing the core loop a normal number of times a month, what do you pay in model, API and infrastructure, and what do they pay you? 1. Under a tenth of the price, fine. 2. Around a third of the price, watch it. 3. Unknown, so we estimate it now from the provider's listed pricing with a date. 4. Custom."

**Technical bottlenecks.** Weak: "Any technical risks?" Strong: "What is the slowest or least reliable step in the core loop, and what does the person experience when it fails? 1. A model call that takes seconds, with a progress state. 2. A third-party rate limit, with a queue. 3. Input quality, with a confidence signal and a retake prompt. 4. Custom."

**Legal, privacy and security.** Weak: "Is this compliant?" Strong: "What personal or sensitive data passes through, where do the users live, and who checks the rules before launch? 1. Personal data of EU or UK residents, so an item to investigate before the first external user. 2. Health, financial or minors' data, so a specialist review task. 3. No personal data stored, so a statement to verify. 4. Custom."

**Persona and UX edge cases.** Weak: "Any edge cases?" Strong: "Picture your beachhead persona on their worst day with this. What do they do that breaks it? 1. Bad input (blurry, partial, wrong format). 2. No connectivity or an expired session mid-task. 3. Two needs at once that the product treats as one. 4. Custom."

## When

**Builder bandwidth.** Weak: "How much time do you have?" Strong: "Hours per week you will actually spend on this for the next two months, counting the weeks you will miss, and what else competes for them? 1. Under 10. 2. 10 to 20. 3. Full time. 4. Custom."

**Proof of concept.** Weak: "What's the first milestone?" Strong: "What could you build in two days that would tell you whether the core loop works at all, with real inputs? 1. A script with hardcoded settings on ten real inputs. 2. A single screen that does the core action and nothing else. 3. A manual run of the loop with a spreadsheet, no code. 4. Custom."

**MVP date.** Weak: "When do you want to launch?" Strong: "What date matters and why, how much buffer is in it, and what will be true on that date that means done? 1. A fixed external date (a trip, a demo, a season) with one week of buffer. 2. A self-imposed date that can move. 3. No date, so we set one from capacity. 4. Custom."

**Cut line.** Weak: "What if you run late?" Strong: "If you are a week behind at the halfway point, what goes first, and what must never go? 1. Drop <the nice-to-have>, keep <the core promise>. 2. Narrow the audience instead of the features. 3. Move the date. 4. Custom."
