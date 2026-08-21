#!/usr/bin/env node
// openwiki-bootstrap.js
// Configure OpenWiki to use .ai/docs/ as the knowledge corpus directory.
// OpenWiki code mode defaults to openwiki/; this bootstrap creates a
// lightweight bridge that merges OpenWiki output into .ai/docs/.

import * as fs from "node:fs"
import * as path from "node:path"

const repoRoot = process.cwd()
const openwikiDir = path.join(repoRoot, "openwiki")
const aiDocsDir = path.join(repoRoot, ".ai", "docs")
const instructionsPath = path.join(openwikiDir, "INSTRUCTIONS.md")
const ignorePath = path.join(repoRoot, ".openwikiignore")

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function writeIfMissing(p, content) {
  if (fs.existsSync(p)) return
  fs.writeFileSync(p, content)
  console.log(`Created: ${p}`)
}

ensureDir(openwikiDir)
ensureDir(aiDocsDir)

writeIfMissing(
  instructionsPath,
  `# OpenWiki Instructions for PawCrew

This project uses OpenCode PawCrew. The canonical project-knowledge corpus lives under \`.ai/docs/\`.

When OpenWiki generates or updates documentation, merge the output into \`.ai/docs/\` rather than keeping it under \`openwiki/\`. Preserve the existing OKF frontmatter and the \`x_wikiguy\` block that PawCrew uses for freshness/drift detection.

## Scope

- Focus on specifications, architecture overviews, decision records, workflows, and reference docs.
- Do not duplicate README content.
- Keep each concept in its own Markdown file with YAML frontmatter.
- Use relative internal links between docs.

## Conventions

- Kinds: Specification | Architecture | Decision | Workflow | Reference.
- Authority: normative for specs/ADRs/contracts; descriptive for overviews/workflows.
- When updating a document, refresh \`generated: { by, at }\` and keep \`x_wikiguy\` intact.
`
)

writeIfMissing(
  ignorePath,
  ["# OpenWiki ignore rules", "*.log", "dist/", "build/", "node_modules/", ".superpowers/", ""].join("\n")
)

const bridgeMetaPath = path.join(repoRoot, ".ai", ".openwiki-bridge.json")
writeIfMissing(
  bridgeMetaPath,
  JSON.stringify({ target: ".ai/docs", source: "openwiki", generatedBy: "pawcrew" }, null, 2)
)

console.log("OpenWiki bootstrap complete for PawCrew.")
