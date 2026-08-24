# AI Hero Cohort 2 Consumers Design

## Goal

Add read-only `wayfinder` and `triage` skills that turn existing PDCA records into a current-state and decision-frontier view without creating a tracker, state store, or approval bypass.

## Scope

- Create `.opencode/skills/wayfinder/SKILL.md`.
- Create `.opencode/skills/triage/SKILL.md`.
- Add narrow triggers to PawBuilder and PatchPaw only.
- Consume `.ai/superpowers/goals`, `plans`, `runs`, and `checks` as the only operational evidence.

## Design

### Wayfinder

Use when a user asks where a multi-step effort stands or what to do next. Read the relevant Goal, Plan, Run, and Check records and return: current goal, active plan, latest verification, and the smallest next required action. If records disagree or are incomplete, state the evidence gap rather than infer a status.

### Triage

Use when a user needs to identify what requires a decision or blocks progress. Read the same records and return a decision frontier: blocked or unverified success criteria, the required owner decision, stale evidence, and the smallest next action. It does not rank a backlog, assign work, or modify task state.

### Boundaries

- Both skills are read-only: no `wiki_save_concept`, `wiki_sync`, file edits, Plan/Run/Check/Goal creation, updates, or closure.
- Neither is a ticket system, project dashboard, agent, command, or source of durable knowledge.
- Existing PDCA and approval ownership remains authoritative; skills may recommend the next flow but cannot authorize it.
- Do not alter LetMeowCook, routing commands, or primary-agent ownership.

## Verification

- Verify both skills declare trigger, procedure, output, and read-only boundaries.
- Confirm only approved agent trigger files change.
- Run `node scripts/pawcrew-doctor.js`, direct `wiki_validate`, `node scripts/test-lorecat-tools.js`, and `git diff --check`.
- Obtain scoped JudgeWhiskers review before completion.
