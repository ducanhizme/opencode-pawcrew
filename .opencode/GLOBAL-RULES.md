# Superpowers Configuration

## Artifact Locations

Superpowers MUST use the following project paths instead of its defaults.

- Design specifications:
  `.ai/superpowers/docs/specs/YYYY-MM-DD-<topic>-design.md`

- Implementation plans:
  `.ai/superpowers/docs/plans/YYYY-MM-DD-<feature-name>.md`

Do NOT write Superpowers artifacts to:

- `docs/superpowers/specs/`
- `docs/superpowers/plans/`
- `docs/plans/`

## Documentation Ownership

All persistent project knowledge lives under `.ai/docs/`.

LoreCat is responsible for managing and validating documentation under
`.ai/docs/`.

Superpowers may create specifications and implementation plans under
the configured paths, but documentation synchronization and
implementation/spec drift analysis remain LoreCat responsibilities.
