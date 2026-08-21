# PatchPaw Refs Extraction — Design Spec

- **Date:** 2026-08-18
- **Agent:** PatchPaw
- **Status:** Approved (brainstormed)
- **Type:** Behavior change (prompt restructure + tooling)
- **Scope:** PatchPaw + PawBuilder + LetMeowCook prompt refactor; new `refs/` directory; install.sh symlink; `.ai/docs` sync

## 1. Goal

Optimize the PatchPaw agent prompt by:
1. Making **Request Classification a required reasoning step** (hard gate with observable output format).
2. Extracting **Bug Flow** and **Change Request Flow** into ref files under `.opencode/agent/refs/` that the agent reads after classification.
3. Extracting the **Delegation common core** (delegate targets, Review Dispatch Rule, dispatch mechanics) into a shared `refs/delegation.md` used across PatchPaw, PawBuilder, and LetMeowCook.

The user wants PatchPaw's prompt to dispatch into mode-specific ref files after a mandatory classification step, and to share the delegation logic across agents.

## 2. Background & Current State

### 2.1 PatchPaw prompt (`.opencode/agent/patchpaw.md`, 204 lines)

- `## Request Classification` (lines 26-33): advisory section, lists BUG vs CHANGE REQUEST keywords and routes, but does not enforce classification as a reasoning step, does not require an observable output, and does not prescribe reading a ref file.
- `## Bug Flow` (lines 35-63): inline flow owned by `systematic-debugging` skill.
- `## Change Request Flow` (lines 65-83): inline flow using LoreCat + sherclaw + `change-impact-analysis`.
- `## Delegation` (lines 163-189): table of 5 delegate targets + Review Dispatch Rule + dispatch mechanics.

### 2.2 PawBuilder prompt (`.opencode/agent/pawbuilder.md`)

- `## Delegation` (lines 96-126): near-identical table to PatchPaw. Same 5 delegate targets, same order. The `judgewhiskers` row is byte-identical; the Review Dispatch Rule body (lines 108-112) is verbatim identical. The other 4 Need rows use PawBuilder-specific wording. PawBuilder adds a "six-section delegation prompt" note (line 114) PatchPaw lacks.

### 2.3 LetMeowCook prompt (`.opencode/agent/letmeowcook.md`)

- No `## Delegation` heading. Delegation lives as a numbered escalation ladder (lines 62-70): direct tools → sherclaw → lorecat → searchpurr → elderpaw → question. Inline "Dispatch mechanics" paragraph (line 71). No Review Dispatch Rule (LetMeowCook cannot dispatch code review — `requesting-code-review` is denied in its frontmatter).

### 2.4 install.sh

Line 156-158 symlinks `agent/*.md` (non-recursive glob). The `refs/` subdirectory is **not** symlinked → any file placed under `.opencode/agent/refs/` would never reach `~/.config/opencode/` and would not be readable by the agent at runtime. This is a **blocker** for the ref-loading mechanism.

### 2.5 `.opencode/agent/refs/`

Empty except a placeholder `.gitkeep`. Untracked. No agent prompt references it.

### 2.6 `.ai/docs` corpus gaps (from LoreCat investigation)

- No document describes PatchPaw's prompt internal structure (Request Classification / Bug Flow / CR Flow / Delegation table).
- No document mentions `.opencode/agent/refs/` or a ref-loading mechanism (0 matches for "refs").
- `workflows/installation.md` describes "Mọi `agent/*.md`" symlink but does not state non-recursive behavior or how a subdirectory like `refs/` would be handled.

## 3. Requested State

### 3.1 PatchPaw — Request Classification becomes a hard gate

PatchPaw must classify every request before any other action and emit a single observable classification line, then read and follow the matching ref file:

```
Classification: BUG
```

or

```
Classification: CHANGE REQUEST
```

After emitting the line, PatchPaw reads `~/.config/opencode/agent/refs/bug_flow.md` or `~/.config/opencode/agent/refs/change_request_flow.md` respectively and follows the loaded flow.

### 3.2 Bug Flow and Change Request Flow become ref files

- `.opencode/agent/refs/bug_flow.md` — verbatim extraction of current `## Bug Flow` section body (lines 35-63), reformatted as a standalone flow document.
- `.opencode/agent/refs/change_request_flow.md` — verbatim extraction of current `## Change Request Flow` section body (lines 65-83), reformatted as a standalone flow document.

No semantic change to the flow contents. The sections in `patchpaw.md` are replaced by a one-line instruction pointing at the ref.

### 3.3 Delegation common core becomes a shared ref

- `.opencode/agent/refs/delegation.md` — the common core shared across PatchPaw, PawBuilder, LetMeowCook:
  - Canonical delegate target list (5 targets, dispatch order).
  - Review Dispatch Rule (overrides Superpowers skill text) — verbatim from current PatchPaw.
  - Dispatch mechanics (opencode) — generic 5 bullets, "self-contained: goal, context, constraints, expected output format".
  - "A subagent report is a lead, not evidence."
- Per-agent Need wording stays **inline** in each agent's prompt (table mapping Need → delegate), because Need phrasing is persona-specific.

### 3.4 PatchPaw / PawBuilder / LetMeowCook Delegation sections after refactor

- **PatchPaw** and **PawBuilder**: one instruction line referencing `refs/delegation.md`, followed by the per-agent Need-mapping table inline (preserving their persona-specific Need wording). PawBuilder keeps its "six-section delegation prompt" note inline.
- **LetMeowCook**: keeps the numbered escalation ladder inline (semantics: try-in-order, not a menu), keeps its inline "Dispatch mechanics" paragraph, adds one line referencing `refs/delegation.md` for the kit-wide common core (Review Dispatch Rule applies when dispatching code review — though LetMeowCook currently denies `requesting-code-review`).

### 3.5 install.sh symlinks the `refs/` directory

After the existing `agent/*.md` loop, install.sh creates a single directory symlink:

```
$DEST/agent/refs  →  $SRC/agent/refs
```

Idempotent via `ln -sfn`; `--force` replaces a conflicting regular directory; conflicts counted like other symlink operations. Directory-level symlink (not per-file) so any new ref file auto-propagates without an install.sh edit.

### 3.6 `.ai/docs` updates

- `architecture/crewkit-architecture.md`: PatchPaw main flow updated (classification hard gate → ref load); `.opencode/agent/refs/` added to the layout description.
- `specs/agent-prompt-contract.md`: §6 PatchPaw components updated — Request Classification is a required reasoning step, flows load from `refs/`, Delegation references shared `refs/delegation.md`.
- `workflows/installation.md`: symlink steps updated to include `agent/refs/` directory.

## 4. Non-Goals / Out of Scope

- Refactoring other PatchPaw sections (First Action, Approval Contract, Verification, etc.) into refs — only Request Classification, Bug/CR Flows, and Delegation are touched.
- Refactoring PawBuilder's or LetMeowCook's other sections into refs.
- Refactoring LoreCat's flat dispatch rule (different shape, only dispatches Sherclaw).
- Adding ref-loading to subagents (sherclaw/searchpurr/elderpaw/judgewhiskers) — they have no delegation authority.
- Writing an opencode plugin to auto-inject ref content into system prompt — explicit `read` tool call is the chosen mechanism.
- Changing `requesting-code-review` permission for LetMeowCook — out of scope; the Review Dispatch Rule reference is informational.

## 5. Design Decisions (from brainstorming)

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | LetMeowCook delegation normalize shape | Keep numbered escalation ladder inline + add 1-line reference to shared ref common core | Preserves try-in-order semantics (numbered = priority, not menu); shares only the stable common core; minimal change. |
| 2 | Request Classification enforce wording | Hard gate + observable output format (`Classification: BUG` / `Classification: CHANGE REQUEST` single line, then read ref) | Explicit, observable, testable. Forces the reasoning step to happen visibly before action. |
| 3 | Ref content boundary | `refs/delegation.md` = common core only (targets, Review Dispatch Rule, dispatch mechanics, lead-not-evidence). Per-agent Need wording stays inline. | Common core is the verbatim-identical part across PatchPaw/PawBuilder. Need phrasing is persona-specific; keeping it inline preserves framing. |

## 6. Architecture

### 6.1 File layout after change

```
.opencode/agent/
├── patchpaw.md          (modified — Classification hard gate, refs to flows + delegation)
├── pawbuilder.md         (modified — Delegation refs delegation.md)
├── letmeowcook.md         (modified — Delegation adds 1-line ref to delegation.md)
├── refs/
│   ├── bug_flow.md             (NEW — extracted from patchpaw.md)
│   ├── change_request_flow.md  (NEW — extracted from patchpaw.md)
│   └── delegation.md           (NEW — shared common core)
└── ... (other agents unchanged)
```

### 6.2 Ref-loading mechanism

- **Trigger**: PatchPaw emits classification line, then reads the matching flow ref. Delegation ref is read on demand when delegation is needed (PatchPaw/PawBuilder always need it for their Delegation section; LetMeowCook reads it lazily).
- **Path resolution**: `~/.config/opencode/agent/refs/<name>.md` (symlinked to the kit repo). In the kit repo itself, the same path resolves back to the repo file (the symlink target).
- **Tool**: opencode `read` tool. Adds 1 tool call per classification (flow ref) + 1 per delegation lookup. Acceptable overhead.
- **Failure mode**: if the ref file is unreachable (install.sh not run, symlink broken), `read` returns an error and the agent falls back to the inline behavior described in its prompt (the ref instruction line names what the ref contains, so the agent can still function with degraded fidelity). The install.sh change in §3.5 prevents this at install time.

### 6.3 Ref file contract

Each ref file is a self-contained markdown document. It must:
- Start with a `# <Title>` heading.
- Not depend on the calling agent's persona (common core only for `delegation.md`; flow refs are mode-specific but agent-agnostic — they describe the flow, not PatchPaw's identity).
- Be readable as a standalone instruction set.

## 7. Detailed Changes

### 7.1 `.opencode/agent/refs/bug_flow.md` (NEW)

Verbatim extraction of current patchpaw.md `## Bug Flow` section (lines 35-63), reformatted:
- Top-level `# Bug Flow` heading.
- Pre-approval / Post-approval subsections preserved.
- Iron rule, root-cause ownership, brainstorming guidance preserved verbatim.

### 7.2 `.opencode/agent/refs/change_request_flow.md` (NEW)

Verbatim extraction of current patchpaw.md `## Change Request Flow` section (lines 65-83), reformatted:
- Top-level `# Change Request Flow` heading.
- Flow steps + `change-impact-analysis` reference + Flow Menu reference preserved.

### 7.3 `.opencode/agent/refs/delegation.md` (NEW)

```markdown
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
```

### 7.4 `.opencode/agent/patchpaw.md` (modified)

Replace `## Request Classification` section (lines 26-33) with the hard-gate version (§3.1).

Replace `## Bug Flow` section (lines 35-63) with:

```markdown
## Bug Flow

After classifying as BUG, read `~/.config/opencode/agent/refs/bug_flow.md` and follow it.
```

Replace `## Change Request Flow` section (lines 65-83) with:

```markdown
## Change Request Flow

After classifying as CHANGE REQUEST, read `~/.config/opencode/agent/refs/change_request_flow.md` and follow it.
```

Replace `## Delegation` section (lines 163-189) with the reference + per-agent inline Need table (§3.4). Keep "A subagent report is a lead, not evidence" inline (it is in the ref, but agents should not have to read the ref to recall this — it is a one-line discipline).

### 7.5 `.opencode/agent/pawbuilder.md` (modified)

Replace `## Delegation` section (lines 96-126) with:
- One line: "Read `~/.config/opencode/agent/refs/delegation.md` for the common core (delegate targets, Review Dispatch Rule, dispatch mechanics). Then apply this per-agent Need mapping:"
- The per-agent Need table (preserve current pawbuilder Need wording, lines 98-104).
- Keep PawBuilder's "six-section delegation prompt" note (line 114) inline.
- Keep "A subagent report is a lead, not evidence" inline.

### 7.6 `.opencode/agent/letmeowcook.md` (modified)

In the Autonomy Contract section, after the numbered escalation ladder (lines 62-70) and the "Dispatch mechanics" paragraph (line 71), add one line:

```markdown
See `~/.config/opencode/agent/refs/delegation.md` for the kit-wide delegation common core (Review Dispatch Rule applies when dispatching code review).
```

No other LetMeowCook changes.

### 7.7 `install.sh` (modified)

After the `for f in "$SRC"/agent/*.md; do ... done` loop (line 156-158), insert:

```bash
# Symlink the agent/refs/ directory (extracted prompt fragments loaded by agents post-classification)
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

### 7.8 `.ai/docs` updates

- `architecture/crewkit-architecture.md`: update the PatchPaw main-flow bullet (classification hard gate → ref load; Bug/CR Flows now in refs; Delegation references shared ref). Add `.opencode/agent/refs/` to the layout.
- `specs/agent-prompt-contract.md` §6: update PatchPaw components — Request Classification is a required reasoning step with observable output; Bug/CR Flows are loaded from `refs/`; Delegation references shared `refs/delegation.md` with per-agent Need inline.
- `workflows/installation.md`: add the `agent/refs/` directory symlink step to the symlink list.

## 8. Risks & Mitigations

| Risk | Severity | Mitigation |
|------|----------|------------|
| install.sh not updated → refs/ unreachable at runtime | BLOCKER | install.sh change is part of this change; verified in verification plan. |
| Agent reads ref via `read` tool adds 1 tool call overhead per classification | LOW | Acceptable; the classification step already adds reasoning overhead. |
| Shared Delegation ref loses persona-specific Need wording if mis-applied | MEDIUM | Decision 3 keeps Need inline per-agent; ref contains common core only. |
| LetMeowCook escalation ladder semantics lost during normalize | MEDIUM | Decision 1 keeps ladder inline; only 1 reference line added. |
| Ref file path drift if install location changes | LOW | Path is `~/.config/opencode/agent/refs/` — the kit's standard install location, stable. |
| `.ai/docs` corpus gaps remain after change | MEDIUM | `.ai/docs` updates are part of this change and the Knowledge Sync phase. |

## 9. Verification Plan

1. **install.sh**: run `./install.sh` in the repo. Verify `~/.config/opencode/agent/refs/` is a symlink pointing to `$SRC/agent/refs`. Verify `ls ~/.config/opencode/agent/refs/` shows `bug_flow.md`, `change_request_flow.md`, `delegation.md`.
2. **Ref files reachable**: `cat ~/.config/opencode/agent/refs/bug_flow.md` and the other two succeed and show the expected content.
3. **PatchPaw prompt**: read modified `patchpaw.md`. Verify Request Classification is the hard-gate version with output format. Verify Bug/CR Flow sections are one-line ref instructions. Verify Delegation references the ref + has per-agent Need table inline.
4. **PawBuilder prompt**: read modified `pawbuilder.md`. Verify Delegation references the ref + has per-agent Need table inline + six-section note preserved.
5. **LetMeowCook prompt**: read modified `letmeowcook.md`. Verify escalation ladder intact + 1 reference line added.
6. **install.sh idempotency**: run `./install.sh` twice; second run should report `updated` for the refs symlink, no conflicts.
7. **`.ai/docs`**: `wiki_validate` passes for the three updated documents.
8. **No behavioral regression**: the extracted Bug/CR Flow content is verbatim from the original sections — no semantic change, only relocation.

## 10. Open Questions

None. All three design decisions resolved during brainstorming.

## 11. Success Criteria

- PatchPaw's Request Classification is a hard gate with observable output.
- Bug/CR Flows load from ref files after classification.
- Delegation common core shared across PatchPaw, PawBuilder, LetMeowCook via `refs/delegation.md`.
- `refs/` directory reachable at runtime via install.sh symlink.
- `.ai/docs` corpus gaps about refs/ and the classification hard gate are filled.
- No behavioral regression in flow or delegation semantics.