---
name: hashline-edit
description: Surgical file edits anchored by content hashes (LINE#ID) instead of fragile text reproduction. Reduces stale-line errors and prevents silent corruption when files change between read and write.
---

# Hashline Edit

## Purpose

Most edit failures happen because the agent tries to reproduce text it saw earlier, but the file has shifted in the meantime. Hashline edit replaces that with a stable, verifiable anchor: **LINE#ID**, where ID is a short content hash of that line.

PawBuilder and PatchPaw use this skill for any multi-step edit or any file that may change between read and write. LetMeowCook uses it for risky edits.

## Format

When reading a file for hashline editing, present lines with tags:

```
11#VK| function hello() {
22#XJ|   return "world";
33#MB| }
```

- Line number (optional but helpful)
- `#`
- Short hash (2–4 chars, e.g. base64url subset)
- `| ` separator
- Original line content

## Usage Flow

1. **Generate view**: call `hashline_view` (plugin tool or script) on the target file. It returns tagged lines.
2. **Plan edits**: reference lines by `LINE#ID` (e.g. `22#XJ`).
3. **Apply edits**: call `hashline_edit` with a list of operations. Each operation includes the anchor hash and either:
   - `replace`: new content to replace that line
   - `after`: insert after this line
   - `before`: insert before this line
   - `delete`: remove the line
4. **Verify**: tool rejects any operation whose current line content hash does not match the anchor. The agent must re-read the file and retry.

## Example

```json
{
  "path": "src/utils.ts",
  "ops": [
    { "anchor": "22#XJ", "replace": "  return 'world';" },
    { "anchor": "33#MB", "after": "// end hello" }
  ]
}
```

## Rules

1. **Always use hashline when**:
   - The file was read more than one turn ago
   - Another tool/subagent may have touched the file
   - The edit spans multiple non-contiguous locations
   - The line content contains fragile whitespace or punctuation

2. **Never use hashline when**:
   - You are creating a new file from scratch
   - The file is tiny (< 10 lines) and you just read it

3. **If verification fails**:
   - Re-read the file with `hashline_view`
   - Identify which lines changed and why
   - Re-plan the edit
   - Do not fall back to blind text replacement

## Hash Algorithm

Default: `SHA-256` of line content (without trailing `\n`), then take first 2–4 characters in base64url alphabet. For normal code, 2 chars is enough for ~3k lines before collision risk matters; use 3 chars for larger files.

## Tool Behavior

The `hashline_edit` tool must:

- Read the file fresh before applying edits
- For each anchor, recompute the hash of the current line at that line number
- Reject the operation if the hash does not match
- Apply operations in order, adjusting line numbers after each insertion/deletion
- Return a report of succeeded and failed operations

## Verification

After applying hashline edits:

- [ ] No operation rejected
- [ ] File still parses / lints
- [ ] Target change is visible in a normal file read

## Integration

This skill pairs with `change-impact-analysis` for safe multi-file edits and with `contract-regression-testing` to verify behavior after edits.
