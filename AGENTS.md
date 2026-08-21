# OpenCode PawCrew

A minimal, native-first agent system for OpenCode: four primary agents
(PawBuilder, PatchPaw, LetMeowCook, LoreCat), five intelligence subagents
(Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers, GuardClaw), nine custom skills
(`ast-grep`, `bug-flow`, `change-impact-analysis`, `change-request-flow`,
`contract-regression-testing`, `crewkit-skill-registry`, `delegation-policy`, `pdca-loop`, `retrospective`),
four routing commands (`/build`, `/patch`, `/cook`, `/lore-cat-save-it`), and two
deterministic plugins (`lore-cat.ts`, `superpowers-gate.ts`).

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
│   └── lore-cat-save-it.md → lorecat
├── plugin/
│   ├── lore-cat.ts         deterministic knowledge tools (wiki_search/read/freshness/save_concept/validate/sync)
│   └── superpowers-gate.ts strips superpowers bootstrap from non-superpowers agents (strip-list, allow-by-default)
└── skills/
 ├── ast-grep/SKILL.md
 ├── bug-flow/SKILL.md
 ├── change-impact-analysis/SKILL.md
 ├── change-request-flow/SKILL.md
 ├── contract-regression-testing/SKILL.md
 ├── crewkit-skill-registry/SKILL.md
 ├── delegation-policy/SKILL.md
 ├── pdca-loop/SKILL.md
 └── retrospective/SKILL.md
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

## Core separation (do not violate)

- **Agent prompt** = identity, authority, boundaries, delegation policy, approval policy, completion contract
- **Skill** = reusable procedure
- **Command** = user-facing entrypoint (routing only)
- **Repository specifics** = project's own AGENTS.md, never these prompts

Never duplicate the same workflow in an agent prompt and a skill or command.

## Tooling Layer

Local intelligence: read, glob, grep, LSP, AST-Grep (`ast-grep` skill, `sg` CLI).
External intelligence: Context7 MCP (official docs), Exa MCP (broad web, needs
`EXA_API_KEY` + `enabled: true`), GitHub/public code search (`gh search code` —
vendor-neutral "public code search" in prompts; no hard-coded grep.app dependency).

| Capability | PawBuilder | PatchPaw | LetMeowCook | Sherclaw | SearchPurr | ElderPaw |
|---|---|---|---|---|---|---|
| Local tools (read/glob/grep/LSP) | yes | yes | yes | yes | read-only manifests | grep/read |
| AST-Grep | yes | yes | yes | yes (no rewrite) | no | optional (no rewrite) |
| Context7 | lightweight | via SearchPurr | yes | no | yes | no |
| Exa / web search | via SearchPurr | via SearchPurr | yes | no | yes | no |
| Public code search | via SearchPurr | via SearchPurr | yes | no | yes | no |

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
lorecat, letmeowcook, judgewhiskers, guardclaw, native general/scout/explore, and
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
  by). Sherclaw/LetMeowCook keep the skill tool for domain
  skills (ast-grep, docker, ...) but deny all 14 Superpowers process skills
  via `permission.skill` patterns. PawBuilder/PatchPaw use Superpowers freely.

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
