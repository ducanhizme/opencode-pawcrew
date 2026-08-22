---
name: goal-persistence
description: Persist active multi-step goals across sessions. Write a goal record at the start of non-trivial work, update progress, and close it when done. Prevents idle loss of context and supports idle continuation.
---

# Goal Persistence

## Purpose

Multi-step goals often span more than one session. This skill writes an active goal record under `.ai/superpowers/goals/` so the next session can resume without re-discovering the objective.

## When to Use

- LetMeowCook at the start of any autonomous goal
- PawBuilder when the user gives a multi-step objective that will not finish in one turn
- Any agent when the user says "continue later" or "remember this goal"

## Goal Record Format

File: `.ai/superpowers/goals/YYYY-MM-DD-<goal-slug>.md`

```markdown
# Goal: <title>

- **Created**: YYYY-MM-DD HH:MM
- **Agent**: <agent name>
- **Status**: active | paused | completed | cancelled
- **Source**: user message / <quote>

## Objective

One-sentence destination.

## Success criteria

- [ ] <criterion 1>
- [ ] <criterion 2>

## Current state

What has been done so far.

## Next action

The very next step to take.

## Blockers

None | <list>

## Related artifacts

- Plan Record: `.ai/superpowers/plans/YYYY-MM-DD-<task-slug>.md`
- Run Log: `.ai/superpowers/runs/YYYY-MM-DD-<task-slug>.md`
```

## Workflow

1. **Create** a goal record when accepting a multi-step goal.
2. **Update** the record at meaningful transitions:
   - Progress made
   - Blocker encountered
   - Scope changed
   - Paused / resumed
3. **Close** the record when the goal is completed or cancelled.
4. **On resume**, read the most recent active goal record and continue from `Next action`.

## Rules

1. **One active goal per session is enough.** Do not create a goal registry for every tiny task.
2. **The goal record is a pointer, not a log.** Keep the Run Log separate under `.ai/superpowers/runs/`.
3. **Update on transition, not on every edit.** Avoid noise.
4. **Close goals honestly.** If the user changes direction, mark cancelled and create a new one.
5. **Resume reads the newest active goal.** If multiple active goals exist, ask the user which to continue.

## Commands

| Action | How |
|---|---|
| Create goal | Write new goal record with status `active` |
| Update goal | Edit the same file, update `Current state` and `Next action` |
| Close goal | Set status `completed` or `cancelled`, append `Closed at` |
| Resume | Read newest `active` goal file and continue `Next action` |

## Integration

Goal persistence extends the `pdca-loop` skill. The Plan Record is the detailed plan; the Goal Record is the durable high-level objective that survives across sessions.
