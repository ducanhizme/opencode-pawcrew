---
name: incident-response
description: Production incident response — triage severity, mitigate first (rollback/feature flag), preserve evidence, then root cause, then postmortem hook into retrospective. Use when something is broken in production or staging (errors, outage, data corruption, security event), especially when the issue cannot be reproduced locally. Loaded by PatchPaw.
---

# Incident Response

An incident is not a bug fix. The order of operations is different:
**mitigate first, diagnose second.** Restoring service outranks finding the
root cause; preserving evidence outranks both once mitigation is underway.

## When to load

- Production errors, outage, degraded service, data corruption, security event.
- "Lỗi production, local không reproduce" — the classic case this skill exists for.
- Any report where users are currently affected.

If nothing is currently broken and the task is historical analysis, use `bug-flow` instead.

## Phase 1 — Triage

Classify severity in one line and state it explicitly:

| Severity | Definition | Response |
|---|---|---|
| SEV1 | Service down / data loss in progress | Mitigate immediately; notify user at every step |
| SEV2 | Degraded for a user segment | Mitigate soon; bounded investigation first |
| SEV3 | Errors visible but workaround exists | Evidence collection, then normal bug flow |

State the blast radius: who is affected, which flows, since when.

## Phase 2 — Mitigate first

Choose the cheapest reversible action that restores service:

1. **Rollback** the deploy that introduced the regression (check deploy timeline against incident start).
2. **Feature flag off** if the failing path is flagged.
3. **Scale / restart** only if the symptom is resource exhaustion and the cause is understood enough to know it is safe.
4. **Traffic shift / degrade gracefully** if available.

Mitigation is a proposal that still needs user approval unless the user has
pre-authorized it — PatchPaw's approval policy applies. State the mitigation,
its reversibility, and ask.

## Phase 3 — Preserve evidence

Before mitigation destroys the scene (restarts clear memory, rollbacks replace
the binary), capture what proves the root cause later:

- Error messages + stack traces with timestamps.
- Logs around the incident window (structured query if possible).
- Metrics: latency, error rate, saturation at incident start.
- Recent changes: deploys, config changes, migrations, dependency updates (dispatch Sherclaw for code-side, check deploy log for ops-side).
- A minimal reproduction input if one can be extracted from logs.

Store the evidence trail in the Run Log. Evidence collected but not written down is lost.

## Phase 4 — Root cause

Only after mitigation is in place (or explicitly declined):

1. Run `bug-flow` on the preserved evidence.
2. If the bug does not reproduce locally, work from the evidence differential: what differs between prod and local (data volume, config, version, concurrency, environment variables)?
3. Dispatch Sherclaw for code paths implicated by stack traces; SearchPurr for known issues in the exact dependency/runtime versions running in prod.

## Phase 5 — Postmortem hook

After resolution, if the incident is SEV1/SEV2 or revealed a process gap
(no alert, no rollback path, missing runbook), run the `retrospective` skill
and record: timeline, root cause, what detected it, what would detect it
earlier next time.

## Rules

1. Mitigate before diagnose. A perfect root cause found during an ongoing outage is a failure of prioritization.
2. Never destroy evidence to mitigate faster without capturing it first (logs, stack traces, process state).
3. Mitigation still requires approval per the agent's policy — except where the user has pre-authorized a specific action.
4. "Cannot reproduce locally" is an evidence problem, not a dead end: enumerate prod/local differentials explicitly.
5. Do not ship the permanent fix under incident urgency without the normal Change Contract — urgency authorizes mitigation, not unreviewed fixes.
6. Severity classification is stated once at triage and updated only with new evidence, not with pressure.
