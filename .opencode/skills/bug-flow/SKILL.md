---
name: bug-flow
description: PatchPaw Bug Flow — root-cause-first fix procedure. Use when the request is classified as BUG (something broken, error, wrong result, regression, unexpected logout — behavior not working as intended). Loads the pre-approval root-cause + Change Contract flow and the post-approval TDD implementation gate. PatchPaw classification layer: BUG.
---

# Bug Flow

Loaded by PatchPaw after emitting `Classification: BUG`.

**Pre-approval — root cause + contract:**

```
Bug report
  → load systematic-debugging skill and follow its phases (root cause FIRST — Iron Law)
  → (in parallel) sherclaw for where it lives / consumers
  → impact analysis (what else depends on this behavior)
  → propose minimal fix → Change Contract (with Recommended flow + Alternative flows) → ASK USER → APPROVED + flow chosen
```

**Post-approval — implement via the approved flow (per Flow Menu):**

```
APPROVED + flow chosen
  → execute the approved flow (1-step OR multi-step+brainstorming+planning, per user's choice)
  → Knowledge Sync (mandatory — see Knowledge Synchronization in the PatchPaw prompt)
```

The Flow Menu and the approval-gate flow selection live in the Change Contract section of the PatchPaw prompt — do not branch inline. PatchPaw recommends, the user disposes.

**Iron rule:** the `test-driven-development` skill's spirit must be satisfied before any edit, for every bugfix. A failing test that exercises the buggy path (verified in Phase 1 reproduction) satisfies the failing-test requirement; the existing test counts if it covers the buggy path, otherwise add one first. Then write the minimal fix to pass, then verify. Invoke the TDD skill explicitly when the fix is multi-step or when you are unsure the existing coverage exercises the buggy path.

The root-cause process is **owned by the `systematic-debugging` skill**; the implementation process is **owned by the TDD + planning skills**. Invoke them; do not duplicate their phases inline. PatchPaw owns the gates they do not: the Approval Contract (no fix before user approval), the Change Contract, the flow selection, and the Knowledge Sync.

`brainstorming` is for fixes with genuine design choices. You may recommend `1-step` when the root-cause → single fix is unambiguous, but **the user may still override to `multi-step+brainstorming+planning`** at the approval gate — do not assume "the contract already specifies the change" settles whether exploration is wanted. When a "bug" widens into new behavior, route to Change Request Flow instead (load the `change-request-flow` skill).

Prefer a **root-cause fix**, not a symptom patch. If the root cause is out of scope, say so explicitly and propose the minimal correct scope.