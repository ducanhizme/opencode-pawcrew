# OpenCode PawCrew

A minimal, native-first agent system for OpenCode: six primary agents
(PawBuilder, PatchPaw, LetMeowCook, PawPixel, LoreCat, Pawfessor), five
intelligence subagents (Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers,
GuardClaw), twenty-two custom skills
(`ast-grep`, `bug-flow`, `change-impact-analysis`, `change-request-flow`,
`code-explanation`, `comment-polish`, `contract-regression-testing`,
`crewkit-skill-registry`, `delegation-policy`, `design-md-contract`,
`frontend-audit`, `frontend-critique`, `frontend-delight`, `frontend-polish`,
`frontend-taste-router`, `frontend-ui-engineering`, `hashline-edit`,
`incident-response`, `pdca-loop`, `performance-investigation`,
`retrospective`, `test-strategy`),
six routing commands (`/build`, `/patch`, `/cook`, `/design`, `/explain`,
`/lore-cat-save-it`), and four deterministic plugins (`frontend-guardian.ts`,
`hashline.ts`, `lore-cat.ts`, `superpowers-gate.ts`).

Four truths: CODE → Sherclaw · PROJECT → LoreCat (.ai/docs) · EXTERNAL →
SearchPurr · JUDGEMENT → ElderPaw.

Source of truth: this repo. Installed into `~/.config/opencode/` via
per-file symlinks (run `./install.sh`).

## Layout

```
.opencode/
├── agent/
│   ├── pawbuilder.md    primary — collaborative feature engineer (Superpowers + approval gates)
│   ├── patchpaw.md     primary — change-controlled maintenance (investigate → propose → approve → fix)
│   ├── letmeowcook.md    primary — autonomous executor (goal ownership + outcome report)
│   ├── pawpixel.md     primary — frontend & UI specialist (DESIGN.md contract + taste skills)
│   ├── pawfessor.md    primary — code explainer (evidence → natural-language understanding, doc generation)
│   ├── lorecat.md      all (primary+subagent) — project knowledge governor (.ai/docs, two reconciliation modes)
│   ├── sherclaw.md     subagent — read-only internal code investigator
│   ├── searchpurr.md    subagent — external docs/source researcher
│   ├── elderpaw.md       subagent — read-only technical advisor
│   ├── judgewhiskers.md subagent — dispatched review specialist (target for Superpowers review dispatch)
│   ├── guardclaw.md subagent — focused read-only security reviewer (explicit/high-risk scope)
│   ├── build.md        disable stub — native build agent off (PawBuilder owns this role)
│   ├── plan.md         disable stub — native plan agent off (PawBuilder's Superpowers flow owns planning)
│   └── explore.md      disable stub — native explore agent off (Sherclaw owns this role; general kept for Superpowers subagent dispatch)
├── command/
│   ├── build.md        → pawbuilder
│   ├── patch.md        → patchpaw
│   ├── cook.md         → letmeowcook
│   ├── design.md       → pawpixel
│   ├── explain.md      → pawfessor
│   └── lore-cat-save-it.md → lorecat
├── plugin/
│   ├── lore-cat.ts         deterministic knowledge tools (wiki_search/read/freshness/save_concept/validate/sync)
│   └── superpowers-gate.ts strips superpowers bootstrap from non-superpowers agents (strip-list, allow-by-default)
└── skills/
    ├── ast-grep/SKILL.md
    ├── bug-flow/SKILL.md
    ├── change-impact-analysis/SKILL.md
    ├── change-request-flow/SKILL.md
    ├── code-explanation/SKILL.md
    ├── comment-polish/SKILL.md
    ├── contract-regression-testing/SKILL.md
    ├── crewkit-skill-registry/SKILL.md
    ├── delegation-policy/SKILL.md        (includes the parallel-dispatch squad pattern)
    ├── design-md-contract/SKILL.md
    ├── frontend-audit/SKILL.md
    ├── frontend-critique/SKILL.md
    ├── frontend-delight/SKILL.md
    ├── frontend-polish/SKILL.md
    ├── frontend-taste-router/SKILL.md
    ├── frontend-ui-engineering/SKILL.md
    ├── hashline-edit/SKILL.md
    ├── incident-response/SKILL.md
    ├── pdca-loop/SKILL.md                (includes cross-session Goal Records)
    ├── performance-investigation/SKILL.md
    ├── retrospective/SKILL.md
    └── test-strategy/SKILL.md
```

Native `build` and `plan` are disabled via stub files (`disable: true`). With `build`
disabled, the default agent resolves to `pawbuilder`. install.sh also verifies the
Superpowers plugin (required by PawBuilder/PatchPaw) is configured and cached.

`judgewhiskers` and `guardclaw` are deliberate review exceptions to "no agent per behavior":
Superpowers skills (`requesting-code-review`, `subagent-driven-development`)
instruct dispatching a `general-purpose` subagent — but this kit has no
`general-purpose` agent, and the model would otherwise improvise and pick
Sherclaw, whose prompt forbids opinions. Three layers pin the dispatch:

1. **PawBuilder & PatchPaw** carry an explicit Review Dispatch Rule that overrides
   Superpowers skill text: any code/task/re-review/whole-branch review dispatch
   must use `subagent_type: "judgewhiskers"` — never `general-purpose`, never
   `sherclaw`. The skill's template content (brief, report, diff package, SHAs)
   is preserved; only the `subagent_type` changes.
2. **`judgewhiskers` description** is keyword-rich for the dispatch match
   ("code review", "task reviewer", "re-review", "spec compliance", "verdict",
   "BLOCKER / SHOULD-FIX / NIT", "requesting-code-review",
   "subagent-driven-development", "receiving-code-review").
3. **`sherclaw` description** leads with "NOT a code reviewer and NOT a task
   reviewer" and avoids review-quality keywords, so description-similarity
   dispatch no longer favors Sherclaw for review work.

`guardclaw` is independent from that Superpowers override. It is dispatched only
for an explicit security review or high-risk security boundary (auth/authz, secrets,
payments, untrusted input, filesystem/network/deserialization, sensitive data); it never
replaces ordinary `judgewhiskers` review.

`pawfessor` is the synthesis counterpart to `sherclaw`: Sherclaw returns raw
evidence (WHERE/WHAT) and is forbidden from interpreting; Pawfessor dispatches
Sherclaw (and LoreCat/SearchPurr/ElderPaw) for evidence, then interprets it
into natural-language explanations, traces, maps, and documentation. Pawfessor
is read-only on code logic; its writes are limited to doc comments, `*.md`
documentation, `docs/explanations/**`, and OpenAPI specs — never `.ai/docs/**`
(LoreCat's corpus). Diagram deliverables use the external `diagram-design`
skill when installed, with an embedded-mermaid fallback.

## Core separation (do not violate)

- **Agent prompt** = identity, authority, boundaries, delegation policy, approval policy, completion contract
- **Skill** = reusable procedure
- **Command** = user-facing entrypoint (routing only)
- **Repository specifics** = project's own AGENTS.md, never these prompts

Never duplicate the same workflow in an agent prompt and a skill or command.

## Disambiguation (ambiguous task → agent)

When a request could plausibly route to more than one primary agent, apply the
matching rule instead of guessing:

| Ambiguous task | Rule |
|---|---|
| Refactor | bounded + behavior-preserving → PatchPaw · has design choices → PawBuilder · repetitive multi-file campaign → LetMeowCook |
| Technical debt | single module → PatchPaw · repo-wide → LetMeowCook with a Goal Record |
| Writing docs | explaining code → Pawfessor · project truth / specs / ADRs → LoreCat |
| Tests | tests for a new feature → PawBuilder · failing/flaky tests → PatchPaw · building out a test suite as a goal → LetMeowCook |
| Security | explaining a vulnerability → Pawfessor · reviewing a diff → GuardClaw (dispatched via the primary) · fixing → PatchPaw |
| Performance | investigation/fix → PatchPaw + `performance-investigation` · repo-wide optimization campaign → LetMeowCook |
| Production incident | active outage/errors → PatchPaw + `incident-response` (mitigate first) |
| No source available | understanding behavior → Pawfessor (Black-box mode) · cloning it → PawBuilder with the extracted behavior spec |

Routing invariants:

- Every task has exactly **one primary agent**; supporting agents are subagents only.
- Primary→primary handoff is an explicit route suggestion to the user ("this belongs to PatchPaw — switch?"), never a silent relay. Documented exception: LoreCat knowledge sync as a phase of the running primary.
- New case that fits no row: apply the decision tree below before creating anything.

```text
New case appears
│
├─ Existing agent + skills handle it?
│    └─ YES → create nothing (add a Rule if a constraint is needed)
│
├─ Difference is only step order / trigger?
│    └─ Workflow: add a section to the existing skill/prompt
│
├─ Reusable reasoning procedure + own output contract
│  + called from ≥2 places?
│    └─ New skill
│
├─ Difference is only a constraint?
│    └─ Rule (prompt / GLOBAL-RULES / contract artifact)
│
└─ New agent? Only when ALL of these hold:
     1. A NEW authority boundary or permission envelope
     2. Cannot be expressed as Skill + Workflow on an existing agent
     3. ≥3 foreseeable use cases in the next 3 months
   Missing any condition → go back up the tree.
```

## Tooling Layer

Local intelligence: read, glob, grep, LSP, AST-Grep (`ast-grep` skill, `sg` CLI).
External intelligence: Context7 MCP (official docs), Exa MCP (broad web, needs
`EXA_API_KEY` + `enabled: true`), GitHub/public code search (`gh search code` —
vendor-neutral "public code search" in prompts; no hard-coded grep.app dependency).

| Capability | PawBuilder | PatchPaw | LetMeowCook | Pawfessor | Sherclaw | SearchPurr | ElderPaw |
|---|---|---|---|---|---|---|---|
| Local tools (read/glob/grep/LSP) | yes | yes | yes | yes | yes | read-only manifests | grep/read |
| AST-Grep | yes | yes | yes | yes | yes (no rewrite) | no | optional (no rewrite) |
| Context7 | lightweight | via SearchPurr | yes | via SearchPurr | no | yes | no |
| Exa / web search | via SearchPurr | via SearchPurr | yes | via SearchPurr | no | yes | no |
| Public code search | via SearchPurr | via SearchPurr | yes | via SearchPurr | no | yes | no |

MCP servers live in `~/.config/opencode/opencode.jsonc` (not symlinked from this
repo — it is the user's global config). install.sh checks they are registered.
Per-agent scoping is enforced by permission patterns (`context7_*: deny`,
`exa_*: deny` on Sherclaw/ElderPaw).

`sg` is not auto-installed. If missing, the ast-grep skill falls back to
grep+LSP and says so. Install: `brew install ast-grep`.

## Superpowers gate

The upstream superpowers plugin injects its bootstrap into the first user
message of every session step — including subagent sessions — because its
hook receives no agent context. `superpowers-gate.ts` runs after superpowers
(auto-discovered plugins register after config-declared ones) and splices the
bootstrap out for a strip-list of agents: sherclaw, searchpurr, elderpaw,
lorecat, letmeowcook, judgewhiskers, guardclaw, pawfessor, native
general/scout/explore, and
title/summary/compaction (defense-in-depth — hidden agents currently use a
separate LLM path that bypasses the transform). Allow-by-default: unknown
agents keep the bootstrap. If upstream changes the bootstrap format, the gate
no-ops (fail-safe); install.sh greps the cached superpowers.js for the markers
and warns on drift.

## LoreCat Layer

LoreCat (`mode: all`) is both user-facing (direct mode: reconciliation
questions allowed) and dispatchable (subagent mode: structured conflict
evidence, never `question()`). `.ai/docs/**` is the only authoritative
project-knowledge corpus. Normative knowledge is never silently rewritten to
match code; the user owns source-of-truth decisions. Git recency is freshness
evidence, never authority.

The `lore-cat.ts` plugin is an **OpenWiki-backed facade**. It exposes the same
six deterministic `wiki_*` tools (`wiki_search`, `wiki_read`, `wiki_freshness`,
`wiki_save_concept`, `wiki_validate`, `wiki_sync`). When the project has the
`openwiki` npm dependency installed, generation/update/validation are
delegated to OpenWiki; PawCrew-specific behavior (`x_wikiguy` freshness,
OKF v0.2, reconciliation modes, write-guard into `.ai/docs`) is preserved either
way.

Integrations:
- PatchPaw: CR impact = LoreCat (project truth) + Sherclaw (code truth);
  approved CR authorizes auto knowledge sync; final report has Knowledge Sync.
- LetMeowCook: exactly two post-completion question gates (analyze impact →
  apply plan); implementation phase remains question-free.
- Superpowers artifact redirect: plans/specs go under `.ai/superpowers/`
  (prompt-level convention; `.superpowers/sdd` is plugin-scripted, cannot be
  redirected without forking).

The plugin registers tools via zod `args` shapes (`@opencode-ai/plugin` Tool
API); root resolution uses the session `directory` from ToolContext. It must
be listed in the global config plugin array (install.sh checks).

## PDCA Loop

Every non-trivial task follows the Deming cycle via the `pdca-loop` skill:

- **Plan**: `pawbuilder` and `patchpaw` create a Plan Record before user approval;
  `letmeowcook` creates one autonomously during Understand/Decide.
- **Do**: execution with a lightweight Run Log.
- **Check**: a Check Record compares observable success criteria against actual evidence.
- **Act**: Knowledge Sync plus an optional Retrospective Note for recurring process lessons.

Artifacts live under `.ai/superpowers/plans/`, `.ai/superpowers/runs/`,
`.ai/superpowers/checks/`, and `.ai/superpowers/improvements/`. The
`retrospective` skill produces lessons-learned entries for `.ai/docs/references/`
or proposed kit improvements.

Multi-step goals that may span sessions get a **Goal Record** under
`.ai/superpowers/goals/` (cross-session persistence section of `pdca-loop`;
CLI helper: `node scripts/goal-persistence.js`). A Goal Record tracks where
the goal is; a Plan Record tracks how one task executes.

## Editing conventions

- Every active agent declares an explicit `model:` in frontmatter (default
  `zai-coding-plan/glm-5.3`). Change per agent freely — see `opencode models`
  for available IDs; the value must carry the provider prefix.
- Permission objects use pattern rules where the LAST matching rule wins:
  broad `"*"` first, narrow rules after.
- Subagents never spawn further agents (`task: deny`) and never edit
  (`edit`/`write`/`patch` all denied — `edit` alone is not enough; `write`
  and `patch` are separate tools).
- Agents intentionally have no OMO runtime references; prompt lineage comes from
  OMO (Sisyphus/Hephaestus/Explore/Librarian/Oracle) adapted for this architecture.
  See THIRD-PARTY-NOTICES.md for attribution — OMO-derived content is distributable
  free of charge for non-commercial use under its Sustainable Use License.
- Skill loading per agent: LoreCat/SearchPurr/ElderPaw set
  `tools: { skill: false }` (skill tool fully disabled, `<available_skills>`
  omitted from context). JudgeWhiskers uses `permission.skill` default-deny
  with exactly two allows — `requesting-code-review` and
  `receiving-code-review` (the Superpowers review procedure it is dispatched
  by). Sherclaw/LetMeowCook/Pawfessor keep the skill tool for domain
  skills (ast-grep, code-explanation, ...) but deny all 14 Superpowers process
  skills via `permission.skill` patterns. PawBuilder/PatchPaw use Superpowers freely.

## Install / update

### Global install (symlinks into `~/.config/opencode/`)

```
./install.sh          # idempotent; re-points existing symlinks
./install.sh --force  # replaces conflicting regular files with symlinks
```

### Project-local install (copies into `PROJECT/.opencode/`)

Use this when the project already has its own OpenCode config, custom agents, or team-specific skills:

```
./install.sh --project ./my-existing-project
./install.sh --project ./my-existing-project --force  # backup + overwrite existing files
```

Project mode copies PawCrew files instead of symlinking, so the crew travels with the repo and never clobbers existing project customizations unless `--force` is used.

After installing, **quit and restart opencode** — config is not hot-reloaded.

## Kit commands

- `git -C ~/opencode-crewkit status` — check drift from installed state
- Global mode: installed files are symlinks; edit them here, changes apply everywhere.
- Project mode: files are copies inside the target repo; refresh with `./install.sh --project <path>`.

<!-- OPENWIKI:START -->

## OpenWiki

This repository has a generated `openwiki/` evidence index. It is optional just-in-time context, not required startup reading.

- Treat source code and tests as authoritative. A brief's unknowns and review items are verification gaps, not automatic requirements.
- Prefer the narrowest quiet validation that proves the changed behavior. Preserve complete failure output.

The scheduled OpenWiki GitHub Actions workflow refreshes the repository wiki. Do not hand-edit generated OpenWiki pages unless explicitly asked; prefer updating source code/docs and letting OpenWiki regenerate.

<!-- OPENWIKI:END -->
