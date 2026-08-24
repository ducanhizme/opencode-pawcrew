# AI Hero Cohort 2 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task.

**Goal:** Add PawCrew-native `prototype` and `domain-modeling` skills with explicit disposal, approval, and LoreCat boundaries.

**Architecture:** Each skill is a focused Markdown procedure. `prototype` produces a disposable experiment and never promotes it to production; `domain-modeling` produces a draft and routes accepted knowledge through LoreCat. Minimal agent triggers preserve current owners.

**Tech Stack:** OpenCode skills, PawCrew agents, LoreCat tools, Node validation scripts.

**Spec:** `.ai/superpowers/docs/specs/2026-08-24-ai-hero-cohort-2-foundation-design.md`

## Global Constraints

- Do not alter LetMeowCook, commands, or primary-agent ownership.
- Do not write `.ai/docs` directly from either skill.
- Prototype artifacts are outside `.ai/docs` and `.ai/superpowers`, visibly throwaway, and cannot become production code without the owning flow.
- Do not commit unless explicitly requested.

### Task 1: Add prototype procedure and agent triggers

**Files:**
- Create: `.opencode/skills/prototype/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`
- Modify: `.opencode/agent/pawpixel.md`

- [ ] Create frontmatter with `name: prototype` and a trigger limited to questions that evidence/discussion cannot settle.
- [ ] Add `## Trigger`, `## Procedure`, and `## Boundaries` sections. Require one verification question, an explicit throwaway marker/path, in-memory data, recorded observation, and deletion/archive after the answer.
- [ ] Prohibit `.ai/docs`, `.ai/superpowers`, automatic production promotion, and Plan/Goal Record creation.
- [ ] Add narrow PawBuilder and PawPixel triggers; preserve PawBuilder approval and PawPixel UI workflow.
- [ ] Run `node scripts/pawcrew-doctor.js` and `git diff --check`.

### Task 2: Add LoreCat-routed domain-modeling procedure

**Files:**
- Create: `.opencode/skills/domain-modeling/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`
- Modify: `.opencode/agent/patchpaw.md`

- [ ] Create frontmatter with `name: domain-modeling` and a trigger limited to ambiguous or recurring domain terms.
- [ ] Add `## Trigger`, `## Procedure`, `## Output`, and `## Boundaries` sections. Require Sherclaw code vocabulary, LoreCat project vocabulary, scenario stress tests, and a Vocabulary Draft containing terms, definitions, relationships, and unresolved ambiguity.
- [ ] Require accepted durable vocabulary to route through `wiki_save_concept`; prohibit direct `.ai/docs` writes and silent normative changes.
- [ ] Add narrow PawBuilder/PatchPaw triggers; retain PatchPaw classification before supporting skills.
- [ ] Run `node scripts/pawcrew-doctor.js`, `node scripts/test-lorecat-tools.js`, `wiki_validate`, and `git diff --check`.

### Task 3: Validate and review Phase 1

**Files:**
- Modify: `.ai/superpowers/runs/2026-08-24-ai-hero-principles-adoption.md`
- Create: `.ai/superpowers/checks/2026-08-24-ai-hero-cohort-2-foundation.md`

- [ ] Run `comment-polish` on changed prompts and skills.
- [ ] Run Doctor, LoreCat smoke test, `wiki_validate`, and `git diff --check`; record exact output in the Check Record.
- [ ] Dispatch JudgeWhiskers for scoped review of the two skills and agent diffs; resolve blockers before completion.
- [ ] Record PASS/FAIL evidence, residual risk, and review result in the Check Record. Do not commit.

## Self-review

The three tasks cover both specified skill contracts, preserve all authority boundaries, and require validation/review. No placeholder implementation steps remain.
