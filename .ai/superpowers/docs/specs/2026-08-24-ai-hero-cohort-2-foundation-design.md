---
type: Design
title: AI Hero Cohort 2 foundation for PawCrew
description: Add disposable prototype and LoreCat-routed domain-modeling procedures.
status: proposed
agent: pawbuilder
generated:
  by: pawbuilder
  at: 2026-08-24T00:00:00Z
x_wikiguy:
  knowledge_kind: Design
  authority: descriptive
  verified_commit: ea3d1ab
  covers:
    - .opencode/skills/prototype/SKILL.md
    - .opencode/skills/domain-modeling/SKILL.md
    - .opencode/agent/pawbuilder.md
    - .opencode/agent/pawpixel.md
---

## Purpose

Add two bounded procedures for settling uncertain design questions and stabilizing recurring domain vocabulary without creating durable records outside LoreCat or bypassing PawCrew approval.

## `prototype`

**Trigger:** a design, state, or UI question cannot be resolved through evidence and discussion alone.

**Procedure:** state one verification question; obtain PawBuilder approval when the prototype would affect material product/design direction; create a visibly throwaway artifact outside `.ai/docs` and `.ai/superpowers`; keep data in-memory and scope implementation to the question; record the observed answer; then delete or archive the artifact as non-production work.

**Boundary:** a prototype never becomes production implementation by implication, creates no Plan/Goal Record, and does not override PawPixel's existing UI mock workflow. Follow the owning agent's normal approval and verification rules for any promoted work.

## `domain-modeling`

**Trigger:** terms are vague, overloaded, contradictory, or recurring across a feature/change's code and documentation.

**Procedure:** gather current terminology from Sherclaw and accepted terminology from LoreCat; stress-test terms with concrete scenarios; produce a Vocabulary Draft containing term, definition, relationships, and unresolved ambiguity; route accepted durable vocabulary to LoreCat through `wiki_save_concept`.

**Boundary:** the skill never writes `.ai/docs` directly, never silently rewrites normative terminology, and does not create a separate glossary store. LoreCat owns the canonical knowledge; PawBuilder/owner retains approval of material domain decisions.

## Integration

- PawBuilder invokes `prototype` only after the clarification/brainstorming flow establishes that a disposable experiment is the smallest way to resolve an approved design question.
- PawPixel retains UI prototype ownership and may invoke `prototype` for non-production variants; its UI workflow remains authoritative for frontend implementation.
- PawBuilder and PatchPaw invoke `domain-modeling` when vocabulary ambiguity affects a material design or behavior change. PatchPaw still classifies before using any supporting skill.
- LetMeowCook is unchanged.

## Verification

- Both skills have valid frontmatter plus explicit Trigger, Procedure, and Boundary sections.
- Prototype rules prohibit durable corpus writes and promotion to production without the owning flow.
- Domain-modeling rules route durable knowledge only through LoreCat.
- Scoped JudgeWhiskers review confirms no approval, LoreCat, or LetMeowCook boundary regresses.
- `node scripts/pawcrew-doctor.js`, `node scripts/test-lorecat-tools.js`, `wiki_validate`, and `git diff --check` pass.
