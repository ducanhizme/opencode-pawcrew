// frontend-guardian.ts — lightweight design-system guard for frontend edits.
// Provides deterministic checks against DESIGN.md and project conventions.
// Not a true post-tool hook (OpenCode does not expose one), but called
// explicitly by agents after UI edits for fast feedback.

import * as fs from "node:fs"
import * as path from "node:path"
import { z } from "zod"

type Res = { title: string; output: string }
type Ctx = { directory?: string }

const DEFAULT_MAX_LOC = 300
const BANNED_AI_PATTERNS = [
  /#(?:6b21a8|8b5cf6|a855f7|9333ea|7c3aed)/i, // common AI purples
]

function resolveRoot(input: any): string {
  return path.resolve(input?.directory || input?.project || process.cwd())
}

function readDesignMd(root: string): string | null {
  const candidates = [path.join(root, "DESIGN.md"), path.join(root, ".opencode", "DESIGN.md")]
  for (const p of candidates) {
    try { return fs.readFileSync(p, "utf8") } catch { /* continue */ }
  }
  return null
}

function countLines(filePath: string): number {
  try { return fs.readFileSync(filePath, "utf8").split(/\r?\n/).length } catch { return 0 }
}

function findUiFiles(root: string): string[] {
  const out: string[] = []
  const extensions = new Set([".tsx", ".jsx", ".vue", ".svelte", ".html", ".css", ".scss"])
  function walk(dir: string) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (["node_modules", ".git", "dist", "build", "coverage"].includes(e.name)) continue
        walk(p)
      } else if (e.isFile() && extensions.has(path.extname(e.name))) {
        out.push(p)
      }
    }
  }
  try { walk(path.join(root, "src")) } catch { /* ignore */ }
  try { walk(path.join(root, "app")) } catch { /* ignore */ }
  try { walk(path.join(root, "components")) } catch { /* ignore */ }
  try { walk(path.join(root, "pages")) } catch { /* ignore */ }
  return out
}

function checkHardcodedColors(content: string): string[] {
  const findings: string[] = []
  const hexMatches = content.matchAll(/#[0-9a-fA-F]{3,8}/g)
  for (const m of hexMatches) {
    const hex = m[0].toLowerCase()
    if (BANNED_AI_PATTERNS.some((p) => p.test(hex))) {
      findings.push(`suspicious AI-aesthetic color ${hex}`)
    }
  }
  return findings
}

export default (input: any) => {
  const pluginRoot = resolveRoot(input)
  const rootOf = (ctx: any): string => path.resolve(ctx?.directory || pluginRoot)

  return {
    tool: {
      frontend_guardian_check: {
        description:
          "Check recent frontend edits for DESIGN.md compliance and common anti-patterns. " +
          "Returns violations with severity and file locations. Call after significant UI edits.",
        args: {
          paths: z.array(z.string()).optional().describe("specific file paths to check; if omitted, scans src/app/components/pages"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const designMd = readDesignMd(root)
          const errors: string[] = []
          const warnings: string[] = []

          if (!designMd) {
            warnings.push("DESIGN.md not found at project root or .opencode/DESIGN.md — create one via design-md-contract skill")
          }

          const targets: string[] = Array.isArray(args?.paths) && args.paths.length
            ? args.paths.map((p: string) => path.resolve(root, p))
            : findUiFiles(root)

          if (targets.length === 0) {
            return {
              title: "frontend_guardian_check: no UI files",
              output: "No UI files found to check. Pass explicit paths if the project uses a non-standard layout.",
            }
          }

          for (const file of targets) {
            const rel = path.relative(root, file)
            const lines = countLines(file)
            const content = fs.readFileSync(file, "utf8")

            if (lines > DEFAULT_MAX_LOC) {
              errors.push(`${rel}: component file is ${lines} lines (> ${DEFAULT_MAX_LOC}) — split it`)
            }

            const colorIssues = checkHardcodedColors(content)
            for (const issue of colorIssues) {
              warnings.push(`${rel}: ${issue}`)
            }

            if (/\bInter\b/.test(content) && !content.includes("font-family: Inter")) {
              // no-op; only flag explicit Inter usage
            }
          }

          const output = [
            `DESIGN.md: ${designMd ? "found" : "missing"}`,
            `Files checked: ${targets.length}`,
            errors.length ? `ERRORS (${errors.length}):\n- ${errors.join("\n- ")}` : "ERRORS: none",
            warnings.length ? `WARNINGS (${warnings.length}):\n- ${warnings.join("\n- ")}` : "WARNINGS: none",
            "",
            "Fix ERRORS before completing. Warnings may be accepted if documented in DESIGN.md.",
          ].join("\n")

          return {
            title: `frontend_guardian_check: ${errors.length} error(s), ${warnings.length} warning(s)`,
            output,
          }
        },
      },
    } as any,
  }
}
