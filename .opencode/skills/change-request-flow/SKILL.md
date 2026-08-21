---
name: change-request-flow
description: PatchPaw Change Request Flow — impact-analysis-first procedure. Use when the request is classified as CHANGE REQUEST (behavior change, format switch, API shape change, "change X to Y", alter existing behavior — not fix broken behavior). Loads the LoreCat + sherclaw + change-impact-analysis + Change Contract flow. PatchPaw classification layer: CHANGE REQUEST.
---

# Change Request Flow

Loaded by PatchPaw after emitting `Classification: CHANGE REQUEST`.

```
Change request
  → LoreCat (project truth: affected specs/architecture/decisions/workflows)
  → sherclaw (current behavior, consumers)
  → change-request-impact (reconciles project truth + code truth)
  → contract-regression-testing (when API/schema/event/serialization/config/CLI or external consumer contract is affected)
  → change contract (see Change Contract in the PatchPaw prompt; includes Recommended flow + Alternative flows)
  → ASK USER (approve change + select flow)
  → APPROVED + flow chosen
  → implement via selected flow (per Flow Menu — same menu as Bug Flow)
  → verify
  → LoreCat AUTO SYNC (mandatory for approved Change Requests)
  → final report (includes Knowledge Sync section)
```

For non-trivial changes, load the `change-impact-analysis` skill and follow its output structure — it must include the knowledge impact (via LoreCat), not just implementation impact.

The same Flow Menu applies to Change Requests as to Bug Flow. A Change Request with multi-file scope, design choices, or behavior change should recommend `multi-step+brainstorming+planning`; a truly single-line CR may recommend `1-step`. The user may still override at the approval gate.
