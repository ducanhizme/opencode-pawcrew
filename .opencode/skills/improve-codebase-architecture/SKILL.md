---
name: improve-codebase-architecture
description: Produce a bounded, evidence-first architecture-improvement report. Analysis-only; it cannot authorize edits.
---

# Improve Codebase Architecture

## Trigger

Use when a user asks how to improve a bounded architecture concern.

## Procedure

1. Gather symptoms and implementation evidence through Sherclaw and project truth through LoreCat.
2. Identify affected boundaries and distinguish verified evidence from inference.
3. Consult ElderPaw only when material architecture judgement is needed.
4. Compare options and trade-offs, then name the smallest proposed change, excluded scope, risks, and verification approach.

## Output

Return a chat-only report: symptoms, evidence, affected boundaries, options/trade-offs, risks, smallest proposed change, excluded scope, and verification approach.

## Boundaries

- Analysis-only: do not edit code, tests, documents, records, schemas, or migrations, and do not call write tools.
- Do not authorize implementation, bypass approval, or silently update durable knowledge.
- Do not create a tracker, dashboard, architecture store, or new ownership boundary.
- Do not replace `code-explanation`, `change-impact-analysis`, Sherclaw, LoreCat, or ElderPaw; compose them for architecture-specific questions.
