---
name: delegation-policy
description: Kit delegation common core — canonical subagent dispatch targets (sherclaw/lorecat/searchpurr/elderpaw/judgewhiskers/guardclaw), review dispatch rules, and dispatch mechanics. Use when delegating investigation, research, general review, or focused security review from a primary agent (PatchPaw/PawBuilder/LetMeowCook). Loads the common-core delegation procedure shared across the kit.
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

## Dispatch mechanics (opencode)

Dispatch via the `task` tool: `subagent_type` (agent name), `description` (3-5 words), `prompt` (self-contained: goal, context, constraints, expected output format).

- **Fresh context**: the subagent sees only your prompt, never this conversation. Include all needed context in the prompt itself.
- **One final message**: the subagent returns a single response and cannot clarify mid-flight. Specify exactly what to return: absolute paths, reproduction evidence, structured blocks.
- **Intent**: state explicitly whether the task is research-only or authorizes code changes.
- **Parallel**: independent investigations = multiple `task` calls in ONE message. Do not duplicate delegated work while waiting.
- **Resume**: pass the prior `task_id` to continue the same subagent session with its context intact.

A subagent report is a lead, not evidence. Verify the touched files and behavior yourself.
