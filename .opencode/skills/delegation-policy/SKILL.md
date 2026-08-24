---
name: delegation-policy
description: Kit delegation common core — canonical subagent dispatch targets (sherclaw/lorecat/searchpurr/elderpaw/judgewhiskers/guardclaw), review dispatch rules, dispatch mechanics, and the parallel-dispatch (squad) pattern. Use when delegating investigation, research, general review, or focused security review from a primary agent (PatchPaw/PawBuilder/LetMeowCook). Loads the common-core delegation procedure shared across the kit.
---

# Delegation — Kit Common Core

Canonical delegate targets (order = dispatch priority):

1. **sherclaw** — code truth (where things live, current behavior, consumers, test coverage)
2. **lorecat** — project truth (.ai/docs: specs, architecture, ADRs, workflows)
3. **searchpurr** — external truth (upstream/library behavior, version compatibility)
4. **elderpaw** — judgement (hard debugging dead ends, subtle concurrency/security root causes)
5. **judgewhiskers** — review (code review, task review, re-review, whole-branch review)
6. **guardclaw** — focused security review (explicit security request or high-risk auth/authz, secrets, payments, untrusted-input, filesystem, network, deserialization, or sensitive-data change)

## Review Dispatch Rule (overrides Superpowers skill text)

Superpowers skills `requesting-code-review` and `subagent-driven-development` instruct you to _"dispatch a `general-purpose` subagent"_. **This kit has no `general-purpose` agent** — opencode would fall back to `sherclaw`, whose prompt forbids opinions and ends review as a no-op.

**Rule:** when any Superpowers skill instructs dispatching a code reviewer, task reviewer, re-reviewer, or whole-branch reviewer, **always dispatch `subagent_type: "judgewhiskers"`** — never `general-purpose`, never `sherclaw`. Pass the review template (brief path, report path, diff/package path, BASE_SHA, HEAD_SHA, global constraints) exactly as the skill prescribes; only the `subagent_type` changes.

## Security Review Dispatch Rule

`guardclaw` is separate from the Superpowers review flow. Dispatch `subagent_type: "guardclaw"` only when the user explicitly requests a security review or the approved scope touches a high-risk security boundary. Include the exact diff/range, threat-relevant context, and expected output. It complements rather than replaces `judgewhiskers`; do not dispatch it for ordinary code review.

## Project-local Skills

Before delegating, check whether the project has custom skills that cover this task. Run `skill("crewkit-skill-registry")` or use the helper script to list skills in:

- `<project>/.opencode/skills/*` — project-local skills (authoritative for this repo)
- `~/.config/opencode/skills/*` — global user skills
- plugin-shipped skills under `~/.config/opencode/plugins/cache/*/skills/*`

If a project-local skill matches the task, invoke it instead of (or before) generic delegation. Project-local skills take precedence over global and plugin-shipped skills.

## Dispatch mechanics (opencode)

Dispatch via the `task` tool: `subagent_type` (agent name), `description` (3-5 words), `prompt` (self-contained: goal, context, constraints, expected output format).

- **Fresh context**: the subagent sees only your prompt, never this conversation. Include all needed context in the prompt itself.
- **One final message**: the subagent returns a single response and cannot clarify mid-flight. Specify exactly what to return: absolute paths, reproduction evidence, structured blocks.
- **Intent**: state explicitly whether the task is research-only or authorizes code changes.
- **Parallel**: independent investigations = multiple `task` calls in ONE message. Do not duplicate delegated work while waiting.
- **Resume**: pass the prior `task_id` to continue the same subagent session with its context intact.

A subagent report is a lead, not evidence. Verify the touched files and behavior yourself.

## Parallel dispatch (squad pattern)

Use when a task has two or more independent investigation dimensions and
combining them serially would waste time: multi-domain features, performance
or security-sensitive changes, large refactors, design decisions needing
architecture + dependency + risk angles.

Composition — pick 2–3 members, never all four for trivial work:

| Member | Responsibility |
|---|---|
| **Sherclaw** | Existing patterns, consumers, tests, file locations |
| **SearchPurr** | Official docs, upstream examples, external prior art |
| **ElderPaw** | Architecture trade-offs, risk analysis, decision recommendation |
| **LoreCat** | Project truth check — specs, ADRs, accepted constraints |

Protocol:

1. State the goal in one sentence.
2. Assign each member a single, bounded question with observable output.
3. Run `task` calls in parallel (one message, multiple calls).
4. Wait for all reports before synthesizing.
5. Synthesize into: current state, options, recommended path, open questions.
6. Present to the user for approval on material decisions.

Dispatch prompts follow the six-section structure (TASK, EXPECTED OUTCOME,
REQUIRED TOOLS, MUST DO, MUST NOT DO, CONTEXT). Example for Sherclaw:

```markdown
TASK: Inventory how the project currently handles authentication middleware.

EXPECTED OUTCOME: List files, functions, tests, and consumers. Identify the contract between middleware and route handlers.

REQUIRED TOOLS: read, grep, LSP, ast-grep.

MUST DO: Provide absolute file paths. Quote relevant code snippets.
MUST NOT DO: Edit code, propose changes, or spawn subagents.

CONTEXT: We are considering adding role-based access control.
```

Rules:

1. Never dispatch without a one-sentence goal and bounded questions — vague squads waste tokens.
2. Do not chain squads. A subagent cannot spawn another agent (`task: deny`).
3. A subagent report is a lead, not evidence. Verify claims against the repository before acting.
4. The squad is for investigation, not implementation. Implementation still follows the approved flow.
5. Time-box: if a subagent takes too long, proceed with partial findings and say so.
