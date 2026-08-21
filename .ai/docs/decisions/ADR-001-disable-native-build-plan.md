---
type: Decision
title: ADR-001 — Disable native build/plan agents
description: Tắt native build/plan agents qua stub disable:true; PawBuilder + Superpowers flow sở hữu implementation và planning với approval gates.
status: accepted
tags:
  - adr
  - agents
  - pawbuilder
sources:
  - .opencode/agent/build.md
  - .opencode/agent/plan.md
x_wikiguy:
  knowledge_kind: Decision
  authority: normative
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - .opencode/agent/build.md
    - .opencode/agent/plan.md
generated:
  by: lorecat
  date: 2026-08-17
---

# ADR-001: Disable native build/plan agents

- **Status**: accepted
- **Date**: 2026-08-17 (ghi lại từ git history, commit `ddc250e` → `91d496c`)

## Context

OpenCode cung cấp agent `build` và `plan` native. Trong CrewKit, vai trò implementation và planning đã được giao cho các primary agent với quy trình rõ ràng và approval gates.

## Decision

Tắt native `build` và `plan` qua stub files (`disable: true`):

- `.opencode/agent/build.md` — "Native build agent disabled in favor of PawBuilder (same role: implementation, but with Superpowers process and explicit approval gates)."
- `.opencode/agent/plan.md` — "Planning is owned by PawBuilder's Superpowers flow (brainstorming → writing-plans) with user approval gates."

Hệ quả mặc định: khi `build` bị disable, default agent resolve thành **PawBuilder**.

## Consequences

- Không trùng vai trò: một chủ sở hữu cho implementation (PawBuilder), một chủ sở hữu cho planning (Superpowers flow qua PawBuilder)
- Người dùng có entrypoint rõ ràng qua `/build` routing command
- Stub phải giữ `disable: true`; nếu native agent được bật lại, đây là thay đổi quyết định cần ADR mới

## Revisit

Bật lại native build/plan chỉ hợp lý nếu cần tách planning khỏi PawBuilder hoặc dùng native flow thay Superpowers.
