---
name: codebase-design
description: Produce an evidence-backed map of an existing codebase's architecture. Read-only; it does not replace project architecture knowledge.
---

# Codebase Design

## Trigger

Use when a user needs an evidence-backed map of existing module boundaries, dependencies, flows, or contracts.

## Procedure

1. Gather implementation evidence from Sherclaw and accepted project/architecture truth from LoreCat.
2. Map module boundaries, dependencies, data or control flow, and public contracts with cited sources.
3. Label conclusions as verified, inferred, or predicted; report evidence gaps and documentation conflicts.
4. Route a genuine documentation conflict to LoreCat reconciliation rather than writing knowledge directly.

## Output

Return a chat-only architecture map with cited evidence, confidence labels, gaps, and any recommended reconciliation.

## Boundaries

- Read-only: do not edit code, tests, documents, or records, and do not call write tools.
- Do not replace `code-explanation`, `change-impact-analysis`, Sherclaw, LoreCat, or ElderPaw; compose them for architecture-specific questions.
- Do not authorize changes, create an architecture store, or silently update durable knowledge.
