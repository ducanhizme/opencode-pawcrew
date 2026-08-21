# Third-Party Notices

## oh-my-openagent (OMO)

Project: https://github.com/code-yeongyu/oh-my-openagent
License: Sustainable Use License v1.0 (see excerpt below)

Several agent prompts in this repository are adaptations of prompts from
oh-my-openagent's `omo-opencode` package. Derivation map:

| File in this repo | OMO source prompt | What was borrowed |
|---|---|---|
| `.opencode/agent/pawbuilder.md` | Sisyphus (GLM 5.2 variant) | Intent classification table, outcome-first (destination/constraints/stopping condition), six-section delegation contract, "a subagent report is a lead, not evidence", verification discipline |
| `.opencode/agent/patchpaw.md` | Sisyphus + Hephaestus | Investigation-first flow, minimal-change policy, post-approval persistence ("do not ask mid-implementation") |
| `.opencode/agent/letmeowcook.md` | Hephaestus | Identity line, forbidden-questions list (JUST DO IT / 100% OR NOTHING), ambiguity exploration hierarchy, "plans are starting lines", completion-report discipline |
| `.opencode/agent/sherclaw.md` | Explore | `<analysis>` intent block, `<results>` structured output (files/answer/next_steps), absolute-path and failure conditions |
| `.opencode/agent/searchpurr.md` | Librarian | Request-type classification (docs/implementation/context), permalink evidence format, communication rules |
| `.opencode/agent/elderpaw.md` | Oracle | Pragmatic-minimalism decision framework, three-tier response structure, effort/confidence tagging, scope discipline |

OMO runtime machinery (background agents, task IDs, category routing, planner/
orchestrator agents, tool schemas) was intentionally **not** carried over; all
borrowed material was rewritten to target native OpenCode capabilities.

### Sustainable Use License — excerpt

> You may use or modify the software only for your own internal business
> purposes or for non-commercial or personal use. You may distribute the
> software or provide it to others only if you do so free of charge for
> non-commercial purposes. You may not alter, remove, or obscure any
> licensing, copyright, or other notices of the licensor in the software.

Accordingly, this repository distributes the adapted prompt content free of
charge for non-commercial use, with this notice preserving attribution.

Full license text: https://github.com/code-yeongyu/oh-my-openagent (LICENSE.md)

## Superpowers

Project: https://github.com/obra/superpowers

Referenced as an external OpenCode plugin (not vendored in this repository).
Users install it independently; this repo only configures and scopes it.

## OpenCode

Project: https://opencode.ai

Target harness. Agent/command/skill file formats follow its conventions.
