# PawCrew Global Rules

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

When a Superpowers skill says to save plans/specs/design docs under
`docs/superpowers/`, save them under `.ai/superpowers/` instead (same
subpaths). The SDD workspace `.superpowers/sdd/` is plugin-scripted and
cannot be redirected.

## Documentation Ownership

All persistent project knowledge lives under `.ai/docs/`.

LoreCat is responsible for managing and validating documentation under
`.ai/docs/`.

Superpowers may create specifications and implementation plans under
the configured paths, but documentation synchronization and
implementation/spec drift analysis remain LoreCat responsibilities.

## Verification Discipline

Verification defines done. Report only evidence gathered this turn:
"should pass", "should work", "should be fine" all mean unverified — never
report them as verified.

- Fix failures caused by your change.
- Name unrelated pre-existing failures without widening scope.
- Delegated work is not verified until you inspect the touched files and
  rerun the checks yourself.
