---
type: Decision
title: ADR-002 — LoreCat as Project Knowledge Governor
description: Thiết lập .ai/docs/** là corpus kiến thức dự án duy nhất có thẩm quyền, LoreCat mode:all, plugin lore-cat.ts deterministic, OKF knowledge model, write discipline, freshness bằng git history.
status: accepted
tags:
  - adr
  - lorecat
  - knowledge
  - okf
sources:
  - .opencode/agent/lorecat.md
  - .opencode/plugin/lore-cat.ts
  - .opencode/command/lore-cat-save-it.md
  - .opencode/GLOBAL-RULES.md
x_wikiguy:
  knowledge_kind: Decision
  authority: normative
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - .opencode/agent/lorecat.md
    - .opencode/plugin/lore-cat.ts
    - .opencode/command/lore-cat-save-it.md
    - .opencode/GLOBAL-RULES.md
generated:
  by: lorecat
  date: 2026-08-17
---

# ADR-002: LoreCat — Project Knowledge Governor

- **Status**: accepted
- **Date**: 2026-08-17 (ghi lại từ git history, commit `02f83a1` → `a897523` → `96e66ba`)

## Context

CrewKit cần một chủ sở hữu duy nhất cho project knowledge: điều dự án tuyên bố **nên** đúng (specs, architecture, ADRs, workflows), tách khỏi code truth (điều repo **đang** làm). Nếu không có corpus có thẩm quyền, kiến thức sống rải rác trong chat, README và trí nhớ agent.

## Decision

1. **`.ai/docs/**` là corpus kiến thức dự án duy nhất có thẩm quyền.** Mọi persistent project knowledge sống dưới `.ai/docs/`; LoreCat chịu trách nhiệm quản lý và validate.
2. **LoreCat là agent `mode: all`** — vừa user-facing (direct mode) vừa dispatchable (subagent mode).
3. **Plugin deterministic `lore-cat.ts`** cung cấp đúng sáu công cụ: `wiki_search`, `wiki_read`, `wiki_freshness`, `wiki_save_concept`, `wiki_validate`, `wiki_sync` — chỉ thao tác `.ai/docs/**`, git read-only, không có hành vi heuristic.
4. **OKF knowledge model**: kinds `Specification | Architecture | Decision | Workflow | Reference`; authority `normative` vs `descriptive`; spec lifecycle `draft → proposed → accepted → implemented → verified → deprecated`; tách approval khỏi implementation state (`x_wikiguy.spec: { approval, implementation }`).
5. **Write discipline**: analysis luôn được phép (search/read/freshness/verification); writes chỉ qua wiki tools, chỉ khi workflow chủ quản cho phép — direct reconciliation, approved Knowledge Update Plan (LetMeowCook Gate 2), PatchPaw approved Change Contract auto-sync, hoặc `/lore-cat-save-it`. No-op saves là hành vi đúng.
6. **Freshness bằng git commit history, không phải mtime**; `verified_commit` + `covers` cho trạng thái `LIKELY_FRESH` / `STALE_CANDIDATES`. Git recency là bằng chứng, không phải thẩm quyền.
7. **Normative knowledge không bao giờ bị viết lại âm thầm** để khớp code; user sở hữu quyết định nguồn sự thật. ADR bị vô hiệu phải được supersede (`SUPERSEDED` + ADR mới), không xóa lịch sử quyết định.
8. **Global rules** (`.opencode/GLOBAL-RULES.md`): Superpowers artifacts redirect sang `.ai/superpowers/`; documentation ownership tuyên bố LoreCat quản `.ai/docs` — được cài vào `~/.config/opencode/AGENTS.md` dưới managed block.

## Consequences

- Mọi agent (PawBuilder/PatchPaw/LetMeowCook) đều có thể dispatch LoreCat để lấy project truth; PatchPaw có auto-sync bắt buộc cho change requests; LetMeowCook có đúng hai knowledge gates sau hoàn thành
- `/lore-cat-save-it` là entrypoint người dùng để persist kiến thức hội thoại vào corpus
- Plugin phải được khai báo trong `~/.config/opencode/opencode.json(c)`; install.sh kiểm tra cấu hình này

## Revisit

Corpus ngoài `.ai/docs` hoặc cơ chế ghi thứ hai cần ADR mới. Thêm công cụ ghi không qua `wiki_save_concept` vi phạm quyết định này.
