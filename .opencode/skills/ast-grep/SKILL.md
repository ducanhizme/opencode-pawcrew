---
name: ast-grep
description: Structural source-code search and rewrite using the sg CLI (ast-grep). Use when searching for code by SHAPE instead of exact text - method calls with specific arg counts, error handlers that return a specific status, function definitions matching a pattern, repeated boilerplate across files. Also for safe structural find-and-replace migrations. Triggers include "structural", "every handler that", "all functions that", "pattern of code", "find similar code blocks", code migration across many files.
---

# AST-Grep — Structural Code Search

Structural search matches code by its syntax tree shape, not by literal text. Use `sg` (ast-grep) when the question is about the SHAPE of code; use plain grep when the question is about exact text.

## Availability Check

First run `sg --version`. If `sg` is not installed:

- Tell the caller explicitly that AST-Grep is unavailable.
- Fall back to grep + LSP + manual inspection.
- NEVER claim a structural search was performed if it was not.
- Install doc for the user: `brew install ast-grep` (or `npm i -g @ast-grep/cli`).

## When Structural Beats Text

USE sg when:

- Finding all instances of a call shape: `$OBJ.method($$$ARGS)` regardless of names/whitespace
- "Every handler that catches an error and returns 401"
- Finding functions/classes matching a signature pattern
- Distinguishing `foo(bar)` as a call vs `foo` as an identifier vs `foo(bar)` in a string/comment (grep cannot)
- Structural migrations: rename/transform repeated code shapes across files

DO NOT use sg when:

- Searching for a literal string, constant, or config key → grep
- Finding a file by name → glob
- Finding all references to one symbol → LSP
- One known file → read it

## Pattern Language

```
sg run -p '<PATTERN>' -l <lang> [-G '<GLOB>']
```

Core metavariable syntax:

- `$VAR` matches a single named node (identifier, literal, expression)
- `$$$ARGS` matches zero-or-more nodes (any arg list, any statement sequence)
- `$$$` spans multi-node gaps: `function $FUNC($$$PARAMS) { $$$ }`
- Literal code in the pattern must match exactly (operators, keywords)

Examples:

```bash
# All method calls named .query with any args
sg run -p '$OBJ.query($$$ARGS)' -l ts

# Every catch block that returns a 401-ish response
sg run -p 'catch ($E) { return $$$REST.status(401)$$$ }' -l ts

# All exported function declarations with async
sg run -p 'async function $FUNC($$$PARAMS) { $$$ }' -l ts

# React useEffect with empty deps (shape-level)
sg run -p 'useEffect(() => { $$$ }, [])' -l tsx
```

Language selection: `-l ts`, `-l tsx`, `-l js`, `-l py`, `-l go`, `-l rs`, `-l php`, `-l java`, `-l kt`, `-l css`, `-l html`, `-l json`, `-l yaml`. Use `-G '<glob>'` to narrow files (`-G '!*.test.ts'` to exclude).

JSON output for structured processing: `sg run -p '...' -l ts --json=pretty`.

## Safe Rewriting

Rewrites are the dangerous half. Rules:

1. ALWAYS run the search first without `-r` and inspect the matches.
2. Rewrite with `-r '<REPLACEMENT>'` — metavariables carry over: `-p '$OBJ.query($$$ARGS)' -r '$OBJ.executeQuery($$$ARGS)'`.
3. Show the caller the intended diff before using `--update-all` (writes files).
4. Never combine `--update-all` with an unreviewed pattern.
5. After any rewrite: run diagnostics/typecheck on touched files.

## Fallback

If sg is missing, a structural query decomposes into: grep for the anchor tokens (`catch`, `.status(401)`, function name) → read candidates → filter by shape manually via LSP/read. State that this is a text-approximation of a structural query.
