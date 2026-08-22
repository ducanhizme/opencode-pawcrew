---
name: frontend-audit
description: Run measurable technical quality checks across accessibility, performance, responsive design, theming, and anti-patterns. Generates a scored report with P0-P3 severity ratings and an actionable plan.
---

# Frontend Audit

## When to Use

- User asks to "audit UI", "check accessibility", "run a11y check"
- Before shipping significant UI changes
- After a redesign or dependency upgrade
- As part of PawPixel verification

## Areas

1. **Accessibility (WCAG 2.2 AA)**
   - Keyboard navigation
   - Focus management
   - ARIA labels and roles
   - Color contrast (4.5:1 normal, 3:1 large)
   - Reduced-motion fallback
   - Screen-reader landmarks

2. **Performance**
   - GPU-safe animations only (`transform`, `opacity`)
   - No `backdrop-blur` on scrolling containers
   - Image loading / lazy loading
   - Bundle size awareness

3. **Responsive**
   - Test at 320px, 768px, 1024px, 1440px
   - No horizontal overflow
   - Touch targets ≥ 44×44 CSS px
   - Mobile-first breakpoints

4. **Theming**
   - Semantic tokens used
   - No hardcoded colors outside `DESIGN.md`
   - Dark/light mode handled if required

5. **Anti-patterns**
   - No generic AI aesthetic
   - No inline styles or arbitrary pixel values
   - Components < 300 LOC
   - Loading/error/empty states present

## Severity

| Severity | Meaning | Action |
|---|---|---|
| P0 | Blocks release (a11y blocker, broken responsive, crash) | Fix before completing |
| P1 | Significant UX or a11y degradation | Fix unless explicitly accepted |
| P2 | Polish / consistency issue | Fix if time allows |
| P3 | Nit / ideal future improvement | Note, optional |

## Output

Produce a structured report:

```markdown
## Frontend Audit: <area>

### Summary
- P0: n | P1: n | P2: n | P3: n

### Findings
1. [P0] <description> — <file/selector> — <recommended fix>
2. [P1] ...

### Action plan
- Fix P0 before completing
- ...
```

## Rule

If any P0 exists, do not mark the UI task complete. Ask the user whether to fix it or accept it as documented debt in `DESIGN.md`.
