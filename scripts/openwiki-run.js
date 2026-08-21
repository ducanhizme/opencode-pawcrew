#!/usr/bin/env node
// openwiki-run.js
// Wrapper around the openwiki CLI that merges its output (openwiki/) into .ai/docs/.
// Usage: node scripts/openwiki-run.js [init|update|status]

import { spawnSync } from "node:child_process"
import * as fs from "node:fs"
import * as path from "node:path"

const ACTION = process.argv[2] || "update"
const repoRoot = process.cwd()
const openwikiBin = path.join(repoRoot, "node_modules", ".bin", "openwiki")
const openwikiDir = path.join(repoRoot, "openwiki")
const aiDocsDir = path.join(repoRoot, ".ai", "docs")

const env = {
  ...process.env,
  OPENWIKI_TELEMETRY_DISABLED: "1",
  DO_NOT_TRACK: "1",
}

function runOpenWiki(action) {
  const args = [action]
  if (ACTION === "init") args.push("--yes")
  const result = spawnSync(openwikiBin, args, { stdio: "inherit", env, cwd: repoRoot })
  return result.status ?? 1
}

function mergeIntoAiDocs() {
  if (!fs.existsSync(openwikiDir)) return 0
  if (!fs.existsSync(aiDocsDir)) fs.mkdirSync(aiDocsDir, { recursive: true })

  const files = walkMd(openwikiDir)
  let copied = 0
  for (const src of files) {
    const rel = path.relative(openwikiDir, src)
    const dst = path.join(aiDocsDir, rel)
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    const content = fs.readFileSync(src, "utf8")
    const merged = mergeWithExisting(dst, content)
    fs.writeFileSync(dst, merged)
    copied++
  }
  console.log(`Merged ${copied} document(s) into ${aiDocsDir}`)
  return 0
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

function mergeWithExisting(dst, generatedContent) {
  if (!fs.existsSync(dst)) return generatedContent
  const existing = fs.readFileSync(dst, "utf8")
  const existingFm = splitFrontmatter(existing)
  const generatedFm = splitFrontmatter(generatedContent)

  // Preserve x_wikiguy and any PawCrew-specific fields from existing file.
  if (existingFm.fm && generatedFm.fm) {
    const xWikiMatch = existingFm.fm.match(/x_wikiguy:[\s\S]*?(?=\n[A-Za-z_][\w-]*:|\n---|$)/)
    if (xWikiMatch && !generatedFm.fm.includes("x_wikiguy:")) {
      generatedFm.fm = generatedFm.fm.trimEnd() + "\n" + xWikiMatch[0]
    }
  }

  return `---\n${generatedFm.fm}\n---\n\n${generatedFm.body.trim()}\n`
}

function splitFrontmatter(text) {
  const m = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: text }
}

const exitCode = runOpenWiki(ACTION)
if (exitCode === 0 && (ACTION === "init" || ACTION === "update")) {
  process.exitCode = mergeIntoAiDocs()
} else {
  process.exitCode = exitCode
}
