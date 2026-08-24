---
name: wayfinder
description: Locate an existing multi-step effort within its PDCA records and identify its evidence-backed next action. Read-only; not a tracker.
---

# Wayfinder

## Trigger

Use when a user asks where an existing multi-step effort stands or what to do next.

## Procedure

1. Read the relevant Goal, Plan, Run, and Check records under `.ai/superpowers/`.
2. Cite the records that establish the current goal, active plan, and latest verification.
3. Report disagreements or missing evidence as gaps; do not infer mutable status.
4. Identify the smallest evidence-backed next action and its owning flow.

## Output

Return a chat-only report: current goal, active plan, latest verification, evidence gaps, and next action.

## Boundaries

- Read-only: do not edit files or call write tools.
- Do not create, update, close, or infer state for Goal, Plan, Run, or Check records.
- Do not create commands, dashboards, or a tracker; do not authorize approval or implementation.
