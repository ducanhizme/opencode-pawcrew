---
name: domain-modeling
description: Stabilize ambiguous or recurring domain terminology before it causes design or behavior drift. Use when terms are vague, overloaded, contradictory, or cross code and documentation boundaries.
---

# Domain Modeling

## Trigger

Use when ambiguous or recurring domain vocabulary materially affects a feature or change.

## Procedure

1. Gather current code vocabulary through Sherclaw and accepted project vocabulary through LoreCat.
2. Stress-test terms with concrete scenarios and identify overloaded or contradictory usage.
3. Produce a Vocabulary Draft: terms, definitions, relationships, and unresolved ambiguity.
4. Route accepted durable vocabulary through `wiki_save_concept`.

## Output

Return the draft in chat or a temporary artifact; LoreCat owns the canonical record.

## Boundaries

- Never write `.ai/docs` directly or silently rewrite normative terminology.
- This skill does not approve product/domain decisions or replace PatchPaw classification.
