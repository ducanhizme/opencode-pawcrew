---
name: frontend-polish
description: Final pass for alignment, consistency, micro-detail quality, and refinements. Use after the structure and functionality are already working.
---

# Frontend Polish

## When to Use

- User says "polish this", "make it look finished", "fix the details"
- Final pass before shipping UI
- After `frontend-critique` identified small issues

## Checklist

- [ ] Alignment: elements align to the same baseline/grid
- [ ] Spacing: consistent scale, no arbitrary gaps
- [ ] Typography: hierarchy clear, no orphaned words where avoidable
- [ ] Color: semantic tokens only, contrast correct
- [ ] Radius/elevation: consistent with `DESIGN.md`
- [ ] Focus states: visible and consistent
- [ ] Empty/error/loading states: visually coherent
- [ ] Micro-copy: no AI clichés, no lorem ipsum
- [ ] Icons: consistent set, stroke, size
- [ ] Motion: subtle, reduced-motion fallback present
- [ ] Scrollbars / overflow: no unexpected horizontal scroll
- [ ] Dead code / commented CSS removed

## Procedure

1. Read `DESIGN.md`.
2. Review the affected files without changing behavior.
3. Make minimal, safe visual fixes.
4. Re-run verification (render, keyboard, responsive).

## Output

```markdown
## Polish Summary
- Files touched: ...
- Changes: ...
- Remaining nits (if any): ...
```

## Rule

Do not refactor architecture during polish. If a component needs structural change, stop and route to PawPixel with a note.
