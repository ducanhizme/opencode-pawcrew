---
type: Workflow
title: Installation and Update Workflow
description: Luồng install.sh — symlink idempotent vào ~/.config/opencode, managed global rules block, pre-flight checks (Superpowers, ast-grep, MCP, LoreCat plugin), restart bắt buộc.
status: accepted
tags:
  - workflow
  - install
  - symlink
sources:
  - install.sh
  - .opencode/GLOBAL-RULES.md
x_wikiguy:
  knowledge_kind: Workflow
  authority: descriptive
  verified_commit: cd4cc39af1aac97220667fa6f930041dbf9ed00b
  covers:
    - install.sh
    - .opencode/GLOBAL-RULES.md
generated:
  by: lorecat
  date: 2026-08-19
---

# Workflow: Cài đặt và cập nhật CrewKit

Mô tả luồng `install.sh` — idempotent installer + pre-flight môi trường.

## Kích hoạt

Người dùng chạy `./install.sh` (hoặc `./install.sh --force`) trong repo, hoặc `git -C ~/opencode-crewkit status` để kiểm tra drift giữa bản cài và repo.

## Các bước

1. **Resolve paths**: `KIT_DIR` = thư mục repo; `SRC` = `$KIT_DIR/.opencode`; `DEST` = `~/.config/opencode`.
2. **Symlink từng file** (qua `link_one`):
   - Mọi `agent/*.md` → `$DEST/agent/` (glob không đệ quy — không nhận subdirectory)
   - Mọi `command/*.md` → `$DEST/command/`
   - Mọi `skills/*/SKILL.md` → `$DEST/skills/<name>/SKILL.md` (glob nhận subdirectory — kit skills: ast-grep, bug-flow, change-impact-analysis, change-request-flow, contract-regression-testing, delegation-policy)
   - Mọi `plugin/*.ts` → `$DEST/plugin/`
   - Idempotent: symlink có sẵn được re-point (`ln -sfn`) → action `update`; file chưa có → `create`; **regular file xung đột** → báo CONFLICT, chỉ thay nếu `--force` (sau khi người dùng xác nhận).
   - Cleanup khi nâng cấp: nếu `$DEST/refs` là symlink từ bản có refs/ cũ, install tự dọn (refs moved sang skills/).
3. **Global rules** (`append_global_rules`): đảm bảo block `<!-- crewkit:global-rules:begin -->` ... `<!-- crewkit:global-rules:end -->` tồn tại trong `$DEST/AGENTS.md` (tạo mới / refresh nội dung / append nếu thiếu). Block chứa Superpowers artifact redirect (`.ai/superpowers/`) và documentation ownership (`.ai/docs/`, LoreCat).
4. **Pre-flight checks**:
   - `check_superpowers`: plugin Superpowers được cấu hình trong `opencode.json(c)` và package đã cache (`~/.cache/opencode/packages/superpowers@*`)
   - `check_ast_grep`: `sg` hoặc `ast-grep` có hoạt động không (cảnh báo nếu là shim hỏng hoặc thiếu — skill sẽ fallback grep+LSP)
   - `check_mcp`: Context7 và Exa có được cấu hình trong `opencode.json(c)`; Exa cần `EXA_API_KEY`
   - `check_lorecat_plugin`: `plugin/lore-cat.ts` đã symlink + được khai báo trong plugin array; global rules managed block hiện diện
5. **Kết thúc**: in thống kê `created/replaced / updated / conflicts`; nếu có conflict → `exit 1` kèm hướng dẫn `./install.sh --force`.

## Sau khi cài

- **Phải khởi động lại opencode** — config không hot-reload.
- Kiểm tra cài đặt: `git -C ~/opencode-crewkit status` (không có drift bất ngờ); `~/opencode-crewkit/install.sh` chạy lại là no-op (updated=0, conflicts=0).
- File đã cài là symlink: sửa trong repo, thay đổi áp dụng ngay cho mọi project dùng kit.

## Lưu ý

- `MCP servers` (`opencode.jsonc`) **không được symlink** từ repo — là config global của user; install.sh chỉ kiểm tra registration.
- `.ai/superpowers/` là redirect của Superpowers artifacts (prompt-level convention); `.superpowers/sdd` là plugin-scripted, không redirect được.
