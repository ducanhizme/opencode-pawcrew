---
type: Design
title: AI Hero collaboration foundation for PawCrew
description: Adapt six collaboration-oriented AI Hero procedures without changing PawCrew authority or delivery controls.
status: proposed
agent: pawbuilder
generated:
  by: pawbuilder
  at: 2026-08-24T00:00:00Z
x_wikiguy:
  knowledge_kind: Design
  authority: descriptive
  verified_commit: b03bb67f05e9b1cff4363f0842caad5969d13616
  covers:
    - .opencode/skills/clarification/SKILL.md
    - .opencode/skills/research/SKILL.md
    - .opencode/skills/handoff/SKILL.md
    - .opencode/skills/to-questionnaire/SKILL.md
    - .opencode/skills/wait-what/SKILL.md
    - .opencode/skills/writing-for-agents/SKILL.md
    - .opencode/agent/pawbuilder.md
    - .opencode/agent/patchpaw.md
---

## Purpose

Provide reusable collaboration procedures inspired by AI Hero while preserving PawCrew's established separation of authority: commands route, agents own identity and approval, skills own reusable procedures, and LoreCat owns durable project knowledge.

## Scope

This cohort adds six project-local skills. It does not add commands, agents, plugins, external integrations, or copies of Superpowers workflows. Procedures are newly written from functional requirements; no substantial source text is copied.

## Skill contracts

### `clarification`

**Trigger:** two plausible interpretations would materially change the requested deliverable.

**Procedure:** state the safe default interpretation, state the consequential alternative, then ask one precise question. If one interpretation is clearly safe and valid, proceed without asking.

**Boundary:** this is ambiguity triage, not ideation or product design. Once intent is clear, invoke Superpowers `brainstorming` when the work needs design exploration. It does not override PatchPaw classification or LetMeowCook's autonomy contract.

### `research`

**Trigger:** an answer depends on facts not established by repository evidence or project knowledge.

**Procedure:** formulate a bounded question; choose official/primary sources; delegate external research through SearchPurr when warranted; distinguish facts from inferences; cite sources; persist only durable project knowledge through LoreCat.

**Boundary:** not a replacement for Sherclaw (code truth), LoreCat (project truth), Context7 (quick official library lookup), or an unbounded web search. It produces a concise Markdown research note only when the finding will be reused.

### `handoff`

**Trigger:** the user asks to transfer work to another agent, harness, session, or human, or work must pause with meaningful context loss risk.

**Procedure:** write a temporary handoff artifact containing destination, current state, decisions, evidence, exact next action, verification status, and redaction of secrets. Link durable Plan/Goal/Check records instead of duplicating them.

**Boundary:** it never silently transfers primary-agent ownership, changes routing, or replaces PDCA Goal Records. The user remains responsible for selecting a new primary agent.

### `to-questionnaire`

**Trigger:** an external stakeholder or expert must supply missing facts before work can proceed.

**Procedure:** identify recipient, decision to unlock, and minimum information needed; draft concise questions grouped by decision; label optional context; include an expected response format.

**Boundary:** not a substitute for asking the user one clarification question. It generates an artifact for someone outside the active conversation.

### `wait-what`

**Trigger:** the user says a prior explanation was unclear or asks for a simpler restatement.

**Procedure:** preserve the original question, state the conclusion first, use short concrete sentences and established project vocabulary, then provide one example or analogy only if it reduces ambiguity.

**Boundary:** this is a communication repair; it does not repeat external research or mutate project knowledge.

### `writing-for-agents`

**Trigger:** creating or revising agent-facing prompts, skills, specs, workflow documents, or instructions.

**Procedure:** identify reader and task; place high-value context first; separate executable steps from reference; define success/failure conditions; point to one authoritative source; remove stale or redundant instructions.

**Boundary:** it complements, rather than replaces, Superpowers `writing-skills`, LoreCat's `.ai/docs` ownership, and the existing prompt/skill/command separation contract.

## Integration

- PawBuilder invokes `clarification` only at its existing Outcome First ambiguity trigger. It invokes `research` when external facts are material and no narrower evidence source applies.
- PatchPaw retains BUG/CHANGE REQUEST classification. It invokes `clarification` only after classification if ambiguity changes the requested behavior, and `research` only for verified external-dependency questions.
- Pawfessor may invoke `wait-what` for simplified restatements and `handoff` only when requested; its write boundary remains unchanged.
- LetMeowCook remains unchanged. Its autonomy contract governs questions and execution.
- LoreCat remains the exclusive writer of `.ai/docs`; the new skills link to it rather than writing there directly.

## Artifacts and data flow

The six skills write only requested, non-normative working artifacts under an existing project convention. When no convention exists, they return content in chat and recommend an artifact path rather than creating a new knowledge store. Durable product/project knowledge flows through LoreCat. Handoff artifacts may be temporary and must reference PDCA records rather than copy their content.

## Error handling

- Missing project convention: do not invent a permanent directory; return the result in chat or ask the owner only when the artifact location changes the deliverable.
- Conflicting sources: label the conflict and route normative-resolution questions to LoreCat.
- Sensitive material: redact secrets, credentials, private tokens, and unnecessary personal data before research or handoff artifacts.
- Unsupported request: state which existing owner/skill should handle it rather than approximating its procedure.

## Verification

- Every new `SKILL.md` has valid name/description frontmatter and explicit trigger/boundary sections.
- Primary prompt edits invoke only skills available to their permissions and preserve existing approval and autonomy language.
- A mapping document records all 25 AI Hero dispositions and documents the six Cohort 1 adaptations.
- `node scripts/pawcrew-doctor.js`, `node scripts/test-lorecat-tools.js`, and `wiki_validate` run successfully or any unrelated pre-existing failure is recorded.

## Non-goals

- Introducing an issue tracker, ticket synchronization, a new command, or a new primary agent.
- Replacing Superpowers brainstorming, plan execution, TDD, debugging, review, or skill-writing procedures.
- Copying the Matt Pocock skill text verbatim.
