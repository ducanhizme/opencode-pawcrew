---
type: Decision
title: ADR-003 — OMO prompt lineage and licensing
description: Prompt agents dẫn xuất từ oh-my-openagent (Sisyphus/Hephaestus/Explore/Librarian/Oracle), viết lại cho OpenCode native; OMO runtime không mang sang; MIT cho nội dung gốc + Sustainable Use License cho phần OMO-derived.
status: accepted
tags:
  - adr
  - licensing
  - lineage
  - omo
sources:
  - THIRD-PARTY-NOTICES.md
  - LICENSE
  - .opencode/agent/**
x_wikiguy:
  knowledge_kind: Decision
  authority: normative
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - THIRD-PARTY-NOTICES.md
    - LICENSE
generated:
  by: lorecat
  date: 2026-08-17
---

# ADR-003: OMO prompt lineage và ràng buộc giấy phép

- **Status**: accepted
- **Date**: 2026-08-17 (ghi lại từ git history, commit `ddc250e` → `d55e34a`)

## Context

Chất lượng prompt của CrewKit được "mượn" từ [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent) (OMO). OMO phát hành dưới **Sustainable Use License v1.0**: được dùng/sửa cho mục đích nội bộ hoặc phân phối **miễn phí phi thương mại**, không được xóa attribution notices.

## Decision

1. **Prompt lineage từ OMO, đã viết lại cho OpenCode native.** Bản đồ derivation được ghi trong `THIRD-PARTY-NOTICES.md`:

   | File trong repo | Nguồn OMO | Mượn gì |
   |---|---|---|
   | `pawbuilder.md` | Sisyphus (GLM 5.2 variant) | Intent classification, outcome-first, delegation contract, verification discipline |
   | `patchpaw.md` | Sisyphus + Hephaestus | Investigation-first flow, minimal-change policy, post-approval persistence |
   | `letmeowcook.md` | Hephaestus | Identity line, forbidden questions, ambiguity hierarchy, completion-report discipline |
   | `sherclaw.md` | Explore | `<analysis>` intent block, `<results>` structured output |
   | `searchpurr.md` | Librarian | Request classification, permalink evidence, communication rules |
   | `elderpaw.md` | Oracle | Pragmatic-minimalism framework, three-tier response, effort/confidence tags |

2. **OMO runtime machinery KHÔNG được mang sang**: background agents, task IDs, category routing, planner/orchestrator agents, tool schemas. Agents của CrewKit không chứa OMO runtime references.
3. **Giấy phép**: repo phân phối MIT cho nội dung gốc (LICENSE), kèm notice giữ attribution OMO; phần OMO-derived chỉ phân phối miễn phí phi thương mại theo Sustainable Use License.

## Consequences

- Mọi prompt mới dẫn xuất từ OMO phải được thêm vào derivation map trong `THIRD-PARTY-NOTICES.md`
- Không được xóa/xuất bản thương mại phần nội dung OMO-derived
- Tham chiếu nguồn: oh-my-openagent và Superpowers (plugin ngoài, không vendored) và OpenCode (harness)

## Revisit

Chuyển sang giấy phép thương mại hoặc vendor Superpowers cần đánh giá lại ràng buộc này.
