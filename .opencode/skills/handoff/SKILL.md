---
name: handoff
description: Prepare a temporary, redacted transfer brief for another agent, harness, session, or human. Use only when the user requests a handoff or a pause risks losing material context; it does not change primary-agent ownership.
---

# Handoff

Create a compact transfer brief without duplicating durable project records.

## Trigger

Use only for a user-requested transfer to another agent, harness, session, or human, or when a pause risks losing material context.

## Procedure

1. Confirm the destination and the next owner. The user selects a new primary agent when ownership must change.
2. Create a temporary Markdown brief using the repository's existing temporary artifact convention. If none exists, return the brief in chat rather than creating a permanent directory.
3. Include `Destination`, `Current state`, `Decisions`, `Evidence`, `Next action`, `Verification status`, `Open risks`, and `Redactions`.
4. Use absolute paths and exact commands where known. Link Plan, Goal, Run, and Check records instead of reproducing their contents.
5. Remove secrets, credentials, tokens, and unnecessary personal data.

## Boundaries

- A handoff does not silently route work, transfer primary-agent authority, or replace a PDCA Goal Record.
- Do not add temporary material to `.ai/docs`; LoreCat owns durable knowledge.
- State missing evidence or verification plainly rather than claiming readiness.
