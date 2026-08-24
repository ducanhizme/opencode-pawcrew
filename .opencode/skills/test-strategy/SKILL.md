---
name: test-strategy
description: Choose the right test level for a change — unit/integration/E2E selection, characterization testing for legacy code without tests, and a flaky-test protocol. Use when adding, extending, or repairing automated tests, or before testing a legacy module with no coverage. Loaded by PawBuilder, PatchPaw, and LetMeowCook.
---

# Test Strategy

The failure modes this skill prevents: writing unit tests for behavior that
only exists at integration boundaries, editing legacy code with no safety net,
and "fixing" flaky tests by retrying them until green.

## Step 1 — Choose the test level

Match the level to where the behavior under test actually lives:

| Change type | Primary level | Notes |
|---|---|---|
| Pure logic, parsing, formatting, state machines | Unit | Fast, no I/O, no framework |
| Module + its real collaborators (DB, FS, HTTP client) | Integration | Use real or faithful fakes; contract at the boundary |
| API endpoint behavior (status, schema, auth) | Contract/API test | Pair with `contract-regression-testing` |
| User-visible flow across pages/services | E2E | Few, critical paths only |
| Concurrency, timing, idempotency | Integration with controlled stimulus | Unit tests cannot see races |

Rules of thumb:

1. Test at the boundary where the requirement is stated. "The API returns 429 when rate-limited" is an API-level test, not a unit test of the counter.
2. Prefer one integration test over five unit tests that mock the collaborator into meaninglessness.
3. E2E budget: only flows whose breakage a user would report. Everything else belongs lower.

## Step 2 — Characterization testing (legacy without tests)

When the target module has no tests and must be changed:

1. **Do not** write tests for how the code *should* behave. Write tests for how it *does* behave — including quirks. The goal is a tripwire, not a spec.
2. Run the module against representative inputs (real log samples if available, else constructed cases) and record actual outputs.
3. Encode those outputs as tests. Name them `characterization:` or mark them so reviewers know they describe current behavior, not desired behavior.
4. Only after the characterization suite is green may the change begin. Any red test during the change means behavior moved — decide explicitly whether that move is intended.
5. After the change lands, quirks that were intentionally fixed get their characterization test replaced by a proper assertion; quirks kept get a comment-free existence as characterization tests.

Dispatch Sherclaw to enumerate the module's entry points and callers before choosing characterization inputs — untested entry points are the ones that will bite.

## Step 3 — Flaky-test protocol

A test that fails intermittently is a bug in the test or a real race — never noise to silence.

1. **Quantify**: run the test N times (e.g. 50) and record the failure rate.
2. **Classify**:
   - Deterministic under isolation, flaky in suite → shared state / ordering / parallelism.
   - Flaky under isolation → timing, real I/O, or a genuine race in the code.
3. **Fix by cause**:
   - Shared state → isolate or reset state per test.
   - Timing → replace sleeps with explicit synchronization/wait-for-condition.
   - Real I/O → fake or sandbox it.
   - Genuine race → that is a product bug: route to `bug-flow`, do not patch the test.
4. **Forbidden**: raising retry counts, marking flaky tests skipped/xfail without a linked issue, asserting on loose ranges to absorb the flake.

## Rules

1. The test level is chosen by where the behavior lives, not by what is easiest to write.
2. Characterization tests describe *is*, not *ought* — never mix the two intents in one test.
3. A flaky test is quarantined only with an explicit linked reason; silent skip is a defect.
4. New coverage must fail when the behavior breaks — a test that cannot fail is decoration.
5. This skill decides *what* to test; the implementation still follows the agent's flow (TDD for PawBuilder, Change Contract for PatchPaw, outcome criteria for LetMeowCook).
