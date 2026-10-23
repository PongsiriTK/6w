# Contributing

Thanks for helping. This file explains what the repository accepts and how to check a change before you open a pull request.

## Before you start

Read [BLUEPRINT.md](BLUEPRINT.md). It records the decisions already made and the ones still open. A pull request that reverses a recorded decision needs to say why in its description.

## What belongs here

- Fixes and improvements to `skills/6w/SKILL.md` and its references.
- Rubric examples and evaluation fixtures.
- Host adapters, with a test recorded in `docs/compatibility.md`.
- Templates, renderer and validator code once the matching plan phase opens.
- Translations and accessibility improvements.

## What does not belong here

- Anything that weakens the line between an accepted decision and validated evidence.
- A dependency on a hosted service.
- Project-specific content. 6W must fit internal tools and community projects as well as startups.

## Check your change

```bash
npm test
```

The gate parses every manifest, checks that every path a manifest names exists, checks skill frontmatter, and resolves every relative Markdown link. Fix what it reports before opening the pull request.

## Pull requests

Fill in every section of the template. Say what problem you hit, what you changed, and how you verified it. If an agent produced the change, say which one and what you asked it to do.

## Versioning

One version string is shared across the files listed in `.version-bump.json`. Change them together.
