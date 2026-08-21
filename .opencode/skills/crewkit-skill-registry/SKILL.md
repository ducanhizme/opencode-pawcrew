---
name: crewkit-skill-registry
description: Discover all OpenCode skills available to this project, including PawCrew skills, global user skills, plugin-shipped skills, and project-local skills. Use at the start of a non-trivial task to choose the right skill, or when an agent needs to confirm whether a skill exists before invoking it.
---

# CrewKit Skill Registry

## Purpose

OpenCode loads skills from multiple places:

1. **Project-local skills**: `<project>/.opencode/skills/<name>/SKILL.md`
2. **Global user skills**: `~/.config/opencode/skills/<name>/SKILL.md`
3. **Plugin-shipped skills**: `~/.config/opencode/plugins/cache/<plugin>/skills/<name>/SKILL.md`
4. **This kit's skills**: `.opencode/skills/<name>/SKILL.md` in the PawCrew repo

Agents need a single, deterministic way to know which skills are available before they invoke one. This skill produces that registry.

## When to use

- At the start of a non-trivial task: scan once, then pick the most specific skill.
- Before invoking a skill you are unsure exists.
- When a project has its own custom skills and you want to confirm they are loadable.
- When debugging "skill not found" errors.

## How to use

Call this skill via the skill tool (`skill("crewkit-skill-registry")`). It takes no arguments.

To produce the actual registry, run the bundled helper from the PawCrew repository:

```bash
node <pawcrew-repo>/scripts/list-available-skills.js [project-root]
```

If the helper is unavailable, fall back to `glob` on these paths:

- `<project>/.opencode/skills/*/SKILL.md`
- `~/.config/opencode/skills/*/SKILL.md`
- `~/.config/opencode/plugins/cache/*/skills/*/SKILL.md`
- `<project>/.opencode/plugins/cache/*/skills/*/SKILL.md`

The skill returns a structured markdown report:

```markdown
## Skill Registry

### Project-local skills
| Skill | Description | Source |
| --- | --- | --- |
| my-project-skill | Custom project workflow | `<project>/.opencode/skills/my-project-skill/SKILL.md` |

### Global user skills
| Skill | Description | Source |
| --- | --- | --- |
| ast-grep | Structural search & safe rewrite | `~/.config/opencode/skills/ast-grep/SKILL.md` |

### Plugin-shipped skills
| Skill | Description | Plugin |
| --- | --- | --- |
| context7-mcp | Official docs lookup | context7-plugin |

### Conflicts
| Skill | Locations |
| --- | --- |
| duplicate-skill | project, global |
```

## Conflict resolution

If the same skill name appears in multiple locations, OpenCode's load order is typically:

1. project-local
2. global user
3. plugin-shipped

Treat the **project-local copy as authoritative** for that project. Report conflicts but do not change files.

## Agent-specific notes

- **PawBuilder / PatchPaw**: use this registry to confirm availability of `pdca-loop`, `retrospective`, and any project-specific skills. Superpowers process skills are still loaded via the Superpowers plugin.
- **LetMeowCook**: use this registry to discover domain skills while keeping Superpowers process skills denied.
- **LoreCat**: this skill is unnecessary because LoreCat runs with `tools.skill: false`; return an empty registry if invoked.
- **Sherclaw / SearchPurr / ElderPaw / JudgeWhiskers / GuardClaw**: use this registry to discover domain skills relevant to the task.

## Implementation note for the agent

When you receive the registry, prefer the most specific skill for the current task. Do not invoke a skill merely because it exists. If no skill matches, fall back to direct tools and report that no skill was applicable.
