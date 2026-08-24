---
name: contract-regression-testing
description: Build a regression-test contract for API, schema, event, serialization, configuration, or CLI behavior changes, including data migrations (dual-write, backfill, mixed-version, rollback). Use after change-impact analysis and before approval when a change can break callers, consumers, persisted data, or external integrations. Produces the current contract, compatibility matrix, consumer test cases, migration checks, and verification commands without modifying code.
---

# Contract Regression Testing

Translate a proposed contract change into observable regression checks. This skill is analysis-only before approval: do not edit implementation or tests. The calling agent owns approval and implementation.

## When to Use

Use after `change-impact-analysis` when the requested change affects an externally observable contract:

- HTTP/API request or response shape, status, headers, or error format
- database schema, migration behavior, serialized or persisted data
- events, queues, webhooks, messages, or CLI output
- configuration files, environment variables, public types, or generated clients
- compatibility with mobile, browser, plugin, or third-party consumers

Do not use for an internal refactor with no observable behavior change, or for a bug whose contract is unchanged. Use `bug-flow` and systematic debugging for those cases.

## Procedure

1. Read the existing change-impact analysis and project truth from `.ai/docs` when present.
2. State the old and proposed contract as examples or assertions. Include valid, invalid, boundary, and backward-compatibility cases.
3. Inventory contract producers and consumers: implementation, serializers/parsers, schemas, generated clients, fixtures, integration tests, documentation, migrations, and known external consumers.
4. Identify the compatibility mode:
   - **non-breaking** — old valid inputs and consumer expectations remain valid;
   - **additive** — new optional fields/capabilities only, with old consumers still valid;
   - **conditionally breaking** — compatibility depends on version, feature flag, rollout, or migration state;
   - **breaking** — old callers or persisted data require coordinated change.
5. Build a matrix mapping each affected consumer to the old expectation, new expectation, regression risk, test level, and migration action.
6. Define the smallest verification set. Prefer contract tests at the boundary, then focused integration tests, then the full relevant suite. Include rollback and mixed-version checks for breaking or conditional changes.
7. Separate tests that should fail before implementation from tests that prove compatibility after implementation. Do not invent a passing result.

## Required Checks

For every affected surface, consider the applicable checks:

- old request/input remains accepted or is rejected with the documented error;
- new request/input is accepted with the intended semantics;
- response/output shape, types, defaults, ordering, and error/status behavior;
- unknown, missing, null, empty, malformed, and boundary values;
- old consumer against new producer and new consumer against old producer;
- serialization round-trip and persisted records across migration versions;
- event/webhook payload compatibility and retry/idempotency behavior;
- generated client, SDK, fixture, snapshot, documentation, and schema alignment;
- authorization and sensitive-data exposure when the contract crosses a trust boundary.

Do not require every check for every change. Mark each as `required`, `recommended`, or `not applicable` with a reason.

## Data-Migration Checklist

Use this section when the change involves persisted data movement or transformation — database upgrades (e.g. MySQL 5.7 → 8), schema rebuilds, column splits/merges, encoding changes, backfills, or storage engine swaps. Each phase below must have an explicit answer in the output; "not applicable" requires a reason.

1. **Dual-write** — during transition, is the new shape written alongside the old? Define: which writer, which reader, and the invariant that both shapes stay consistent. Include a check that detects divergence (reconciliation query or checksum).
2. **Backfill** — how does historical data reach the new shape? Define: batch size, idempotency (re-running a batch must not corrupt), resumability after interruption, and a completion proof (row counts / checksum before vs after).
3. **Mixed-version** — while old and new code run simultaneously (rolling deploy), both must read both shapes. Include: old-code-reads-new-data case and new-code-reads-old-data case. If either fails, the rollout needs a flag or a stop-the-world step — say which.
4. **Rollback** — the migration must be reversible or explicitly declared irreversible with user approval. Define: what happens to data written in the new shape if we roll back, and the restore path (backup, reverse migration, dual-read tolerance).
5. **Cutover criteria** — the observable conditions that authorize switching readers to the new shape (backfill complete + reconciliation clean + mixed-version window elapsed).

Phase ordering is fixed: dual-write → backfill → mixed-version verification → cutover → old-shape cleanup. A plan that skips a phase must justify the skip in the output.

## Output Format

Return this labeled structure to the calling agent:

```markdown
**Contract surface:** <API|schema|event|serialization|config|CLI|multiple>

**Current contract:** <precise examples/assertions with evidence>

**Proposed contract:** <precise target examples/assertions>

**Compatibility:** non-breaking|additive|conditionally breaking|breaking — <reason>

**Consumer matrix:**
| Consumer / producer | Old expectation | New expectation | Risk | Test level | Migration action |
|---|---|---|---|---|---|
| <path or external consumer> | <...> | <...> | <...> | contract/integration/unit | <...> |

**Regression cases:**
- [required|recommended|n/a] <case> — <expected assertion and reason>

**Mixed-version / rollback checks:** <cases, or n/a with reason>

**Data-migration phases:** <dual-write / backfill / mixed-version / rollback / cutover answers per the checklist, or n/a with reason>

**Knowledge impact:** <affected .ai/docs paths and VERIFY_ONLY|UPDATE|CREATE|none>

**Implementation gate:** <what must be true before approval or implementation>

**Verification commands:** <exact commands or command families; no claimed results>

**Out of scope:** <adjacent consumers or tests not covered>
```

Every current-state claim must cite a file, symbol, schema, test, or external contract actually inspected. If an external consumer is only reported by the user, label it as an assumption and add a discovery or compatibility check.

## Boundaries

- Never edit code, tests, schemas, migrations, or documentation.
- Never silently choose a compatibility policy for a breaking change; surface it to PatchPaw's approval gate.
- Do not duplicate the broader dependency/risk inventory from `change-impact-analysis`; add concrete observable assertions and test coverage.
- Do not report tests as passing unless the command was actually run and its output was observed.
