---
type: Decision
title: ADR-004 — JudgeWhiskers as deliberate exception
description: judgewhiskers là ngoại lệ có chủ đích của no-agent-per-behavior — Superpowers skills dispatch review theo description, Sherclaw cấm opinion; Sherclaw description repels review dispatches.
status: accepted
tags:
  - adr
  - judgewhiskers
  - sherclaw
  - superpowers
sources:
  - .opencode/agent/judgewhiskers.md
  - .opencode/agent/sherclaw.md
x_wikiguy:
  knowledge_kind: Decision
  authority: normative
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - .opencode/agent/judgewhiskers.md
    - .opencode/agent/sherclaw.md
generated:
  by: lorecat
  date: 2026-08-17
---

# ADR-004: JudgeWhiskers — ngoại lệ có chủ đích của "no agent per behavior"

- **Status**: accepted
- **Date**: 2026-08-17 (ghi lại từ git history, commit `5826071`)

## Context

Nguyên tắc thiết kế của CrewKit: "Adding a behavior rarely adds an agent" — behavior luôn bật sống trong prompts, procedure dùng lại sống trong skills, advice sống trong subagents. Nhưng Superpowers skills (`requesting-code-review`, `subagent-driven-development`) dispatch một judgewhiskers subagent **theo description** ("Review code changes", "Review Task N (spec + quality)").

Khi không có agent khớp, model improvise và chọn **Sherclaw** — mà prompt của Sherclaw **cấm opinion** ("No recommendations, no opinions on design"). Kết quả là review dispatch rơi vào agent không được thiết kế cho việc đó.

## Decision

1. **Tạo `judgewhiskers` subagent** — ngoại lệ duy nhất, có chủ đích của "no agent per behavior": chuyên gia review được dispatch, verdict-first, severity-gated findings.
2. **Đẩy review dispatches ra khỏi Sherclaw**: description của Sherclaw tường minh chống review ("Investigation only - NOT for code review, quality judgment, or recommendations (dispatch judgewhiskers for that)").
3. **JudgeWhiskers là target chuẩn** cho mọi Superpowers review dispatch.

## Consequences

- Review dispatch có đích đến khớp: spec compliance + quality verdicts (`APPROVED` / `APPROVED_WITH_NITS` / `REQUEST_CHANGES`)
- JudgeWhiskers read-only trên checkout (mọi git mutating deny), tự chạy tests, không subagent, không sửa findings
- Không tạo thêm agent per-behavior khác; ngoại lệ này không mở tiền lệ

## Revisit

Nếu Superpowers đổi cơ chế dispatch (không còn theo description), cân nhắc giữ hay bỏ agent này. Mọi agent per-behavior mới cần ADR riêng.
