---
name: clarification
description: Resolve material ambiguity before work starts. Use only when two plausible interpretations would produce different deliverables; state the safe default and ask one precise question only when needed. Do not use for naming, defaults, or design exploration.
---

# Clarification

Use this procedure to resolve ambiguity without turning every minor choice into a user question.

## Trigger

Load this skill only when two plausible interpretations would materially change the requested behavior, artifact, scope, or success condition. Do not load it for local names, defaults, formatting, or other implementation trivia.

## Procedure

1. State the interpretation you will use if no response is required.
2. State the alternative and the concrete difference it makes to the deliverable.
3. Ask one precise question only when the user must choose between them.
4. When intent is clear, return to the owning agent's existing workflow.

If one interpretation is safe, conventional, and satisfies the request, adopt it and proceed without a question.

## Boundaries

- This is intent triage, not product design or ideation. Use Superpowers `brainstorming` once a request needs design exploration.
- PatchPaw classifies a request as BUG or CHANGE REQUEST before loading this skill; clarification does not replace classification or root-cause analysis.
- LetMeowCook does not use this skill. Its autonomy contract governs questions during execution and this skill never creates an exception.
- This skill cannot approve, plan, edit, or transfer ownership.
