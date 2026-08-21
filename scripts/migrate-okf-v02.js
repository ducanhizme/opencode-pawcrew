#!/usr/bin/env node
// migrate-okf-v02.js
// Idempotent migration of .ai/docs from OKF v0.1 to v0.2.
// - Adds okf_version: "0.2" to index.md frontmatter.
// - Converts legacy `timestamp:` to `generated: { by, at }` if found.
// - Preserves x_wikiguy and all PawCrew metadata.

import * as fs from "node:fs"
import * as path from "node:path"

const docsDir = path.join(process.cwd(), ".ai", "docs")

function splitFrontmatter(text) {
  const m = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: text }
}

function migrateDoc(filePath) {
  const text = fs.readFileSync(filePath, "utf8")
  const { fm, body } = splitFrontmatter(text)
  if (!fm) return { changed: false, path: filePath }

  let newFm = fm
  // Convert legacy v0.1 timestamp to v0.2 generated block
  if (/^timestamp:/m.test(newFm) && !/^generated:/m.test(newFm)) {
    const ts = newFm.match(/^timestamp:\s*(.+)$/m)?.[1]?.trim() || new Date().toISOString()
    newFm = newFm.replace(/^timestamp:.+$/m, "")
    newFm = `okf_version: "0.2"\n${newFm}\ngenerated:\n  by: lorecat\n  at: ${ts}`
  }

  const changed = newFm.trim() !== fm.trim()
  if (changed) {
    fs.writeFileSync(filePath, `---\n${newFm.trim()}\n---\n\n${body.trim()}\n`)
  }
  return { changed, path: filePath }
}

function migrateIndex() {
  const idxPath = path.join(docsDir, "index.md")
  if (!fs.existsSync(idxPath)) return { changed: false, path: idxPath }
  const text = fs.readFileSync(idxPath, "utf8")
  const { fm, body } = splitFrontmatter(text)
  let newFm = fm
  if (!/^okf_version:/m.test(newFm)) {
    newFm = `okf_version: "0.2"\n${newFm}`
  }
  const changed = newFm.trim() !== fm.trim()
  if (changed) {
    fs.writeFileSync(idxPath, `---\n${newFm.trim()}\n---\n\n${body.trim()}\n`)
  }
  return { changed, path: idxPath }
}

function walkMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkMd(p, out)
    else if (e.isFile() && e.name.endsWith(".md")) out.push(p)
  }
  return out
}

const results = []
results.push(migrateIndex())
for (const f of walkMd(docsDir)) {
  if (f === path.join(docsDir, "index.md") || f === path.join(docsDir, "log.md")) continue
  results.push(migrateDoc(f))
}

const changed = results.filter((r) => r.changed)
console.log(`OKF v0.2 migration: ${changed.length}/${results.length} files updated.`)
for (const r of changed) {
  console.log(`  - ${path.relative(process.cwd(), r.path)}`)
}
