# PatchPaw Refs Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make PatchPaw's Request Classification a hard gate with observable output, extract Bug/CR Flows and the Delegation common core into `refs/` files loaded after classification, share the delegation ref across PatchPaw/PawBuilder/LetMeowCook, and make `refs/` reachable at runtime via install.sh.

**Architecture:** Three new ref files under `.opencode/agent/refs/` hold the extracted flow bodies (verbatim) and the delegation common core (delegate targets + Review Dispatch Rule + dispatch mechanics). The three primary agent prompts reference the refs by absolute runtime path `~/.config/opencode/agent/refs/<name>.md` and keep only per-agent Need mappings inline. install.sh gains one directory-level symlink so refs auto-propagate. `.ai/docs` gaps (refs mechanism, classification hard gate, install recursion) are filled via wiki tools.

**Tech Stack:** OpenCode agent prompts (markdown + YAML frontmatter), bash installer, LoreCat plugin tools (`wiki_save_concept`, `wiki_validate`, `wiki_sync`).

**Spec:** `.ai/superpowers/specs/2026-08-18-patchpaw-refs-extraction-design.md`

## Global Constraints

- Ref runtime path is exactly `~/.config/opencode/agent/refs/<name>.md` — every prompt instruction and doc must use this verbatim.
- Flow extraction is **verbatim** — only reformat for standalone use (heading level `##` → `#`, "below" → named section references). No semantic edits.
- Per-agent Need wording stays **inline** in each agent prompt; `refs/delegation.md` contains common core only (targets, Review Dispatch Rule, dispatch mechanics, lead-not-evidence).
- LetMeowCook's escalation ladder and dispatch mechanics paragraph stay inline; only one reference line is added.
- `.ai/docs` writes go **only** through wiki tools (`wiki_save_concept` then `wiki_sync`) — never direct file edits.
- Kit convention: Superpowers artifacts under `.ai/superpowers/` (already applied to this plan's location).
- Commit style: match repo history — imperative subject + detailed body explaining what and why.
- Frontmatter of the three agents must NOT change (model, permission, description stay as-is).
- Do not touch `.gitkeep` in refs/ — harmless, keeps empty-dir history if refs are ever emptied.

---

### Task 1: Baseline commit (spec + plan)

**Files:**
- Commit: `.ai/superpowers/specs/2026-08-18-patchpaw-refs-extraction-design.md`
- Commit: `.ai/superpowers/plans/2026-08-18-patchpaw-refs-extraction.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a clean git baseline so each implementation task is an isolated, reviewable commit.

- [ ] **Step 1: Verify working tree contains only expected untracked dirs**

Run: `git status --short`
Expected: only `?? .ai/superpowers/specs/`, `?? .ai/superpowers/plans/`, `?? .opencode/agent/refs/` (and nothing else unexpected).

- [ ] **Step 2: Commit spec + plan**

```bash
git add .ai/superpowers/specs/2026-08-18-patchpaw-refs-extraction-design.md .ai/superpowers/plans/2026-08-18-patchpaw-refs-extraction.md
git commit -m "Add PatchPaw refs-extraction design spec and implementation plan: classification hard gate (observable Classification: BUG | CHANGE REQUEST output), Bug/CR Flow extraction into .opencode/agent/refs/, shared delegation common core across PatchPaw/PawBuilder/LetMeowCook, install.sh refs/ directory symlink, .ai/docs gap fill"
```

---

### Task 2: Create `refs/delegation.md` (shared common core)

**Files:**
- Create: `.opencode/agent/refs/delegation.md`

**Interfaces:**
- Consumes: nothing.
- Produces: `~/.config/opencode/agent/refs/delegation.md` content (after Task 7 symlink) — referenced verbatim by patchpaw.md, pawbuilder.md, letmeowcook.md as `~/.config/opencode/agent/refs/delegation.md`.

- [ ] **Step 1: Write the file with exactly this content**

````markdown
# Delegation — Kit Common Core

Canonical delegate targets (order = dispatch priority):

1. **sherclaw** — code truth (where things live, current behavior, consumers, test coverage)
2. **lorecat** — project truth (.ai/docs: specs, architecture, ADRs, workflows)
3. **searchpurr** — external truth (upstream/library behavior, version compatibility)
4. **elderpaw** — judgement (hard debugging dead ends, subtle concurrency/security root causes)
5. **judgewhiskers** — review (code review, task review, re-review, whole-branch review)

## Review Dispatch Rule (overrides Superpowers skill text)

Superpowers skills `requesting-code-review` and `subagent-driven-development` instruct you to _"dispatch a `general-purpose` subagent"_. **This kit has no `general-purpose` agent** — opencode would fall back to `sherclaw`, whose prompt forbids opinions and ends review as a no-op.

**Rule:** when any Superpowers skill instructs dispatching a code reviewer, task reviewer, re-reviewer, or whole-branch reviewer, **always dispatch `subagent_type: "judgewhiskers"`** — never `general-purpose`, never `sherclaw`. Pass the review template (brief path, report path, diff/package path, BASE_SHA, HEAD_SHA, global constraints) exactly as the skill prescribes; only the `subagent_type` changes.

## Dispatch mechanics (opencode)

Dispatch via the `task` tool: `subagent_type` (agent name), `description` (3-5 words), `prompt` (self-contained: goal, context, constraints, expected output format).

- **Fresh context**: the subagent sees only your prompt, never this conversation. Include all needed context in the prompt itself.
- **One final message**: the subagent returns a single response and cannot clarify mid-flight. Specify exactly what to return: absolute paths, reproduction evidence, structured blocks.
- **Intent**: state explicitly whether the task is research-only or authorizes code changes.
- **Parallel**: independent investigations = multiple `task` calls in ONE message. Do not duplicate delegated work while waiting.
- **Resume**: pass the prior `task_id` to continue the same subagent session with its context intact.

A subagent report is a lead, not evidence. Verify the touched files and behavior yourself.
````

- [ ] **Step 2: Verify content markers**

Run: `grep -c "judgewhiskers\|Review Dispatch Rule\|lead, not evidence" .opencode/agent/refs/delegation.md`
Expected: a count ≥ 5 (canonical list 1 hit, rule heading 1, rule body 2, mechanics 0, lead-not-evidence 1 — exact count may vary; the point is all three markers present). Then run each individually:
`grep -q "### .*Review Dispatch Rule\|## Review Dispatch Rule" .../delegation.md && grep -q "subagent_type: \"judgewhiskers\"" .../delegation.md && grep -q "lead, not evidence" .../delegation.md && echo OK`
Expected: `OK`.

- [ ] **Step 3: Commit**

```bash
git add .opencode/agent/refs/delegation.md
git commit -m "Add shared delegation common core ref: canonical delegate targets (sherclaw/lorecat/searchpurr/elderpaw/judgewhiskers), Review Dispatch Rule (judgewhiskers dispatch override), generic dispatch mechanics, lead-not-evidence discipline. Loaded by PatchPaw/PawBuilder/LetMeowCook; per-agent Need wording stays inline."
```

---

### Task 3: Create `refs/bug_flow.md` and `refs/change_request_flow.md` (verbatim extraction)

**Files:**
- Create: `.opencode/agent/refs/bug_flow.md`
- Create: `.opencode/agent/refs/change_request_flow.md`
- Source (read-only): `.opencode/agent/patchpaw.md` lines 35-83

**Interfaces:**
- Consumes: nothing.
- Produces: the two flow refs that patchpaw.md (Task 4) will point to at `~/.config/opencode/agent/refs/bug_flow.md` and `~/.config/opencode/agent/refs/change_request_flow.md`.

- [ ] **Step 1: Write `bug_flow.md` with exactly this content**

````markdown
# Bug Flow

Loaded by PatchPaw after emitting `Classification: BUG`.

**Pre-approval — root cause + contract:**

```
Bug report
  → load systematic-debugging skill and follow its phases (root cause FIRST — Iron Law)
  → (in parallel) sherclaw for where it lives / consumers
  → impact analysis (what else depends on this behavior)
  → propose minimal fix → Change Contract (with recommended_flow + alternative_flows) → ASK USER → APPROVED + flow chosen
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

`brainstorming` is for fixes with genuine design choices. You may recommend `1-step` when the root-cause → single fix is unambiguous, but **the user may still override to `multi-step+brainstorming+planning`** at the approval gate — do not assume "the contract already specifies the change" settles whether exploration is wanted. When a "bug" widens into new behavior, route to Change Request Flow instead (read `~/.config/opencode/agent/refs/change_request_flow.md`).

Prefer a **root-cause fix**, not a symptom patch. If the root cause is out of scope, say so explicitly and propose the minimal correct scope.
````

- [ ] **Step 2: Write `change_request_flow.md` with exactly this content**

````markdown
# Change Request Flow

Loaded by PatchPaw after emitting `Classification: CHANGE REQUEST`.

```
Change request
  → LoreCat (project truth: affected specs/architecture/decisions/workflows)
  → sherclaw (current behavior, consumers)
  → change-request-impact (reconciles project truth + code truth)
  → change contract (see Change Contract in the PatchPaw prompt; includes recommended_flow + alternative_flows)
  → ASK USER (approve change + select flow)
  → APPROVED + flow chosen
  → implement via selected flow (per Flow Menu — same menu as Bug Flow)
  → verify
  → LoreCat AUTO SYNC (mandatory for approved Change Requests)
  → final report (includes Knowledge Sync section)
```

For non-trivial changes, load the `change-impact-analysis` skill and follow its output structure — it must include the knowledge impact (via LoreCat), not just implementation impact.

The same Flow Menu applies to Change Requests as to Bug Flow. A Change Request with multi-file scope, design choices, or behavior change should recommend `multi-step+brainstorming+planning`; a truly single-line CR may recommend `1-step`. The user may still override at the approval gate.
````

- [ ] **Step 3: Verify verbatim-extraction invariants**

Run:
```bash
cd <repo-root>
for s in "root cause FIRST — Iron Law" "PatchPaw recommends, the user disposes" "test-driven-development" "root-cause fix, not a symptom patch"; do grep -qF "$s" .opencode/agent/refs/bug_flow.md || echo "MISSING in bug_flow: $s"; done
for s in "LoreCat (project truth: affected specs/architecture/decisions/workflows)" "change-impact-analysis" "multi-step+brainstorming+planning" "LoreCat AUTO SYNC"; do grep -qF "$s" .opencode/agent/refs/change_request_flow.md || echo "MISSING in cr_flow: $s"; done
echo DONE
```
Expected: only `DONE` — no MISSING lines.

- [ ] **Step 4: Commit**

```bash
git add .opencode/agent/refs/bug_flow.md .opencode/agent/refs/change_request_flow.md
git commit -m "Extract PatchPaw Bug Flow and Change Request Flow into refs: verbatim content relocated from patchpaw.md with standalone reformatting only (## to # headings, 'below' rewritten to named PatchPaw sections, cross-flow pointer to the sibling ref). Loaded after classification replaces the inline sections."
```

---

### Task 4: Modify `patchpaw.md` — classification hard gate + flow refs + delegation ref

**Files:**
- Modify: `.opencode/agent/patchpaw.md`
  - `## Request Classification` (lines 26-33) → hard-gate version
  - `## Bug Flow` (lines 35-63) → one-line ref instruction
  - `## Change Request Flow` (lines 65-83) → one-line ref instruction
  - `## Delegation` (lines 163-189) → ref instruction + inline Need table; drop inline Review Dispatch Rule + Dispatch mechanics subsections (now in ref)

**Interfaces:**
- Consumes: `refs/bug_flow.md`, `refs/change_request_flow.md`, `refs/delegation.md` from Tasks 2-3 (referenced by runtime path `~/.config/opencode/agent/refs/<name>.md`).
- Produces: patchpaw.md whose Classification section is a hard gate with observable output format. Later tasks rely on this exact classification-line format: `Classification: BUG` / `Classification: CHANGE REQUEST`.

- [ ] **Step 1: Replace the `## Request Classification` section**

Read the file first. Replace the entire section (from `## Request Classification` through the paragraph ending `...has no root cause.`) with:

```markdown
## Request Classification (REQUIRED)

Before any other action, classify the request and output the classification as a single line:

- `Classification: BUG` — "broken", "error", "wrong result", "regression", "logged out unexpectedly"
- `Classification: CHANGE REQUEST` — "change X to Y", "make it return Z instead", "switch format"

Output the classification line first. Then read and follow the matching ref file:

- **BUG** → read `~/.config/opencode/agent/refs/bug_flow.md` and follow it
- **CHANGE REQUEST** → read `~/.config/opencode/agent/refs/change_request_flow.md` and follow it

Do not skip classification. Do not act before classifying. A change request is not automatically a debugging task — do not force systematic debugging onto a change that has no root cause.
```

- [ ] **Step 2: Replace the `## Bug Flow` section body**

Delete the whole section content (Pre-approval/Post-approval diagrams, Iron rule paragraph, ownership paragraph, brainstorming paragraph, root-cause paragraph) and replace the section with:

```markdown
## Bug Flow

After classifying as BUG, read `~/.config/opencode/agent/refs/bug_flow.md` and follow it.
```

- [ ] **Step 3: Replace the `## Change Request Flow` section body**

Delete the whole section content (flow diagram, change-impact-analysis paragraph, Flow Menu paragraph) and replace the section with:

```markdown
## Change Request Flow

After classifying as CHANGE REQUEST, read `~/.config/opencode/agent/refs/change_request_flow.md` and follow it.
```

- [ ] **Step 4: Replace the `## Delegation` section**

Delete the whole section — table, "lead, not evidence" line, `### Review Dispatch Rule (overrides Superpowers skill text)` subsection, `### Dispatch mechanics (opencode)` subsection — and replace with:

```markdown
## Delegation

Read `~/.config/opencode/agent/refs/delegation.md` for the common core (delegate targets, Review Dispatch Rule, dispatch mechanics). Then apply this per-agent Need mapping:

| Need                                                                                                                            | Delegate to       |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Where things live, current behavior, consumers, test coverage                                                                   | **sherclaw**      |
| Project truth — affected specs, architecture, ADRs, workflows                                                                   | **lorecat**       |
| Upstream/library behavior causing the bug, version compatibility                                                                | **searchpurr**     |
| Hard debugging dead ends, subtle concurrency/security root causes                                                               | **elderpaw**        |
| Code review, task review, re-review, whole-branch review (Superpowers `requesting-code-review` / `subagent-driven-development`)  | **judgewhiskers** |

A subagent report is a lead, not evidence. Verify the touched files and behavior yourself.
```

- [ ] **Step 5: Verify**

Run:
```bash
cd <repo-root>
grep -c "Classification: BUG\|Classification: CHANGE REQUEST" .opencode/agent/patchpaw.md   # expect: 2 (the two classification bullets)
grep -c "~/.config/opencode/agent/refs/" .opencode/agent/patchpaw.md                        # expect: 5 (2 in classification + 1 Bug Flow + 1 CR Flow + 1 Delegation)
grep -q "### Review Dispatch Rule" .opencode/agent/patchpaw.md && echo "FAIL: rule still inline" || echo "OK: rule moved to ref"
grep -q "### Dispatch mechanics" .opencode/agent/patchpaw.md && echo "FAIL: mechanics still inline" || echo "OK: mechanics moved to ref"
grep -qF "A subagent report is a lead, not evidence. Verify the touched files and behavior yourself." .opencode/agent/patchpaw.md && echo "OK: lead-not-evidence kept inline"
```
Expected: `2`, `5`, `OK: rule moved to ref`, `OK: mechanics moved to ref`, `OK: lead-not-evidence kept inline`.

Then read the full file to confirm: frontmatter unchanged; section order intact (First Action → Request Classification (REQUIRED) → Bug Flow → Change Request Flow → Knowledge Synchronization → Change Contract → Approval Contract → After Approval → Investigation Tooling → Delegation → Verification → Communication).

- [ ] **Step 6: Commit**

```bash
git add .opencode/agent/patchpaw.md
git commit -m "PatchPaw: enforce Request Classification as hard gate (single observable 'Classification: BUG | CHANGE REQUEST' line before any action, then load matching flow ref); replace inline Bug/CR Flow bodies with ref instructions; replace inline Delegation common core with refs/delegation.md reference keeping per-agent Need table and lead-not-evidence inline"
```

---

### Task 5: Modify `pawbuilder.md` — Delegation → ref + Need inline

**Files:**
- Modify: `.opencode/agent/pawbuilder.md` — `## Delegation` section (lines 96-126)

**Interfaces:**
- Consumes: `refs/delegation.md` from Task 2 (runtime path `~/.config/opencode/agent/refs/delegation.md`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Replace the `## Delegation` section**

Read the file first. Delete the whole section — table, elderpaw note, `### Review Dispatch Rule (overrides Superpowers skill text)` subsection (including the six-section note inside it), `### Dispatch mechanics (opencode)` subsection, bold lead-not-evidence line — and replace with:

```markdown
## Delegation

Read `~/.config/opencode/agent/refs/delegation.md` for the common core (delegate targets, Review Dispatch Rule, dispatch mechanics). Then apply this per-agent Need mapping:

| Need                                                                                                                            | Delegate to                                                    |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Project structure, similar features, conventions, symbols, data flows, test coverage                                            | **sherclaw**                                                   |
| Project truth — accepted specs, architecture docs, ADRs that bind the design                                                    | **lorecat** (subagent mode: returns evidence, never questions) |
| Official docs, dependency APIs, upstream behavior, external examples                                                            | **searchpurr**                                                  |
| Architecture trade-offs, material API/schema/security/concurrency decisions, suspiciously complex solutions                      | **elderpaw**                                                     |
| Code review, task review, re-review, whole-branch review (Superpowers `requesting-code-review` / `subagent-driven-development`)  | **judgewhiskers** (see Review Dispatch Rule)                   |

Consult elderpaw only when architectural judgement is genuinely useful — not for normal CRUD or obvious implementation details.

Structure delegation prompts with six sections: TASK, EXPECTED OUTCOME, REQUIRED TOOLS, MUST DO, MUST NOT DO, CONTEXT. Make success criteria observable.

**A subagent report is a lead, not evidence.** After delegation, verify the touched files and behavior yourself.
```

- [ ] **Step 2: Verify**

Run:
```bash
cd <repo-root>
grep -c "~/.config/opencode/agent/refs/delegation.md" .opencode/agent/pawbuilder.md   # expect: 1
grep -q "### Review Dispatch Rule" .opencode/agent/pawbuilder.md && echo "FAIL: rule still inline" || echo "OK: rule moved to ref"
grep -q "### Dispatch mechanics" .opencode/agent/pawbuilder.md && echo "FAIL: mechanics still inline" || echo "OK: mechanics moved to ref"
grep -qF "Structure delegation prompts with six sections" .opencode/agent/pawbuilder.md && echo "OK: six-section note kept"
grep -qF "**A subagent report is a lead, not evidence.**" .opencode/agent/pawbuilder.md && echo "OK: lead-not-evidence kept"
grep -qF "Consult elderpaw only when architectural judgement" .opencode/agent/pawbuilder.md && echo "OK: elderpaw note kept"
```
Expected: `1`, `OK: rule moved to ref`, `OK: mechanics moved to ref`, `OK: six-section note kept`, `OK: lead-not-evidence kept`, `OK: elderpaw note kept`. Frontmatter unchanged.

- [ ] **Step 3: Commit**

```bash
git add .opencode/agent/pawbuilder.md
git commit -m "PawBuilder: replace inline Delegation common core with refs/delegation.md reference; keep per-agent Need mapping, elderpaw judgement note, six-section delegation prompt note, and lead-not-evidence inline"
```

---

### Task 6: Modify `letmeowcook.md` — add delegation common-core reference line

**Files:**
- Modify: `.opencode/agent/letmeowcook.md` — one line added after the Dispatch mechanics paragraph (line 71, inside Autonomy Contract)

**Interfaces:**
- Consumes: `refs/delegation.md` from Task 2 (runtime path `~/.config/opencode/agent/refs/delegation.md`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Add the reference line**

After the paragraph starting `Dispatch mechanics (opencode): dispatch via the \`task\` tool...` (the paragraph ending `...Do not duplicate delegated work while waiting.`), insert as its own paragraph:

```markdown
See `~/.config/opencode/agent/refs/delegation.md` for the kit-wide delegation common core (Review Dispatch Rule applies when dispatching code review).
```

Change nothing else in the file.

- [ ] **Step 2: Verify**

Run:
```bash
cd <repo-root>
grep -c "~/.config/opencode/agent/refs/delegation.md" .opencode/agent/letmeowcook.md   # expect: 1
grep -cE "^[0-9]\. " .opencode/agent/letmeowcook.md | sort | uniq -c | head -1         # ladder intact (numbered items still present)
grep -qF "6. LAST RESORT: ask one precise question" .opencode/agent/letmeowcook.md && echo "OK: escalation ladder intact"
grep -qF "Dispatch mechanics (opencode): dispatch via the \`task\` tool" .opencode/agent/letmeowcook.md && echo "OK: mechanics paragraph intact"
```
Expected: `1`, ladder numbered items present, `OK: escalation ladder intact`, `OK: mechanics paragraph intact`. Frontmatter unchanged.

- [ ] **Step 3: Commit**

```bash
git add .opencode/agent/letmeowcook.md
git commit -m "LetMeowCook: reference kit-wide delegation common core ref (refs/delegation.md); escalation ladder and dispatch mechanics stay inline unchanged"
```

---

### Task 7: `install.sh` — refs/ directory symlink (test-first)

**Files:**
- Modify: `install.sh` — insert block after the `agent/*.md` symlink loop (after line 158, before the `command/*.md` loop)

**Interfaces:**
- Consumes: `.opencode/agent/refs/` directory from Tasks 2-3.
- Produces: runtime path `~/.config/opencode/agent/refs` (directory symlink) that all agent prompt instructions depend on.

- [ ] **Step 1: Capture the failing state (refs unreachable at runtime)**

Run: `ls ~/.config/opencode/agent/refs/ 2>&1 || echo "NOT_LINKED"`
Expected (before fix): `No such file or directory` or `NOT_LINKED` — this is the failure this task removes. If it unexpectedly exists as a symlink already, re-point is still handled by the new block (idempotent).

- [ ] **Step 2: Insert the symlink block**

Read install.sh first. Between the closing `done` of `for f in "$SRC"/agent/*.md; do ... done` and the `for f in "$SRC"/command/*.md; do` loop, insert exactly:

```bash
# Symlink the agent/refs/ directory (extracted prompt fragments loaded by agents post-classification).
# Directory-level symlink so any new ref file auto-propagates without editing install.sh.
if [[ -d "$SRC/agent/refs" ]]; then
  if [[ -L "$DEST/agent/refs" ]]; then
    ln -sfn "$SRC/agent/refs" "$DEST/agent/refs"
    updated=$((updated + 1))
  elif [[ -e "$DEST/agent/refs" ]]; then
    if [[ "$FORCE" == "--force" ]]; then
      rm -rf "$DEST/agent/refs"
      ln -sfn "$SRC/agent/refs" "$DEST/agent/refs"
      created=$((created + 1))
    else
      echo "CONFLICT: $DEST/agent/refs exists (not a symlink). Use --force to replace."
      conflicts=$((conflicts + 1))
    fi
  else
    ln -sfn "$SRC/agent/refs" "$DEST/agent/refs"
    created=$((created + 1))
  fi
fi
```

- [ ] **Step 3: Syntax-check the script**

Run: `bash -n install.sh && echo SYNTAX_OK`
Expected: `SYNTAX_OK`.

- [ ] **Step 4: Run install and verify the symlink**

```bash
cd <repo-root> && ./install.sh
ls -la ~/.config/opencode/agent/refs
```
Expected: install completes with `conflicts: 0`; `~/.config/opencode/agent/refs` is a symlink pointing to `.opencode/agent/refs`.

- [ ] **Step 5: Verify all three refs reachable at runtime path**

```bash
for f in delegation bug_flow change_request_flow; do
  head -1 ~/.config/opencode/agent/refs/$f.md
done
```
Expected:
```
# Delegation — Kit Common Core
# Bug Flow
# Change Request Flow
```

- [ ] **Step 6: Verify idempotency**

```bash
cd <repo-root> && ./install.sh 2>&1 | grep -E "updated symlinks|conflicts:"
```
Expected: second run reports `updated symlinks: 1` (the refs re-point) and `conflicts: 0`; exit code 0.

- [ ] **Step 7: Commit**

```bash
git add install.sh
git commit -m "install.sh: symlink agent/refs/ directory into ~/.config/opencode (directory-level, idempotent ln -sfn, --force replaces conflicting regular dir, conflict counted otherwise) — makes post-classification ref loading reachable at runtime for end-user projects"
```

---

### Task 8: `.ai/docs` sync via wiki tools

**Files:**
- Update via `wiki_save_concept`: `.ai/docs/architecture/crewkit-architecture.md`
- Update via `wiki_save_concept`: `.ai/docs/specs/agent-prompt-contract.md`
- Update via `wiki_save_concept`: `.ai/docs/workflows/installation.md`
- Then: `wiki_sync` with the three changed paths

**Interfaces:**
- Consumes: implementation HEAD from Tasks 2-7 (get SHA via `git rev-parse HEAD` for `verified_commit`).
- Produces: corpus consistent with implementation; `wiki_validate` passing.

- [ ] **Step 1: Get the verified commit SHA**

Run: `git rev-parse HEAD`
Expected: a 40-char SHA — use it as `verified_commit` in all three frontmatters below.

- [ ] **Step 2: Update `architecture/crewkit-architecture.md`**

Call `wiki_save_concept` with path `.ai/docs/architecture/crewkit-architecture.md`, `preserve_unknown: true`, frontmatter YAML = existing frontmatter with ONLY these changes: `verified_commit` → new SHA; `generated.date` → `2026-08-18` (today; likely unchanged). Body = existing body with exactly these three edits:

Edit A — PatchPaw main flow bullet (in `## Luồng chính`), replace:

```markdown
- **PatchPaw**: classify (bug vs change request) → sherclaw/LoreCat evidence → root cause / impact → change contract (recommended_flow + alternative_flows) → ⏸ approval (user chọn flow: 1-step | multi-step+brainstorming+planning) → implement theo flow đã chọn (Flow Menu) → verify → **LoreCat auto-sync** (bắt buộc cho change request)
```

with:

```markdown
- **PatchPaw**: classification hard gate (output `Classification: BUG | CHANGE REQUEST` trước mọi action) → load ref flow tương ứng (`~/.config/opencode/agent/refs/bug_flow.md` | `change_request_flow.md`) → sherclaw/LoreCat evidence → root cause / impact → change contract (recommended_flow + alternative_flows) → ⏸ approval (user chọn flow: 1-step | multi-step+brainstorming+planning) → implement theo flow đã chọn (Flow Menu) → verify → **LoreCat auto-sync** (bắt buộc cho change request)
```

Edit B — `## Editing conventions`, append one bullet:

```markdown
- Prompt fragments dùng chung (mode flows, delegation common core) sống trong `.opencode/agent/refs/` — agents đọc qua runtime path `~/.config/opencode/agent/refs/<name>.md` sau classification (PatchPaw hard gate) hoặc khi cần delegation; per-agent Need wording giữ inline trong prompt
```

Edit C — `## Mô hình cài đặt`, replace `symlink từng file vào \`~/.config/opencode/\` (agent, command, skill, plugin)` with `symlink từng file vào \`~/.config/opencode/\` (agent, command, skill, plugin) và symlink nguyên thư mục \`agent/refs/\``.

- [ ] **Step 3: Update `specs/agent-prompt-contract.md`**

Call `wiki_save_concept` with path `.ai/docs/specs/agent-prompt-contract.md`, `preserve_unknown: true`, frontmatter = existing with `verified_commit` → new SHA. Body = existing with exactly these two edits:

Edit A — `## 1. Phân tách core (bất khả xâm phạm)`, after the four existing bullets and before `Cấm:`, insert:

```markdown
- **Refs** (`.opencode/agent/refs/`) = prompt fragments load theo mode hoặc dùng chung: flows load sau classification (PatchPaw hard gate), delegation common core load theo nhu cầu; runtime path `~/.config/opencode/agent/refs/<name>.md` (symlinked bởi install.sh); per-agent wording (Need mapping) giữ inline trong prompt
```

Edit B — `## 6. Cấu trúc prompt`, replace the first bullet:

```markdown
- PawBuilder/PatchPaw: intent classification, outcome/evidence-first, approval contract tường minh, delegation policy, verification discipline
```

with:

```markdown
- PawBuilder/PatchPaw: intent classification (PatchPaw: classification hard gate — output `Classification: BUG | CHANGE REQUEST` trước mọi action rồi load ref flow tương ứng từ `refs/`), outcome/evidence-first, approval contract tường minh, delegation policy (common core trong `refs/delegation.md`, Need mapping inline), verification discipline
```

- [ ] **Step 4: Update `workflows/installation.md`**

Call `wiki_save_concept` with path `.ai/docs/workflows/installation.md`, `preserve_unknown: true`, frontmatter = existing with `verified_commit` → new SHA; `generated.date` → `2026-08-18`. Body = existing with exactly one edit — `## Các bước` step 2, replace:

```markdown
2. **Symlink từng file** (qua `link_one`):
   - Mọi `agent/*.md` → `$DEST/agent/`
```

with:

```markdown
2. **Symlink từng file** (qua `link_one`):
   - Mọi `agent/*.md` → `$DEST/agent/` (glob không đệ quy — không nhận subdirectory)
   - Cả thư mục `agent/refs/` → `$DEST/agent/refs` (directory-level symlink riêng — ref files auto-propagate; `--force` thay regular dir xung đột)
```

- [ ] **Step 5: Sync corpus indexes**

Call `wiki_sync` with changed_paths `[".ai/docs/architecture/crewkit-architecture.md", ".ai/docs/specs/agent-prompt-contract.md", ".ai/docs/workflows/installation.md"]`.

- [ ] **Step 6: Validate corpus**

Call `wiki_validate`.
Expected: no errors for the three updated documents.

- [ ] **Step 7: Commit**

```bash
git add .ai/docs
git commit -m "Sync .ai/docs to refs extraction: architecture (PatchPaw classification hard gate + ref loading, refs/ convention bullet, refs symlink in install model), agent-prompt-contract (refs layer in core separation, PatchPaw prompt structure), installation workflow (non-recursive agent glob + refs/ directory symlink); verified_commit refreshed"
```

---

### Task 9: Final end-to-end verification

**Files:**
- Read-only verification across all touched surfaces.

**Interfaces:**
- Consumes: everything from Tasks 2-8.
- Produces: verification evidence for the final report.

- [ ] **Step 1: Runtime path resolution check**

```bash
readlink ~/.config/opencode/agent/refs
grep -c "refs/bug_flow.md\|refs/change_request_flow.md\|refs/delegation.md" ~/.config/opencode/agent/patchpaw.md
grep -c "refs/delegation.md" ~/.config/opencode/agent/pawbuilder.md ~/.config/opencode/agent/letmeowcook.md
```
Expected: readlink prints the repo refs path; patchpaw count = 5 (through the symlink — proves installed prompts see the same file); pawbuilder = 1; letmeowcook = 1.

- [ ] **Step 2: Cross-file consistency — every referenced ref exists**

```bash
for ref in bug_flow change_request_flow delegation; do
  test -f ~/.config/opencode/agent/refs/$ref.md && echo "OK: $ref.md" || echo "FAIL: $ref.md"
done
```
Expected: three `OK` lines, zero `FAIL`.

- [ ] **Step 3: No dangling inline leftovers**

```bash
cd <repo-root>
grep -n "do not branch inline" .opencode/agent/patchpaw.md && echo "FAIL: flow body still in patchpaw" || echo "OK: flow body extracted"
grep -n "change-request-impact" .opencode/agent/patchpaw.md && echo "FAIL: CR flow detail still in patchpaw" || echo "OK: CR flow extracted"
```
Expected: `OK: flow body extracted`, `OK: CR flow extracted`.

- [ ] **Step 4: wiki corpus final state**

Confirm `wiki_validate` reports clean and `.ai/docs/index.md` + `log.md` reflect the three updated paths (wiki_sync did this in Task 8).

- [ ] **Step 5: Report**

Report per PatchPaw Communication contract: root delta, changed files, verification evidence, residual risk. Include mandatory Knowledge Sync section (spec §9 item 8: extraction is verbatim — no behavioral regression).

---

## Self-Review (completed during planning)

1. **Spec coverage:** §3.1→Task 4 Step 1; §3.2→Tasks 3-4; §3.3→Task 2; §3.4→Tasks 4-6; §3.5→Task 7; §3.6→Task 8; §9 verification plan→Tasks 7-9 steps. No gaps.
2. **Placeholder scan:** every step carries exact content or exact commands with expected output. No TBD/TODO.
3. **Consistency:** ref runtime path identical everywhere (`~/.config/opencode/agent/refs/`); classification-line format identical in Task 4 and Task 8 docs; the "5" expected in Task 4 Step 5 grep count matches the three instruction sites (2 classification + 2 flow sections + 1 delegation).
