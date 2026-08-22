// openwiki-config.js
// Shared loader for per-project OpenWiki configuration.
// Reads PROJECT/.ai/openwiki.config.json if present, then falls back to
// ~/.openwiki/.env. Returns an env object and CLI flags for the openwiki CLI.
//
// Supported fields in .ai/openwiki.config.json:
//   {
//     "provider": "openai-compatible",
//     "modelId": "openai/gpt-5.6-luna",
//     "baseUrl": "https://api.example.com/v1",
//     "apiKey": "sk-..."
//   }

import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"
import * as os from "node:os"

const HOME = os.homedir()

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"))
  } catch {
    return null
  }
}

function readEnvFile(p) {
  const out = {}
  try {
    const text = fs.readFileSync(p, "utf8")
    for (const line of text.split(/\r?\n/)) {
      const idx = line.indexOf("=")
      if (idx === -1 || line.startsWith("#")) continue
      const key = line.slice(0, idx).trim()
      let value = line.slice(idx + 1).trim()
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
      out[key] = value
    }
  } catch {
    // ignore missing env file
  }
  return out
}

export function loadOpenWikiConfig(projectRoot) {
  const root = path.resolve(projectRoot || process.cwd())
  const projectConfigPath = path.join(root, ".ai", "openwiki.config.json")
  const projectConfig = readJson(projectConfigPath) || {}
  const globalEnv = readEnvFile(path.join(HOME, ".openwiki", ".env"))

  const provider = projectConfig.provider || globalEnv.OPENWIKI_PROVIDER || "openai-compatible"
  const modelId = projectConfig.modelId || globalEnv.OPENWIKI_MODEL_ID || ""
  const baseUrl = projectConfig.baseUrl || globalEnv.OPENAI_COMPATIBLE_BASE_URL || ""
  const apiKey = projectConfig.apiKey || globalEnv.OPENAI_COMPATIBLE_API_KEY || ""

  const env = {
    ...process.env,
    OPENWIKI_PROVIDER: provider,
    OPENWIKI_MODEL_ID: modelId,
    OPENAI_COMPATIBLE_BASE_URL: baseUrl,
    OPENAI_COMPATIBLE_API_KEY: apiKey,
  }

  // Strip empty values so the CLI falls back to its own defaults/auth where appropriate.
  for (const key of Object.keys(env)) {
    if (env[key] === "") delete env[key]
  }

  const flags = []
  if (modelId) flags.push("--modelId", modelId)

  return {
    root,
    configPath: projectConfigPath,
    projectConfig,
    provider,
    modelId,
    baseUrl,
    apiKey: Boolean(apiKey),
    env,
    flags,
  }
}

export function getOpenWikiEnv(projectRoot) {
  const cfg = loadOpenWikiConfig(projectRoot)
  return cfg.env
}

export function getOpenWikiFlags(projectRoot) {
  const cfg = loadOpenWikiConfig(projectRoot)
  return cfg.flags
}

export function suggestConfigTemplate() {
  return `{
  "provider": "openai-compatible",
  "modelId": "openai/gpt-5.6-luna",
  "baseUrl": "https://api.example.com/v1",
  "apiKey": "sk-..."
}
`
}

// ESM compatibility for direct execution tests.
const isMain = import.meta.url.startsWith("file:") && process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])
if (isMain) {
  const cfg = loadOpenWikiConfig(process.argv[2] || process.cwd())
  console.log(JSON.stringify(cfg, null, 2))
}
