---
name: comment-polish
description: Audit and clean up code comments, JSDoc/TSDoc, and inline documentation. Remove AI slop, outdated comments, and filler. Preserve useful intent and non-obvious constraints.
---

# Comment Polish

## Purpose

Comments should explain intent and non-obvious constraints, not narrate what the code already says. This skill audits comments in changed files and cleans them up before a task is marked complete.

## When to Use

- User asks to "polish comments", "clean up docs", "remove AI slop"
- Before completing any non-trivial code change
- After code review feedback about comments
- When touching files that contain generated or placeholder comments

## Anti-patterns to Remove

| Bad pattern | Why | Fix |
|---|---|---|
| `// Import the module` | States the obvious | Delete |
| `// Loop through items` | Narrates code | Delete or rewrite to explain *why* |
| `// TODO: implement` | Vague, ownerless | Convert to issue or delete if already done |
| `// This function does X` | Repeats the name | Delete or explain edge cases |
| AI clichés like "robust", "seamless", "leverage" without meaning | Weakens credibility | Replace with concrete description |
| Outdated comments that no longer match code | Active harm | Update or delete |
| Commented-out code blocks | Clutter | Delete (git has history) |

## Preserve These

- Why a non-obvious approach was chosen
- Known limitations or debt with owner/date
- Workarounds for upstream bugs (include link/version)
- Public API JSDoc/TSDoc with parameters, return values, and examples
- Security or performance notes that are not obvious from the code

## Procedure

1. Identify the files touched by the current task.
2. Read comments in those files only.
3. For each suspicious comment, decide: delete, rewrite, or keep.
4. Apply minimal edits. Do not refactor code during comment polish.
5. Run diagnostics/typecheck to ensure nothing broke.

## Output

```markdown
## Comment Polish Summary

Files reviewed: ...
Comments removed: ...
Comments rewritten: ...
Comments added (missing docs): ...
Remaining concerns: ...
```

## Rules

1. **Do not add comments that restate code.**
2. **Do not remove comments that explain non-obvious intent.**
3. **If a comment is wrong, fix it or delete it.** Leaving it is worse than removing it.
4. **Public API changes need updated JSDoc/TSDoc.**
5. **Never use comment polish as an excuse to refactor.** If the code needs structural change, route to the implementation agent.

## Verification

After comment polish:

- [ ] No AI-slop clichés remain in touched files
- [ ] No outdated or misleading comments remain
- [ ] No commented-out code remains
- [ ] Public API docs are accurate if changed
- [ ] Typecheck/lint still passes
