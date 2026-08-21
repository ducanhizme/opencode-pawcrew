---
type: Specification
title: Agent Prompt Contract
description: Hợp đồng chuẩn tắc (normative) để soạn agent, command và skill trong CrewKit — frontmatter bắt buộc, permission last-match-wins, ràng buộc subagent, phân tách core, cấm duplicate workflow.
status: accepted
tags:
  - specification
  - contract
  - agent-authoring
sources:
  - AGENTS.md
  - .opencode/agent/**
  - .opencode/skills/**
  - .opencode/command/**
x_wikiguy:
  knowledge_kind: Specification
  authority: normative
  verified_commit: cd4cc39af1aac97220667fa6f930041dbf9ed00b
  covers:
    - .opencode/agent
    - .opencode/skills
    - .opencode/command
    - AGENTS.md
generated:
  by: lorecat
  date: 2026-08-19
---

# Agent Prompt Contract

Hợp đồng chuẩn tắc này ràng buộc cách soạn mọi thành phần trong CrewKit: agent prompts, commands, skills. Nếu implementation vi phạm, đó là `IMPLEMENTATION_DRIFT` — không viết lại hợp đồng âm thầm để khớp code.

## 1. Phân tách core (bất khả xâm phạm)

- **Agent prompt** = identity, authority, boundaries, delegation policy, approval policy, completion contract
- **Skill** = reusable procedure (kit skills: `ast-grep`, `bug-flow`, `change-request-flow`, `contract-regression-testing`, `delegation-policy`, `change-impact-analysis`; Superpowers external process skills)
- **Command** = user-facing entrypoint (routing only)
- **Repository specifics** = AGENTS.md của dự án, không bao giờ trong prompt
- **Refs** (đã bỏ) — prompt fragments dùng chung (mode flows, delegation common core) giờ sống trong `.opencode/skills/` dạng OpenCode skills: `bug-flow` + `change-request-flow` (load sau classification PatchPaw hard gate qua `skill("bug-flow")` / `skill("change-request-flow")`), `contract-regression-testing` (load khi contract surface bị ảnh hưởng), `delegation-policy` (load khi delegate qua `skill("delegation-policy")`); per-agent wording (Need mapping) giữ inline trong prompt

Cấm: duplicate cùng một workflow trong agent prompt VÀ skill/command.

## 2. Frontmatter bắt buộc

Mọi active agent (không phải stub) phải khai báo:

- `description:` — mô tả vai trò, dùng cho dispatch routing
- `mode:` — `primary` | `subagent` | `all` (LoreCat dùng `all`: vừa user-facing vừa dispatchable)
- `model:` — ID model tường minh kèm provider prefix (mặc định `zai-coding-plan/glm-5.3`); stub không cần
- `color:` — (tùy chọn, khuyến khích) màu hiển thị
- `permission:` — pattern rules (xem §3)
- `tools:` — (khi cần) `skill: false` để tắt skill tool hoàn toàn

Stub disable dùng `disable: true` và không cần model.

## 3. Quy tắc permission

- Pattern rules: rule khớp **sau cùng** thắng (last-match-wins). Viết rule rộng `"*"` trước, rule hẹp sau.
- Mọi scoping được ép buộc bằng permission patterns, không chỉ gợi ý prompt (ví dụ: Sherclaw `edit: deny`, `task: deny`, MCP denials, block `sg --update-all`).

## 4. Ràng buộc subagent

- Subagents **không bao giờ** spawn agent tiếp theo: `task: deny`
- Subagents **không bao giờ** edit: `edit: deny`
- Primary agents dispatch the kit's intelligence and review subagents: `task: allow` is declared explicitly rather than inherited from global configuration
- Subagent điều tra (Sherclaw/ElderPaw/SearchPurr): `question: deny`, `todowrite: deny` nơi phù hợp
- JudgeWhiskers: read-only trên checkout (mọi git mutating bị deny), tự chạy tests, verdict-first
- GuardClaw: read-only focused security review, chỉ report vulnerability có evidence + exploit path + confidence; không thay thế JudgeWhiskers review tổng quát
- Sherclaw: `edit/task/question/todowrite` deny, MCP deny, `sg --update-all` deny — evidence only, absolute paths

## 5. Skill loading theo agent

| Agent | Skill tool | Superpowers process skills |
|---|---|---|
| PawBuilder | bật | dùng tự do (Superpowers là engine) |
| PatchPaw | bật | dùng tự do |
| LetMeowCook | bật | deny cả 14 (autonomy — ceremony không phải engine) |
| Sherclaw | bật | deny cả 14 (giữ domain skills: ast-grep, docker...) |
| LoreCat / SearchPurr / ElderPaw / GuardClaw | `skill: false` (tắt hẳn) | n/a |
| JudgeWhiskers | bật | `permission.skill` default-deny — allow đúng `requesting-code-review` + `receiving-code-review` (xem ADR-005) |

Kit skills (`bug-flow`, `change-request-flow`, `contract-regression-testing`, `delegation-policy`, `ast-grep`, `change-impact-analysis`) available cho mọi agent có skill tool bật, trừ khi bị deny qua `permission.skill` patterns.

## 6. Cấu trúc prompt

- PawBuilder/PatchPaw: intent classification (PatchPaw: classification hard gate — output `Classification: BUG | CHANGE REQUEST` trước mọi action rồi load skill flow tương ứng `skill("bug-flow")` / `skill("change-request-flow")`), outcome/evidence-first, approval contract tường minh, delegation policy (`skill("delegation-policy")` cho common core, Need mapping inline), verification discipline
- LetMeowCook: autonomy contract, forbidden questions, operating loop, đúng hai post-completion knowledge gates, completion report bắt buộc
- LoreCat: knowledge model (kinds, authority, spec lifecycle, doc states), query flow, direct/subagent modes, write discipline, completion report
- Sherclaw: `<analysis>` intent block, `<results>` structured output, success/failure criteria, stop conditions
- SearchPurr: request classification (TYPE A–D), evidence labels (`[official docs]` / `[real-world implementation]` / `[community discussion]`), permalink evidence format
- ElderPaw: pragmatic minimalism, three-tier response, effort/confidence tags, scope discipline
- JudgeWhiskers: review dimensions, verify-don't-trust, read-only discipline, verdict-first output, severity rules
- GuardClaw: threat-boundary review, candidate challenge trước report, exploit-path/confidence evidence, read-only discipline

## 7. Giới hạn lineage

- Agents không chứa OMO runtime references (không background agents, task IDs, category routing, planner/orchestrator, tool schemas của OMO)
- Prompt lineage từ OMO phải giữ attribution trong `THIRD-PARTY-NOTICES.md` (xem ADR-003)

## 8. Tuân thủ

Mọi thay đổi thêm/sửa agent, command, skill trong repo phải khớp hợp đồng này. Command chỉ được chứa routing (frontmatter `agent:` + `$ARGUMENTS`) — không chứa procedure.
