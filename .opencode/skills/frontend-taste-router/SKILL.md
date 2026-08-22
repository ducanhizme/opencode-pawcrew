---
name: frontend-taste-router
description: Select the right visual taste direction for a frontend task. Maps brief signals to one of five taste skills (design-taste-frontend, high-end-visual-design, minimalist-ui, gpt-taste, industrial-brutalist-ui) and explains how to load the canonical skill.
---

# Frontend Taste Router

## Purpose

Map a user's frontend brief to the right visual taste skill. This skill does not contain the full taste rules; it points to the canonical taste skills already installed in `~/.agents/skills/` or `.agents/skills/`.

## Available Tastes

| Taste skill | Path | Best for | Key signals in brief |
|---|---|---|---|
| `design-taste-frontend` | `~/.agents/skills/design-taste-frontend/SKILL.md` | Ambiguous, landing, portfolio, redesign | "redesign", "landing", "portfolio", "make it look better", no clear system |
| `high-end-visual-design` | `~/.agents/skills/high-end-visual-design/SKILL.md` | Premium / creative / Awwwards | "premium", "luxury", "Awwwards", "agency", "high-end", cinematic motion |
| `minimalist-ui` | `~/.agents/skills/minimalist-ui/SKILL.md` | Clean workspace / SaaS / editorial | "minimal", "clean", "workspace", "editorial", "Notion-style", warm monochrome |
| `gpt-taste` | `~/.agents/skills/gpt-taste/SKILL.md` | GSAP scroll-driven landing | "scroll animation", "GSAP", "AIDA", "bento", "award site", viral landing |
| `industrial-brutalist-ui` | `~/.agents/skills/industrial-brutalist-ui/SKILL.md` | Data-heavy / raw / dashboard | "brutalist", "industrial", "data-heavy", "dashboard", "terminal", "Swiss grid" |

## Selection Procedure

1. Read the brief for signals: page kind, vibe words, references, audience, brand assets, constraints.
2. If the brief names a real design system (Fluent, Carbon, Primer, GOV.UK, USWDS, shadcn/ui), route to `design-taste-frontend` section 2.A.
3. Otherwise, pick exactly one taste from the table above.
4. Output one line: `Taste selected: <name> — <reason>`.
5. Load the canonical taste skill with the native skill tool from its path.

## When No Taste Fits

If the brief is a generic "make a nice UI" with no signals, default to `design-taste-frontend` because it contains the brief-inference protocol and will ask one clarifying question if needed.

## Combining with Core Skill

Always pair the selected taste with `frontend-ui-engineering`. Taste sets direction; `frontend-ui-engineering` enforces component architecture, accessibility, responsive behavior, and verification.
