# Host compatibility

A host appears as supported only after a recorded test. Fill a row by running the skill on the host, trying each capability, and recording the host version and date.

| Host | Version tested | Date | Install and activate | File read and write | Attachments | Script runtime | Save and resume | Browsing | archify | Export | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Claude Code | 2.1.282 | 2026-10-23 | untested (marketplace install and automatic activation not exercised) | pass | not exercised | pass (Node 24.18) | pass (`state.mjs` save, checkpoint, reload) | available, not exercised | installed at `~/.claude/skills/archify`, detected by `diagrams.mjs`, not run | pass (`export.mjs` full bundle) | partial: scripts and export verified in-session, install and activation untested |
| Codex CLI | not yet | | | | | | | | | | untested |
| Cursor | not yet | | | | | | | | | | untested |
| Hermes Agent | not yet | | | | | | | | | | untested |
| Generic Agent Skills runtime | not yet | | | | | | | | | | untested |

Result values: full (install, discovery, scoring, save and resume, export), partial (name what passed and what was not exercised), discovery-only, failed.

The Claude Code row was recorded by running the scripts inside a Claude Code session on macOS. The skill text was in context as repository files, not loaded through a marketplace install, so activation by description is unverified.

When a capability is missing, the skill follows the degradation table in `BLUEPRINT.md` section 13. Record which rows applied.
