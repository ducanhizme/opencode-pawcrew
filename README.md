<div align="center">

# OpenCode CrewKit

**Enterprise-grade agent crew for [OpenCode](https://opencode.ai)**

Controlled autonomy for software engineering teams. Clear ownership. Audit-ready decisions. Knowledge that survives the session.

[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f.svg)](LICENSE)
[![OpenCode](https://img.shields.io/badge/for-OpenCode-8A2BE2.svg)](https://opencode.ai)
[![Superpowers](https://img.shields.io/badge/process-Superpowers-FF6B35.svg)](https://github.com/obra/superpowers)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-6c757d.svg)](#status)

*Prompt lineage from [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent), adapted for native OpenCode without the orchestration overhead.*

</div>

---

## Story

Most AI coding assistants today are either too cautious — asking for permission on every line — or too reckless — editing production code, skipping tests, and leaving the codebase inconsistent with its own documentation.

CrewKit was built for teams that need a third way: **agents that act with bounded autonomy**, where every important decision is visible, every change is verified, and every session leaves the project knowledge corpus stronger.

It started as a set of custom OpenCode agents for maintainers who were tired of:
- Models that confuse "investigate" with "implement".
- Reviews that never happen because the wrong subagent got dispatched.
- Plans that look good but are never compared against what actually shipped.
- Docs that drift from code the moment the chat ends.

CrewKit treats these as design problems, not prompt-engineering hacks. The result is a small crew of agents with explicit authority boundaries, deterministic plugins for knowledge governance, and a PDCA loop that makes work auditable by default.

## Why CrewKit

- **Role clarity over role explosion** — four primary agents, five specialists, each with one job, one approval policy, and one completion contract. No agent-of-agents. No hidden runtime.
- **Native OpenCode** — agents, commands, skills, and permissions live in standard OpenCode config. No scheduler, no router, no custom orchestration layer to maintain.
- **Approval at the right gates** — PawBuilder stops at material design decisions, PatchPaw stops before the diff, LetMeowCook runs autonomously and reports at the end.
- **Deterministic knowledge governance** — LoreCat owns `.ai/docs` as the project truth corpus, with drift detection, source-of-truth reconciliation, and sanctioned write paths.
- **Verification-first completion** — no task is "done" without fresh evidence: tests, type checks, builds, and a Check Record against observable success criteria.
- **Continuous improvement loop** — the `pdca-loop` and `retrospective` skills convert every completed task into feedback for the kit itself.

## Status

**Beta · production-ready for experienced teams.**

CrewKit is actively used for real software engineering work on macOS and Linux with [OpenCode](https://opencode.ai) and the [Superpowers](https://github.com/obra/superpowers) plugin. The agent architecture, knowledge model, and PDCA workflow are stable. Prompt-level refinements and new skills land frequently, so pin a commit if you need reproducible behavior.

- Windows support is untested.
- Breaking changes between releases are expected while the kit stabilizes.
- Issues and PRs are welcome — see **Contributing** below.

This is a CLI/agent kit, not a visual app. The end-to-end walkthroughs in **Flows in action** below are the demo.

## The Crew

A small crew with explicit authority boundaries. No agent-of-agents, no hidden runtime.

### Primary agents

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin: 24px 0;">

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 20px; background: #ffffff;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
    <img src="images/pawbuilder.png" width="72" height="72" alt="PawBuilder" style="border-radius: 12px;">
    <div>
      <div style="font-size: 18px; font-weight: 700;">PawBuilder</div>
      <div style="font-size: 13px; color: #57606a;">Collaborative Feature Engineer</div>
    </div>
  </div>
  <p style="margin: 0 0 12px 0; font-size: 14px;">Takes a feature request from idea to verified implementation. Stops at material design decisions; user owns architecture, public API, schema, and behavior changes.</p>
  <div style="font-size: 12px;">
    <span style="display: inline-block; background: #ddf4ff; color: #0969da; padding: 3px 10px; border-radius: 999px; margin-right: 6px;">Approval: design gates</span>
    <span style="display: inline-block; background: #dafbe1; color: #1a7f37; padding: 3px 10px; border-radius: 999px;">Process: Superpowers</span>
  </div>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 20px; background: #ffffff;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
    <img src="images/patchpaw.png" width="72" height="72" alt="PatchPaw" style="border-radius: 12px;">
    <div>
      <div style="font-size: 18px; font-weight: 700;">PatchPaw</div>
      <div style="font-size: 13px; color: #57606a;">Change-Controlled Maintenance Engineer</div>
    </div>
  </div>
  <p style="margin: 0 0 12px 0; font-size: 14px;">Fixes bugs and implements bounded change requests with the smallest correct change. No material code change before user approves the proposed change.</p>
  <div style="font-size: 12px;">
    <span style="display: inline-block; background: #fff8c5; color: #7d4e00; padding: 3px 10px; border-radius: 999px; margin-right: 6px;">Approval: proposed change</span>
    <span style="display: inline-block; background: #ffebe9; color: #cf222e; padding: 3px 10px; border-radius: 999px;">Rule: no renovation</span>
  </div>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 20px; background: #ffffff;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
    <img src="images/letmeowcook.png" width="72" height="72" alt="LetMeowCook" style="border-radius: 12px;">
    <div>
      <div style="font-size: 18px; font-weight: 700;">LetMeowCook</div>
      <div style="font-size: 13px; color: #57606a;">Autonomous Execution Engineer</div>
    </div>
  </div>
  <p style="margin: 0 0 12px 0; font-size: 14px;">Owns a complete goal end-to-end: migrations, upgrades, CI fixes. No questions during execution except genuine blockers; mandatory outcome report and knowledge gates.</p>
  <div style="font-size: 12px;">
    <span style="display: inline-block; background: #fbefff; color: #8250df; padding: 3px 10px; border-radius: 999px; margin-right: 6px;">Autonomy: full</span>
    <span style="display: inline-block; background: #ffebe9; color: #cf222e; padding: 3px 10px; border-radius: 999px;">100% or nothing</span>
  </div>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 20px; background: #ffffff;">
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
    <img src="images/lorecat.png" width="72" height="72" alt="LoreCat" style="border-radius: 12px;">
    <div>
      <div style="font-size: 18px; font-weight: 700;">LoreCat</div>
      <div style="font-size: 13px; color: #57606a;">Project Knowledge Governor</div>
    </div>
  </div>
  <p style="margin: 0 0 12px 0; font-size: 14px;">Owns the project truth corpus under <code>.ai/docs</code> — specs, architecture, ADRs, workflows. Detects drift and reconciles sources of truth without silently rewriting normative knowledge.</p>
  <div style="font-size: 12px;">
    <span style="display: inline-block; background: #fff8c5; color: #7d4e00; padding: 3px 10px; border-radius: 999px; margin-right: 6px;">Source of truth</span>
    <span style="display: inline-block; background: #ddf4ff; color: #0969da; padding: 3px 10px; border-radius: 999px;">Drift detection</span>
  </div>
</div>

</div>

### Intelligence subagents

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; margin: 24px 0;">

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center;">
  <img src="images/sherclaw.png" width="64" height="64" alt="Sherclaw" style="border-radius: 12px; margin-bottom: 10px;">
  <div style="font-size: 16px; font-weight: 700;">Sherclaw</div>
  <div style="font-size: 12px; color: #0969da; margin-bottom: 8px;">Code Truth</div>
  <p style="margin: 0; font-size: 13px; color: #24292f;">Read-only internal investigator. Where things live, how they work, who depends on them.</p>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center;">
  <img src="images/searchpurr.png" width="64" height="64" alt="SearchPurr" style="border-radius: 12px; margin-bottom: 10px;">
  <div style="font-size: 16px; font-weight: 700;">SearchPurr</div>
  <div style="font-size: 12px; color: #0969da; margin-bottom: 8px;">External Truth</div>
  <p style="margin: 0; font-size: 13px; color: #24292f;">Official docs, upstream source, real-world usage. Labeled evidence via Context7, Exa, GitHub.</p>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center;">
  <img src="images/elderpaw.png" width="64" height="64" alt="ElderPaw" style="border-radius: 12px; margin-bottom: 10px;">
  <div style="font-size: 16px; font-weight: 700;">ElderPaw</div>
  <div style="font-size: 12px; color: #8250df; margin-bottom: 8px;">Technical Judgement</div>
  <p style="margin: 0; font-size: 13px; color: #24292f;">Architecture trade-offs, hard debugging, one concrete recommendation with effort + confidence.</p>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center;">
  <img src="images/judgewhiskers.png" width="64" height="64" alt="JudgeWhiskers" style="border-radius: 12px; margin-bottom: 10px;">
  <div style="font-size: 16px; font-weight: 700;">JudgeWhiskers</div>
  <div style="font-size: 12px; color: #8250df; margin-bottom: 8px;">Review Gate</div>
  <p style="margin: 0; font-size: 13px; color: #24292f;">Dispatched reviewer. Verdicts as BLOCKER / SHOULD-FIX / NIT with spec compliance evidence.</p>
</div>

<div style="border: 1px solid #d0d7de; border-radius: 12px; padding: 16px; background: #ffffff; text-align: center;">
  <img src="images/guardclaw.png" width="64" height="64" alt="GuardClaw" style="border-radius: 12px; margin-bottom: 10px;">
  <div style="font-size: 16px; font-weight: 700;">GuardClaw</div>
  <div style="font-size: 12px; color: #cf222e; margin-bottom: 8px;">Security Verdict</div>
  <p style="margin: 0; font-size: 13px; color: #24292f;">Focused security review for auth/authz, secrets, payments, untrusted input, sensitive data.</p>
</div>

</div>

## Quick start

```bash
git clone https://github.com/duwscan/opencode-crewkit.git
cd opencode-crewkit
./install.sh
```

`install.sh` is idempotent: it symlinks agents, commands, and skills into
`~/.config/opencode/` (available in **every project**) and pre-flights your
environment:

```
✓ Superpowers plugin configured and cached
✓ AST-Grep working (ast-grep 0.42.1)
✓ Context7 MCP configured
△ Exa MCP — set EXA_API_KEY to enable
```

Then **restart opencode** (config is not hot-reloaded) and pick your entry point:

| Command | Routes to | Use for |
|---|---|---|
| `/build <feature>` | PawBuilder | New features, subsystems, creative work |
| `/patch <bug or change>` | PatchPaw | Bugs, regressions, bounded behavior changes |
| `/cook <goal>` | LetMeowCook | Migrations, upgrades, "make CI pass" |
| `/lore-cat-save-it` | LoreCat | Persist this conversation's knowledge into `.ai/docs` (verified, normalized, linked — not chat dumps) |

With the native `build`/`plan` agents disabled, the default agent is **PawBuilder**.

## Tooling layer

Agents get tools by responsibility — the cheapest precise tool wins.

| Capability | PawBuilder | PatchPaw | LetMeowCook | LoreCat | Sherclaw | SearchPurr | ElderPaw | Reviewer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Read / Glob / Grep / LSP | ✅ | ✅ | ✅ | docs+git | ✅ | 📄 | ✅ | ✅ |
| AST-Grep (`sg`) | ✅ | ✅ | ✅ | ❌ | 🔍 no-rewrite | ❌ | optional | ✅ |
| Context7 (official docs) | light | via SearchPurr | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Exa (broad web) | via SearchPurr | via SearchPurr | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Public/GitHub code search | via SearchPurr | via SearchPurr | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Wiki tools (`.ai/docs`) | via LoreCat | via LoreCat | via LoreCat | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit | approval-gated | approval-gated | ✅ | ❌ (wiki tools only) | ❌ | ❌ | ❌ | ❌ |
| Run tests / typecheck | ✅ | ✅ | ✅ | git read-only | git/sg only | ❌ | git/sg only | ✅ |

**Search escalation policy** (shared across agents): exact text → `grep` · files →
`glob` · symbols/references → `LSP` · code shape → `AST-Grep` · official docs →
`Context7` · real-world usage → GitHub code search · broad discovery → `Exa`.

Every scoping rule is **enforced by OpenCode permission patterns**, not just
prompt suggestions — e.g. Sherclaw's `edit: deny`, `task: deny`, MCP denials, and
a hard block on `sg --update-all` (no rewrites from a read-only investigator).

## Skills

| Skill | Type | Purpose |
|---|---|---|
| [`ast-grep`](.opencode/skills/ast-grep/SKILL.md) | domain | Structural search & safe rewrite via `sg`; falls back to grep+LSP when the binary is missing — and never fakes a structural search |
| [`change-impact-analysis`](.opencode/skills/change-impact-analysis/SKILL.md) | analysis | Change contract without touching code: current → requested → delta → dependencies → risks → verification plan |
| [`contract-regression-testing`](.opencode/skills/contract-regression-testing/SKILL.md) | analysis | API/schema/event/serialization/config/CLI compatibility matrix and concrete regression checks before approval |
| [`bug-flow`](.opencode/skills/bug-flow/SKILL.md) | process | Root-cause-first fix procedure with pre-approval contract and post-approval TDD |
| [`change-request-flow`](.opencode/skills/change-request-flow/SKILL.md) | process | Impact-analysis-first procedure for bounded behavior/API changes with mandatory knowledge sync |
| [`delegation-policy`](.opencode/skills/delegation-policy/SKILL.md) | policy | Canonical subagent dispatch targets, review dispatch rules, and dispatch mechanics |
| [`pdca-loop`](.opencode/skills/pdca-loop/SKILL.md) | process | Deming PDCA loop: Plan Record → Run Log → Check Record → Knowledge Sync + Retrospective |
| [`retrospective`](.opencode/skills/retrospective/SKILL.md) | process | Extract process lessons and propose kit improvements after completed tasks |
| [Superpowers](https://github.com/obra/superpowers) | process | PawBuilder & PatchPaw's engine: brainstorming → writing-plans → TDD → verification-before-completion |

LetMeowCook deliberately **denies** Superpowers *process* skills (enforced via
`permission.skill` patterns) while keeping domain skills — autonomy is the point;
ceremony is not. JudgeWhiskers is scoped the inverse way: skill access is
default-deny with exactly two allows — `requesting-code-review` and
`receiving-code-review` — since it is the dispatch target of the Superpowers
review flow.

## PDCA loop

CrewKit follows the Deming cycle for non-trivial work:

- **Plan** — `pawbuilder` and `patchpaw` persist a Plan Record before user approval;
  `letmeowcook` creates one autonomously during Understand/Decide.
- **Do** — execute with a lightweight Run Log.
- **Check** — a Check Record compares observable success criteria against fresh evidence.
- **Act** — Knowledge Sync plus an optional Retrospective Note for recurring process lessons.

Artifacts live under `.ai/superpowers/plans/`, `.ai/superpowers/runs/`,
`.ai/superpowers/checks/`, and `.ai/superpowers/improvements/`.

## Design principles

```text
Agent prompt  = identity · authority · boundaries · delegation · approval · completion contract
Skill         = reusable procedure
Command       = user entrypoint (routing only)
AGENTS.md     = repository specifics
```

- **No agent-of-agents.** Subagents never spawn subagents (`task: deny`).
- **Approval gates where they matter.** PawBuilder stops at design decisions,
  PatchPaw stops before the diff, LetMeowCook stops for nothing except true blockers.
- **Evidence before completion.** "Should pass" means unverified. LetMeowCook's
  turn cannot end without an audit-style outcome report.
- **Adding a behavior rarely adds an agent.** Behavior that is always-on lives in
  prompts; reusable procedure lives in skills; advice lives in subagents.

## Flows in action

Real-world scenarios where multiple agents collaborate. Each flow ends with verification and knowledge sync.

### Scenario 1: Build a new feature end-to-end

A product manager asks for organization-level API keys with expiration and revocation.

```text
You: /build organization-level API keys with expiration and revocation

PawBuilder:  I read this as implementation: feature request → explore → design → approve → build.

  PLAN  ├─ Plan Record: .ai/superpowers/plans/2026-08-21-api-keys.md
        │   Goal: org API keys with expiration + revocation, verified by tests
        │   Success criteria:
        │     - [ ] New `api_keys` table stores key hash, scopes, expires_at, revoked_at
        │     - [ ] Middleware accepts org keys and rejects expired/revoked keys
        │     - [ ] Admin CLI can create, list, revoke keys
        │     - [ ] Migration is reversible; existing user keys unaffected
        │   Flow: multi-step + brainstorming + planning

  DO    ├─ sherclaw     "existing auth model, key storage patterns, similar features"
        │               → /src/auth/user-keys.ts exists; org keys do not
        ├─ elderpaw       "single table vs reuse sessions schema — trade-offs?"
        │               → recommendation: separate `api_keys` table, effort Medium, confidence high
        ├─ lorecat        "any accepted spec or ADR for org-level auth?"
        │               → no spec; create ADR-014 after approval
        └─ Superpowers  brainstorming → design doc under .ai/superpowers/specs/

  CHECK ⏸ APPROVAL GATE — material decisions:
        1. New `api_keys` table + migration (schema change)     ← needs you
        2. Revocation = hard delete vs soft revoke flag         ← needs you

You:   separate table, soft revoke flag. Approved.

  ACT   PawBuilder:  TDD implementation → tests green → typecheck clean
        ├─ judgewhiskers dispatch → VERDICT: APPROVED_WITH_NITS (2 nits, fixed)
        ├─ LoreCat sync: ADR-014 created, architecture.md updated
        └─ Check Record: .ai/superpowers/checks/2026-08-21-api-keys.md
           → all 4 success criteria PASS

        Done. Migrations in /db/migrations/0042_api_keys.sql, tests in /tests/auth/.
```

### Scenario 2: Fix a race-condition bug

Users get logged out during concurrent API requests.

```text
You: /patch users occasionally get logged out during concurrent API requests

PatchPaw:   I read this as a bug: sherclaw → evidence → root cause → propose → approve → fix.

  PLAN  ├─ Plan Record: .ai/superpowers/plans/2026-08-21-refresh-race.md
        │   Goal: eliminate double-refresh race causing 401 logout
        │   Success criterion: concurrent refresh test passes 100/100 runs

  DO    ├─ sherclaw    session refresh flow, middleware, token rotation
        │              → 3 refresh paths found, /src/auth/refresh.ts:41 suspicious
        ├─ reproduce   concurrent curl -j 2 refreshes → one 401 reproduced ✓
        ├─ Superpowers systematic-debugging
        │              root cause: double refresh race — second request revokes the
        │              token pair the first request just wrote (no lock, check-then-act)
        └─ elderpaw    "is a per-user mutex the right fix here?"
                       → yes; avoid subsystem rewrite, confidence high

  CHECK ⏸ APPROVAL GATE — proposed minimal fix:
       add per-user mutex in refresh handler + regression test
       (NOT a session-subsystem rewrite)

You:   approved.

  ACT   PatchPaw:   regression test (red: reproduced race) → implement lock → test green
        ├─ auth suite 34/34 → typecheck ✓
        ├─ LoreCat sync: behavior unchanged; no docs update needed
        └─ Check Record: race test 100/100 PASS

        Fixed. Root cause: check-then-act race at refresh.ts:41. Touched 2 files.
        Pre-existing unrelated flake in /tests/mail noted, not touched.
```

### Scenario 3: Change request with contract impact

Rename a public API field from flat to nested, affecting external consumers.

```text
You: /patch change SessionResponse from "userId" to "user.id" (nested)

PatchPaw:   I read this as a change request: current state → delta → impact → contract → approve.

  PLAN  ├─ Plan Record: .ai/superpowers/plans/2026-08-21-session-response.md
        │   Goal: nest user.id in SessionResponse without breaking mobile client
        │   Success criteria:
        │     - [ ] Serializer returns nested shape under X-API-Version: 2
        │     - [ ] Old shape still served under X-API-Version: 1
        │     - [ ] Integration tests cover both versions
        │     - [ ] API docs updated

  DO    ├─ sherclaw               consumers of SessionResponse: serializer, 2 frontends,
        │                         6 integration tests, mobile client (external)
        ├─ skill: change-impact-analysis
        │    current_state:  { userId: string }          — serializer.ts, 11 references
        │    requested_state: { user: { id: string } }
        │    compatibility:  breaking: true  (mobile client pinned to old shape)
        │    risks: stale consumers, contract tests, API docs
        │    proposed_change: serializer → contract test → frontends → API docs → version header
        └─ skill: contract-regression-testing
             → matrix: mobile client (old), web client (new), integration tests (both)

  CHECK ⏸ APPROVAL GATE — breaking change, mobile needs a release note

You:   approved, add X-API-Version header.

  ACT   PatchPaw:   implements exactly the contract → all consumers migrated → verify → done.
        ├─ integration tests 18/18 ✓
        ├─ contract tests added for v1 + v2
        ├─ LoreCat sync: API spec updated, ADR-015 created for versioned response shape
        └─ Check Record: all success criteria PASS

        PatchPaw fixes the thing. It does not renovate the neighborhood.
```

### Scenario 4: Autonomous migration

Bump a dependency major version and make CI green.

```text
You: /cook migrate this package to the new SDK version and make CI pass

LetMeowCook:  goal understood: bump sdk v2 → v3, all checks green. Stopping condition: CI ✓

  PLAN  ├─ Plan Record: .ai/superpowers/plans/2026-08-21-sdk-v3-migration.md
        │   Goal: SDK v3, CI green
        │   Success criteria:
        │     - [ ] 47 call sites compile against v3
        │     - [ ] 61/61 tests pass
        │     - [ ] CI pipeline green
        │     - [ ] No runtime auth regression

  DO    ├─ local survey        grep + LSP: 47 call sites, 12 use removed API
        ├─ AST-Grep            sg run -p '$SDK.createClient($$$A)' — repository-wide shape migration
        ├─ Context7 (direct)   v3 migration guide: createClient → initClient, auth moved to options
        ├─ searchpurr          how 3 major OSS repos handle the auth move
        ├─ implement           47 sites migrated
        └─ recover             build fails → read error → peer dep conflict → different approach ✓

  CHECK ├─ verify              build ✓ · typecheck ✓ · 61/61 tests ✓ · CI green ✓
        └─ Check Record: all 4 criteria PASS

  ACT   ├─ Gate 1: analyze knowledge impact? → Yes
        ├─ Gate 2: update .ai/docs/references/sdk-versions.md? → Yes
        ├─ Gate 3: record process lesson? → Yes
        │   → Retrospective: "AST-Grep pattern for SDK v3 auth move saved 2 hours;
        │      add to lessons-learned.md"
        └─ Outcome Report:
           ## Goal        migrate sdk v2→v3, CI passing (unchanged after investigation)
           ## Changed     14 files, sdk ^3.1.0, config/auth wiring
           ## Decisions   kept compat shim for initClient (removed in 2 call sites only);
           ##             upstream pattern C chosen over A (smaller diff, same behavior)
           ## Verified    build, typecheck, 61/61 tests, CI run #1842 green — this turn
           ## Remaining   shim removable after Q3 deprecation; flagged in CHANGELOG
```

### Scenario 5: Drift detection and reconciliation

Check whether the current auth implementation still matches the accepted spec.

```text
You: @lorecat does the current implementation satisfy the accepted auth spec?

LoreCat:   PROJECT TRUTH query → wiki_search/wiki_read .ai/docs

  DO    ├─ spec found      .ai/docs/specs/auth-session.md — normative, accepted,
        │                  verified_commit b06768c, covers src/auth/**
        ├─ claim check     dispatch Sherclaw: "verify: sessions stored in Redis
        │                  via RedisSessionStore" → DRIFT (store = postgres)
        └─ wiki_freshness  STALE_CANDIDATES (src/auth/session.ts changed after
                           verified_commit)

  CHECK ⏸ SOURCE-OF-TRUTH RECONCILIATION (direct mode — never silently picks a side):
        Project knowledge: sessions in Redis
        Verified implementation: sessions in PostgreSQL
        [Implementation is correct — update project knowledge]
        [Specification is correct — mark IMPLEMENTATION_DRIFT]
        [Do not reconcile yet]

You:   implementation is correct.

  ACT   LoreCat:   Wiki Update Plan → wiki_save_concept (spec updated, verified_commit
           refreshed, ADR-006 superseded + ADR-014 created rather than
           rewriting decision history) → wiki_sync → wiki_validate
           → Knowledge Updated report. Git recency was freshness evidence,
           never authority — your choice was.
```

### Scenario 6: Security review on a high-risk change

A change touches authentication and payment webhooks; you want a focused security pass.

```text
You: /patch add webhook signature verification for Stripe events

PatchPaw:   I read this as a change request: auth + payment boundary → impact → contract → approve.

  DO    ├─ sherclaw     current webhook handler, secret storage, signature parsing
        ├─ searchpurr    Stripe official signature verification docs
        ├─ change-impact-analysis → payment boundary affected
        └─ guardclaw     high-risk dispatch: auth/authz + secrets + untrusted input
             → findings: webhook secret in env only ✓, constant-time compare missing ✗,
               replay attack window not bounded ✗

  CHECK ⏸ APPROVAL GATE — guardclaw findings must be addressed before merge

You:   approved, fix both findings.

  ACT   PatchPaw:   implement constant-time compare + timestamp tolerance → tests
        ├─ guardclaw re-review → no new findings, residual risk: clock skew
        ├─ judgewhiskers code review → VERDICT: APPROVED
        ├─ LoreCat sync: security ADR updated with webhook verification pattern
        └─ Check Record: signature verification passes test vectors
```

## Credits

- **[oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent)** — role
  prompts descend from its Sisyphus (GLM variant), Hephaestus, Explore, Librarian,
  and Oracle prompts. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
- **[Superpowers](https://github.com/obra/superpowers)** — the process engine
  (brainstorming, planning, TDD, review, verification skills).
- **[OpenWiki](https://github.com/google/openwiki)** — OKF lifecycle, docs-only
  write guard, index synchronization, and no-op change detection concepts
  behind LoreCat's knowledge runtime.
- **[OpenCode](https://opencode.ai)** — the harness this is native to.

## License

[MIT](LICENSE) for this repository's original content, with attribution notices
for OMO-derived prompt content preserved in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)
(OMO content: free non-commercial distribution per its Sustainable Use License).

<div align="center">

**[Report a bug](https://github.com/duwscan/opencode-crewkit/issues)** ·
**[Request an agent](https://github.com/duwscan/opencode-crewkit/issues)** ·
Made with ☕ and too many agent frameworks

</div>
