# AI Hero Cohort 2 Consumers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add read-only `wayfinder` and `triage` skills that derive current-state and decision-frontier views from existing PDCA records.

**Architecture:** Two focused Markdown procedures consume only Goal, Plan, Run, and Check records. Narrow PawBuilder/PatchPaw triggers expose the procedures without commands, persistence, task mutation, or new ownership.

**Tech Stack:** OpenCode skills, PawCrew agent prompts, PDCA records, Node validation scripts.

**Spec:** `.ai/superpowers/docs/specs/2026-08-24-ai-hero-cohort-2-consumers-design.md`

## Global Constraints

- Do not alter LetMeowCook, routing commands, or primary-agent ownership.
- Do not add a tracker, dashboard, state store, write tool call, or mutable status transition.
- Both skills read only `.ai/superpowers/goals`, `plans`, `runs`, and `checks`.
- Do not commit unless explicitly requested.

---

### Task 1: Add the read-only Wayfinder procedure

**Files:**
- Create: `.opencode/skills/wayfinder/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`

**Interfaces:**
- Consumes: Goal, Plan, Run, and Check records under `.ai/superpowers/`.
- Produces: a chat-only current-state report: current goal, active plan, latest verification, evidence gaps, and smallest next action.

- [ ] **Step 1: Add the skill contract**

Create frontmatter with `name: wayfinder` and a description limited to locating a multi-step effort within existing PDCA evidence.

- [ ] **Step 2: Define the procedure and boundaries**

Add `## Trigger`, `## Procedure`, `## Output`, and `## Boundaries`. Require reading relevant records, citing record paths, reporting disagreement or missing evidence, and refusing to infer mutable status. Prohibit edits, write tools, record creation/closure, commands, dashboards, and approval authorization.

- [ ] **Step 3: Add PawBuilder's narrow trigger**

Add one sentence in PawBuilder's skill-extension guidance: load `wayfinder` only when a user asks where an existing multi-step effort stands or what evidence-backed action is next.

- [ ] **Step 4: Validate the isolated deliverable**

Run: `node scripts/pawcrew-doctor.js && git diff --check`

Expected: Doctor reports 0 errors and no whitespace errors are reported.

### Task 2: Add the read-only Triage procedure

**Files:**
- Create: `.opencode/skills/triage/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`
- Modify: `.opencode/agent/patchpaw.md`

**Interfaces:**
- Consumes: Goal, Plan, Run, and Check records under `.ai/superpowers/`.
- Produces: a chat-only decision-frontier report: blocked/unverified criteria, required owner decision, stale evidence, and smallest next action.

- [ ] **Step 1: Add the skill contract**

Create frontmatter with `name: triage` and a description limited to read-only identification of decisions, blockers, and verification gaps in an existing effort.

- [ ] **Step 2: Define the procedure and boundaries**

Add `## Trigger`, `## Procedure`, `## Output`, and `## Boundaries`. Require citations to source records and distinction between a blocker, an unverified criterion, and a decision request. Prohibit ranking a backlog, assigning work, mutating record state, creating tickets, or authorizing implementation.

- [ ] **Step 3: Add narrow agent triggers**

Add one PawBuilder trigger for an evidence-backed decision frontier and one PatchPaw trigger after request classification for blocked maintenance/change-record evidence. Preserve all existing classification and approval rules.

- [ ] **Step 4: Validate the isolated deliverable**

Run: `node scripts/pawcrew-doctor.js && git diff --check`

Expected: Doctor reports 0 errors and no whitespace errors are reported.

### Task 3: Verify and review the consumer phase

**Files:**
- Modify: `.ai/superpowers/runs/2026-08-24-ai-hero-principles-adoption.md`
- Create: `.ai/superpowers/checks/2026-08-24-ai-hero-cohort-2-consumers.md`

- [ ] **Step 1: Run comment polish**

Review the five changed skill/prompt files for misleading, stale, or filler comments; make no unrelated refactors.

- [ ] **Step 2: Run full verification**

Run: `node scripts/pawcrew-doctor.js && node scripts/test-lorecat-tools.js && git diff --check`

Run direct `wiki_validate` and record its output.

Expected: Doctor reports 0 errors, LoreCat smoke test reports valid documents, direct corpus validation reports valid documents, and the diff check passes.

- [ ] **Step 3: Request scoped review**

Dispatch JudgeWhiskers to review the two skill files and three agent diffs against this plan and the consumer design spec. Resolve any blocker before closing the phase.

- [ ] **Step 4: Write records**

Append the implementation decisions and validation output to the Run Log. Create the Check Record with PASS/FAIL against each criterion, review verdict, residual risks, and references to the Plan Record and this implementation plan.

## Self-review

- Spec coverage: Tasks 1–2 implement both read-only procedures and triggers; Task 3 validates boundaries and records evidence.
- Placeholder scan: no TBD/TODO markers or unspecified implementation steps.
- Consistency: both skill procedures consume only the same four PDCA record types and prohibit mutation.
