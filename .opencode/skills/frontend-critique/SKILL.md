---
name: frontend-critique
description: Provide UX and design critique with scores and prioritized issues across the overall interface. Use when the user wants to improve hierarchy, information architecture, cognitive load, or visual direction.
---

# Frontend Critique

## When to Use

- User asks "does this look good?", "critique this UI", "why does this feel off?"
- Before a redesign to understand current debt
- After PawPixel builds UI to validate direction

## Dimensions

Score each from 1–5:

1. **Hierarchy**: can the user tell what matters first?
2. **Information architecture**: are related things grouped? Is navigation discoverable?
3. **Cognitive load**: is the screen too dense or too sparse?
4. **Visual consistency**: tokens, spacing, radius, typography align?
5. **Brand fit**: does it feel right for the audience and product?
6. **Interaction clarity**: do buttons/links/controls clearly signal behavior?

## Procedure

1. Take a pass without changing code.
2. Identify the top 3–5 issues.
3. For each issue, note: dimension, severity, evidence, recommended fix.
4. Do not rewrite everything at once — prioritize the highest-impact changes.

## Output

```markdown
## Frontend Critique: <scope>

| Dimension | Score | Top issue | Suggested fix |
|---|---|---|---|
| Hierarchy | 3/5 | ... | ... |
...

### Prioritized actions
1. **Highest impact**: ...
2. ...
```

## Rule

Critique is read-only unless the user explicitly asks for changes. If they do, route to `frontend-polish` or back to PawPixel implementation.
