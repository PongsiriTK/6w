# Host compatibility

A host appears as supported only after a recorded test. Fill a row by running the skill on the host, trying each capability, and recording the host version and date.

| Host | Version tested | Date | Install and activate | File read and write | Attachments | Script runtime | Save and resume | Browsing | archify | Export | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Code | 2.1.282 | 2026-10-24 | pass: `claude plugin marketplace add PongsiriTK/6w` then `claude plugin install 6w@6w` installed 0.0.4 from GitHub; `claude plugin details 6w@6w` lists the one skill at about 190 always-on tokens. Activation: pass, see the record below. | pass | not exercised | pass (Node 24.18) | pass (`state.mjs` save, checkpoint, reload) | available, not exercised | installed at `~/.claude/skills/archify`, detected by `diagrams.mjs`, not run | pass (`export.mjs` full bundle) | full for discovery, scoring, save and resume, export and install; attachments and archify not exercised |
| Codex CLI | CLI present, version not recorded | | not exercised. `npx skills add PongsiriTK/6w --list` discovers the skill, so `--agent codex` should install it; nobody has run it yet. | | | | | | | | untested |
| Cursor | CLI present, version not recorded | 2026-10-24 | install only: `npx skills add PongsiriTK/6w --global --agent cursor` copied the skill to `~/.agents/skills/6w`, the shared folder the Skills CLI uses for Cursor. Activation not exercised. | | | | | | | | install-only |
| Hermes Agent | not yet | | | | | | | | | | untested |
| Generic Agent Skills runtime | not yet | | | | | | | | | | untested |

Result values: full (install, discovery, scoring, save and resume, export), partial (name what passed and what was not exercised), discovery-only, failed.

## Activation record, Claude Code, 2026-10-24

Setup: plugin `6w@6w` 0.0.4 installed from the GitHub marketplace. A fresh empty git repository in a temporary directory. Headless run: `claude -p "<prompt>" --max-turns 4 --allowedTools "Skill"`, default model (claude-fable-5-1), no project instructions.

Prompt: "I want to build a Slack bot that summarizes incoming support tickets for a 10-person SaaS team and suggests who should take each one. Help me think it through before I code anything. Show me the baseline scoreboard only; do not create or write any files."

Observed: the session invoked the `6w:6w` skill twice without being asked for it by name, printed the scoreboard in the documented shape, marked three caps active, showed its ratings and arithmetic by hand and said the score script was not run because no state file existed, named Whether at zero as the blocker, and wrote no file. Four turns, about 1.18 USD. All six raw scores and the overall were checked against the formula afterwards and match.

Not observed: a full walkthrough, save and resume through the plugin, or an export from the plugin path. Those were verified from the repository checkout, not from the installed copy.

When a capability is missing, the skill follows the degradation table in `BLUEPRINT.md` section 13. Record which rows applied.
