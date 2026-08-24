---
type: Reference
title: AI Hero capability disposition map
description: Mapping of AI Hero's canonical skills to PawCrew equivalents and phased adaptations.
x_wikiguy:
  knowledge_kind: Reference
  authority: descriptive
  verified_commit: b03bb67f05e9b1cff4363f0842caad5969d13616
  covers:
    - .opencode/skills/
    - .opencode/agent/
    - AGENTS.md
generated:
  by: lorecat
  at: 2026-08-24T08:47:25.988Z
---

## Purpose

This map prevents duplicate procedures while PawCrew adopts compatible AI Hero ideas. `retain` means PawCrew or Superpowers already owns the behavior; `adapt` means a PawCrew-native procedure is being added; `defer` means a later approved cohort may address it. It is descriptive, not a replacement for agent or skill contracts.

## Sources and attribution

- AI Hero catalog: https://www.aihero.dev/skills
- Canonical source repository: https://github.com/mattpocock/skills
- License: https://github.com/mattpocock/skills/blob/main/LICENSE (MIT)

Cohort 1 procedures are original PawCrew adaptations. They do not copy substantial upstream text; if a future change copies substantial upstream material, it must preserve the MIT copyright and permission notice.

## Terminology

- **Plan Record** is PawCrew's implementation-unit equivalent to a ticket.
- **Goal Record** is PawCrew's cross-session epic/decision-map equivalent.
- **Change Contract** is PawCrew's request-to-implementation bridge.
- Commands route; agents own authority; skills own reusable procedures; LoreCat owns durable project knowledge.

## Canonical dispositions

| AI Hero skill | Disposition | PawCrew owner or cohort | Rationale |
| --- | --- | --- | --- |
| `ask-matt` | retain | PawBuilder Intent Gate, PatchPaw classification, routing table | PawCrew routes by explicit primary-agent ownership rather than a second universal router. |
| `grill-me` | retain + adapt | Superpowers `brainstorming`; Cohort 1 `clarification` | Brainstorming owns design exploration; clarification adds only material-ambiguity triage. |
| `grill-with-docs` | retain | Superpowers `brainstorming`, LoreCat, domain work | Durable project knowledge already flows through LoreCat. |
| `grilling` | retain + adapt | Superpowers `brainstorming`; Cohort 1 `clarification` | Do not duplicate interview/design workflow; retain a narrow one-question primitive. |
| `wayfinder` | defer | Cohort 2 candidate | Goal Records cover persistence; decision-frontier mapping needs a dedicated later design. |
| `prototype` | defer | Cohort 2 candidate | Requires an explicit throwaway-artifact lifecycle and verification boundary. |
| `to-questionnaire` | adapt | Cohort 1 | External-stakeholder discovery questionnaire is not otherwise owned. |
| `to-spec` | retain | Superpowers `brainstorming` and `writing-plans`, PawBuilder | Existing approved design-to-plan flow is more tightly integrated with PDCA. |
| `to-tickets` | retain | PDCA Plan/Goal Records | Adding a ticket layer would create a second source of truth. |
| `implement` | retain | PawBuilder, `executing-plans`, TDD, verification | Existing approved implementation path already owns this work. |
| `tdd` | retain | Superpowers `test-driven-development`, `test-strategy`, `bug-flow` | Existing TDD and regression procedures are established. |
| `code-review` | retain | JudgeWhiskers and review dispatch rule | Existing reviewer target and security separation are explicit. |
| `resolving-merge-conflicts` | defer | Cohort 3 candidate | Conflict resolution is useful but needs a PawCrew-safe policy for irreversible Git actions. |
| `diagnosing-bugs` | retain | `bug-flow`, `systematic-debugging`, `incident-response`, performance investigation | Root-cause and regression procedures already exist. |
| `triage` | defer | Cohort 2 candidate | Backlog/issue-state machine is not yet a PawCrew-owned capability. |
| `domain-modeling` | defer | Cohort 2 candidate | Useful reusable vocabulary discipline, but must align with LoreCat authority. |
| `codebase-design` | defer | Cohort 2 candidate | Useful reference guidance; needs a boundary with existing architecture documents. |
| `improve-codebase-architecture` | defer | Cohort 2 candidate | Needs a scoped evidence/report workflow before adoption. |
| `research` | adapt | Cohort 1 | Adds bounded primary-source research with citation and fact/inference separation. |
| `teach` | defer | Cohort 3 candidate | Multi-session learning workspace is independent from core delivery workflow. |
| `handoff` | adapt | Cohort 1 | Adds requested temporary context transfer without replacing Goal Records or routing ownership. |
| `wait-what` | adapt | Cohort 1 | Adds a concise explanation-repair procedure. |
| `writing-for-agents` | adapt | Cohort 1 | Adds agent-facing document quality guidance complementary to `writing-skills`. |
| `setup-matt-pocock-skills` | defer | Cohort 3 candidate | Any project-workflow setup must be renamed and avoid Matt-specific tracker assumptions. |
| `wizard` | defer | Cohort 3 candidate | Human-only workflow guidance needs a scoped operational procedure. |

## Guardrails

- Do not create duplicate routing, ticket, diagnostics, upkeep, TDD, review, or bug-diagnosis skills while the listed owner remains applicable.
- LetMeowCook's autonomy contract controls questioning during execution; Cohort 1 adds no exception.
- Project knowledge changes remain subject to LoreCat reconciliation and validation.
- A future external tracker integration must wrap Plan Records rather than replace them.
