# How to port 6W to a new host

6W is one skill tree. A host gets a manifest that points at it, and nothing else changes.

## Steps

1. Read the host's plugin or skill documentation and find three facts: where it discovers `SKILL.md` files, what manifest file it reads, and how it exposes commands if at all.
2. Add a manifest directory at the repository root named after the host, following the existing ones (`.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`, `.hermes-plugin/`). Point its skills field at `./skills/`.
3. Add the manifest's version field to `.version-bump.json`.
4. Add an install command to `README.md` marked untested.
5. Run the skill on the host. Try each column of `docs/compatibility.md`. Record the host version, the date and the result.
6. Run `npm test`.

## Rules

- Do not edit `skills/6w/SKILL.md` to fit a host. If the skill names an action the host cannot perform, add a short mapping note in the manifest directory and link it from the compatibility row.
- Do not claim a result you did not observe.
