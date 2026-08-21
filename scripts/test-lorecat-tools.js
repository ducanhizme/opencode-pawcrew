#!/usr/bin/env node
// test-lorecat-tools.js
// Lightweight smoke test of lore-cat.ts wiki_* tools without full OpenCode runtime.

import { pathToFileURL } from "node:url"
import * as path from "node:path"

const pluginPath = path.resolve(".opencode/plugin/lore-cat.ts")
const mod = await import(pathToFileURL(pluginPath).href)
const plugin = mod.default({ directory: process.cwd() })

const run = async (name, args) => {
  const tool = plugin.tool[name]
  if (!tool) throw new Error(`Missing tool: ${name}`)
  return await tool.execute(args, { directory: process.cwd() })
}

const results = []

results.push(await run("wiki_validate", {}))
results.push(await run("wiki_freshness", { path: "decisions/ADR-001-disable-native-build-plan.md" }))
results.push(await run("wiki_search", { query: "PawBuilder", limit: 5 }))

console.log(JSON.stringify(results, null, 2))
