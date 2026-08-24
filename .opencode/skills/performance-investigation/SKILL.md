---
name: performance-investigation
description: Structured performance investigation — baseline, profile, hypothesize, measure, fix gate. Use when a symptom is slowness, high CPU/memory, slow startup, slow query, or latency regression (API chậm sau deploy, query gây CPU 100%, app khởi động chậm). Loaded by PatchPaw and LetMeowCook before any performance fix.
---

# Performance Investigation

Performance work fails when the fix is chosen before the bottleneck is proven.
This skill enforces the order: **baseline → profile → hypothesize → measure →
fix gate**. No code change is authorized until a measurement shows where time
is actually spent.

## When to load

- Latency regression ("API chậm sau deploy", "endpoint P95 tăng").
- Resource saturation (CPU 100%, memory growth, connection pool exhaustion).
- Slow startup / slow build / slow page load.
- Any fix proposal that begins with "maybe cache it" — that is a hypothesis, not a diagnosis.

## Phase 1 — Baseline

Before touching anything, capture the current state so improvement is provable:

1. Define the metric and the workload: `P95 latency of GET /x under N rps`, `cold start time`, `query runtime on dataset D`.
2. Record the number with the command or tool used (profiler output, `time`, APM query, `EXPLAIN`).
3. Record the environment (local/staging/prod, data size, concurrency).

A baseline without the workload description is not a baseline.

## Phase 2 — Profile

Measure before guessing. Pick the cheapest probe that covers the suspect layer:

| Suspect layer | First probe |
|---|---|
| Database | slow query log, `EXPLAIN ANALYZE`, N+1 detection (ORM query log) |
| Application CPU | language profiler (py-spy, pprof, perf, `--prof`) |
| Memory | heap snapshot / allocation profiler |
| I/O / network | request tracing, connection counts, DNS/TLS timing |
| Frontend | Lighthouse / DevTools performance trace, bundle analysis |
| Startup | timed import/init tracing |

Dispatch Sherclaw for code-level evidence (hot loops, missing indexes usage,
synchronous calls in request path). Dispatch SearchPurr only when the profiler
output points at a library/runtime behavior that needs external docs.

## Phase 3 — Hypothesize

Write each hypothesis as a falsifiable statement:

```text
H1: The /orders endpoint runs one query per row (N+1) → expect query count ≈ row count in ORM log.
H2: Cold start is dominated by module X import → expect import time > 50% of startup trace.
```

Rank by (likelihood × impact). Test the top one first. Never batch-fix multiple hypotheses at once — the measurement becomes unattributable.

## Phase 4 — Measure

For the chosen hypothesis:

1. Predict the observable signal if the hypothesis is true.
2. Run the probe.
3. Compare against the prediction. Confirmed → Phase 5. Refuted → next hypothesis, record the refutation in the Run Log.

Three refuted hypotheses without progress → consult ElderPaw with the full evidence trail (baseline, probes, refutations).

## Phase 5 — Fix gate

A fix is authorized only when:

1. The bottleneck is confirmed by measurement (not by reading code alone).
2. The fix targets the confirmed bottleneck.
3. A re-measurement plan exists: same metric, same workload as the baseline.

After the fix, re-run the baseline workload and record before/after numbers in
the Check Record. If the metric did not move materially, the fix was wrong or
incomplete — return to Phase 3, do not stack more fixes.

## Rules

1. No fix without a baseline number. "It feels faster" is not evidence.
2. One hypothesis per measurement cycle.
3. Profiler output (or equivalent measurement) is evidence; reading code is only hypothesis generation.
4. Cache additions, query rewrites, and async conversions are fixes, not diagnoses — they require the fix gate like everything else.
5. Record the environment with every number; a measurement without context is not reproducible.
6. This skill produces evidence and a fix proposal; the actual change still goes through the agent's normal approval flow (PatchPaw Change Contract / LetMeowCook outcome criteria).
