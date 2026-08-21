---
title: "crew-code — Agent system for DeepSeek Harness"
date: 2026-08-17
status: design
type: specification
---

# crew-code — Agent system for DeepSeek Harness

## Purpose

Build a new DSH (DeepSeek Harness) plugin, **crew-code**, that ports the opencode-crewkit agent roster (PawBuilder, PatchPaw, LetMeowCook, LoreCat + subagents Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers) to DeepSeek Harness, building on top of a deep fork of superpowers. The target platform is DSH's Cordis plugin framework ("everything is a plugin"), not OpenCode.

## Scope

- New sibling repo `dsh-crew-code` (opencode-crewkit stays OpenCode-only).
- Deep fork of superpowers: git-subtree the skill markdown, reimplement the bootstrap engine natively for DSH.
- 4 agent presets (PawBuilder, PatchPaw, LetMeowCook, LoreCat) on `ctx.agentPresets`.
- 5 subagent personas (Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers, LoreCat-subagent-mode) on `ctx.subagents` — both one-shot and continuable.
- 4 human commands (`/build`, `/patch`, `/cook`, `/lore-cat-save-it`) on `ctx.commands`.
- Superpowers skill content served through DSH's `ctx.skills` registry; two-tier invocation policy (process skills denied to LetMeowCook/LoreCat).
- Wiki-guy deterministic tools (wiki_search/read/freshness/save_concept/validate/sync) reimplemented on `ctx.tools`, scoped to LoreCat.

Out of scope (Phase 2+):
- LLM adapter work (DSH's shipped adapters suffice).
- ACP / remote subagent backends.
- Continuable subagent orchestration beyond what DSH's continuation manager provides natively.

## Non-goals

- No OpenCode compatibility shim.
- No opencode-crewkit `install.sh` symlink mechanism — DSH uses profile composition.
- No `superpowers-gate` plugin — DSH scoping replaces it.
- No opencode `permission.skill` pattern mechanism — DSH layered skill invocation policy replaces it.
- No opencode skill-loading tool — DSH's `dsh-tool-skill` replaces it.

## Locked decisions

| Decision | Choice |
|---|---|
| Repo strategy | New sibling repo `dsh-crew-code` |
| Superpowers integration | Deep fork: subtree skills + native bootstrap |
| Agent-to-preset mapping | 4 presets + subagent personas (NOT all agents as presets) |
| Command routing | `ctx.commands` handlers (no model turn) |
| Content porting | Port identity + skills, reimplement infra |
| Superpowers fork shape | Subtree skills + native bootstrap |
| Wiki-guy | Reimplement as DSH tools on `ctx.tools` |
| Subagent modes | One-shot AND continuable in v1 |
| Plugin structure | Layered plugin family (Approach B) |

## Platform: DeepSeek Harness

DSH is a Cordis-based agent harness. Key seams crew-code uses:

- **`ctx.agentPresets`** — named agent compositions; presets mount plugins via standing composition; `mount(agentCtx, id)` parents an agent's scope to the preset's composition so mounted registrations cover that agent. `composeFrom(agentCtx, parentCtx)` lets a child join a parent's composition.
- **`ctx.systemPrompt`** — `section()` registers ordered prompt sections (convention: `-100` harness identity, `0` persona, 100–199 tool guidance). Sections are scope-layered: scoped entries shadow globals.
- **`ctx.skills`** — host+per-scope layered registry. `registerProvider()` adds a SkillProvider; `register()` adds a runtime skill. Scoped entries shadow global entries by name. `isModelInvocable` policy governs model access.
- **`ctx.subagents`** — named provider registry. `start()` one-shot, `startContinuable()` + `followup()` continuable. `registerContinuableSetup()` installs scope-local capabilities in every continuable child on fresh creation and cold resume.
- **`ctx.commands`** — human commands that dispatch without a model turn.
- **`ctx.tools`** — `defineTool` typed DSL; tool registrations are scope-layered.
- **`ctx.fs`** — filesystem seam; sandbox-compatible. `ctx.subprocess` for shell/git.

## Architecture

### Plugin topology

crew-code is a **bundle** (`crew-code.yml`) stacking five plugins, each owning one concern. Load order matters: `crew-core` first (installs the superpowers bootstrap section so presets inherit it), capabilities next, `crew-presets` last (composes agents from now-registered capabilities).

```
crew-code/
├── package.json                    dsh: { bundle: "crew-code.yml" }
├── crew-code.yml                   bundle patch file — ordered config rows
├── tsconfig.json
├── vitest.config.ts
├── vitest.e2e.config.ts
├── scripts/install.sh              profile wiring
├── src/
│   ├── core/                       crew-core: bootstrap + commands
│   │   ├── index.ts
│   │   ├── bootstrap.ts            using-superpowers prompt section + agent/pre-step listener
│   │   ├── commands.ts              /build /patch /cook /lore-cat-save-it
│   │   └── *.test.ts
│   ├── skills/                     crew-skills + crew-skills-restrict
│   │   ├── index.ts                crew-skills: provider registration (global)
│   │   ├── provider.ts             scans vendor/superpowers + project skills
│   │   ├── restrict.ts             crew-skills-restrict: scoped shadow plugin
│   │   ├── process-list.ts         the 14-skill constant
│   │   └── *.test.ts
│   ├── subagents/                  crew-subagents
│   │   ├── index.ts                apply(): register persona catalog, tools, continuable setup
│   │   ├── personas.ts             5 persona + toolFilter + setup specs
│   │   └── *.test.ts
│   ├── wiki/                       crew-wiki
│   │   ├── index.ts                apply(): register 6 tools on ctx.tools (scoped)
│   │   ├── tools/
│   │   │   ├── search.ts
│   │   │   ├── read.ts
│   │   │   ├── freshness.ts
│   │   │   ├── save-concept.ts
│   │   │   ├── validate.ts
│   │   │   └── sync.ts
│   │   ├── schema.ts               OKF frontmatter schema + validation
│   │   ├── paths.ts                .ai/docs resolution
│   │   ├── frontmatter.ts          YAML parse + preserve-unknown-fields
│   │   ├── git.ts                  git recency / verified_commit checks
│   │   └── *.test.ts
│   └── presets/                    crew-presets
│       ├── index.ts                apply(): register 4 preset composition dirs
│       ├── pawbuilder/{composition.yml,persona.md}
│       ├── patchpaw/{composition.yml,persona.md}
│       ├── letmeowcook/{composition.yml,persona.md}
│       └── lorecat/{composition.yml,persona.md}
├── vendor/
│   └── superpowers/skills/*/SKILL.md    git subtree of upstream superpowers
└── skills/                         bundled project skills
    ├── ast-grep/SKILL.md
    └── change-impact-analysis/SKILL.md
```

### Bundle config

```yaml
# crew-code.yml
- insert:
    - id: crew-core
      name: './src/core/index.ts'
      inject: ['systemPrompt']
    - id: crew-skills
      name: './src/skills/index.ts'
      inject: ['skills']
    - id: crew-skills-restrict
      name: './src/skills/restrict.ts'
      inject: ['skills']
    - id: crew-subagents
      name: './src/subagents/index.ts'
      inject: ['subagents', 'agents', 'tools']
    - id: crew-wiki
      name: './src/wiki/index.ts'
      inject: ['tools', 'fs']
    - id: crew-presets
      name: './src/presets/index.ts'
      inject: ['agentPresets']
```

### Per-preset composition matrix

Each preset's `composition.yml` mounts only the plugins it needs:

| Preset | crew-core | crew-skills | crew-skills-restrict | crew-subagents | crew-wiki |
|---|---|---|---|---|---|
| pawbuilder | yes | yes | — | yes | — |
| patchpaw | yes | yes | — | yes | — |
| letmeowcook | — | yes | yes | yes | — |
| lorecat | — | yes | yes | — | yes |

### Capability matrix

| Capability | pawbuilder | patchpaw | letmeowcook | lorecat |
|---|---|---|---|---|
| Local tools (read/glob/grep/LSP) | yes | yes | yes | yes |
| AST-Grep skill | yes | yes | yes | yes |
| Superpowers bootstrap (crew-core) | yes | yes | **no** | **no** |
| Superpowers process skills | yes | yes | **denied** | **denied** |
| ctx.subagents dispatch | yes | yes | yes | **no** |
| wiki_* tools | no | no | no | **yes** |
| Skill tool | yes | yes | yes | yes |

## Superpowers bootstrap & gate (native reimplementation)

### Bootstrap section

A `PromptSection` at order `-90` (after harness identity `-100`, before persona `0`):

```ts
ctx.systemPrompt.section({
  name: 'crew-superpowers-directive',
  order: -90,
  text: USING_SUPERPOWERS_BODY,   // forked from using-superpowers/SKILL.md, DSH-adapted
})
```

The body is the upstream using-superpowers content with the "Tool Mapping for OpenCode" block rewritten for DSH vocabulary: `task` → `subagent`, `todowrite` → `todo`, `apply_patch` → DSH `edit`/`write`, etc. This is the one intentional text divergence from upstream; it does not auto-update with subtree pulls.

### Skill tool & catalog (native)

crew-code does NOT fork the opencode skill-loading tool. DSH's `dsh-tool-skill` already:
- Injects `<available_skills>` at first `agent/pre-step`.
- Re-injects on catalog digest change via `agent.inject()`.
- Loads skill bodies on `skill({ name })` calls.
- Enforces `isModelInvocable` policy.

`crew-skills` only registers a `SkillProvider` whose candidates are the vendored superpowers subtree + project skills.

### "Invoke before responding" enforcement (agent/pre-step)

A lightweight `agent/pre-step` waterfall listener that re-pins a short reminder on every step so it survives compaction and long turns. It does not reject steps — annotate, don't reject:

```ts
ctx.on('agent/pre-step', (payload, next) => {
  return next()
})
```

### Gate via scoping (no gate plugin)

The opencode-crewkit `superpowers-gate.ts` strips the bootstrap from non-superpowers agents. On DSH, scoping replaces the gate:

- The bootstrap `PromptSection` is registered inside each preset's standing composition.
- Only presets that mount `crew-core` get it: pawbuilder, patchpaw.
- LetMeowCook and LoreCat don't mount `crew-core` — no bootstrap, no stripping needed.
- Subagents inherit parent composition via `composeFrom`, but `crew-subagents` does NOT mount `crew-core` in the child creation window — no bootstrap reaches subagents.

Strip-list equivalence:

| opencode gate target | DSH mechanism |
|---|---|
| sherclaw, searchpurr, elderpaw, judgewhiskers | subagent persona — crew-core not mounted in child |
| lorecat (subagent mode) | subagent persona — same |
| letmeowcook | its preset does not mount crew-core |
| hidden agents (title/summary/compaction) | DSH hidden agents use a separate LLM path that doesn't go through ctx.systemPrompt.assemble for our sections |

## Agent presets & persona system

### Persona content

Each preset dir has a `persona.md` ported from the opencode-crewkit agent markdown, adapted:

1. Strip opencode frontmatter (`model:`, `permission:`, `tools:` denies) — DSH handles via composition + scoping.
2. Rewrite tool/delegation references to DSH vocabulary.
3. Keep identity, authority, delegation policy, approval contract, completion contract verbatim.

### Per-scope skill restriction

LetMeowCook and LoreCat deny the 14 Superpowers process skills via a scoped `crew-skills-restrict` plugin mounted only by their preset compositions. The restrictor re-registers the 14 skills with `modelInvocable: false`, shadowing the global provider's entries for that scope:

```ts
const SUPERPOWERS_PROCESS_SKILLS = [
  'brainstorming', 'writing-plans', 'executing-plans',
  'test-driven-development', 'systematic-debugging',
  'verification-before-completion', 'requesting-code-review',
  'receiving-code-review', 'subagent-driven-development',
  'dispatching-parallel-agents', 'using-git-worktrees',
  'finishing-a-development-branch', 'using-superpowers',
  'writing-skills',
] as const

function registerRestrictor(ctx: Context) {
  for (const name of SUPERPOWERS_PROCESS_SKILLS) {
    ctx.skills.register({
      name,
      description: '',
      invocation: { modelInvocable: false, userInvocable: false },
      content: RESTRICTED_STUB,   // "This skill is not available in this agent's composition."
    })
  }
}
```

DSH's first-wins-by-name per layer means the scoped shadow makes `isModelInvocable()` return false for that scope. `dsh-tool-skill` rejects before loading. The stub content never reaches the model.

PawBuilder and PatchPaw mount only `crew-skills` (no restrictor) — full access.

### Subagent persona vs. preset persona

Subagents (Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers, LoreCat-subagent-mode) are spawned via `ctx.subagents.start()` with a `persona` option that shadows the child's `deployment:persona` section. The child's composition comes from `composeFrom(parentCtx)` — inheriting the parent's tools and skill registrations — but `crew-subagents` does NOT mount `crew-core` in the child, so no bootstrap.

## Skills subsystem

### Source 1 — Vendored superpowers subtree

`vendor/superpowers/` is a git subtree of `https://github.com/obra/superpowers.git`. `crew-skills/provider.ts` scans `vendor/superpowers/skills/` for `<name>/SKILL.md` entries and surfaces each as a `SkillCandidate` with `SkillSource: 'bundled'` and `resourceBase: { kind: 'directory', path: <skill dir> }`.

### Source 2 — Bundled project skills

`skills/` at repo root holds `ast-grep/SKILL.md` and `change-impact-analysis/SKILL.md` (ported from opencode-crewkit). Registered as a second `SkillProvider` (`crew-project-skills`, `SkillSource: 'project-dsh'`, rank 100) to outrank bundled superpowers on name collisions.

### Two-tier invocation policy

- **Global layer (host):** `crew-skills` registers every skill with `modelInvocable: true`. This is what PawBuilder and PatchPaw see.
- **Per-preset layer (scope):** `crew-skills-restrict`, mounted only by `letmeowcook` and `lorecat` presets, shadows the 14 process skills as `modelInvocable: false`.

### Fork maintenance

```
git subtree pull --prefix=vendor/superpowers \
  https://github.com/obra/superpowers.git main --squash
```

A drift test asserts every `vendor/superpowers/skills/*/SKILL.md` matching the process-skill name pattern is in `process-list.ts`, flagging upstream additions that need a manual restrictor update.

## Subagents

DSH's subagent seam supports one-shot (`start()`) and continuable (`startContinuable()` + `followup()`) modes. crew-code exposes both in v1.

### Persona catalog

```ts
export const CREW_SUBAGENTS = {
  sherclaw: {
    persona: SHERLOCK_PERSONA,
    toolFilter: { deny: ['task','edit','write','patch','subagent'] },
    setup: restrictProcessSkills,
    description: 'Read-only internal code investigator',
  },
  searchpurr: {
    persona: GOOGLEGUY_PERSONA,
    toolFilter: { deny: ['task','edit','write','patch','subagent'] },
    setup: restrictProcessSkills,
    description: 'External docs/source researcher',
  },
  elderpaw: {
    persona: OLDMAN_PERSONA,
    toolFilter: { deny: ['task','edit','write','patch','subagent'] },
    setup: restrictProcessSkills,
    description: 'Read-only technical advisor',
  },
  'judgewhiskers': {
    persona: CODE_REVIEWER_PERSONA,
    toolFilter: { deny: ['task','edit','write','patch','subagent'] },
    setup: restrictReviewOnlySkills,   // deny all process skills EXCEPT requesting/receiving-code-review
    description: 'Dispatched review specialist',
  },
  lorecat: {
    persona: WIKIGUY_PERSONA,
    toolFilter: { deny: ['task','edit','write','patch','subagent'] },
    setup: mountCrewWiki + restrictProcessSkills,
    description: 'Project knowledge governor (dispatched mode)',
  },
}
```

All personas deny `subagent` (subagents never spawn further agents) and all write tools. `judgewhiskers` allows only the two review skills. `lorecat` (dispatched mode) mounts `crew-wiki` tools in the child scope via the setup hook.

### Tool surface

| Tool | DSH service call | Purpose |
|---|---|---|
| `subagent` | `ctx.subagents.start()` or `startContinuable()` | Dispatch a child. `continuable: true` → durable child; returns `{childId, messageId}`. `continuable: false` (default) → one-shot; returns `SubagentResult.output`. |
| `subagent_followup` | `ctx.subagents.followup()` | Send a later message to a continuable child. |
| `subagent_interrupt` | `ctx.subagents.interrupt()` | Stop a live continuable child. |
| `subagent_list` | `ctx.subagents.listChildren()` | Enumerate direct session-backed subagents of the current agent. |

### Dispatch semantics — opencode `task` → DSH `subagent`

| opencode-crewkit | DSH equivalent |
|---|---|
| `task` tool with `subagent_type` | `subagent` tool with `persona` |
| Fresh context | One-shot `start()` — child gets only `prompt` ContentBlocks |
| `task_id` to resume | `startContinuable()` + `followup()` |
| Parallel dispatch | Multiple `subagent` tool calls in one step |
| "One final message" | `SubagentResult.output` — child's last non-empty assistant message |
| Research-only vs. change intent | Stated in the prompt text (no DSH mechanism enforces) |

### Continuable child authority and setup

- `followup` is authorized by the exact live direct parent Agent (`ctx.agents.requireInitiator()`).
- `crew-subagents` uses `ctx.subagents.registerContinuableSetup()` to install scope-local capabilities in every continuable child on fresh creation AND cold resume, so a resumed child gets the same composition (persona + toolFilter + skill restrictor + wiki tools if lorecat).

### Primary's dispatch contract

The primary's persona prompt instructs it to use `subagent({ description, prompt, persona, continuable? })` with the six-section delegation prompt format (TASK/EXPECTED OUTCOME/REQUIRED TOOLS/MUST DO/MUST NOT DO/CONTEXT). `continuable: true` when the primary expects to send follow-ups to the same child; `false` (default) for single-deliverable dispatch.

## Wiki-guy tools

Six deterministic tools reimplemented on DSH's `ctx.tools` with `defineTool`. The OKF frontmatter schema, `.ai/docs` resolution, and "normative knowledge never silently rewritten" policy port verbatim — only the tool bindings change.

| Tool | Purpose | DSH bindings |
|---|---|---|
| `wiki_search` | Search `.ai/docs/**` | `ctx.fs` read + index; kind/limit filters |
| `wiki_read` | Read one doc | `ctx.fs` read; returns frontmatter + body + git metadata |
| `wiki_freshness` | Git drift check on covered paths | `ctx.fs` + `ctx.subprocess` (git) |
| `wiki_save_concept` | Write one OKF doc atomically | `ctx.fs` write; enforce path-inside-.ai/docs, preserve unknown OKF fields, refresh provenance |
| `wiki_validate` | Scan corpus integrity | `ctx.fs` read; YAML frontmatter, x_wikiguy integrity, link resolution, index.md/log.md presence |
| `wiki_sync` | Regenerate index.md + append log.md | `ctx.fs` read/write |

**Filesystem access:** `ctx.fs` for read/write; `ctx.subprocess` for git (keeps tools sandbox-compatible). Tools run through the normal tool execution pipeline, so any `fs/*` policy applies.

**Scoping:** `crew-wiki` tools are registered in the calling context's scope. Mounted only by the `lorecat` preset composition (primary mode) and installed in the `lorecat` subagent persona's setup (dispatched mode), the tools are invisible to other presets and other subagent personas.

### LoreCat dual-mode

- **Primary mode:** `/lore-cat-save-it` command composes a `lorecat` preset agent. Can call DSH's user-interaction tool (`question()`) — direct mode.
- **Subagent mode:** A primary dispatches via `subagent({ persona: 'lorecat', continuable: true })`. The `lorecat` subagent persona's setup mounts `crew-wiki` in the child scope. Same `persona.md` body used in both modes.

## Commands

`crew-core/commands.ts` registers four commands on `ctx.commands`:

| Command | Handler |
|---|---|
| `/build <prompt>` | Compose agent from `pawbuilder` preset; deliver `<prompt>` as initial user message |
| `/patch <prompt>` | Compose agent from `patchpaw` preset; deliver `<prompt>` |
| `/cook <prompt>` | Compose agent from `letmeowcook` preset; deliver `<prompt>` |
| `/lore-cat-save-it` | Compose agent from `lorecat` preset; deliver the save instruction (uses current session context) |

Each handler calls `ctx.agentPresets.mount(agentCtx, id)` then `ctx.agents.create(...)` then `agent.followup(...)`. The command dispatches **without a model turn** — pure routing.

## Testing

DSH uses vitest. crew-code adds `vitest.config.ts` (unit + integration) and `vitest.e2e.config.ts`.

### Coverage

| Plugin | Key tests |
|---|---|
| `crew-core` | bootstrap section renders at order -90; `agent/pre-step` passes through; each command composes correct preset and delivers prompt; command dispatches without a model turn |
| `crew-skills` | provider lists vendored superpowers + project skills; restrictor shadows 14 process skills as `modelInvocable: false` for letmeowcook/lorecat scopes; restrictor does NOT affect pawbuilder/patchpaw scopes; drift test (every `vendor/superpowers/skills/*/SKILL.md` matching process-skill names is in restrictor list) |
| `crew-subagents` | each persona's toolFilter denies write tools + `subagent`; one-shot `start()` returns `SubagentResult`; continuable `startContinuable()` + `followup()` returns `{childId, messageId}`; cold resume re-applies setup; `judgewhiskers` setup restricts all process skills except the two review skills; `lorecat` setup mounts `crew-wiki` tools in child scope |
| `crew-wiki` | each of 6 tools reads/writes `.ai/docs` via `ctx.fs`; `wiki_save_concept` enforces path-inside-.ai/docs and preserves unknown OKF fields; `wiki_validate` catches YAML/link/index errors; `wiki_sync` regenerates index.md and appends log.md; tools invisible when not mounted under lorecat preset |
| `crew-presets` | each of 4 presets resolves via `ctx.agentPresets.resolve(id)`; each mounts correct plugin subset (capability matrix); persona section renders at order 0 |

## Packaging

```json
{
  "name": "@crew-code/dsh-crew-code",
  "version": "0.1.0",
  "dsh": { "bundle": "crew-code.yml" },
  "scripts": {
    "build": "tsdown",
    "test": "vitest run",
    "test:e2e": "vitest run --config vitest.e2e.config.ts",
    "subtree:pull": "git subtree pull --prefix=vendor/superpowers https://github.com/obra/superpowers.git main --squash"
  },
  "peerDependencies": {
    "@deepseek-ai/cordis": "workspace:*",
    "@deepseek-ai/dsh-agent": "workspace:*",
    "@deepseek-ai/dsh-agent-presets": "workspace:*",
    "@deepseek-ai/dsh-skill": "workspace:*",
    "@deepseek-ai/dsh-subagent": "workspace:*",
    "@deepseek-ai/dsh-tools": "workspace:*",
    "@deepseek-ai/dsh-fs": "workspace:*"
  }
}
```

## Install / profile wiring

`scripts/install.sh`:
1. Verifies `dsh` is on PATH.
2. Adds the crew-code bundle to the user's `web` or `headless` profile (via `dsh profile add-bundle` or editing the profile's `dsh.profile` list).
3. Runs `dsh --profile <name> --dump-config` to verify the rows landed.
4. Idempotent: re-running checks the bundle is already listed and no-ops.

No symlinks — DSH loads plugins from the bundle path.

## Verification (done criteria for v1)

1. `pnpm test` green — all unit + integration tests pass.
2. `pnpm test:e2e` green — end-to-end: mount crew-code in a test DSH context; `/build summarize this repo` composes PawBuilder and produces a response; `/patch`, `/cook`, `/lore-cat-save-it` likewise.
3. `dsh --profile web --dump-config` shows all 6 plugin rows.
4. PawBuilder dispatches Sherclaw one-shot and continuable; `subagent_followup` works; cold resume re-applies persona + skill restrictor.
5. LoreCat round-trip: `wiki_save_concept` → `wiki_validate` → `wiki_sync` on a temp `.ai/docs`.
6. LetMeowCook/LoreCat compositions reject `skill({ name: 'brainstorming' })` (process-skill restrictor); PawBuilder/PatchPaw accept it.
7. Subagents cannot call `subagent`/`edit`/`write`/`patch` (toolFilter enforced).

## Open questions (none blocking implementation)

- Exact DSH hook point for one-shot subagent child setup (pre-publication `setup` callback vs. `agent/created` event) — to be confirmed against DSH source during implementation.
- Whether `ctx.agentPresets` reads preset composition dirs from a configurable root or requires programmatic registration — affects `crew-presets/index.ts` shape.
- DSH `subagent` tool's exact parameter schema for `persona` and `toolFilter` — may require a custom tool definition rather than the shipped `dsh-tool-subagent` if the shipped tool doesn't expose these options.