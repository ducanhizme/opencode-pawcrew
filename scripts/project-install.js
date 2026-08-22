#!/usr/bin/env node
// project-install.js — minimal project-local installer for PawCrew.
// Copies .opencode from the kit into PROJECT/.opencode without running
// pre-flight checks (those were already validated by the global install).
// Usage: node scripts/project-install.js /path/to/project

import * as fs from "node:fs"
import * as path from "node:path"

const kitDir = process.cwd()
const srcDir = path.join(kitDir, ".opencode")
const projectDir = process.argv[2]

if (!projectDir) {
  console.error("Usage: node scripts/project-install.js /path/to/project")
  process.exit(1)
}

const destDir = path.join(projectDir, ".opencode")

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

let created = 0
let updated = 0
let skipped = 0

for (const src of walk(srcDir)) {
  const rel = path.relative(srcDir, src)
  const dst = path.join(destDir, rel)
  if (fs.existsSync(dst)) {
    const a = fs.readFileSync(src, "utf8")
    const b = fs.readFileSync(dst, "utf8")
    if (a === b) { skipped++; continue }
    fs.cpSync(src, dst, { force: true, preserveTimestamps: true })
    updated++
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    fs.cpSync(src, dst, { preserveTimestamps: true })
    created++
  }
}

const notePath = path.join(destDir, ".crewkit-overlay.md")
if (!fs.existsSync(notePath)) {
  fs.writeFileSync(
    notePath,
    `# PawCrew Project Overlay\n\nThis directory was populated by PawCrew via project-local install.\n\n- Agents, commands, skills, and plugins from PawCrew have been copied here.\n- Existing files were preserved unless they differed from the kit, in which case they were overwritten.\n- Custom project-specific files are safe to add alongside them.\n\nIf you want to refresh the overlay later, re-run:\n\n\`\`\`bash\nnode ${path.join(kitDir, "scripts/project-install.js")} ${projectDir}\n\`\`\`\n`,
  )
  created++
}

const loreCatBootstrap = path.join(kitDir, "scripts/openwiki-bootstrap.js")
const loreCatRun = path.join(kitDir, "scripts/openwiki-run.js")
const loreCatConfig = path.join(kitDir, "scripts/openwiki-config.js")
for (const [src, rel] of [
  [loreCatBootstrap, "../scripts/openwiki-bootstrap.js"],
  [loreCatRun, "../scripts/openwiki-run.js"],
  [loreCatConfig, "../scripts/openwiki-config.js"],
]) {
  const dst = path.join(projectDir, rel)
  if (fs.existsSync(dst)) { updated++; fs.cpSync(src, dst, { force: true }) }
  else { created++; fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.cpSync(src, dst) }
}

console.log(`Installed PawCrew into ${destDir}`)
console.log(`  created: ${created}`)
console.log(`  updated: ${updated}`)
console.log(`  skipped: ${skipped}`)
