---
type: Plan
title: Adapt compatible AI Hero capabilities into PawCrew
description: Deliver a phased, license-aware adoption of AI Hero procedures without duplicating PawCrew or Superpowers controls.
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
    - .opencode/skills/clarification/SKILL.md
    - .opencode/agent/pawbuilder.md
    - .opencode/agent/patchpaw.md
    - .opencode/skills/retrospective/SKILL.md
    - .ai/docs/references/
---

## Goal

Create a phased adoption program that transfers the maximum useful AI Hero behavior into PawCrew as adapted skills, documentation, and integrations while preserving the existing authority, approval, PDCA, review, and knowledge-governance model.

## Success criteria (observable)

- [ ] Every one of AI Hero's 25 canonical skills has an evidence-backed disposition: adopt, adapt, or retain an existing PawCrew/Superpowers equivalent.
- [ ] The approved first cohort of non-duplicative adaptations has explicit triggers, boundaries, artifacts, and verification criteria.
- [ ] Any reused substantial Matt Pocock source content preserves the required MIT attribution and license notice.
- [ ] PawCrew's routing, approval, PDCA, review, TDD, and LoreCat authority boundaries remain intact; LetMeowCook receives no new implementation-phase questioning path.
- [ ] A project-knowledge reference records the canonical mapping, terminology differences, and rationale for retaining existing controls rather than adding duplicates.
- [ ] Each completed cohort passes skill metadata/Markdown validation and `pawcrew-doctor` with no newly introduced errors.

## Approved flow

multi-step+brainstorming+planning — Cohort 1 approved: clarification, research, handoff, to-questionnaire, wait-what, and writing-for-agents

## Estimated effort

Large (3+d), delivered as independently approved cohorts

## Known risks

- Duplicating Superpowers or established PawCrew controls → classify all 25 skills before creating a new artifact; retain equivalent procedures rather than shadowing them.
- Copyright/license omission when adapting source text → use original procedural ideas by default; preserve MIT notices for substantial copied text.
- Adding user-question friction to autonomous work → do not alter LetMeowCook; its autonomy contract overrides any compatible clarification primitive.
- Scope is too large for one safe release → split work into independently approved cohorts, each with its own spec, plan, run, and check records.

## Out of scope

- An external issue-tracker synchronization integration, unless selected as a later dedicated cohort.
- New primary agents or a replacement for PawCrew's authority boundaries.
- Verbatim forks of AI Hero skills where existing PawCrew/Superpowers behavior already fulfills the need.
