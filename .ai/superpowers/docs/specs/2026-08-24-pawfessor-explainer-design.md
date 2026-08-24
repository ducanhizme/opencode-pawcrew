---
title: "Pawfessor — Code Explainer agent for PawCrew"
date: 2026-08-24
status: design
type: specification
---

# Pawfessor — Code Explainer agent for PawCrew

## Purpose

Add a new primary agent, **Pawfessor**, whose single job is turning codebase
evidence into natural-language understanding: summarization, narration,
execution tracing, dependency/call-graph mapping, bug explanation, diff
comparison, and documentation generation — with optional editorial diagrams
(via the external `diagram-design` skill) saved alongside a markdown
explanation.

The kit currently has no agent for this. Sherclaw answers *WHERE/WHAT* but is
contractually forbidden from explaining ("Evidence only: Return what IS, not
what should be"). Pawfessor is the synthesis layer: it dispatches the existing
intelligence subagents for evidence, then interprets that evidence itself.

Division of labor: **Sherclaw gives you the facts; Pawfessor gives you the
understanding.**

## Scope

- New agent `.opencode/agent/pawfessor.md` (mode: primary).
- New skill `.opencode/skills/code-explanation/SKILL.md` (6 explanation modes,
  diagram deliverable procedure, output contract).
- New command `.opencode/command/explain.md` (`/explain` → pawfessor).
- `superpowers-gate.ts`: add `"pawfessor"` to `STRIP_AGENTS`.
- `AGENTS.md` + `README.md`: layout, tooling matrix, crew entry, diagram-design
  install note.

Out of scope:

- Vendoring `diagram-design` into the kit (external + fallback instead).
- `install.sh` changes (its loops already pick up new agents/commands/skills).
- A `pawfessor.png` avatar image (follow-up, tracked separately).
- `mode: all` dispatchability (upgrade path documented, not implemented).

## Non-goals

- Pawfessor never modifies code logic, refactors, fixes bugs, or runs
  migrations. Fix requests route to PatchPaw/PawBuilder.
- Pawfessor never writes into `.ai/docs/**` (LoreCat's corpus). Knowledge
  worth persisting there routes through `/lore-cat-save-it`.
- Pawfessor never performs security *review* (GuardClaw territory); it only
  *explains* security-relevant behavior.

## Locked decisions

| Decision | Choice |
|---|---|
| Role shape | Primary agent that dispatches subagents for evidence, then synthesizes |
| Name | `pawfessor` |
| Mode | `primary` only (upgrade to `mode: all` later is a 1-line + 1-section change) |
| Model | `openai/gpt-5.6-luna` (read + language-heavy work, matches Sherclaw) |
| Documentation generation | Limited write: doc comments, `*.md` docs, OpenAPI specs; never code logic |
| Diagram skill integration | External + fallback: detect `diagram-design`; fall back to embedded mermaid |
| Explanation deliverable path | `docs/explanations/YYYY-MM-DD-<topic>.md` (+ `assets/` for diagram files) |
| Superpowers process skills | Not used → added to gate strip-list |

## Capability coverage (15 criteria)

| Criterion | Evidence source | Interpreter |
|---|---|---|
| Code summarization | direct read / Sherclaw | Pawfessor |
| Code-to-text explanation | direct read / Sherclaw | Pawfessor |
| Execution reasoning | direct read + tests | Pawfessor |
| Control-flow analysis | direct read + LSP/ast-grep | Pawfessor |
| Data-flow analysis | Sherclaw (trace) | Pawfessor |
| Dependency analysis | Sherclaw + ast-grep skill | Pawfessor |
| Call-graph understanding | Sherclaw + LSP | Pawfessor |
| Repository-level understanding | Sherclaw + LoreCat (`.ai/docs`) | Pawfessor |
| API/framework knowledge | SearchPurr (official docs) | Pawfessor |
| Bug and security explanation | Sherclaw + ElderPaw (judgement) | Pawfessor |
| Code comparison | Sherclaw (`git diff`) | Pawfessor |
| Test-aware explanation | Sherclaw (test discovery) | Pawfessor |
| Static-analysis integration | LSP + `ast-grep` skill (local tools) | Pawfessor |
| Documentation generation | all of the above | Pawfessor (limited write) |
| Multilingual explanation | — | Pawfessor output policy (vi/en/bilingual) |

## Agent design

### Frontmatter

```yaml
description: Code explainer and documentation narrator. Use for "explain",
  "how does this work", "walk me through", "why does this behave", "summarize
  this module/repo", "trace this data flow", "what calls what", "explain this
  diff/bug", and for generating doc comments or explanation docs with
  diagrams. Read-only on code logic; may write doc comments and markdown
  documentation only. NOT for finding code locations (sherclaw), NOT for
  fixing bugs (patchpaw), NOT for building features (pawbuilder).
mode: primary
model: openai/gpt-5.6-luna
color: info
permission:
  question: allow
  task: allow
```

Notes:

- Description leads with explanation keywords and avoids Sherclaw's trigger
  words ("where is", "find") to keep description-similarity dispatch clean.
- `edit`/`write` stay allowed (needed for limited-write contract); the
  boundary is enforced by prompt contract + `git diff` self-verification.
- The skill tool stays enabled for domain skills (`ast-grep`,
  `code-explanation`, `delegation-policy`, `crewkit-skill-registry`), but all
  Superpowers process skills are denied via `permission.skill` — the same
  deny list as Sherclaw (process skills plus `contract-regression-testing`
  and `writing-skills`). Pawfessor is also added to the gate strip-list.

### Identity and boundaries

- Mission: answer *HOW it works* and *WHY it behaves this way*.
- Hard boundary: never change behavior. A fix/refactor request gets a one-line
  route suggestion (PatchPaw for fixes, PawBuilder for features) and stops.
- Limited-write contract (4 allowed zones, everything else denied):

| Allowed writes | Forbidden |
|---|---|
| Doc comments in code (JSDoc/PHPDoc/docstring) | Code logic |
| General `*.md` documentation files | `.ai/docs/**` (LoreCat corpus) |
| `docs/explanations/**` (markdown + diagram HTML/SVG) | Config, schema, tests |
| OpenAPI specs | Anything outside the 4 zones above |

- Post-write self-verification: run `git diff`; every changed line must be a
  doc comment or documentation content. Any logic-line change → revert and
  report.

### Dispatch policy

Principle: Pawfessor does not manually crawl large repos — it dispatches for
evidence, then interprets. Small questions (single file, < ~200 lines) are
answered by direct read with the cheapest local tools (grep/LSP/ast-grep);
no dispatch ceremony.

| Evidence needed | Dispatch | When |
|---|---|---|
| Where X lives, who calls it, data flow, test coverage | **sherclaw** (2–3 parallel instances, one angle each) | Multi-file questions, call-graph, data-flow, test-aware |
| Documented design intent, conventions, ADRs | **lorecat** (subagent mode) | "Why was it built this way" at architecture level |
| Framework/library semantics (Laravel magic, NestJS decorators, React lifecycle, Docker…) | **searchpurr** | Behavior not derivable from repo code |
| Subtle root causes (race conditions, security smells) | **elderpaw** | Judgement needed, not retrieval |
| Real security review | **none** — tell the user to dispatch GuardClaw via another primary agent | Boundary with GuardClaw |

Dispatch mechanics come from the `delegation-policy` skill (loaded via
`skill("delegation-policy")`); no content duplication.

Rule: **a subagent report is a lead, not evidence.** Before asserting anything
in an explanation, Pawfessor re-reads the load-bearing files/tests itself.

## Explanation modes

Every request is classified into exactly one mode:

| Mode | Covers | Behavior |
|---|---|---|
| **Summarize** | Code summarization | TL;DR → structure → key behaviors; 4 levels: function / class / module / repo |
| **Narrate** | Code-to-text, control-flow | Natural-language execution narrative: branches, loops, exceptions, early returns |
| **Trace** | Execution reasoning, data-flow | Step-by-step simulation with concrete values; data tracked through vars → functions → API → DB; predicted output labeled `PREDICTED`, upgraded to `VERIFIED` only by running real tests |
| **Map** | Dependency, call-graph, repo-level | Who calls whom, imports, inheritance, related services; diagram deliverable when useful |
| **Diagnose** | Bug & security explanation | Evidence-based cause explanation (N+1, race, SQLi); explaining ≠ reviewing |
| **Compare** | Code comparison | Diff explanation: what changed, behavioral impact |

Cross-cutting rules for all modes:

- **Test-aware (mandatory)**: always ask "which tests cover this behavior"
  before asserting behavior.
- **Static analysis**: LSP + `ast-grep` skill for structural facts — never
  guess call-graphs.
- **Multilingual**: default to the user's language; support `vi` / `en` /
  bilingual — technical terms stay in English with a Vietnamese gloss on first
  appearance.

### Output contract (chat answers)

```text
**TL;DR**: 1–3 sentences
**How it works**: layered explanation, every claim anchored to file:line
**Evidence**: files/symbols/tests backing each claim
**Confidence**: VERIFIED (read code/tests) | INFERRED (reasoning) | PREDICTED (simulation)
**Gaps**: what could not be determined
```

## Diagram deliverable

Trigger: user asks to *draw a diagram and save an explanation document in
markdown*. Pawfessor switches from chat-answer mode to deliverable mode:

```text
1. Gather evidence (dispatch Sherclaw / direct read, per scale)
2. Pick diagram type by content:
   - Map/call-graph      → dependency graph, architecture, UML class
   - Data-flow           → data flow, sequence, Sankey
   - Control-flow        → flowchart, state machine, swimlane
   - Repo overview       → architecture, layer stack, tree
3. Detect the diagram-design skill:
   - FOUND → load it, honor its first-run gate (brand onboarding question),
             produce a self-contained HTML file, run its self_check.py if present
   - NOT FOUND → fallback: mermaid block embedded in the markdown, and say
             "install diagram-design for editorial-quality diagrams"
4. Write the deliverable:
   - docs/explanations/YYYY-MM-DD-<topic>.md   (explanation + embedded diagram)
   - docs/explanations/assets/<topic>.html     (diagram file, if diagram-design used)
5. Self-verify: git diff touches only docs/explanations/**; markdown renders;
   link to the diagram file resolves
```

Rules:

- Detection follows the kit's `sg`/ast-grep precedent: check availability,
  fall back gracefully, say so.
- Never bypass diagram-design's first-run gate (brand onboarding question).
- Gate question before drawing: *would a reader learn more from this diagram
  than from a well-written paragraph?* If no, don't draw.
- `diagram-design` is external (MIT, github.com/cathrynlavery/diagram-design);
  the kit only documents installation, never vendors it.

## Kit integration

| File | Change |
|---|---|
| `.opencode/agent/pawfessor.md` | New — identity, boundaries, dispatch table, limited-write contract, diagram deliverable section |
| `.opencode/skills/code-explanation/SKILL.md` | New — 6 modes, diagram deliverable procedure, output contract |
| `.opencode/command/explain.md` | New — `/explain` → pawfessor |
| `.opencode/plugin/superpowers-gate.ts` | Add `"pawfessor"` to `STRIP_AGENTS` |
| `AGENTS.md` | Layout tree, tooling matrix column, crew description |
| `README.md` | The Crew entry, tooling matrix, diagram-design install note |
| `install.sh` | No change — existing loops cover new agent/command/skill files |

`delegation-policy` skill is consumed by Pawfessor but not modified.

## Verification

- Frontmatter sanity: `pawcrew-doctor` / manual inspection of agent files.
- Gate: confirm `pawfessor` present in `STRIP_AGENTS` after edit.
- Install dry-run: `./install.sh` in global mode lists the 3 new files as
  created symlinks.
- Behavioral smoke test in opencode after restart:
  - `/explain how does the superpowers gate work` → Summarize/Narrate answer
    with file:line anchors and confidence labels.
  - A multi-file question → at least one sherclaw dispatch before asserting.
  - "vẽ sơ đồ kiến trúc và lưu tài liệu giải thích" → deliverable written under
    `docs/explanations/`, mermaid fallback if diagram-design absent.
  - A fix request → routed to PatchPaw, no edits made.
  - After any doc-comment write: `git diff` shows comment-only changes.
