#!/usr/bin/env node
// project-install.js — PawCrew installer supporting both project-local copy
// and global symlink install modes. Avoids shelling out to cp/ln to prevent
// "Resource temporarily unavailable" errors on fork-exhausted hosts.

import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

const kitDir = process.cwd()
const srcDir = path.join(kitDir, ".opencode")

const args = process.argv.slice(2)
const globalMode = args.includes("--global") || args.includes("-g")
const force = args.includes("--force") || args.includes("-f")
const projectDirArg = args.find((a) => !a.startsWith("-"))

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

function makeSymlink(src, dst, rel) {
  ensureDir(path.dirname(dst))
  const target = path.relative(path.dirname(dst), src)
  if (fs.existsSync(dst) || fs.lstatSync(dst, { throwIfNoEntry: false })) {
    if (!force) { return "skipped" }
    fs.rmSync(dst, { force: true, recursive: true })
  }
  fs.symlinkSync(target, dst)
  return "linked"
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst))
  if (fs.existsSync(dst)) {
    const a = fs.readFileSync(src, "utf8")
    const b = fs.readFileSync(dst, "utf8")
    if (a === b) return "skipped"
    fs.cpSync(src, dst, { force: true, preserveTimestamps: true })
    return "updated"
  }
  fs.cpSync(src, dst, { preserveTimestamps: true })
  return "created"
}

if (globalMode) {
  // Global install: symlink kit files into ~/.config/opencode/
  const configDir = process.env.OPENCODE_CONFIG_DIR || path.join(os.homedir(), ".config", "opencode")
  const catPaths = [
    [path.join(kitDir, "scripts", "openwiki-bootstrap.js"), path.join(configDir, "scripts", "openwiki-bootstrap.js")],
    [path.join(kitDir, "scripts", "openwiki-run.js"), path.join(configDir, "scripts", "openwiki-run.js")],
    [path.join(kitDir, "scripts", "openwiki-config.js"), path.join(configDir, "scripts", "openwiki-config.js")],
    [path.join(kitDir, "scripts", "hashline-engine.js"), path.join(configDir, "scripts", "hashline-engine.js")],
    [path.join(kitDir, "scripts", "goal-persistence.js"), path.join(configDir, "scripts", "goal-persistence.js")],
    [path.join(kitDir, "scripts", "pawcrew-doctor.js"), path.join(configDir, "scripts", "pawcrew-doctor.js")],
  ]
  let linked = 0, skipped = 0, failed = 0
  for (const [src, dst] of catPaths) {
    const res = makeSymlink(src, dst)
    if (res === "linked") { linked++; console.log(`linked ${dst}`) }
    else { skipped++; console.log(`skipped ${dst}`) }
  }
  for (const src of walk(srcDir)) {
    const rel = path.relative(srcDir, src)
    const dst = path.join(configDir, rel)
    const res = makeSymlink(src, dst)
    if (res === "linked") linked++
    else skipped++
  }
  console.log(`Global install into ${configDir}: linked=${linked}, skipped=${skipped}, failed=${failed}`)
  process.exit(0)
}

if (!projectDirArg) {
  console.error("Usage: node scripts/project-install.js [--global] [--force] /path/to/project")
  process.exit(1)
}

const destDir = path.join(projectDirArg, ".opencode")
let created = 0
let updated = 0
let skipped = 0

for (const src of walk(srcDir)) {
  const rel = path.relative(srcDir, src)
  const dst = path.join(destDir, rel)
  const res = copyFile(src, dst)
  if (res === "created") created++
  else if (res === "updated") updated++
  else skipped++
}

const notePath = path.join(destDir, ".crewkit-overlay.md")
if (!fs.existsSync(notePath)) {
  fs.writeFileSync(
    notePath,
    `# PawCrew Project Overlay\n\nThis directory was populated by PawCrew via project-local install.\n\n- Agents, commands, skills, and plugins from PawCrew have been copied here.\n- Existing files were preserved unless they differed from the kit, in which case they were overwritten.\n- Custom project-specific files are safe to add alongside them.\n\nIf you want to refresh the overlay later, re-run:\n\n\`\`\`bash\nnode ${path.join(kitDir, "scripts/project-install.js")} ${projectDirArg}\n\`\`\`\n`,
  )
  created++
}

const loreCatBootstrap = path.join(kitDir, "scripts/openwiki-bootstrap.js")
const loreCatRun = path.join(kitDir, "scripts/openwiki-run.js")
const loreCatConfig = path.join(kitDir, "scripts/openwiki-config.js")
const hashlineEngine = path.join(kitDir, "scripts/hashline-engine.js")
const goalPersistence = path.join(kitDir, "scripts/goal-persistence.js")
const pawcrewDoctor = path.join(kitDir, "scripts/pawcrew-doctor.js")
for (const [src, rel] of [
  [loreCatBootstrap, "../scripts/openwiki-bootstrap.js"],
  [loreCatRun, "../scripts/openwiki-run.js"],
  [loreCatConfig, "../scripts/openwiki-config.js"],
  [hashlineEngine, "../scripts/hashline-engine.js"],
  [goalPersistence, "../scripts/goal-persistence.js"],
  [pawcrewDoctor, "../scripts/pawcrew-doctor.js"],
]) {
  const dst = path.join(projectDirArg, rel)
  const res = copyFile(src, dst)
  if (res === "created") created++
  else if (res === "updated") updated++
  else skipped++
}

console.log(`Installed PawCrew into ${destDir}`)
console.log(`  created: ${created}`)
console.log(`  updated: ${updated}`)
console.log(`  skipped: ${skipped}`)
