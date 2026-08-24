# Pawfessor — Code Explainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add Pawfessor, a primary agent that turns codebase evidence into natural-language understanding, plus its `code-explanation` skill, `/explain` command, and kit integration.

**Architecture:** Pawfessor is a synthesis layer — it dispatches the existing intelligence subagents (Sherclaw/LoreCat/SearchPurr/ElderPaw) for evidence, then interprets that evidence itself. Detailed procedure lives in the `code-explanation` skill; the agent prompt carries identity, boundaries, dispatch policy, and the limited-write contract. Diagrams use the external `diagram-design` skill with a mermaid fallback.

**Tech Stack:** OpenCode agent/command/skill markdown, one TypeScript plugin edit (`superpowers-gate.ts`), doc updates (`AGENTS.md`, `README.md`).

## Global Constraints

- Agent prompt = identity/authority/boundaries/delegation/approval/completion. Skill = reusable procedure. Never duplicate a workflow across both.
- Pawfessor never modifies code logic; limited-write zones only (doc comments, `*.md` docs, `docs/explanations/**`, OpenAPI). Never writes `.ai/docs/**`.
- Every active agent declares an explicit `model:` with provider prefix. Pawfessor uses `openai/gpt-5.6-luna`.
- Permission pattern rules: LAST matching rule wins — broad `"*"` first, narrow rules after.
- Pawfessor is added to the `superpowers-gate.ts` STRIP-list (it does not use Superpowers process skills).
- `diagram-design` is external (MIT) — documented, never vendored. Fallback = embedded mermaid.
- Explanation deliverables go to `docs/explanations/YYYY-MM-DD-<topic>.md` (+ `assets/`).
- No `install.sh` changes (its loops already pick up new agent/command/skill files).

---

### Task 1: `code-explanation` skill

**Files:**
- Create: `.opencode/skills/code-explanation/SKILL.md`

**Interfaces:**
- Produces: the procedure Pawfessor loads via `skill("code-explanation")` — six modes (Summarize/Narrate/Trace/Map/Diagnose/Compare), diagram deliverable steps, output contract.

- [x] **Step 1: Write the skill file** (full content in execution)
- [x] **Step 2: Verify** — `test -f .opencode/skills/code-explanation/SKILL.md` and frontmatter has `name: code-explanation`.

### Task 2: `pawfessor` agent

**Files:**
- Create: `.opencode/agent/pawfessor.md`

**Interfaces:**
- Consumes: `code-explanation` skill (Task 1), `delegation-policy` skill (existing).
- Produces: a `mode: primary` agent that `/explain` routes to.

- [x] **Step 1: Write the agent file** (frontmatter + body; `permission.skill` denies the 14 Superpowers process skills, same list as Sherclaw)
- [x] **Step 2: Verify** — frontmatter has `mode: primary`, `model: openai/gpt-5.6-luna`, and the skill deny list.

### Task 3: `/explain` command

**Files:**
- Create: `.opencode/command/explain.md`

**Interfaces:**
- Consumes: `pawfessor` agent (Task 2).

- [x] **Step 1: Write the command file** (`agent: pawfessor`, `$ARGUMENTS`)
- [x] **Step 2: Verify** — frontmatter has `agent: pawfessor`.

### Task 4: superpowers-gate strip-list

**Files:**
- Modify: `.opencode/plugin/superpowers-gate.ts` (STRIP_AGENTS set)

- [x] **Step 1: Add `"pawfessor"` to STRIP_AGENTS** (crewkit section)
- [x] **Step 2: Verify** — `rg '"pawfessor"' .opencode/plugin/superpowers-gate.ts` returns the entry.

### Task 5: AGENTS.md integration

**Files:**
- Modify: `AGENTS.md` (header summary, layout tree, tooling matrix, role note)

- [x] **Step 1: Update header counts/lists** (primary agents incl. PawPixel + Pawfessor, skills incl. code-explanation, commands incl. /explain)
- [x] **Step 2: Add to layout tree** (pawfessor.md, explain.md, code-explanation/SKILL.md)
- [x] **Step 3: Add Pawfessor column to tooling matrix**
- [x] **Step 4: Add Sherclaw-vs-Pawfessor role note**
- [x] **Step 5: Verify** — `rg -i pawfessor AGENTS.md` returns hits in each section.

### Task 6: README.md integration

**Files:**
- Modify: `README.md` (The Crew table, quick-start command table, tooling matrix, skills table, diagram-design note)

- [x] **Step 1: Add Pawfessor crew table** (primary agents; avatar pending — no broken image)
- [x] **Step 2: Add `/explain` to quick-start command table**
- [x] **Step 3: Add Pawfessor column to tooling matrix**
- [x] **Step 4: Add `code-explanation` to skills table + diagram-design install note**
- [x] **Step 5: Verify** — `rg -i pawfessor README.md` returns hits.

### Task 7: Whole-kit verification

- [x] **Step 1: Install dry-run** — `./install.sh` lists the 3 new files as created symlinks (global mode).
- [x] **Step 2: Cross-check** — `rg -l pawfessor .opencode` shows agent + command + gate; no stray references.
