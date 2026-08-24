# AI Hero Cohort 2 Architecture Design

## Goal

Add read-only `codebase-design` and `improve-codebase-architecture` skills that clarify current architecture and produce scoped improvement reports without creating durable architecture knowledge or authorizing edits.

## Scope

- Create `.opencode/skills/codebase-design/SKILL.md`.
- Create `.opencode/skills/improve-codebase-architecture/SKILL.md`.
- Add narrow PawBuilder triggers only.
- Reuse Sherclaw for code truth, LoreCat for project truth, and ElderPaw only for material architecture judgement.

## Design

### Codebase Design

Use when a user needs an evidence-backed map of the existing codebase architecture. Gather code truth from Sherclaw and accepted architecture/project truth from LoreCat. Report module boundaries, dependencies, data/control flow, public contracts, confidence labels, and evidence gaps. It may recommend a LoreCat reconciliation when documented architecture conflicts with implementation, but cannot write documentation directly.

### Improve Codebase Architecture

Use when a user asks how to improve a bounded architecture concern. Gather evidence before recommendations. Return a report containing symptoms, evidence, affected boundaries, options and trade-offs, risks, smallest proposed change, excluded scope, and verification approach. The report is analysis-only: it cannot edit code, authorize implementation, create migrations, or silently update documentation.

### Boundaries

- Both skills are read-only and produce chat-only output.
- They do not replace `code-explanation`, `change-impact-analysis`, Sherclaw, LoreCat, or ElderPaw; they compose those owners for architecture-specific questions.
- Durable knowledge belongs to LoreCat; accepted updates use the sanctioned reconciliation/write flow.
- Do not alter LetMeowCook, routing commands, primary ownership, or introduce a tracker/dashboard/store.

## Verification

- Verify both skills have Trigger, Procedure, Output, and Boundaries sections with explicit ownership and no-write rules.
- Confirm PawBuilder is the only changed agent prompt and no command/LetMeowCook files change.
- Run `node scripts/pawcrew-doctor.js`, direct `wiki_validate`, `node scripts/test-lorecat-tools.js`, and `git diff --check`.
- Obtain scoped JudgeWhiskers review before closing the phase.
