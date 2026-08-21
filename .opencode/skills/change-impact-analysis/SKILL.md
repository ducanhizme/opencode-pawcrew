---
name: change-impact-analysis
description: Analyze a requested change without modifying code. Use when planning a behavior change, API change, or bounded change request before proposing the fix. Produces current state, requested state, delta, dependencies, impact, risks, and a proposed change with a verification plan. Use ONLY when a change request needs impact analysis before approval - not for bug reproduction or open-ended feature design.
---

# Change Impact Analysis

Analyze a requested change WITHOUT modifying any code. This skill produces understanding, not edits.

This skill does NOT ask for approval and does NOT implement anything. The calling agent owns approval policy and execution.

## When to Use

- A bounded change request exists (change X to Y, switch format, alter response shape)
- The current behavior and requested behavior can both be stated concretely
- You need to know what breaks before proposing the change

Do not use for: bug investigation with an unknown cause (use systematic debugging), or open-ended feature design (use brainstorming).

## Procedure

1. **Establish project truth.** If a `.ai/docs` corpus exists, retrieve affected specs/architecture/decisions/workflows through LoreCat (dispatch as subagent — it returns evidence and conflict reports, never questions). Note each document's freshness (verified/stale/unverified).
2. **Establish current state.** Search the repository for everything that implements or consumes the behavior in question. Use parallel searches: definition sites, call sites, tests, configs, docs.
3. **Establish requested state.** Restate it precisely enough that both states could be expressed as assertions or examples.
4. **Compute the delta.** The exact difference between the two states - not the implementation steps, the semantic difference.
5. **Trace dependencies.** Everything that touches the affected surface: direct consumers, indirect consumers (via API/schema/serialization), tests, migrations, documentation, external contracts, project knowledge documents.
6. **Assess impact and risks.** Breaking changes first. Then behavioral drift, stale consumers, migration burden, rollback difficulty, knowledge drift (normative specs contradicted by the requested state).
7. **Propose the change.** The smallest correct set of edits. Explicitly out-of-scope items listed separately.

## Output Format

Produce this structure (labeled markdown — every label present, values may be prose):

```markdown
**Knowledge:** corpus present|absent · affected specs: ... · architecture: ... · decisions: ... · workflows: ... · freshness verified|stale|unverified|n/a

**Current state:** behavior + where it lives (files/symbols as evidence)

**Requested state:** precise target behavior

**Delta:** the semantic difference

**Direct impact:** modules/APIs/behaviors that must change

**Indirect consumers:** what consumes the affected surface without changing itself

**Compatibility:** breaking true|false — notes

**Drift:** exists true|false — documentation-stale|implementation-drift|architecture-drift|unknown

**Risks:** ordered by severity

**Knowledge impact:** required true|false — per affected document: UPDATE | CREATE | SUPERSEDE | DEPRECATE | VERIFY_ONLY

**Proposed change:** smallest correct edit set, in order

**Out of scope:** adjacent issues noticed but not addressed

**Verification plan:** tests to run/update, checks to execute
```

## Rules

- Every claim about current behavior must cite a file/symbol you actually saw. If you did not see it, mark it as assumption.
- Knowledge claims must cite `.ai/docs` paths retrieved via LoreCat — do not invent spec content; if the corpus is absent, write `corpus absent` in **Knowledge** and move on.
- If the delta is ambiguous (multiple interpretations of the request), surface that at the top of the output - the calling agent needs it before approval.
- Never edit files during this analysis.
