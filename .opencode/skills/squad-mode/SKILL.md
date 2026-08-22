---
name: squad-mode
description: Activate parallel specialist subagents for complex tasks. Use when a single agent cannot efficiently cover architecture, implementation, and verification at once.
---

# Squad Mode

## Purpose

Squad Mode turns a complex task into a short parallel research/audit burst. A lead agent (usually PawBuilder) dispatches 2–4 specialists at the same time, waits for their reports, then synthesizes the findings into a single plan.

This is a lightweight alternative to heavy orchestration: no hidden runtime, no scheduler, just explicit parallel `task` calls.

## When to Use

Use Squad Mode when the task has two or more independent investigation dimensions and combining them serially would waste time:

- New feature touching multiple domains (frontend + backend + API contract)
- Performance or security-sensitive change
- Large refactor needing pattern audit + test impact + docs impact
- Design decision needing architecture review + dependency research + risk analysis

## Squad Composition

| Member | Responsibility |
|---|---|
| **Sherclaw** | Find existing patterns, consumers, tests, file locations |
| **SearchPurr** | Official docs, upstream examples, external prior art |
| **ElderPaw** | Architecture trade-offs, risk analysis, decision recommendation |
| **LoreCat** | Project truth check — specs, ADRs, accepted constraints |

Pick 2–3 members per task. Do not dispatch all four for trivial work.

## Dispatch Protocol

1. **State the goal** in one sentence.
2. **Assign each member a single, bounded question** with observable output.
3. **Run `task` calls in parallel.**
4. **Wait for all reports** before synthesizing.
5. **Synthesize** into: current state, options, recommended path, open questions.
6. **Present to user** for approval on material decisions.

## Example Prompts

### Sherclaw

```markdown
TASK: Inventory how the project currently handles authentication middleware.

EXPECTED OUTCOME: List files, functions, tests, and consumers. Identify the contract between middleware and route handlers.

REQUIRED TOOLS: read, grep, LSP, ast-grep.

MUST DO: Provide absolute file paths. Quote relevant code snippets.
MUST NOT DO: Edit code, propose changes, or spawn subagents.

CONTEXT: We are considering adding role-based access control.
```

### SearchPurr

```markdown
TASK: Research best practices for RBAC middleware in FastAPI/NestJS/Express (match our framework).

EXPECTED OUTCOME: 2–3 recommended patterns with source labels (official docs or real-world examples).

REQUIRED TOOLS: Context7, web search, public code search.

MUST DO: Label each claim as official-docs, real-world-implementation, or community-discussion.
MUST NOT DO: Edit code or give opinions without evidence.

CONTEXT: Project uses <framework>.
```

### ElderPaw

```markdown
TASK: Evaluate RBAC integration options for architecture risk.

EXPECTED OUTCOME: Recommended approach with trade-offs: coupling, testability, migration effort, security boundary.

REQUIRED TOOLS: read, grep.

MUST DO: Compare at least two approaches and give a clear recommendation with rationale.
MUST NOT DO: Edit code or implement.

CONTEXT: Sherclaw found current auth middleware at <paths>. SearchPurr found patterns <summary>.
```

## Synthesis Template

After all reports return, produce:

```markdown
## Squad findings

### Current state
...

### External patterns
...

### Risks and trade-offs
...

### Recommendation
...

### Open questions
- ...

### Next step
Ask user to approve the recommended approach.
```

## Rules

1. **Never dispatch without a one-sentence goal and bounded questions.** Vague squads waste tokens.
2. **Do not chain squads.** A subagent cannot spawn another agent (`task: deny`).
3. **A subagent report is a lead, not evidence.** Verify claims against the actual repository before acting.
4. **Squad Mode is for investigation, not implementation.** Implementation still follows the approved flow (plan → TDD → verify).
5. **Time-box.** If a subagent is taking too long, stop it and proceed with partial findings.

## Integration

Squad Mode feeds into `writing-plans` and `executing-plans`. It pairs with `change-impact-analysis` for multi-file changes and `contract-regression-testing` for API/schema work.
