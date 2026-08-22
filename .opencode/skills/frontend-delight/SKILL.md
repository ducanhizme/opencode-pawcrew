---
name: frontend-delight
description: Add tasteful personality and memorable moments once the fundamentals are already working. Use for micro-interactions, empty-state personality, transition details, and small moments that improve perceived quality without harming usability.
---

# Frontend Delight

## When to Use

- User says "add some delight", "make it feel alive", "surprise me"
- After accessibility, responsive, and core UX are solid
- For marketing pages, onboarding, success states, empty states

## Constraints

1. **Fundamentals first.** Never add delight on top of broken UI.
2. **Reduced motion is law.** Every animation must have a `prefers-reduced-motion` fallback.
3. **No performance harm.** Animate `transform` and `opacity` only.
4. **No novelty for novelty's sake.** Delight must support the user's goal or reinforce brand.
5. **Keep it small.** One or two memorable moments per screen is enough.

## Common Delight Patterns

- Subtle hover lift on cards (`transform: translateY(-2px)`)
- Staggered entrance for lists
- Success-state micro-animation
- Custom cursor on interactive hero elements
- Empty-state illustration with brand voice
- Smooth route transitions (where framework supports)

## Procedure

1. Verify `frontend-audit` and `frontend-polish` passed.
2. Choose 1–2 delight moments that match brand and use case.
3. Implement with reduced-motion fallback.
4. Test on low-end device / mobile if possible.

## Output

```markdown
## Delight Summary
- Added: ...
- Rationale: ...
- Reduced-motion fallback: ...
- Performance note: ...
```

## Rule

If delight adds complexity without clear user benefit, remove it.
