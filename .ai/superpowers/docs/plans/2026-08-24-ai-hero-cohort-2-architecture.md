# AI Hero Cohort 2 Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task.

**Goal:** Add read-only architecture-mapping and architecture-improvement-report skills.

**Architecture:** `codebase-design` composes Sherclaw and LoreCat evidence into a current architecture map; `improve-codebase-architecture` composes evidence into a bounded, analysis-only improvement report. Both preserve existing authority owners.

**Tech Stack:** OpenCode skills, PawCrew agent prompts, LoreCat/Sherclaw/ElderPaw delegation, Node validation scripts.

**Spec:** `.ai/superpowers/docs/specs/2026-08-24-ai-hero-cohort-2-architecture-design.md`

## Global Constraints

- Both skills are read-only and chat-only.
- Do not create durable architecture knowledge, trackers, dashboards, commands, migrations, or approval bypasses.
- Do not alter LetMeowCook, routing commands, or primary ownership.
- Do not commit unless explicitly requested.

### Task 1: Add Codebase Design

**Files:**
- Create: `.opencode/skills/codebase-design/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`

- [ ] Add frontmatter and `Trigger`, `Procedure`, `Output`, and `Boundaries` sections.
- [ ] Require Sherclaw code truth, LoreCat project truth, cited module boundaries/dependencies/flows/contracts, confidence labels, and evidence gaps.
- [ ] Prohibit direct documentation writes, implementation edits, approval, and ownership replacement.
- [ ] Add a narrow PawBuilder trigger for evidence-backed current architecture mapping.
- [ ] Run `node scripts/pawcrew-doctor.js` and `git diff --check`.

### Task 2: Add Improve Codebase Architecture

**Files:**
- Create: `.opencode/skills/improve-codebase-architecture/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`

- [ ] Add frontmatter and `Trigger`, `Procedure`, `Output`, and `Boundaries` sections.
- [ ] Require symptoms, evidence, affected boundaries, options/trade-offs, risks, smallest proposed change, excluded scope, and verification approach.
- [ ] Require ElderPaw only for material architecture judgement; prohibit edits, migrations, implementation authorization, and direct documentation updates.
- [ ] Add a narrow PawBuilder trigger for a bounded evidence-first architecture-improvement report.
- [ ] Run `node scripts/pawcrew-doctor.js` and `git diff --check`.

### Task 3: Validate and close Phase 3

**Files:**
- Modify: `.ai/superpowers/runs/2026-08-24-ai-hero-principles-adoption.md`
- Create: `.ai/superpowers/checks/2026-08-24-ai-hero-cohort-2-architecture.md`

- [ ] Run comment polish on touched skill/prompt files.
- [ ] Run `node scripts/pawcrew-doctor.js`, direct `wiki_validate`, `node scripts/test-lorecat-tools.js`, and `git diff --check`.
- [ ] Dispatch scoped JudgeWhiskers review and resolve blockers.
- [ ] Record evidence, residual risk, and the review verdict in the Run/Check Records.

## Self-review

Tasks 1–2 cover each procedure and PawBuilder trigger; Task 3 covers validation/review/records. No task creates an architecture store or changes ownership.
