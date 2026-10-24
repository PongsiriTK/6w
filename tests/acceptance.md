# Acceptance criteria and how each is checked

One row per criterion in BLUEPRINT.md section 17. A row points at a deterministic test, at a fixture, or at a dated manual record. A row with no check says so.

| Criterion | Check | Status (2026-10-24) |
| --- | --- | --- |
| Vague idea | Fixture `tests/fixtures/vague-idea`: every cap active, no persona, no evidence above user, export says which sections are empty. Live: the Claude Code activation record in `docs/compatibility.md` shows the same behavior on a one-sentence brief. | pass |
| Polished unsupported pitch | Fixture `polished-unsupported-pitch`: every rating's evidence is assumption or unknown, the deck is a partially-read source, a risk names the unsupported claims. | pass |
| User finishes immediately | Fixture `finish-immediately`: all six Ws LOCKED, scores unchanged from the vague state, six assumptions in the register, export marks empty sections. | pass |
| User overrides a score | Fixture `override-score`: What LOCKED at or below its cap with the user's words as the reason, an assumption for the undecided scope, no inflation. | pass |
| Target audience changes | Fixture `late-audience-change`: new proposed decision lists dependents in `affects`, the old decision is superseded and kept, Who drops below the gate. | pass |
| Impossible date and scope | Fixture `impossible-date`: When cap active, three alternatives recorded as open questions, bandwidth rating kept where the user's clarity put it. | pass |
| Buyer differs from user | Not covered by a fixture. The persona matrix defines the gatekeeper role and the handoff renders it, but no fixture exercises a buyer who is not the user. | not covered |
| No browsing | The MenuLens examples record `capabilities.browsing: false` and no external source other than user-pasted text. No test asserts behavior when browsing is absent. | partial |
| Missing parser | The pitch fixture records slides 9 to 12 as unreadable in the source's coverage and limitations. No test exercises an unreadable attachment end to end. | partial |
| Missing archify | `diagrams.test.mjs`: fallback used when no archify output exists; `export.test.mjs`: the manifest records `fallback`. | pass |
| Resume on another host | `state.test.mjs`: load, save, revision check, checkpoint, migrate. Cross-host resume was not run; the state file is plain JSON with stable IDs, which is what makes it possible. | partial |
| HTML offline | `render.test.mjs`: no external src, href, @import or font in the page. Manual: the demo opened from `file://` in headless Chrome with no network access needed. | pass |
| JavaScript disabled | `render.test.mjs`: every section and every record is in the DOM with the script removed. | pass |
| Unsafe source content | `render.test.mjs`: script-like strings render inert; `diagrams.test.mjs`: 23 sanitizer bypass vectors rejected; `export.test.mjs`: Markdown injection escaped. The page also carries a CSP that allows only the inline search script. | pass |
| Output consistency | `export.test.mjs`: HTML and every Markdown file carry one state hash, the manifest matches the files on disk, a hand-edited file is reported. | pass |
| Broken references | `validate.test.mjs`: a link to a missing ID is reported with its path, including the single `persona` field. | pass |
| Failed export | `export.test.mjs`: an invalid state is refused before any write; a failure during the final swap rolls back; a crash between swaps is recovered on the next run. | pass |
| Print and mobile | Manual, 2026-10-24: headless Chrome printed the demo to a 17-page PDF with no header or footer; pages were not inspected one by one. Phone width was checked by rendering the page in a 390-pixel iframe after wide tables were given their own scroll container. Keyboard: a visible focus style exists on every focusable element; tab order was not walked by hand. | partial |
| Cap arithmetic | `score.test.mjs`: a cap binds above the raw score and lifts when cleared; an unknown cap id neither changes the score nor shows as active. | pass |

## Evaluation beyond tests

Structured human review of question usefulness, assumption quality, persona relevance, unsupported claims and handoff usability has not been done. The six fixtures carry `notes.md` files written for that review. Pilot sessions with real users are the next step and are not something a script can replace.
