## Decisions made

- Use adaptation rather than a verbatim fork of AI Hero skills; the upstream MIT license permits copying with attribution, but PawCrew-specific boundaries require original procedures.
- Deliver the program in independently approved cohorts; Cohort 1 covers collaboration procedures.

## External sources consulted

- AI Hero catalog and official `mattpocock/skills` repository: canonical skills, aliases, procedures, and MIT license.

## Files touched

- `.ai/superpowers/plans/2026-08-24-ai-hero-principles-adoption.md`: expanded the approved program and recorded Cohort 1.
- `.ai/superpowers/goals/2026-08-24-adopt-ai-hero-capabilities.md`: recorded cross-session objective and current state.
- `.ai/superpowers/docs/specs/2026-08-24-ai-hero-collaboration-foundation-design.md`: proposed Cohort 1 design.

## Cohort 2 Phase 1 execution

- User approved the foundation design and inline execution on 2026-08-24.
- Added the `prototype` and `domain-modeling` skill procedures with their specified disposal and LoreCat boundaries.
- Added only narrow triggers to PawBuilder, PawPixel, and PatchPaw; LetMeowCook and commands were not changed.
- Installed the new skills globally with `./install.sh`; OpenCode restart is required to load the updated configuration.
- JudgeWhiskers reviewed the scoped implementation as `APPROVED_WITH_NITS`; all reported nits were addressed before final validation.

## Cohort 2 Phase 2 execution

- User approved a read-only consumer design for `wayfinder` and `triage`.
- Added both procedures without commands, state storage, record mutation, backlog ranking, or ownership changes.
- Added narrow PawBuilder and PatchPaw triggers; LetMeowCook and commands remain unchanged.
- JudgeWhiskers reviewed the consumer scope as `APPROVED_WITH_NITS`; the mutable-status inference boundary was added to `triage` before final validation.

## Cohort 2 Phase 3 execution

- User approved separate read-only skills for architecture mapping and improvement reporting.
- Added `codebase-design` and `improve-codebase-architecture` with no-write, no-authorization, and owner-composition boundaries.
- JudgeWhiskers returned `APPROVED_WITH_NITS`; the ownership-composition findings were addressed before final validation.
