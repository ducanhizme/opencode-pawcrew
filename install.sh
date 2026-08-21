#!/usr/bin/env bash
# Install the agent kit into ~/.config/opencode/ via per-file symlinks.
# Idempotent: existing symlinks are re-pointed to this repo.
# --force: replace conflicting regular files (after confirmation).

set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$KIT_DIR/.opencode"
DEST="${HOME}/.config/opencode"
FORCE="${1:-}"

created=0
updated=0
conflicts=0
skipped=0

link_one() {
  local src="$1" dst="$2"
  local action=""
  if [[ -L "$dst" ]]; then
    action="update"
  elif [[ -e "$dst" ]]; then
    if [[ "$FORCE" == "--force" ]]; then
      rm "$dst"
      action="replace"
    else
      echo "CONFLICT: $dst exists (regular file). Use --force to replace."
      conflicts=$((conflicts + 1))
      return
    fi
  else
    action="create"
  fi
  ln -sfn "$src" "$dst"
  case "$action" in
    create)  created=$((created + 1));;
    update)  updated=$((updated + 1));;
    replace) created=$((created + 1));;
  esac
}

append_global_rules() {
  local rules="$SRC/GLOBAL-RULES.md"
  local dst="$DEST/AGENTS.md"
  local begin="<!-- crewkit:global-rules:begin -->"
  local end="<!-- crewkit:global-rules:end -->"

  [[ -f "$rules" ]] || { echo; echo "WARNING: $rules not found, skipping global rules."; return 0; }

  echo
  if [[ ! -e "$dst" ]]; then
    { printf '%s\n\n' "$begin"; cat "$rules"; printf '\n%s\n' "$end"; } > "$dst"
    echo "Global rules: created $dst"
  elif grep -qF "$begin" "$dst" 2>/dev/null; then
    local tmp
    tmp="$(mktemp)"
    awk -v begin="$begin" -v end="$end" -v rf="$rules" '
      index($0, begin) { inskip=1; print; while ((getline rl < rf) > 0) print rl; next }
      index($0, end)   { inskip=0; print; next }
      !inskip          { print }
    ' "$dst" > "$tmp"
    mv "$tmp" "$dst"
    echo "Global rules: refreshed managed block in $dst"
  else
    { printf '\n%s\n\n' "$begin"; cat "$rules"; printf '\n%s\n' "$end"; } >> "$dst"
    echo "Global rules: appended managed block to $dst"
  fi
}

check_ast_grep() {
  local sg_bin=""
  command -v sg >/dev/null 2>&1 && sg_bin="$(command -v sg)"
  [[ -z "$sg_bin" ]] && command -v ast-grep >/dev/null 2>&1 && sg_bin="$(command -v ast-grep)"
  if [[ -n "$sg_bin" ]] && "$sg_bin" --version >/dev/null 2>&1; then
    echo "AST-Grep: working ($("$sg_bin" --version 2>/dev/null | head -1) at $sg_bin)."
  elif [[ -n "$sg_bin" ]]; then
    echo "WARNING: $sg_bin exists but is BROKEN (shim placeholder or missing runtime)."
    echo "         Fix: brew install ast-grep  (or re-link the real binary over the shim)"
  else
    echo "WARNING: sg (ast-grep) not found. The ast-grep skill will fall back to grep+LSP."
    echo "         Install: brew install ast-grep"
  fi
}

check_mcp() {
  local all="${1:-}"
  for cfg in "$DEST/opencode.json" "$DEST/opencode.jsonc"; do
    [[ -f "$cfg" ]] && all="$(cat "$cfg" 2>/dev/null)"$'\n'"$all"
  done
  echo
  if grep -q '"context7"' <<<"$all"; then
    echo "Context7 MCP: configured."
  else
    echo "WARNING: Context7 MCP not configured in $DEST/opencode.json(c)."
    echo "         SearchPurr/LetMeowCook docs research degraded."
  fi
  if grep -q '"exa"' <<<"$all"; then
    if [[ -n "${EXA_API_KEY:-}" ]]; then
      echo "Exa MCP: configured (EXA_API_KEY present)."
    else
      echo "Exa MCP: configured but EXA_API_KEY not set / server disabled."
    fi
  else
    echo "Exa MCP: not configured (optional; broad web research falls back to websearch/webfetch)."
  fi
}

check_lorecat_plugin() {
  local linked=yes configured=yes cfg
  if [[ ! -e "$DEST/plugin/lore-cat.ts" ]]; then linked=no; fi
  for cfg in "$DEST/opencode.json" "$DEST/opencode.jsonc"; do
    [[ -f "$cfg" ]] && grep -q "lore-cat.ts" "$cfg" 2>/dev/null && configured=yes && break
    [[ -f "$cfg" ]] && configured=no
  done
  echo
  if [[ $linked == yes && $configured == yes ]]; then
    echo "LoreCat plugin: symlinked and configured."
  else
    echo "WARNING: LoreCat plugin incomplete (symlinked: $linked, configured: $configured)."
    echo "         Add \"./plugin/lore-cat.ts\" to the plugin array in $DEST/opencode.json(c)."
  fi
  if grep -qF "<!-- crewkit:global-rules:begin -->" "$DEST/AGENTS.md" 2>/dev/null; then
    echo "Global rules (.ai/ redirect): managed block present in $DEST/AGENTS.md (auto-loaded)."
  else
    echo "WARNING: global rules managed block missing from $DEST/AGENTS.md — re-run install.sh."
  fi
}

check_superpowers() {
  local cfg_found=0 cache_found=0 cfg
  for cfg in "$DEST/opencode.json" "$DEST/opencode.jsonc"; do
    if [[ -f "$cfg" ]] && grep -q "superpowers" "$cfg" 2>/dev/null; then
      cfg_found=1
      break
    fi
  done
  if ls -d "$HOME/.cache/opencode/packages/"superpowers@* >/dev/null 2>&1; then
    cache_found=1
  fi

  echo
  if [[ $cfg_found -eq 1 && $cache_found -eq 1 ]]; then
    echo "Superpowers: installed (plugin configured and package cached)."
  elif [[ $cfg_found -eq 1 ]]; then
    echo "Superpowers: configured in opencode.json(c) but not cached yet - downloads on next start."
  else
    echo "WARNING: Superpowers plugin not configured in $DEST/opencode.json(c)."
    echo "         PawBuilder and PatchPaw depend on Superpowers process skills."
    echo "         Fix: add \"plugin\": [\"superpowers@git+https://github.com/obra/superpowers.git\"]"
  fi
}

mkdir -p "$DEST/agent" "$DEST/command" "$DEST/skills"

for f in "$SRC"/agent/*.md; do
  link_one "$f" "$DEST/agent/$(basename "$f")"
done

# refs/ directory removed — flows + delegation moved to skills (.opencode/skills/*/SKILL.md),
# auto-symlinked by the skill loop below. Clean up a stale $DEST/refs symlink from prior installs.
if [[ -L "$DEST/refs" ]]; then
  rm "$DEST/refs"
  echo "Cleanup: removed stale symlink $DEST/refs (refs/ moved to skills/)."
fi

for f in "$SRC"/command/*.md; do
  link_one "$f" "$DEST/command/$(basename "$f")"
done

for d in "$SRC"/skills/*/; do
  name="$(basename "$d")"
  [[ -f "$d/SKILL.md" ]] || continue
  mkdir -p "$DEST/skills/$name"
  link_one "$d/SKILL.md" "$DEST/skills/$name/SKILL.md"
done

for f in "$SRC"/plugin/*.ts; do
  [[ -f "$f" ]] || continue
  mkdir -p "$DEST/plugin"
  link_one "$f" "$DEST/plugin/$(basename "$f")"
done

check_superpowers_gate() {
  local linked=yes configured=no cfg cached
  [[ -e "$DEST/plugin/superpowers-gate.ts" ]] || linked=no
  for cfg in "$DEST/opencode.json" "$DEST/opencode.jsonc"; do
    [[ -f "$cfg" ]] && grep -q "superpowers-gate.ts" "$cfg" 2>/dev/null && configured=yes && break
  done
  echo
  if [[ $linked == yes && $configured == yes ]]; then
    echo "Superpowers gate: symlinked and configured (strips superpowers bootstrap from non-superpowers agents)."
  else
    echo "WARNING: Superpowers gate incomplete (symlinked: $linked, configured: $configured)."
    echo "         Without it, every non-superpowers agent (subagents, lorecat, ...) receives the superpowers bootstrap."
  fi
  # Drift canary: the gate matches the bootstrap by literal markers. If upstream
  # superpowers.js rewords them, the gate silently no-ops — surface that here.
  for cached in "$HOME/.cache/opencode/packages/"superpowers@*/.opencode/plugins/superpowers.js; do
    [[ -f "$cached" ]] || continue
    if ! grep -qF "You have superpowers." "$cached" || ! grep -qF "EXTREMELY_IMPORTANT" "$cached"; then
      echo "WARNING: cached superpowers.js no longer contains the bootstrap markers the gate matches."
      echo "         $cached"
      echo "         The gate is likely no-op now — update isBootstrapPart() in .opencode/plugin/superpowers-gate.ts."
    fi
    break
  done
}

check_superpowers
check_superpowers_gate
check_ast_grep
check_mcp
check_lorecat_plugin
append_global_rules

echo
echo "Installed from: $KIT_DIR"
echo "  created/replaced: $created"
echo "  updated symlinks: $updated"
echo "  conflicts:        $conflicts"
[[ $skipped -gt 0 ]] && echo "  skipped:          $skipped"

if [[ $conflicts -gt 0 ]]; then
  echo "Resolve conflicts with: ./install.sh --force"
  exit 1
fi

echo "Done. Restart opencode for changes to take effect."
