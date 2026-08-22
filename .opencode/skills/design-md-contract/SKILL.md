---
name: design-md-contract
description: Maintain a DESIGN.md contract as the single source of truth for UI tokens, typography, spacing, radius, elevation, motion, responsive behavior, accessibility constraints, and accepted debt. Use before significant UI work and update it before code when the design system changes.
---

# DESIGN.md Contract

## Purpose

`DESIGN.md` is the closed token layer between the design system and the code an AI writes. It lives at the project root or in `.opencode/DESIGN.md`. Every significant UI decision must be named here before it appears in code.

PawPixel reads `DESIGN.md` before designing, creates it if missing, and updates it when the design system changes.

## When to Use

- Starting a new frontend task without an existing `DESIGN.md`
- Changing global tokens, typography, spacing, radius, motion, or responsive behavior
- Adding a new component family or pattern
- Rebranding or shifting visual direction
- Handing work to another agent or human reviewer

## Required Sections

A valid `DESIGN.md` must contain at least:

```markdown
# DESIGN.md

## Audience
Who uses this product and in what context?

## Brand personality
How should the interface feel?

## Design system

### Tokens
- Color: semantic names and values
- Typography: font families, scales, weights
- Spacing: scale (e.g. 0.25rem increments)
- Radius: allowed values
- Elevation: shadows / borders / z-index layers

### Breakpoints
320, 768, 1024, 1440, 1920 (adjust to project)

### Motion
Default easing, duration, reduced-motion behavior

### Accessibility constraints
Minimum contrast, focus style, keyboard requirements, accepted debt

## Component primitives
Buttons, inputs, cards, badges, tags, toggles, tooltips, etc.

## Layout patterns
Page shell, grid, navigation, responsive strategy

## Accepted debt
Known exceptions with owner and revisit date
```

## Rules

1. **Code cannot contradict DESIGN.md.** If a token, color, font, or value is not in `DESIGN.md`, either add it or do not use it.
2. **Component files stay under 300 LOC.** If a component exceeds this, split it and note the decomposition in `DESIGN.md`.
3. **Every interactive element has states:** default, hover, focus-visible, active, disabled, loading.
4. **Motion respects `prefers-reduced-motion`.**
5. **Accessibility constraints are non-negotiable.** Accepted debt must be listed explicitly.

## Update Workflow

1. Read existing `DESIGN.md` from project root or `.opencode/DESIGN.md`.
2. If missing, create from this template and fill with user-provided context.
3. Before writing significant UI code, ensure the relevant tokens/primitives/patterns are documented.
4. After material design changes, append a dated entry under `## Changelog`.

## Verification

Before completing UI work:

- [ ] `DESIGN.md` exists and is up to date
- [ ] All tokens used in new code are named in `DESIGN.md`
- [ ] New components/primitives are documented
- [ ] Accessibility constraints are still satisfied
- [ ] No undocumented accepted debt introduced
