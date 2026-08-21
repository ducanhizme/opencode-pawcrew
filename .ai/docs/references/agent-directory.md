---
type: Reference
title: Agent Directory
description: Danh bạ agent CrewKit — vai trò, mode, model, approval contract, ràng buộc permission chính, disable stubs, bốn truths.
status: accepted
tags:
  - reference
  - agents
  - directory
sources:
  - .opencode/agent/**
x_wikiguy:
  knowledge_kind: Reference
  authority: descriptive
  verified_commit: 42ed4aa88a50df868e9a27fc1f98b232355de434
  covers:
    - .opencode/agent
generated:
  by: lorecat
  date: 2026-08-18
---

# Agent Directory

Danh bạ đầy đủ các agent trong CrewKit, theo `.opencode/agent/`.

## Primary agents

| Agent | File | Mode | Vai trò | Approval | Model |
|---|---|---|---|---|---|
| PawBuilder | `pawbuilder.md` | primary | Collaborative feature engineer — idea → design → approval → verified implementation (Superpowers engine) | Material design decisions | `zai-coding-plan/glm-5.3` |
| PatchPaw | `patchpaw.md` | primary | Change-controlled maintenance — smallest correct change, bug vs change request | Proposed change trước mọi edit | `zai-coding-plan/glm-5.3` |
| LetMeowCook | `letmeowcook.md` | primary | Autonomous executor — owns goal end-to-end, recovers, outcome report bắt buộc | Không có trong execution; đúng hai knowledge gates | `zai-coding-plan/glm-5.3` |
| LoreCat | `lorecat.md` | **all** | Project knowledge governor — `.ai/docs`, drift, source-of-truth reconciliation | Direct: user chọn; subagent: evidence only | `zai-coding-plan/glm-5.3` |

## Subagents

| Agent | File | Mode | Vai trò | Ràng buộc chính |
|---|---|---|---|---|
| Sherclaw | `sherclaw.md` | subagent | Internal code investigator — evidence only, absolute paths | `edit/task/question/todowrite` deny; MCP deny; `sg --update-all` deny; skill tool bật nhưng deny 14 Superpowers skills |
| SearchPurr | `searchpurr.md` | subagent | External researcher — docs/source/usage, labeled evidence có link | `edit/task/question/todowrite` deny; `glob/grep/lsp` deny; `skill: false`; bash chỉ `gh/git clone/git log/curl/npm view/ls` |
| ElderPaw | `elderpaw.md` | subagent | Technical advisor — một recommendation + effort/confidence | `edit/task/question/todowrite` deny; MCP deny; `skill: false`; git read-only + `sg run` (no rewrite) |
| JudgeWhiskers | `judgewhiskers.md` | subagent | Dispatched review gate — verdict-first, severity findings | `edit/task/question/todowrite` deny; MCP deny; `permission.skill` default-deny, allow đúng 2 review skills (`requesting-code-review`, `receiving-code-review`); mọi git mutating deny (read-only checkout) |
| GuardClaw | `guardclaw.md` | subagent | Focused security review — explicit/high-risk scope, evidence-backed vulnerability verdict | `edit/task/question/todowrite` deny; `skill: false`; MCP deny; mọi git mutating deny (read-only checkout) |

## Disable stubs

| File | Nội dung |
|---|---|
| `build.md` | `disable: true` — native build agent tắt, PawBuilder thay thế |
| `plan.md` | `disable: true` — native plan agent tắt, Superpowers flow (PawBuilder) sở hữu planning |

## Đặc điểm chung

- Mọi active agent khai báo `model:` tường minh kèm provider prefix (`zai-coding-plan/glm-5.3`).
- Subagents không bao giờ spawn agent (`task: deny`) và không bao giờ edit (`edit: deny`).
- Skill loading: LoreCat/SearchPurr/ElderPaw/GuardClaw `tools.skill: false`; JudgeWhiskers `permission.skill` default-deny với đúng 2 allow (review skills, xem ADR-005); Sherclaw/LetMeowCook giữ skill tool nhưng deny 14 Superpowers process skills.
- LoreCat là agent duy nhất có `mode: all` — user-facing + dispatchable, với plugin deterministic `lore-cat.ts`.

## Bốn truths — ai trả lời gì

| Câu hỏi | Agent |
|---|---|
| "Code này đang làm gì / nằm ở đâu?" | Sherclaw |
| "Dự án chính thức nói gì / còn đúng không?" | LoreCat |
| "API upstream / docs ngoài nói gì?" | SearchPurr |
| "Nên chọn phương án nào, đánh đổi ra sao?" | ElderPaw |
