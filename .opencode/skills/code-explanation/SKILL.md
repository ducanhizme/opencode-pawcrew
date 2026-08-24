---
name: code-explanation
description: Procedure for turning codebase evidence into natural-language understanding. Six modes (Summarize, Narrate, Trace, Map, Diagnose, Compare), evidence-gathering dispatch rules, diagram deliverables via the external diagram-design skill with mermaid fallback, and the limited-write documentation contract. Loaded by Pawfessor for any explanation, walkthrough, trace, diff explanation, or documentation-generation request.
---

# Code Explanation

The procedure behind Pawfessor. One rule above all: **explain from evidence,
never from memory.** Every claim in an explanation is anchored to a file,
symbol, test, or commit that you actually read this session.

## Step 0 — Classify the request

Pick exactly one mode before doing anything else:

| Signal in the request | Mode |
|---|---|
| "summarize", "what does this do", "overview of this module/repo" | **Summarize** |
| "explain", "how does this work", "walk me through" | **Narrate** |
| "what happens when", "trace this input", "predict the output", "what value does X have" | **Trace** |
| "what calls what", "dependencies", "where does data flow", "architecture of" | **Map** |
| "why does this bug happen", "explain this race/N+1/injection", "why is this slow" | **Diagnose** |
| "explain this diff", "what changed between", "compare these two implementations" | **Compare** |

If the request also asks to *save* the explanation as markdown (with or
without a diagram), this becomes a **deliverable** — see Diagram Deliverable
and Documentation Output below.

## Step 1 — Gather evidence (cheapest sufficient source first)

1. **Small scope** (single file or < ~200 lines, freshly read): read directly.
   Use grep/glob/LSP; use the `ast-grep` skill for structural facts
   (call shapes, signatures, handler patterns). No dispatch ceremony.
2. **Multi-file scope**: dispatch **sherclaw** — 2–3 parallel instances, one
   bounded angle each (e.g. "callers of X", "data flow through Y", "tests
   covering Z"). Follow the `delegation-policy` skill for mechanics.
3. **"Why was it built this way"** at architecture level: dispatch **lorecat**
   (subagent mode) for documented intent, conventions, ADRs in `.ai/docs`.
4. **Framework/library semantics** not derivable from repo code (Laravel
   magic methods, NestJS decorators, React lifecycle, Docker behavior):
   dispatch **searchpurr**.
5. **Subtle root causes** (race conditions, memory-model issues, security
   smells) where judgement matters: dispatch **elderpaw** with the evidence
   you already collected.

A subagent report is a lead, not evidence. Before asserting anything from a
report, re-read the load-bearing files/tests yourself.

## Step 2 — Run the mode

### Summarize

Four levels — pick the one requested, default to the smallest that fits:

- **Function**: purpose, inputs/outputs, side effects, failure modes.
- **Class**: responsibility, public surface, invariants, collaborators.
- **Module**: internal structure, exported API, consumers, key flows.
- **Repository**: purpose, top-level structure, entry points, major
  subsystems, build/run/test commands, conventions.

Structure: TL;DR → structure → key behaviors → notable risks or smells
(observed, not judged).

### Narrate

Tell the execution story in natural language, in execution order:

- Follow the actual control flow: branches, loops, exceptions, early returns.
- Name the decision points and what selects each branch.
- Quote the anchor line (`file:line`) at each significant step.
- Distinguish what the code *does* from what callers *expect*.

### Trace

Simulate execution with concrete values:

1. State the input assumptions explicitly.
2. Walk step by step, showing the evolving values of the variables that
   matter (a table works well).
3. Track data across boundaries: variable → function → API → database.
4. Label the predicted output `PREDICTED`. Upgrade to `VERIFIED` only by
   running the relevant test or the smallest real execution — and say which.

### Map

Produce the relationship picture:

- Call graph: who calls the target, what the target calls (LSP references +
  ast-grep for shape; never guessed).
- Dependencies: imports, inheritance, injected services, package/service
  boundaries.
- Data flow: where data enters, transforms, persists, exits.
- For repo-level maps, note conventions the structure implies.

Map mode is the natural trigger for a diagram — see Diagram Deliverable.

### Diagnose

Explain a bug or smell from evidence:

1. Reproduce the reasoning chain: symptom → mechanism → root cause.
2. Anchor each link: the line that misbehaves, the test that exposes it, the
   commit that introduced it (`git blame`/`git log`) when relevant.
3. Classify the mechanism precisely (N+1 query, race window, injection point,
   off-by-one, stale cache…).
4. Explaining ≠ fixing: end with what a fix would need to address, then route
   to PatchPaw. Never apply the fix.

### Compare

Explain differences between two implementations or a diff:

1. Identify the comparison axis (behavior, performance, structure, API).
2. For diffs: what changed, what stayed, and the behavioral impact of each
   hunk — not a line-by-line recital.
3. State which differences are semantic and which are cosmetic.

## Cross-cutting rules (all modes)

- **Test-aware (mandatory)**: before asserting behavior, ask which tests cover
  it. A claim backed by a passing test is stronger than one backed by reading
  alone — say which you have.
- **Static analysis over guessing**: LSP for symbols/references, the
  `ast-grep` skill for structural patterns. If `sg` is missing, fall back to
  grep+LSP and say so.
- **Confidence labels**: mark every substantive claim —
  `VERIFIED` (read the code/test ran) · `INFERRED` (reasoning from evidence) ·
  `PREDICTED` (simulation, not executed).
- **Multilingual**: answer in the user's language by default. Support `vi`,
  `en`, or bilingual on request. Keep technical terms in English; gloss them
  in Vietnamese on first appearance when answering in Vietnamese.
- **Gaps are content**: what could not be determined belongs in the answer,
  not in a footnote.

## Output contract (chat answers)

```text
**TL;DR**: 1–3 sentences
**How it works**: layered explanation, every claim anchored to file:line
**Evidence**: files/symbols/tests backing each claim
**Confidence**: VERIFIED | INFERRED | PREDICTED per substantive claim
**Gaps**: what could not be determined
```

Scale the sections to the question — a one-function answer needs no ceremony.

## Diagram Deliverable

Trigger: the user asks to draw a diagram and save the explanation as
markdown. Before drawing, ask: *would a reader learn more from this diagram
than from a well-written paragraph?* If no, write the paragraph and skip the
diagram.

Procedure:

1. Gather evidence per Step 1.
2. Pick the diagram type by content:

   | Content | Diagram types |
   |---|---|
   | Call graph / module map | dependency graph, architecture, UML class |
   | Data flow | data flow, sequence, Sankey |
   | Control flow | flowchart, state machine, swimlane |
   | Repo overview | architecture, layer stack, tree |
   | Schema / entities | ER, database schema |

3. Detect the `diagram-design` skill (via `crewkit-skill-registry` or the
   skill directories):
   - **Found** → load it and follow it: honor its first-run gate (brand
     onboarding question — never bypass), produce the self-contained HTML
     file, run its `self_check.py` when available.
   - **Not found** → fall back to a mermaid block embedded in the markdown,
     and say once: "Install `diagram-design` for editorial-quality diagrams."
4. Write the deliverable:
   - `docs/explanations/YYYY-MM-DD-<topic>.md` — the explanation (output
     contract structure) with the diagram embedded or linked.
   - `docs/explanations/assets/<topic>.html` — the diagram file when
     diagram-design produced one.
5. Self-verify: `git diff` touches only `docs/explanations/**`; the markdown
   renders; the link to the diagram file resolves.

`diagram-design` is external (MIT, github.com/cathrynlavery/diagram-design).
It is never vendored into the kit; detection + fallback is the contract.

## Documentation Output (limited write)

When asked to generate documentation (doc comments, README sections, OpenAPI,
architecture notes), the write contract is:

| Allowed | Forbidden |
|---|---|
| Doc comments in code (JSDoc/PHPDoc/docstring) | Code logic changes |
| General `*.md` documentation files | Anything under `.ai/docs/**` (LoreCat's corpus) |
| `docs/explanations/**` (markdown + diagram assets) | Config files, schemas, tests |
| OpenAPI specs | Anything outside the four zones above |

After every write, run `git diff` and confirm each changed line is a doc
comment or documentation content. If any logic line changed, revert it and
report the near-miss.

Doc comments describe contracts — purpose, parameters, returns, errors,
invariants — not mechanics the code already shows. Knowledge worth persisting
as project truth routes to LoreCat via `/lore-cat-save-it`, never a direct
write.
