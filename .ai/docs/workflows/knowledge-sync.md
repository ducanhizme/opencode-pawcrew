---
type: Workflow
title: Knowledge Sync Workflow
description: Bốn đường ghi kiến thức được phép vào .ai/docs — direct reconciliation, LetMeowCook Gates 1-2, PatchPaw Change Request auto-sync, /lore-cat-save-it; write discipline, validation, trạng thái tài liệu.
status: accepted
tags:
  - workflow
  - lorecat
  - knowledge-sync
  - okf
sources:
  - .opencode/agent/lorecat.md
  - .opencode/agent/letmeowcook.md
  - .opencode/agent/patchpaw.md
  - .opencode/command/lore-cat-save-it.md
x_wikiguy:
  knowledge_kind: Workflow
  authority: descriptive
  verified_commit: 42ed4aa88a50df868e9a27fc1f98b232355de434
  covers:
    - .opencode/agent/lorecat.md
    - .opencode/agent/letmeowcook.md
    - .opencode/agent/patchpaw.md
    - .opencode/command/lore-cat-save-it.md
generated:
  by: lorecat
  date: 2026-08-18
---

# Workflow: Knowledge Sync vào `.ai/docs`

Mô tả bốn đường ghi kiến thức được phép vào corpus, theo Write Discipline của LoreCat: **analysis luôn được phép; writes chỉ qua wiki tools, chỉ khi workflow chủ quản cho phép.**

## Nguyên tắc chung

- Mọi write đi qua `wiki_save_concept` (đường ghi hợp lệ duy nhất), sau đó `wiki_sync` (index/log) rồi `wiki_validate`.
- Normative knowledge không bao giờ bị viết lại âm thầm để khớp code. ADR bị vô hiệu → `SUPERSEDED` + ADR mới.
- No-op saves là hành vi đúng: "No documentation changes required" — không tạo metadata/log noise.

## Đường 1: Direct reconciliation (LoreCat user-facing)

Khi LoreCat phát hiện **material conflict** giữa `.ai/docs` và implementation đã verify, nó hỏi user chọn nguồn sự thật:

- **[Implementation is correct — update project knowledge]** → user lựa chọn = ủy quyền reconciliation cho scope bị ảnh hưởng: xác định knowledge bị ảnh hưởng, Wiki Update Plan, sync qua `wiki_save_concept` + `wiki_sync` + `wiki_validate`, refresh provenance/`verified_commit`. ADR bị vô hiệu → supersede.
- **[Specification is correct — keep project knowledge, mark IMPLEMENTATION_DRIFT]** → giữ normative knowledge; ghi `x_wikiguy.consistency: { status: implementation_drift, detected_at_commit: <sha> }`; trả evidence để dispatch PatchPaw đưa code về đúng.
- **[Do not reconcile yet]** → không thay đổi gì; báo conflict chưa giải quyết.

## Đường 2: LetMeowCook — hai post-completion knowledge gates

Chỉ sau Outcome Report (implementation + verification hoàn tất):

1. **Gate 1 — Permission to analyze knowledge impact**: user đồng ý → LoreCat phân tích read-only (không ghi); từ chối → xong, không phân tích.
2. **Gate 2 — Approval of the wiki update plan**: trình bày plan chính xác (paths + UPDATE/CREATE/SUPERSEDE + lý do); user đồng ý → LoreCat ghi + validate; từ chối → xong, `.ai/docs` không đổi.

Cấm `question()` trong implementation phase; hai gate này là ngoại lệ duy nhất.

## Đường 3: PatchPaw — Change Request auto-sync

- **Change Request đã được approval** = ủy quyền CẢ implementation lẫn knowledge sync — không cần xin wiki approval lần hai.
- Sync **bắt buộc**: không hoàn thành được cho tới khi LoreCat đã đồng bộ knowledge bị ảnh hưởng HOẶC xác định không cần thay đổi nội dung (consistency verification là kết quả hợp lệ).
- **Bug fix**: consistency verification bắt buộc; cập nhật nội dung chỉ khi fix thay đổi behavior đã được tài liệu hóa.
- Final report phải có section `## Knowledge Sync` (updated paths / verified against / remaining drift).

## Đường 4: `/lore-cat-save-it` (command)

Entrypoint user: persist kiến thức hội thoại vào `.ai/docs`. Pipeline:

1. Trích knowledge đáng giữ (specs, architecture, decisions có rationale, workflows, references) — KHÔNG phải "save chat as Markdown".
2. Phân loại mỗi ứng viên: knowledge_kind + authority (normative/descriptive).
3. `wiki_search` tìm concept hiện có để UPDATE/SUPERSEDE thay vì duplicate.
4. Verify implementation claims với Sherclaw (current HEAD).
5. Ghi qua `wiki_save_concept` (OKF frontmatter, `x_wikiguy`, `verified_commit`).
6. `wiki_sync` rồi `wiki_validate`.
7. Báo cáo created/updated/superseded + evidence + drift còn lại.

## Kiểm tra sau mọi write

- `wiki_validate`: OKF structure, required `type`, `x_wikiguy` integrity (knowledge_kind; normative cần `verified_commit`), internal links resolve, `index.md` + `log.md` tồn tại.
- `wiki_sync`: regenerate `index.md` từ titles/descriptions, append `log.md`; no-op im lặng khi không có gì đổi.

## Trạng thái tài liệu

`VERIFIED / LIKELY_FRESH / STALE / CONFLICT / UNVERIFIED / IMPLEMENTATION_DRIFT / ARCHITECTURE_DRIFT` — freshness qua `wiki_freshness` (`verified_commit` + `covers`, git diff), rồi semantic verification qua Sherclaw khi có `STALE_CANDIDATES`.
