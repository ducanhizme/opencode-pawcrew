---
type: Reference
title: OKF Knowledge Model
description: Mô hình kiến thức cho corpus .ai/docs — knowledge kinds, authority normative/descriptive, spec lifecycle, document states, freshness semantics, metadata yêu cầu, write path.
status: accepted
tags:
  - reference
  - okf
  - knowledge-model
  - lorecat
sources:
  - .opencode/agent/lorecat.md
  - .opencode/plugin/lore-cat.ts
x_wikiguy:
  knowledge_kind: Reference
  authority: descriptive
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - .opencode/agent/lorecat.md
    - .opencode/plugin/lore-cat.ts
generated:
  by: lorecat
  date: 2026-08-17
---

# OKF Knowledge Model

Mô hình kiến thức cho corpus `.ai/docs/**` — cách phân loại, thẩm quyền, vòng đời và trạng thái tài liệu. Nền tảng từ [OpenWiki](https://github.com/google/openwiki) (OKF lifecycle, docs-only write guard, index sync, no-op detection).

## Kinds (frontmatter `type` / `x_wikiguy.knowledge_kind`)

| Kind | Dùng cho | Ví dụ |
|---|---|---|
| Specification | Yêu cầu, hợp đồng, quy tắc domain, ràng buộc bảo mật | Spec agent-prompt-contract |
| Architecture | Tổng quan hệ thống, mô tả cấu trúc | CrewKit architecture |
| Decision | ADR đã chấp nhận, lịch sử quyết định | ADR-001…004 |
| Workflow | Quy trình tái sử dụng | Installation, knowledge-sync |
| Reference | Danh mục, bảng tra cứu | Agent directory, OKF model |

## Authority

- **normative** — specs, contracts, domain rules, accepted ADRs, security constraints. Nếu code khác → `IMPLEMENTATION_DRIFT`. Không bao giờ viết lại normative knowledge âm thầm để khớp code.
- **descriptive** — architecture overviews, workflows, implementation notes. Nếu code khác → `DOCUMENTATION_DRIFT`.

## Spec lifecycle

```
draft → proposed → accepted → implemented → verified → deprecated
```

Tách approval khỏi implementation state: `x_wikiguy.spec: { approval: accepted, implementation: partial }`.

## Document states

| State | Ý nghĩa |
|---|---|
| VERIFIED | Khớp implementation đã kiểm chứng |
| LIKELY_FRESH | `wiki_freshness`: không có path được covers đổi từ `verified_commit` |
| STALE_CANDIDATES | Path được covers đã đổi — cần semantic verification (Sherclaw) |
| STALE | Đã xác nhận lỗi thời về ngữ nghĩa |
| CONFLICT | Mâu thuẫn với implementation (chờ reconciliation) |
| UNVERIFIED | Chưa có `verified_commit` / metadata x_wikiguy |
| IMPLEMENTATION_DRIFT | Normative knowledge giữ nguyên, code đi lệch (đã ghi nhận) |
| ARCHITECTURE_DRIFT | Descriptive knowledge lệch implementation |

## Freshness semantics

- Dùng git commit history, **không** dùng filesystem mtime.
- `verified_commit` + `covers` trong `x_wikiguy`; `wiki_freshness` chạy `git diff --name-only <verified_commit>..HEAD -- <covers>`.
- Empty diff → `LIKELY_FRESH`; changed paths → `STALE_CANDIDATES` (semantic verification vẫn bắt buộc).
- Git recency là bằng chứng freshness, **không phải thẩm quyền** — implementation mới hơn không tự động ghi đè knowledge đã chấp nhận.

## Metadata yêu cầu (`wiki_validate`)

- Mọi tài liệu: YAML frontmatter + top-level `type`.
- Có `x_wikiguy`: phải có `knowledge_kind`.
- `authority: normative`: phải có `verified_commit`.
- `index.md` và `log.md` phải tồn tại ở corpus root (do `wiki_sync` sinh ra).
- Internal markdown links phải resolve (bỏ qua `https:`, `mailto:`, `#`).

## Write path

Chỉ `wiki_save_concept` (atomic, preserve unknown OKF fields, refresh `generated: by/date`), sau đó `wiki_sync` (index + log, no-op im lặng) rồi `wiki_validate`. Xem workflow `knowledge-sync` cho bốn đường ủy quyền ghi.
