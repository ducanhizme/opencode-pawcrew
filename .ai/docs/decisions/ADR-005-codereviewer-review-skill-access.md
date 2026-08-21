---
type: Decision
title: ADR-005 — JudgeWhiskers review-skill access
description: JudgeWhiskers tách khỏi nhóm tools.skill:false (lỗi gộp của 96e66ba, trái ADR-004); skill access = permission.skill default-deny với đúng 2 allow — requesting-code-review và receiving-code-review.
status: accepted
tags:
  - adr
  - judgewhiskers
  - skills
  - superpowers
sources:
  - .opencode/agent/judgewhiskers.md
  - AGENTS.md
  - README.md
x_wikiguy:
  knowledge_kind: Decision
  authority: normative
  verified_commit: 96e66ba4cf865cbae39707f6a0b2fab526fb3ded
  covers:
    - .opencode/agent/judgewhiskers.md
    - AGENTS.md
    - README.md
generated:
  by: lorecat
  date: 2026-08-17
---

# ADR-005: JudgeWhiskers — quyền truy cập review skills của Superpowers

- **Status**: accepted
- **Date**: 2026-08-17

## Context

Commit `96e66ba` ("Disable skill tool for non-superpowers agents") đặt JudgeWhiskers vào nhóm `tools: { skill: false }` cùng LoreCat/SearchPurr/ElderPaw. Đây là sự không nhất quán với chính kiến trúc kit: theo ADR-004, JudgeWhiskers **chính là dispatch target của Superpowers review flow** — nó tham gia Superpowers process, không giống các agent thuần investigation/research/advisory.

Hậu quả: JudgeWhiskers không thể load `requesting-code-review` hay `receiving-code-review` — hai skill review duy nhất của Superpowers (đã xác nhận trong cache package: đúng 14 skills). Skill `requesting-code-review` chứa template `judgewhiskers.md` mà bên dispatch fill; reviewer có skill này nắm được template/standard gốc khi review hoặc re-review, thay vì chỉ nhận phần text được dán vào prompt dispatch.

## Decision

1. **Xóa `tools: { skill: false }`** khỏi `judgewhiskers.md` — JudgeWhiskers có skill tool.
2. **Scope skill = default-deny với đúng hai allow** (user-approved design):

   ```yaml
   permission:
     skill:
       "*": deny
       "requesting-code-review": allow
       "receiving-code-review": allow
   ```

   (last-match-wins: rule `"*": deny` đứng trước, rule hẹp allow đứng sau)

3. **Body note**: cuối mục Boundaries ghi rõ available skills = đúng 2 review skills, mọi skill khác bị deny.
4. **AGENTS.md + README.md** cập nhật grouping: nhóm `tools.skill: false` chỉ còn LoreCat/SearchPurr/ElderPaw; JudgeWhiskers ghi riêng với inverse scoping.

## Alternatives considered

- **Sherclaw-style (cho tất cả trừ 14 process skills)**: khớp convention Sherclaw/LetMeowCook và bảng tooling README (JudgeWhiskers có AST-Grep), nhưng user chọn scope chặt nhất — JudgeWhiskers chỉ cần procedure review, không cần domain skills.

## Consequences

- JudgeWhiskers load được đúng 2 Superpowers review skills; mọi skill khác (kể cả domain skills như ast-grep) bị deny ở permission layer.
- Đây là pattern scoping skill thứ ba trong kit: (a) full Superpowers (PawBuilder/PatchPaw), (b) deny-14-keep-domain (Sherclaw/LetMeowCook), (c) default-deny-2-allow (JudgeWhiskers), (d) tắt hẳn (LoreCat/SearchPurr/ElderPaw).
- Spec `agent-prompt-contract` §5, reference `agent-directory`, architecture doc đã cập nhật theo.

## Verification

- `git diff` xác nhận 3 file đổi đúng scope: `judgewhiskers.md` (frontmatter + 1 dòng body), `AGENTS.md` (1 bullet), `README.md` (1 câu).
- Frontmatter YAML: cùng cấu trúc pattern `permission.skill` đã được kiểm chứng trên Sherclaw/LetMeowCook.
- `./install.sh` từ repo: 16 symlinks re-pointed, 0 conflicts; symlink `judgewhiskers.md` trỏ về repo và chứa block skill mới.
- **Lưu ý verified_commit**: fix được verify trên working tree tại HEAD `96e66ba` (chưa commit). Sau khi commit, `wiki_freshness` sẽ báo `STALE_CANDIDATES` cho các doc covers `.opencode/agent` — đó là tín hiệu đúng; refresh `verified_commit` sau khi commit.

## Revisit

Nếu JudgeWhiskers cần domain skills (ví dụ ast-grep cho structural review), chuyển sang Sherclaw-style deny-list qua ADR mới.
