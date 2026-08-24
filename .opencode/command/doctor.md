---
description: Run a health check on your PawCrew installation, OpenCode config, plugins, and tooling dependencies. Reports symlinks, plugin registration, OpenWiki, AST-Grep, and kit repository state.
---

# /doctor

## Purpose

Run `bunx pawcrew-doctor` (or `node scripts/pawcrew-doctor.js` from the kit repo) to verify that PawCrew is installed and configured correctly.

## What it checks

| Area | Check |
|---|---|
| Global symlinks | All kit agents/commands/skills/plugins are symlinked into `~/.config/opencode/` |
| OpenCode config | `opencode.json/jsonc` exists and mentions Superpowers, lore-cat, hashline plugins |
| Plugins | `lore-cat.ts`, `superpowers-gate.ts`, `frontend-guardian.ts`, `hashline.ts` exist in kit |
| OpenWiki | `openwiki` CLI present and `.ai/.openwiki-bridge.json` exists |
| AST-Grep | `sg` / `ast-grep` in PATH and working |
| diagram-design | Optional skill for Pawfessor diagram deliverables (mermaid fallback when missing) |
| Kit repo | Is a git repo and whether it has uncommitted changes |

## Usage

From the kit repo:

```bash
node scripts/pawcrew-doctor.js
```

From any project (after installing the kit CLI):

```bash
bunx pawcrew-doctor
```

## Exit codes

- `0` — no errors (warnings may exist)
- `1` — one or more errors

## When to use

- After `install.sh` to verify the global setup
- After `install.sh --project <path>` to verify project-local overlay
- When an agent fails to load a skill or plugin
- Before reporting a PawCrew issue

## What it does NOT do

- It does not fix problems automatically.
- It does not check project-specific build or test health.
- It does not validate agent prompt syntax.

## Fix hints

- **Symlink missing**: run `./install.sh` (global) or `./install.sh --project <path>` (project-local)
- **Plugin not registered**: edit `~/.config/opencode/opencode.json(c)` and add the plugin name to the `plugin` array
- **AST-Grep missing**: `brew install ast-grep` (or re-link the real binary over any shim)
- **OpenWiki missing**: run `npm install` in the kit repo
- **Uncommitted changes**: review `git status` and commit if needed
