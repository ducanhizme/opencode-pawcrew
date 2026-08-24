# AI Hero Collaboration Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six collaboration-focused, AI Hero-inspired procedures to PawCrew without weakening its routing, approval, PDCA, review, or knowledge-governance controls.

**Architecture:** Add six focused project-local skills under `.opencode/skills/`; each owns one reusable procedure and declares its trigger, procedure, output, and boundary. Keep invocation decisions in existing primary prompts and preserve the existing command-only routing model. Record the full 25-skill adoption matrix as descriptive project knowledge through LoreCat tools.

**Tech Stack:** OpenCode Markdown skills and agents, PawCrew LoreCat tools, Node.js validation scripts, Superpowers workflow skills.

**Spec:** `.ai/superpowers/docs/specs/2026-08-24-ai-hero-collaboration-foundation-design.md`

## Global Constraints

- Do not alter `.opencode/command/`; commands remain routing-only.
- Do not modify LetMeowCook or grant an implementation-phase questioning path.
- Do not copy substantial Matt Pocock source text; use newly written procedures, so no MIT notice is required for copied content.
- Do not modify the user-owned `README.md` or `LICENSE` working-tree changes.
- Use LoreCat's sanctioned tools for all `.ai/docs/**` writes.
- Do not commit, amend, push, or publish unless the user explicitly requests it.

## File structure

- Create `.opencode/skills/clarification/SKILL.md`: material-ambiguity triage only.
- Create `.opencode/skills/research/SKILL.md`: bounded external-fact research and citations.
- Create `.opencode/skills/handoff/SKILL.md`: temporary, redacted handoff package.
- Create `.opencode/skills/to-questionnaire/SKILL.md`: stakeholder questionnaire generation.
- Create `.opencode/skills/wait-what/SKILL.md`: concise explanation repair.
- Create `.opencode/skills/writing-for-agents/SKILL.md`: agent-facing document quality procedure.
- Modify `.opencode/agent/pawbuilder.md`: replace inline clarification procedure with a narrow invocation trigger; add research trigger.
- Modify `.opencode/agent/patchpaw.md`: add post-classification clarification and external-fact research triggers.
- Modify `.opencode/agent/pawfessor.md`: route explanation repair and requested handoff to the two relevant skills if its permissions permit them.
- Modify `AGENTS.md`: update the project skill inventory and record the six additions without changing routing.
- Create `.ai/docs/references/ai-hero-capability-map.md` through `wiki_save_concept`: full canonical disposition matrix with sources and terminology mapping.

---

### Task 1: Record adoption matrix and delivery boundaries

**Files:**
- Create: `.ai/docs/references/ai-hero-capability-map.md`
- Modify: `AGENTS.md`
- Test: `wiki_validate`

**Interfaces:**
- Consumes: the 25 canonical AI Hero inventory and the approved design specification.
- Produces: a descriptive capability map used by future maintainers to prevent duplicate skills.

- [ ] **Step 1: Build the 25-row disposition matrix**

Use canonical names only. Mark `ask-matt`, `grill-me`, `grill-with-docs`, `grilling`, `to-spec`, `to-tickets`, `implement`, `tdd`, `code-review`, and `diagnosing-bugs` as retained equivalents, citing the exact PawCrew/Superpowers owner. Mark Cohort 1 as adapted: `research`, `handoff`, `to-questionnaire`, `wait-what`, and `writing-for-agents`; explain that `clarification` adapts the shared intent of AI Hero grilling rather than creating a second brainstorming flow. Mark all remaining canonical skills as deferred to later cohorts.

- [ ] **Step 2: Persist the map through LoreCat**

Call `wiki_save_concept` for `.ai/docs/references/ai-hero-capability-map.md` with `type: Reference`, descriptive authority, verified current HEAD, and the map body. Include source URLs for AI Hero's catalog and Matt Pocock's MIT-licensed repository. State that procedures in this cohort are original adaptations and contain no substantial copied source text.

- [ ] **Step 3: Update the public kit inventory**

In `AGENTS.md`, update the local-skill count from 22 to 28 and add the six exact skill names to the skills layout/list. Do not add commands or agents.

- [ ] **Step 4: Verify knowledge integrity**

Run: `wiki_validate`

Expected: the corpus validates; report any existing unrelated validation failure unchanged.

### Task 2: Add clarification and integrate it with feature/maintenance agents

**Files:**
- Create: `.opencode/skills/clarification/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`
- Modify: `.opencode/agent/patchpaw.md`
- Test: `node scripts/pawcrew-doctor.js`

**Interfaces:**
- Consumes: an ambiguous request after intent/classification is known.
- Produces: either a safe default interpretation or one precise decision question.

- [ ] **Step 1: Create valid skill metadata**

Create frontmatter with `name: clarification` and a description that triggers only when multiple plausible interpretations change the deliverable. Do not trigger for names, defaults, local implementation choices, or design exploration.

- [ ] **Step 2: Write the procedure**

Require exactly this order: state the interpretation that will be used if no response is needed; name the alternative and its deliverable impact; ask one precise question only if the difference is material. Add a stop condition: once intent is resolved, return to the owning agent's existing flow. State that Superpowers `brainstorming` owns ideation and product design.

- [ ] **Step 3: Write compatibility boundaries**

State that PatchPaw must classify BUG or CHANGE REQUEST before using the procedure. State that LetMeowCook is not a consumer: its autonomy contract governs questions and the skill must never justify an implementation-phase question. State that the skill cannot approve, plan, or edit.

- [ ] **Step 4: Narrow PawBuilder's inline rule**

Replace its current detailed Outcome First ambiguity sentence with a trigger to invoke `clarification`; retain the Destination, Constraints, and Stopping condition checklist unchanged.

- [ ] **Step 5: Add PatchPaw post-classification trigger**

After PatchPaw's classification requirement, add that it invokes `clarification` only when the requested behavior still has materially distinct interpretations. Do not change BUG/CHANGE REQUEST routing or its approval contract.

- [ ] **Step 6: Run structural validation**

Run: `node scripts/pawcrew-doctor.js`

Expected: no errors attributable to the new skill or prompt references.

### Task 3: Add bounded research procedure

**Files:**
- Create: `.opencode/skills/research/SKILL.md`
- Modify: `.opencode/agent/pawbuilder.md`
- Modify: `.opencode/agent/patchpaw.md`
- Test: `node scripts/pawcrew-doctor.js`

**Interfaces:**
- Consumes: a bounded factual question not answered by code or accepted project knowledge.
- Produces: cited findings with fact/inference separation and a recommendation for durable knowledge handling.

- [ ] **Step 1: Create valid skill metadata and trigger boundary**

Use `name: research`. Trigger when external facts materially affect a decision and repository evidence (Sherclaw) and project truth (LoreCat) do not answer it. Explicitly exclude quick dependency syntax lookups already handled by Context7 and unbounded browsing.

- [ ] **Step 2: Write the evidence procedure**

Require a one-sentence research question, source priority of official documentation/source first, bounded SearchPurr delegation for external work, citations for each material claim, and a separate `Facts`, `Inferences`, and `Open questions` output. Require redaction of credentials and unnecessary personal data.

- [ ] **Step 3: Define artifact ownership**

Require a reusable finding to be offered to LoreCat for `.ai/docs` persistence; otherwise return the cited result in chat. Prohibit direct writes to `.ai/docs` and prohibit treating Git recency as authority.

- [ ] **Step 4: Add narrow primary-agent triggers**

In PawBuilder, invoke research only after local/project evidence is insufficient and external facts affect design. In PatchPaw, invoke it only for verified upstream or dependency behavior after repository investigation. Retain existing SearchPurr/Context7 guidance.

- [ ] **Step 5: Run structural validation**

Run: `node scripts/pawcrew-doctor.js`

Expected: no errors attributable to the new skill or its agent references.

### Task 4: Add explicit temporary handoff procedure

**Files:**
- Create: `.opencode/skills/handoff/SKILL.md`
- Modify: `.opencode/agent/pawfessor.md`
- Test: `node scripts/pawcrew-doctor.js`

**Interfaces:**
- Consumes: a user-requested transfer or an unavoidable pause with context-loss risk.
- Produces: a redacted, temporary Markdown handoff that links durable artifacts.

- [ ] **Step 1: Create valid skill metadata**

Use `name: handoff`. Trigger only for explicit transfer to an agent, harness, session, or human, or when a user-approved pause would otherwise lose material context.

- [ ] **Step 2: Define the mandatory handoff format**

Require headings: `Destination`, `Current state`, `Decisions`, `Evidence`, `Next action`, `Verification status`, `Open risks`, and `Redactions`. Require absolute paths and exact commands where known. Link Plan, Goal, Run, and Check records instead of copying them.

- [ ] **Step 3: Define authority and storage rules**

State that the artifact is temporary, must follow an existing project convention, and otherwise must be returned in chat. It cannot silently transfer primary ownership, create a durable knowledge corpus, or contain secrets, credentials, tokens, or unnecessary personal data.

- [ ] **Step 4: Integrate Pawfessor only when permitted**

Confirm Pawfessor permits the `skill` tool. If it does, add a one-line trigger for explicit requested handoffs. If it does not, leave its prompt unchanged and document the restriction in the Run Log.

- [ ] **Step 5: Run structural validation**

Run: `node scripts/pawcrew-doctor.js`

Expected: no errors attributable to the new skill or Pawfessor change.

### Task 5: Add external-questionnaire and explanation-repair procedures

**Files:**
- Create: `.opencode/skills/to-questionnaire/SKILL.md`
- Create: `.opencode/skills/wait-what/SKILL.md`
- Modify: `.opencode/agent/pawfessor.md`
- Test: `node scripts/pawcrew-doctor.js`

**Interfaces:**
- `to-questionnaire` consumes a missing-decision brief and produces a recipient-ready questionnaire.
- `wait-what` consumes an unclear prior explanation and produces a concise re-explanation.

- [ ] **Step 1: Create `to-questionnaire`**

Use frontmatter `name: to-questionnaire`. Require the procedure to identify recipient, decision unlocked, minimum facts required, and response deadline only when provided by the user. Produce questions grouped by decision, mark optional context, and specify an expected response format. Prohibit it from replacing a single in-chat clarification question.

- [ ] **Step 2: Create `wait-what`**

Use frontmatter `name: wait-what`. Trigger only when the user says an explanation did not land or explicitly requests a simpler restatement. Require conclusion first, short concrete sentences, existing project vocabulary, and at most one example or analogy when it reduces ambiguity. Prohibit research, code edits, and project-knowledge mutation.

- [ ] **Step 3: Integrate Pawfessor's explanation-repair trigger**

Confirm Pawfessor permits `skill`. If so, add a one-line `wait-what` trigger for user-requested simplification. Preserve Pawfessor's read-only code boundary and evidence-first explanation procedure.

- [ ] **Step 4: Run structural validation**

Run: `node scripts/pawcrew-doctor.js`

Expected: no errors attributable to the two skills or Pawfessor reference.

### Task 6: Add agent-facing writing procedure

**Files:**
- Create: `.opencode/skills/writing-for-agents/SKILL.md`
- Test: `node scripts/pawcrew-doctor.js`

**Interfaces:**
- Consumes: a request to create or revise an agent prompt, skill, spec, workflow, or instruction document.
- Produces: a reader-oriented document with executable procedure and explicit completion criteria.

- [ ] **Step 1: Create valid skill metadata and boundaries**

Use `name: writing-for-agents`. Trigger on agent-facing documentation, not general user documentation. State that it complements Superpowers `writing-skills`, not replaces it; skill authoring still follows the existing skill-authoring procedure when applicable.

- [ ] **Step 2: Write the authoring checklist**

Require: identify reader/task; lead with context and authority boundary; distinguish mandatory steps from reference; use one source of truth; state inputs, outputs, failure modes, and completion evidence; remove stale, duplicated, and contradictory instructions. Require documentation ownership to remain with LoreCat for `.ai/docs`.

- [ ] **Step 3: Run structural validation**

Run: `node scripts/pawcrew-doctor.js`

Expected: no errors attributable to the new skill.

### Task 7: Validate the completed cohort and update PDCA artifacts

**Files:**
- Modify: `.ai/superpowers/runs/2026-08-24-ai-hero-principles-adoption.md`
- Create: `.ai/superpowers/checks/2026-08-24-ai-hero-collaboration-foundation.md`
- Modify: `.ai/superpowers/goals/2026-08-24-adopt-ai-hero-capabilities.md`
- Test: `node scripts/pawcrew-doctor.js`, `node scripts/test-lorecat-tools.js`, `wiki_validate`, `git diff --check`

**Interfaces:**
- Consumes: changed skills/prompts, validation output, and the approved Plan/Spec records.
- Produces: evidence-based completion state for Cohort 1 and a resumable goal transition.

- [ ] **Step 1: Inspect each changed Markdown file**

Check every new or modified skill for exact name/folder matching, a descriptive trigger, procedure, explicit boundaries, and no references to unavailable skills or agent tools. Run `comment-polish` on every changed skill and prompt file; preserve non-obvious constraints.

- [ ] **Step 2: Run validation commands**

Run: `node scripts/pawcrew-doctor.js && node scripts/test-lorecat-tools.js && git diff --check`

Expected: all commands exit 0. Then invoke `wiki_validate`; record its result separately because it is a tool call rather than a shell command.

- [ ] **Step 3: Dispatch code review**

Use `requesting-code-review` and dispatch the reviewer as `judgewhiskers`, following PawCrew's Review Dispatch Rule. Address any blocker or should-fix finding before creating the Check Record.

- [ ] **Step 4: Create the Check Record**

Create `.ai/superpowers/checks/2026-08-24-ai-hero-collaboration-foundation.md` with one PASS/FAIL evidence line for each Cohort 1 success criterion, the exact verification commands/results, review result, unexpected behavior, and residual risk. Reference the Plan Record at `.ai/superpowers/plans/2026-08-24-ai-hero-principles-adoption.md`.

- [ ] **Step 5: Update durable progress**

Append concise decisions, deviations, sources, and touched files to the Run Log. Update the Goal Record: mark Cohort 1 complete, list deferred Cohorts 2 and 3 as next steps, and keep the overall goal active.

- [ ] **Step 6: Report outcome without committing**

Report changed paths, verification evidence, residual risk, Plan/Check paths, and LoreCat knowledge-sync result. Do not create a commit, push, or publish.

## Plan self-review

### Spec coverage

- Six contracts: Tasks 2–6 each create the specified skill with trigger, procedure, boundary, and output rules.
- PawBuilder/PatchPaw/Pawfessor integration: Tasks 2–5 define exact limited prompt edits; LetMeowCook remains untouched by a global constraint.
- Knowledge ownership and 25-skill mapping: Task 1 persists the map through LoreCat.
- Verification and PDCA: Task 7 requires doctor, smoke test, diff check, wiki validation, review, Check Record, Run Log, and Goal update.

### Placeholder scan

No TBD/TODO markers, unspecified test actions, unnamed files, or ambiguous implementation steps remain.

### Interface consistency

All skill names match their target directories and the approved design: `clarification`, `research`, `handoff`, `to-questionnaire`, `wait-what`, and `writing-for-agents`.
