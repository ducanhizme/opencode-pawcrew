---
name: triage
description: Identify the read-only decision frontier for an existing effort from PDCA records. It does not rank, assign, or mutate work.
---

# Triage

## Trigger

Use when a user needs to identify blocked decisions, unverified criteria, or stale evidence in an existing effort.

## Procedure

1. Read the relevant Goal, Plan, Run, and Check records under `.ai/superpowers/`.
2. Cite the record evidence for each blocker, unverified criterion, decision request, or stale item.
3. Distinguish a blocker from an unverified criterion and from an owner decision request.
4. Identify the smallest next action without assigning work or changing state.

## Output

Return a chat-only decision frontier: blockers, unverified criteria, owner decisions, stale evidence, and next actions.

## Boundaries

- Read-only: do not edit files or call write tools.
- Do not rank backlogs, assign work, create tickets, mutate record state, or infer mutable status.
- Do not authorize implementation, override approval gates, or become a source of durable knowledge.
