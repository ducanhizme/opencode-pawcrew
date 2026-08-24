---
type: Plan
title: Adapt AI Hero Cohort 2 capabilities
description: Add architecture and planning procedures after resolving Cohort 1 knowledge-validation prerequisites.
status: planned
agent: pawbuilder
generated:
  by: lorecat
  at: 2026-08-24T00:00:00Z
x_wikiguy:
  knowledge_kind: Plan
  authority: descriptive
  verified_commit: b03bb67f05e9b1cff4363f0842caad5969d13616
  covers:
    - .opencode/skills/
    - .ai/superpowers/
    - .ai/docs/
---

## Goal

Add PawCrew-native adaptations of `prototype`, `domain-modeling`, `wayfinder`, `triage`, `codebase-design`, and `improve-codebase-architecture` without creating a parallel tracker, knowledge store, or approval bypass.

## Success criteria (observable)

- [ ] Cohort 1 is committed and `wiki_validate` passes before Cohort 2 writes begin.
- [ ] Each new skill has explicit trigger, procedure, boundary, and artifact rules.
- [ ] `wayfinder` and `triage` are read-only views over existing PDCA records.
- [ ] `domain-modeling` and `codebase-design` route durable knowledge through LoreCat.
- [ ] Architecture improvement reports are analysis-only and cannot authorize edits.
- [ ] Each approved phase passes Doctor, corpus validation, and JudgeWhiskers review.

## Approved flow

Three independently approved phases: foundation, consumers, capstone.

## Estimated effort

Large (3+d)

## Known risks

- Cohort 1 freshness and corpus validation are incomplete → resolve before starting.
- Triage could become a parallel ticket system → limit it to read-only views.
- Domain procedures could bypass LoreCat → produce drafts and route accepted knowledge through sanctioned tools.

## Out of scope

- External issue-tracker integration.
- New primary agents or routing commands.
- Material refactors based only on an architecture report.
