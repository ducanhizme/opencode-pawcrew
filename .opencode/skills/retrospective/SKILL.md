---
name: retrospective
description: Extract process lessons and propose kit improvements after a completed task. Use only when a recurring pattern, wrong estimate, missing skill, unclear delegation rule, or verification failure suggests the kit itself should improve. Produces a Retrospective Note; does not edit code or implement changes without approval.
---

# Retrospective

Use after a task completes (or fails) when there is a **process lesson** worth preserving or a **kit improvement** worth proposing.

Do not use for:
- One-off incidents that will not recur.
- Venting about a single tricky dependency.
- Decisions that belong in the Outcome Report instead.

Use when:
- The same blocker appeared in 2+ recent tasks.
- An estimate was off by 2x or more for a reason that will repeat.
- A skill/agent prompt was unclear and caused a wrong dispatch or missed step.
- Verification consistently fails for the same category of change.
- A delegation rule conflicted with Superpowers skill text.

## Inputs

Before running, gather:
- Plan Record (`.ai/superpowers/plans/*.md`)
- Check Record (`.ai/superpowers/checks/*.md`)
- Outcome Report (from the completing agent)
- Conversation context (what actually happened vs what was expected)

## Procedure

1. **Identify the gap.** What did the kit miss? Examples:
   - Missing skill for a recurring task type
   - Agent prompt ambiguity
   - Weak success criteria template
   - Wrong default flow recommendation
   - Overlapping agent responsibilities

2. **Classify the lesson.**
   - `process` — how work is done (e.g., "always run contract-regression-testing before approval for CLI changes")
   - `prompt` — agent identity/instruction clarity
   - `skill` — missing or incomplete reusable procedure
   - `tooling` — missing MCP, plugin, or CLI capability
   - `knowledge` — gap in `.ai/docs` corpus

3. **Propose the smallest improvement.** One change per Retrospective Note unless two changes are inseparable. Include effort estimate and confidence.

4. **Decide where to store it.**
   - General lesson with low kit-change risk → append to `.ai/docs/references/lessons-learned.md`
   - Proposed kit change (prompt/skill/workflow) → create `.ai/superpowers/improvements/YYYY-MM-DD-<topic>.md`

## Output Format

For `.ai/superpowers/improvements/*.md`:

```yaml
---
type: Improvement
title: <proposed kit change>
description: <one sentence>
status: proposed
created: YYYY-MM-DD
x_wikiguy:
  knowledge_kind: Improvement
  authority: descriptive
  verified_commit: <HEAD at write time>
---
```

```markdown
## Trigger
What task(s) surfaced this gap?

## Observed pattern
What happened repeatedly or predictably?

## Root cause
Why did the kit behave this way?

## Proposed change
- File(s): <paths>
- Change: <concise description>

## Effort
Quick | Short | Medium | Large

## Confidence
high | medium | low — <one phrase>

## Risks / open questions
- <what could go wrong or need validation>
```

For `.ai/docs/references/lessons-learned.md` append:

```markdown
## YYYY-MM-DD — <short title>
- **Context:** <which task(s)>
- **Lesson:** <what to remember or do differently>
- **Applies to:** <agent/skill/workflow>
```

## Boundaries

- This skill is analysis-only by default. It does not edit agent prompts or create skills.
- If the proposed change is accepted by the user, route implementation to the appropriate agent:
  - prompt/skill/workflow change → PawBuilder
  - simple `.ai/docs` update → LoreCat direct or `/lore-cat-save-it`
- Do not silently update normative `.ai/docs` without user approval.

## Completion

Return:
- Path of the created/updated Retrospective Note
- Classification (`process|prompt|skill|tooling|knowledge`)
- Whether user approval is needed before implementation
