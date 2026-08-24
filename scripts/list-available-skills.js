#!/usr/bin/env node
// list-available-skills.js
// Discover all OpenCode skills visible to the current project.
// Searches project-local, global user, and plugin-shipped skill directories.
// Usage: node scripts/list-available-skills.js [project-root]

import fs from "node:fs"
import path from "node:path"
import os from "node:os"

const projectRoot = path.resolve(process.argv[2] || process.cwd())
const home = os.homedir()

const sources = [
  {
    category: "project-local",
    base: path.join(projectRoot, ".opencode", "skills"),
  },
  {
    category: "global-user",
    base: path.join(home, ".config", "opencode", "skills"),
  },
]

const pluginSkillGlobs = [
  path.join(home, ".config", "opencode", "plugins", "cache", "*", "skills", "*"),
  path.join(projectRoot, ".opencode", "plugins", "cache", "*", "skills", "*"),
]

function exists(p) {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}

function readSkillFile(skillPath) {
  try {
    const text = fs.readFileSync(skillPath, "utf8")
    const name = text.match(/^name:\s*(.+)$/m)?.[1]?.trim() || path.basename(path.dirname(skillPath))
    const description = text.match(/^description:\s*(.+)$/m)?.[1]?.trim() || ""
    return { name, description, path: skillPath }
  } catch {
    return null
  }
}

function scanDir(base, category) {
  if (!exists(base)) return []
  const out = []
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const skillPath = path.join(base, entry.name, "SKILL.md")
    if (!fs.existsSync(skillPath)) continue
    const skill = readSkillFile(skillPath)
    if (skill) {
      skill.category = category
      out.push(skill)
    }
  }
  return out
}

function scanPluginGlob(pattern, category) {
  const parts = pattern.split(path.sep)
  const star1 = parts.indexOf("*")
  const star2 = parts.indexOf("*", star1 + 1)
  if (star1 === -1 || star2 === -1) return []

  const base = path.sep + parts.slice(0, star1).join(path.sep)
  if (!exists(base)) return []

  const out = []
  for (const plugin of fs.readdirSync(base, { withFileTypes: true })) {
    if (!plugin.isDirectory()) continue
    const skillsBase = path.join(base, plugin.name, ...parts.slice(star1 + 1, star2))
    if (!exists(skillsBase)) continue
    for (const entry of fs.readdirSync(skillsBase, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const skillPath = path.join(skillsBase, entry.name, "SKILL.md")
      if (!fs.existsSync(skillPath)) continue
      const skill = readSkillFile(skillPath)
      if (skill) {
        skill.category = category
        skill.plugin = plugin.name
        out.push(skill)
      }
    }
  }
  return out
}

const all = []
for (const { category, base } of sources) {
  all.push(...scanDir(base, category))
}
for (const pattern of pluginSkillGlobs) {
  all.push(...scanPluginGlob(pattern, "plugin-shipped"))
}

const byName = new Map()
const conflicts = []
for (const skill of all) {
  if (byName.has(skill.name)) {
    conflicts.push({ name: skill.name, locations: [byName.get(skill.name).path, skill.path] })
  } else {
    byName.set(skill.name, skill)
  }
}

const result = {
  projectRoot,
  categories: {
    "project-local": all.filter((s) => s.category === "project-local"),
    "global-user": all.filter((s) => s.category === "global-user"),
    "plugin-shipped": all.filter((s) => s.category === "plugin-shipped"),
  },
  conflicts,
  total: all.length,
}

console.log(JSON.stringify(result, null, 2))
