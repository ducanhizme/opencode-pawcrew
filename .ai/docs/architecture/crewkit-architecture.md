---
type: Architecture
title: CrewKit Architecture
description: Hệ thống agent native-first cho OpenCode — bốn truths, bốn primary + bốn subagent, phân tách core (prompt/skill/command/AGENTS.md), tooling layer, LoreCat layer, editing conventions, mô hình cài đặt.
status: accepted
tags:
  - architecture
  - agents
  - opencode
sources:
  - AGENTS.md
  - README.md
  - .opencode/agent/**
  - .opencode/skills/**
  - .opencode/command/**
  - .opencode/plugin/**
x_wikiguy:
  knowledge_kind: Architecture
  authority: descriptive
  verified_commit: cd4cc39af1aac97220667fa6f930041dbf9ed00b
  covers:
    - .opencode/agent
    - .opencode/skills
    - .opencode/command
    - .opencode/plugin
    - AGENTS.md
    - install.sh
generated:
  by: lorecat
  date: 2026-08-19
---

# CrewKit Architecture

OpenCode CrewKit là một hệ thống agent tối giản, native-first cho [OpenCode](https://opencode.ai): bốn primary agents, một knowledge governor, năm intelligence subagents, sáu kit skills (cộng các Superpowers external skills), bốn routing commands, và hai deterministic plugins. Không có orchestration runtime — mọi thứ đều là file cấu hình OpenCode native (agents, permissions, skills, commands).

## Bốn truths

Mọi câu hỏi trong hệ thống được phân loại theo nguồn sự thật:

| Truth | Chủ sở hữu | Nguồn thẩm quyền |
|---|---|---|
| CODE truth | Sherclaw | Repository hiện tại (HEAD) |
| PROJECT truth | LoreCat | `.ai/docs/**` |
| EXTERNAL truth | SearchPurr | Tài liệu/source bên ngoài |
| JUDGEMENT | ElderPaw | Khuyến nghị kỹ thuật |

`AGENTS.md` của repo tuyên bố rõ: `.ai/docs` là thẩm quyền cho điều dự án nói **nên** đúng; Sherclaw là thẩm quyền cho điều repo **đang** làm. Git recency là bằng chứng freshness, không bao giờ là thẩm quyền.

## Danh sách agent

| Agent | Mode | Vai trò | Approval contract |
|---|---|---|---|
| PawBuilder | primary | Feature engineer cộng tác (idea → design → approval → verified) | Quyết định thiết kế vật chất |
| PatchPaw | primary | Bảo trì change-controlled (bug/bounded change, smallest correct change) | Proposed change trước mọi edit |
| LetMeowCook | primary | Executor tự trị (sở hữu goal end-to-end) | Không có trong execution; đúng hai knowledge gates sau hoàn thành |
| LoreCat | all | Knowledge governor — `.ai/docs`, drift detection, source-of-truth reconciliation | Direct: user chọn nguồn sự thật; subagent: evidence only |
| Sherclaw | subagent | Điều tra code read-only (evidence, không opinion) | — |
| SearchPurr | subagent | Nghiên cứu ngoài (docs/source, evidence có link) | — |
| ElderPaw | subagent | Tư vấn kỹ thuật (một khuyến nghị, effort/confidence) | — |
| JudgeWhiskers | subagent | Review gate: spec compliance + quality verdicts | — |
| GuardClaw | subagent | Focused security review: explicit/high-risk scope, evidence-backed vulnerability verdict | — |

`build` và `plan` native bị tắt qua stub (`disable: true`) — PawBuilder và Superpowers flow sở hữu vai trò đó.

## Phân tách core (không vi phạm)

```
Agent prompt  = identity · authority · boundaries · delegation · approval · completion contract
Skill         = reusable procedure
Command       = user entrypoint (routing only)
AGENTS.md     = repository specifics
```

Quy tắc: **không bao giờ duplicate cùng một workflow trong agent prompt VÀ skill/command.** Repository specifics sống trong AGENTS.md của dự án, không bao giờ trong prompt.

## Tooling layer

Nguyên tắc: công cụ rẻ và chính xác nhất thắng; mọi scoping đều được **ép buộc bằng OpenCode permission patterns**, không chỉ gợi ý prompt.

- Local intelligence: read, glob, grep, LSP, AST-Grep (`sg`)
- External intelligence: Context7 MCP (official docs), Exa MCP (broad web, cần `EXA_API_KEY`), GitHub/public code search (`gh search code`)
- Search escalation: exact text → grep · files → glob · symbols → LSP · code shape → AST-Grep · official docs → Context7 · real-world usage → GitHub code search · broad discovery → Exa
- Skill loading: LoreCat/SearchPurr/ElderPaw/GuardClaw đặt `tools.skill: false`; JudgeWhiskers dùng `permission.skill` default-deny với đúng 2 allow — `requesting-code-review` + `receiving-code-review` (ADR-005); Sherclaw/LetMeowCook giữ skill tool nhưng deny cả 14 Superpowers process skills qua `permission.skill` patterns
- `judgewhiskers` là ngoại lệ có chủ đích của "no agent per behavior" — Superpowers skills dispatch code review theo description (xem ADR-004)

## LoreCat layer

LoreCat (`mode: all`) vừa user-facing (direct mode: reconciliation questions allowed) vừa dispatchable (subagent mode: structured conflict evidence, không bao giờ `question()`).

- Corpus duy nhất: `.ai/docs/**` (OKF Markdown — frontmatter + body)
- Plugin deterministic `lore-cat.ts`: `wiki_search`, `wiki_read`, `wiki_freshness`, `wiki_save_concept`, `wiki_validate`, `wiki_sync` — chỉ thao tác `.ai/docs/**`, git read-only
- Knowledge kinds: Specification | Architecture | Decision | Workflow | Reference
- Authority: normative (specs, contracts, ADRs — drift = `IMPLEMENTATION_DRIFT`) vs descriptive (architecture, workflows — drift = `DOCUMENTATION_DRIFT`)
- Normative knowledge không bao giờ bị viết lại âm thầm để khớp code; user sở hữu quyết định nguồn sự thật
- Writes chỉ qua wiki tools, chỉ khi workflow chủ quản cho phép (xem workflow `knowledge-sync`)
- Conflict evidence (subagent mode) là format YAML duy nhất hiển thị trong chat — short scalars/enums/shas, trao đổi agent-to-agent; các artifact trình user (như PatchPaw Change Contract) dùng labeled markdown vì giá trị là prose

## Editing conventions

- Mọi active agent khai báo `model:` tường minh (mặc định `zai-coding-plan/glm-5.3`, giá trị phải kèm provider prefix)
- Permission dùng pattern rules, rule khớp **sau cùng** thắng: rule rộng `"*"` trước, rule hẹp sau
- Subagents không bao giờ spawn agent (`task: deny`) và không bao giờ edit (`edit: deny`)
- Agents không có OMO runtime references; lineage prompt từ OMO (Sisyphus/Hephaestus/Explore/Librarian/Oracle), xem `THIRD-PARTY-NOTICES.md`
- Prompt fragments dùng chung (mode flows, delegation common core) sống trong `.opencode/skills/` dạng OpenCode skills (`bug-flow`, `change-request-flow`, `contract-regression-testing`, `delegation-policy`) — agents load qua `skill` tool on-demand (`skill("bug-flow")` / `skill("change-request-flow")` sau classification PatchPaw hard gate; `skill("contract-regression-testing")` khi contract surface bị ảnh hưởng; `skill("delegation-policy")` khi delegate); per-agent Need wording giữ inline trong prompt. Không còn refs/ directory.
- Display-format rule: YAML chỉ cho schema short-scalar/enum trao đổi agent-to-agent (không parser, không prose đa dòng); labeled markdown cho mọi artifact trình user chứa prose

## Mô hình cài đặt

`install.sh` idempotent: symlink từng file vào `~/.config/opencode/` (agent, command, skills, plugin) — skill dirs auto-symlink qua `skills/*/SKILL.md` glob (6 kit skills + external), quản lý block global rules trong `~/.config/opencode/AGENTS.md`, pre-flight môi trường (Superpowers plugin, ast-grep, MCP Context7/Exa, LoreCat plugin). Khi nâng cấp từ bản có `refs/` cũ, install tự dọn symlink `$DEST/refs` lửng lơ (refs moved sang skills/). `--force` thay thế regular file xung đột. Sau cài đặt phải khởi động lại opencode (config không hot-reload). Chi tiết: workflow `installation`.

## Routing commands

| Command | Routes to | Dùng cho |
|---|---|---|
| `/build <feature>` | PawBuilder | Feature mới, subsystem |
| `/patch <bug-or-change>` | PatchPaw | Bug, regression, bounded change |
| `/cook <goal>` | LetMeowCook | Migration, upgrade, "make CI pass" |
| `/lore-cat-save-it` | LoreCat | Persist kiến thức hội thoại vào `.ai/docs` (verified, normalized, linked) |

## Luồng chính

- **PawBuilder**: explore → design → ⏸ approval gate (material design decisions) → Superpowers plan → TDD → verify → judgewhiskers dispatch; guardclaw chỉ cho yêu cầu security hoặc high-risk boundary
- **PatchPaw**: classification hard gate (output `Classification: BUG | CHANGE REQUEST` trước mọi action) → load skill flow tương ứng (`skill("bug-flow")` | `skill("change-request-flow")`) → sherclaw/LoreCat evidence → root cause / impact → change contract (Recommended flow + Alternative flows, labeled markdown) → ⏸ approval (user chọn flow: 1-step | multi-step+brainstorming+planning) → implement theo flow đã chọn (Flow Menu) → verify → **LoreCat auto-sync** (bắt buộc cho change request)
- **LetMeowCook**: goal → explore → execute → verify → outcome report (bắt buộc) → Q1 knowledge impact → Q2 apply wiki plan
- **LoreCat**: query → wiki_search/wiki_read → classify claims → Sherclaw verification → freshness → trả lời hoặc báo conflict

## Design principles

- No agent-of-agents: subagents không spawn subagents
- Approval gates đúng chỗ: PawBuilder dừng ở design decisions, PatchPaw dừng trước diff, LetMeowCook không dừng trừ blocker thật sự
- Evidence before completion: "should pass" nghĩa là chưa verified
- Thêm behavior hiếm khi thêm agent: behavior luôn bật sống trong prompts; procedure dùng lại sống trong skills; advice sống trong subagents
