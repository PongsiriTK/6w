# Plugin evals

Cases for `claude plugin eval`, which runs each prompt in a sandboxed Claude Code session with the plugin installed, grades the transcript, and by default also runs a no-plugin baseline so the delta shows what the skill adds.

```bash
claude plugin eval . --runs 1 --no-publish --trust-plugin --allow-tools Bash
```

Each case is a folder with `prompt.md` (frontmatter sets turns and allowed tools) and `graders/*.md`. Grading uses a model (haiku by default, three votes per grader), so verdicts vary between runs: in one session the same transcript failed a grader three to zero and then passed it three to zero on a re-run. Read a single run as a smoke signal, not a measurement, and look at the transcript in the HTML report before changing the skill. These cases check behavior the fixtures cannot: that the skill fires from plain language, that it stays quiet on unrelated work, and that finishing early produces an honest partial answer. A run costs real money; the default suite is three cases.

| Case | Checks |
| --- | --- |
| `triggers-on-idea` | A one-line product idea activates the skill, produces the scoreboard, invents nothing |
| `stays-quiet-on-code` | A plain coding question does not activate the skill |
| `finish-early` | "Finish now" yields a partial result that names what is unresolved, with no inflated score |
| `scores-with-script` | With a shell allowed and files forbidden, the agent pipes the draft state to `score.mjs -`, writes nothing, and asks at most two questions. Needs `--allow-tools Bash`. |

## What the runs on 2026-10-24 showed

- The skill fired on the one-line idea in every with-plugin run and in no baseline run, and it stayed quiet on the coding question in every run.
- The evidence grader failed both with-plugin runs under the default haiku judge and passed 3 to 0 under `--judge-model sonnet` on the same kind of transcript. Treat haiku failures on that grader as noise until a stronger judge agrees.
- The sonnet judge failed the caps-and-no-files grader for a real reason: the response asked a third question after its two numbered ones. The skill text now forbids that.
- One transcript showed a hand-computed score that disagreed with its own working. The skill now pipes the draft state to `score.mjs -` when it may not write files. The eval cases allow no shell tool, so in evals the agent still scores by hand and says so.
- `scores-with-script`, two runs with a sonnet judge and `--allow-tools Bash`: the agent called `score.mjs` through the shell in both runs (deterministic `tool_used` grader), created no file in either (deterministic `file_exists` grader), and asked at most two questions (6 of 6 judge votes). One judge failed the "not by hand" grader because the response mentioned members typing runs by hand into their spreadsheet; the response itself said the draft was "scored in memory and thrown away". That grader now judges only statements about the scores.
