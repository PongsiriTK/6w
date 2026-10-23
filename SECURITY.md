# Security policy

Report suspected vulnerabilities privately so they can be fixed before disclosure.

## Reporting

Use GitHub's private vulnerability reporting on this repository. If that option is unavailable, open an issue that says only "security report" and a maintainer will reply with a private channel.

Include, when you can:

- the affected version or commit
- the host agent and version (Claude Code, Codex, Cursor, Hermes)
- the component or file involved
- a minimal reproduction
- the impact and the conditions needed to reproduce it

## Scope

6W reads user-supplied documents and renders them into an HTML report. Reports about script execution from attachment content, unsafe URL schemes in the export, or secrets leaking into generated files are in scope. Reports about the host agent itself belong with that host's maintainers.
