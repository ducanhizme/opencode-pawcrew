# OpenWiki Instructions for PawCrew

This project uses OpenCode PawCrew. The canonical project-knowledge corpus lives under `.ai/docs/`.

When OpenWiki generates or updates documentation, merge the output into `.ai/docs/` rather than keeping it under `openwiki/`. Preserve the existing OKF frontmatter and the `x_wikiguy` block that PawCrew uses for freshness/drift detection.

## Scope

- Focus on specifications, architecture overviews, decision records, workflows, and reference docs.
- Do not duplicate README content.
- Keep each concept in its own Markdown file with YAML frontmatter.
- Use relative internal links between docs.

## Conventions

- Kinds: Specification | Architecture | Decision | Workflow | Reference.
- Authority: normative for specs/ADRs/contracts; descriptive for overviews/workflows.
- When updating a document, refresh `generated: { by, date }` and keep `x_wikiguy` intact.
