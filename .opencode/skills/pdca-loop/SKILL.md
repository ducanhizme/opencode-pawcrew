---
name: pdca-loop
description: Deming PDCA loop for OpenCode CrewKit. Use when starting any non-trivial task to produce a Plan Record, execute with a Run Log, verify against the Plan with a Check Record, and close the loop via Knowledge Sync + optional Retrospective. Loaded by PawBuilder, PatchPaw, and LetMeowCook.
---

# PDCA Loop

Standard Deming cycle: **Plan → Do → Check → Act**.

Use this skill for any task that is not a single obvious edit. It creates durable artifacts so the loop can be audited, compared, and improved over time.

## Artifacts

| Artifact | Phase | Location | Purpose |
|---|---|---|---|
| **Plan Record** | Plan | `.ai/superpowers/plans/YYYY-MM-DD-<task-slug>.md` | Approved goal, success criteria, flow, estimates, risks |
| **Run Log** | Do | `.ai/superpowers/runs/YYYY-MM-DD-<task-slug>.md` | Decisions, deviations, sources consulted, files touched |
| **Check Record** | Check | `.ai/superpowers/checks/YYYY-MM-DD-<task-slug>.md` | Expected-vs-actual per success criterion, residual risk |
| **Retrospective Note** | Act | `.ai/docs/references/lessons-learned.md` or `.ai/superpowers/improvements/` | Process lessons and proposed kit improvements |

Only the **Plan Record** is required for every PDCA task. Run Log and Check Record are strongly recommended for multi-step work. Retrospective Note is created only when a genuine process lesson is identified.

## Phase 1 — Plan

Before material work, produce a Plan Record with this frontmatter and body:

```yaml
---
type: Plan
title: <concise goal>
description: <one sentence>
status: planned
agent: pawbuilder|patchpaw|letmeowcook
created: YYYY-MM-DD
x_wikiguy:
  knowledge_kind: Plan
  authority: descriptive
  verified_commit: <HEAD at planning time>
  covers:
    - <affected code paths>
---
```

Body sections:

```markdown
## Goal
Restate the user request as outcome + stopping condition.

## Success criteria (observable)
- [ ] <criterion 1 — precise assertion>
- [ ] <criterion 2>

## Approved flow
1-step | multi-step+brainstorming+planning | autonomous (LetMeowCook)

## Estimated effort
Quick (<1h) | Short (1-4h) | Medium (1-2d) | Large (3+d)

## Known risks
- <risk> → <mitigation>

## Out of scope
- <item>
```

For PawBuilder and PatchPaw, the Plan Record is created *before* asking the user for approval. The approval request must reference the Plan Record path. The user's approval implicitly carries the flow choice.

For LetMeowCook, the Plan Record is created during the Understand/Decide phase and does not require user approval, but it must exist before execution begins.

## Phase 2 — Do

During execution, maintain a lightweight Run Log. It may be appended to the same Run Log file as work progresses.

```markdown
## Decisions made
- <decision> → <reason>

## Deviations from Plan
- <planned X> → <actual Y> → <reason>

## External sources consulted
- Exa/SearchPurr/Context7: <topic> → <source summary>

## Files touched
- <path>: <what changed>
```

Rule: do not let the Run Log become a chat transcript. Record only load-bearing facts.

## Phase 3 — Check

After implementation and local verification, produce a Check Record:

```yaml
---
type: Check
title: Check for <task title>
description: Expected-vs-actual verification
status: pass|partial|fail
plan_record: ../plans/YYYY-MM-DD-<task-slug>.md
created: YYYY-MM-DD
x_wikiguy:
  knowledge_kind: Check
  authority: descriptive
  verified_commit: <HEAD at check time>
---
```

Body sections:

```markdown
## Verification evidence
- Criterion 1: PASS / FAIL — <command or observation>
- Criterion 2: PASS / FAIL — ...

## Unexpected behavior
- <what differed from plan and why>

## Residual risk
- <risk that remains>

## Review input (optional)
- JudgeWhiskers review: <path or n/a>
```

A Check Record is **not** the same as an Outcome Report. The Outcome Report tells the user what happened; the Check Record compares it against the Plan.

If the Check fails:
1. Stop.
2. Root-cause via `bug-flow` / `systematic-debugging` or consult ElderPaw after three failed recovery attempts.
3. Update the Plan Record with a revised scope/flow and re-approval if needed.

## Phase 4 — Act

The Act phase has two mandatory outputs and one optional output.

### Mandatory: Knowledge Sync

Follow the existing Knowledge Sync workflow:
- PawBuilder/PatchPaw: use the approved Change Request auto-sync path.
- LetMeowCook: use the two post-completion knowledge gates.
- Direct LoreCat reconciliation: if the user is talking directly to LoreCat.

### Mandatory: Outcome Report

The Outcome Report must reference:
- Plan Record path
- Check Record path
- Knowledge Sync result

### Optional: Retrospective Note

If the task surfaced a process lesson (recurring blocker, wrong estimate, missing skill, unclear delegation rule, frequent verification failure), create a Retrospective Note.

Use the `retrospective` skill to produce it. Store it under:
- `.ai/docs/references/lessons-learned.md` (append) for general lessons
- `.ai/superpowers/improvements/YYYY-MM-DD-<topic>.md` for proposed kit changes (prompt updates, new skills, workflow changes)

## Integration with existing agents

### PawBuilder
- Plan Record is created after initial exploration and *before* asking for material-design approval.
- Check Record is created after `verification-before-completion`.
- Load `pdca-loop` at the start of non-trivial feature work.

### PatchPaw
- The Change Contract is the Plan Record for change requests and bug fixes.
- For bugs, add a short "Hypothesis → Actual" section to the Plan Record after root-cause analysis.
- Check Record compares the approved change against verification evidence.

### LetMeowCook
- Plan Record is created autonomously during Understand/Decide.
- Check Record is part of the mandatory Outcome Report preparation.
- Add Gate 3 after Gate 2: "Any process lesson to record?" — if yes, run the `retrospective` skill.

## Rules

- A Plan Record with no observable success criteria is invalid. Every criterion must be checkable.
- Do not skip Check by merging it into Outcome Report. They are separate artifacts with different audiences.
- No Retrospective Note for one-off incidents. Only record lessons that are likely to recur or change how the kit works.
- All artifacts must use frontmatter `type` and `x_wikiguy` consistent with OKF.
