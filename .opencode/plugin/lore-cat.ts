// lore-cat.ts — knowledge-management tools for the LoreCat agent.
// OpenWiki-backed facade: delegates generation/update/validation to the
// openwiki CLI when available, and preserves PawCrew-specific behavior
// (freshness via x_wikiguy.verified_commit + covers, reconciliation modes,
// OKF frontmatter with x_wikiguy block).
// Operates ONLY on <project>/.ai/docs/**. Git usage is read-only.

import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"
import { execSync, spawnSync } from "node:child_process"
import { z } from "zod"

type Res = { title: string; output: string }
type Ctx = { directory?: string }

const HOME = os.homedir()

function readJson(p: string): any {
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return null }
}

function readEnvFile(p: string): Record<string, string> {
  const out: Record<string, string> = {}
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
  } catch { /* ignore missing env file */ }
  return out
}

function loadOpenWikiConfig(projectRoot: string) {
  const root = path.resolve(projectRoot || process.cwd())
  const projectConfig = readJson(path.join(root, ".ai", "openwiki.config.json")) || {}
  const globalEnv = readEnvFile(path.join(HOME, ".openwiki", ".env"))

  const provider = projectConfig.provider || globalEnv.OPENWIKI_PROVIDER || "openai-compatible"
  const modelId = projectConfig.modelId || globalEnv.OPENWIKI_MODEL_ID || ""
  const baseUrl = projectConfig.baseUrl || globalEnv.OPENAI_COMPATIBLE_BASE_URL || ""
  const apiKey = projectConfig.apiKey || globalEnv.OPENAI_COMPATIBLE_API_KEY || ""

  const env: Record<string, string> = {
    ...process.env as Record<string, string>,
    OPENWIKI_PROVIDER: provider,
    OPENWIKI_MODEL_ID: modelId,
    OPENAI_COMPATIBLE_BASE_URL: baseUrl,
    OPENAI_COMPATIBLE_API_KEY: apiKey,
  }

  for (const key of Object.keys(env)) {
    if (env[key] === "") delete env[key]
  }

  const flags: string[] = []
  if (modelId) flags.push("--modelId", modelId)

  return { env, flags }
}

function resolveRoot(input: any): string {
  return path.resolve(input?.directory || input?.project || process.cwd())
}

function docsRoot(root: string): string {
  return path.join(root, ".ai", "docs")
}

function openwikiPath(root: string): string {
  const local = path.join(root, "node_modules", ".bin", "openwiki")
  if (fs.existsSync(local)) return local
  return "openwiki"
}

function openwikiAvailable(root: string): boolean {
  try {
    const bin = openwikiPath(root)
    execSync(`"${bin}" --help`, { cwd: root, stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

/** True only when OpenWiki is both installed and able to run (API key configured). */
function openwikiUsable(root: string): boolean {
  if (!openwikiAvailable(root)) return false
  const res = runOpenWiki(root, ["--print", "hello"])
  // A usable run either succeeds or fails on something other than authentication.
  const authFail = /Invalid API key|MODEL_AUTHENTICATION|no API key|OPENAI_API_KEY|LANGCHAIN_API_KEY/i.test(res.stderr + res.stdout)
  return res.ok || !authFail
}

function runOpenWiki(root: string, args: string[], input?: string): { ok: boolean; stdout: string; stderr: string } {
  const bin = openwikiPath(root)
  const cfg = loadOpenWikiConfig(root)
  const env = {
    ...cfg.env,
    OPENWIKI_TELEMETRY_DISABLED: "1",
    DO_NOT_TRACK: "1",
  }
  const result = spawnSync(bin, [...cfg.flags, ...args], { cwd: root, env, input, encoding: "utf8" })
  return {
    ok: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  }
}

function mergeOpenWikiOutput(root: string) {
  const openwikiDir = path.join(root, "openwiki")
  const aiDocsDir = docsRoot(root)
  if (!fs.existsSync(openwikiDir) || !fs.existsSync(aiDocsDir)) return 0
  let copied = 0
  for (const src of walkMd(openwikiDir)) {
    const rel = path.relative(openwikiDir, src)
    const dst = path.join(aiDocsDir, rel)
    fs.mkdirSync(path.dirname(dst), { recursive: true })
    const generated = fs.readFileSync(src, "utf8")
    const merged = mergeWithExisting(dst, generated)
    fs.writeFileSync(dst, merged)
    copied++
  }
  return copied
}

function mergeWithExisting(dst: string, generatedContent: string): string {
  if (!fs.existsSync(dst)) return generatedContent
  const existing = fs.readFileSync(dst, "utf8")
  const existingFm = splitFrontmatter(existing)
  const generatedFm = splitFrontmatter(generatedContent)
  if (existingFm.fm && generatedFm.fm && !generatedFm.fm.includes("x_wikiguy:")) {
    const xWikiMatch = existingFm.fm.match(/x_wikiguy:[\s\S]*?(?=\n[A-Za-z_][\w-]*:|\n---|$)/)
    if (xWikiMatch) {
      generatedFm.fm = generatedFm.fm.trimEnd() + "\n" + xWikiMatch[0]
    }
  }
  return `---\n${generatedFm.fm}\n---\n\n${generatedFm.body.trim()}\n`
}

function git(root: string, cmd: string): string | null {
  try {
    return execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim()
  } catch {
    return null
  }
}

function insideDocs(root: string, p: string): string | null {
  const docs = docsRoot(root)
  const cleaned = p.replace(/^\.?\//, "")
  const resolved = cleaned.startsWith(".ai/docs/") || cleaned.startsWith(`.ai${path.sep}docs${path.sep}`)
    ? path.resolve(root, cleaned)
    : path.resolve(docs, cleaned)
  if (resolved !== docs && !resolved.startsWith(docs + path.sep)) return null
  return resolved
}

function isFile(p: string): boolean {
  try { return fs.statSync(p).isFile() } catch { return false }
}

function splitFrontmatter(text: string): { fm: string; body: string } {
  const m = text.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { fm: m[1], body: m[2] } : { fm: "", body: text }
}

function splitFrontmatterFile(file: string): { fm: string; body: string } {
  if (!isFile(file)) return { fm: "", body: "" }
  return splitFrontmatter(fs.readFileSync(file, "utf8"))
}

function topBlocks(fm: string): Map<string, string> {
  const blocks = new Map<string, string>()
  const lines = fm.split(/\r?\n/)
  let cur: string | null = null
  let buf: string[] = []
  const flush = () => { if (cur !== null) blocks.set(cur, buf.join("\n")) }
  for (const line of lines) {
    const m = line.match(/^([A-Za-z_][\w-]*):/)
    if (m && !/^\s/.test(line)) { flush(); cur = m[1]; buf = [line] }
    else if (cur !== null) buf.push(line)
  }
  flush()
  return blocks
}

function walkMd(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkMd(p, out)
    else if (e.isFile() && e.name.endsWith(".md") && e.name !== "INSTRUCTIONS.md") out.push(p)
  }
  return out
}

function xWikiBlock(fm: string): string[] | null {
  const lines = fm.split(/\r?\n/)
  const start = lines.findIndex((l) => /^x_wikiguy:\s*$/.test(l))
  if (start === -1) return null
  const inner: string[] = []
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) break
    inner.push(lines[i])
  }
  return inner
}

const MANAGED_KEYS = new Set([
  "type", "title", "description", "status", "tags",
  "sources", "generated", "verified", "x_wikiguy",
])

export default (input: any) => {
  const pluginRoot = resolveRoot(input)
  const rootOf = (ctx: any): string => path.resolve(ctx?.directory || pluginRoot)

  return {
    tool: {

      wiki_search: {
        description:
          "Search ONLY the project knowledge corpus .ai/docs/** (specs, architecture, decisions/ADRs, workflows, references). " +
          "Use for 'what does the project officially say about X'. Not for code questions (use grep/Sherclaw).",
        args: {
          query: z.string().describe("search text (case-insensitive substring)"),
          kind: z.enum(["Specification", "Architecture", "Decision", "Workflow", "Reference"]).optional().describe("filter by frontmatter type"),
          limit: z.number().optional().describe("max matches (default 20)"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const q = String(args?.query ?? "").toLowerCase()
          const kind = args?.kind ? String(args.kind).toLowerCase() : null
          const limit = Math.max(1, Number(args?.limit ?? 20))
          const docs = docsRoot(root)
          if (!fs.existsSync(docs)) {
            return {
              title: "wiki_search: no corpus",
              output: `No .ai/docs corpus exists at ${docs}. The project has no managed project knowledge yet — state this rather than guessing. To create knowledge, use wiki_save_concept (directly authorized) or report back to the caller.`,
            }
          }
          if (!q) return { title: "wiki_search", output: "error: query is required" }

          // Prefer OpenWiki search if available; otherwise fall back to local grep scan.
          if (openwikiUsable(root)) {
            const res = runOpenWiki(root, ["--print", `search wiki for "${q}" and return JSON results`])
            if (res.ok) {
              try {
                const data = JSON.parse(res.stdout)
                const hits = (Array.isArray(data) ? data : data?.results ?? []).slice(0, limit)
                if (hits.length) {
                  return {
                    title: `wiki_search: ${q}${kind ? ` (${kind})` : ""}`,
                    output: `${hits.length} match(es) from OpenWiki:\n` + hits.map((h: any) => `- ${h.path ?? h.file}: ${h.title ?? ""}`).join("\n"),
                  }
                }
              } catch {
                // fall through to local scan
              }
            }
          }

          const hits: string[] = []
          for (const f of walkMd(docs)) {
            const { fm } = splitFrontmatterFile(f)
            if (kind) {
              const t = fm.match(/^type:\s*(\S+)/m)?.[1]?.toLowerCase()
              const k = fm.match(/knowledge_kind:\s*(\S+)/m)?.[1]?.toLowerCase()
              if (t !== kind && k !== kind) continue
            }
            const rel = path.relative(root, f)
            const raw = fs.readFileSync(f, "utf8")
            const lines = raw.split(/\r?\n/)
            for (let i = 0; i < lines.length && hits.length < limit; i++) {
              if (lines[i].toLowerCase().includes(q)) {
                hits.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 200)}`)
              }
            }
            if (hits.length >= limit) break
          }
          return {
            title: `wiki_search: ${q}${kind ? ` (${kind})` : ""}`,
            output: hits.length
              ? `${hits.length} match(es) in .ai/docs (showing up to ${limit}):\n` + hits.join("\n")
              : `No matches for "${q}" in .ai/docs. The corpus has ${walkMd(docs).length} documents. Absence of documentation is itself an answer — report it.`,
          }
        },
      },

      wiki_read: {
        description:
          "Read one document from .ai/docs: returns frontmatter (OKF metadata), body, and git metadata (last commit touching the file).",
        args: {
          path: z.string().describe("document path, relative to project root or .ai/docs"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const p = insideDocs(root, String(args?.path ?? ""))
          if (!p) return { title: "wiki_read", output: "error: path must resolve inside .ai/docs" }
          if (!isFile(p)) return { title: "wiki_read", output: `error: no such document: ${args?.path}` }
          const { fm, body } = splitFrontmatterFile(p)
          const rel = path.relative(root, p)
          const last = git(root, `git log -1 --format="%h | %ad | %s" --date=short -- ${JSON.stringify(rel)}`)
          return {
            title: `wiki_read: ${rel}`,
            output: [
              `path: ${rel}`,
              "--- frontmatter ---",
              fm || "(none)",
              "--- git ---",
              last ? `last commit: ${last}` : "no git history for this file",
              "--- body ---",
              body.trim() || "(empty body)",
            ].join("\n"),
          }
        },
      },

      wiki_freshness: {
        description:
          "Deterministic Git drift check for one .ai/docs document using its x_wikiguy metadata (verified_commit + covers). " +
          "Returns LIKELY_FRESH (no covered paths changed), STALE_CANDIDATES (covered paths changed — semantic verification via Sherclaw still needed), " +
          "UNVERIFIED, UNKNOWN_COMMIT, or NO_GIT.",
        args: {
          path: z.string().describe("document path inside .ai/docs"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const p = insideDocs(root, String(args?.path ?? ""))
          if (!p || !isFile(p)) return { title: "wiki_freshness", output: `error: no such document: ${args?.path}` }
          const rel = path.relative(root, p)
          const { fm } = splitFrontmatterFile(p)
          const inner = xWikiBlock(fm)
          if (!inner) {
            return { title: `wiki_freshness: ${rel}`, output: `path: ${rel}\nstatus: UNVERIFIED\nreason: no x_wikiguy metadata (no verified_commit)` }
          }
          const vc = inner.join("\n").match(/verified_commit:\s*([0-9a-fA-F]{7,40})/)?.[1]
          if (!vc) {
            return { title: `wiki_freshness: ${rel}`, output: `path: ${rel}\nstatus: UNVERIFIED\nreason: x_wikiguy has no verified_commit` }
          }
          const covers: string[] = []
          const ci = inner.findIndex((l) => /^\s*covers:\s*$/.test(l))
          if (ci !== -1) {
            for (let i = ci + 1; i < inner.length; i++) {
              const m = inner[i].match(/^\s+-\s*(\S+)/)
              if (!m) break
              covers.push(m[1])
            }
          }
          const scope = covers.length ? covers : [rel]
          if (!git(root, "git rev-parse --git-dir")) {
            return { title: `wiki_freshness: ${rel}`, output: `path: ${rel}\nstatus: NO_GIT\nreason: not a git repository — freshness undecidable` }
          }
          if (!git(root, `git rev-parse --verify ${vc}^{commit}`)) {
            return { title: `wiki_freshness: ${rel}`, output: `path: ${rel}\nstatus: UNKNOWN_COMMIT\nverified_commit: ${vc}\nreason: commit not reachable in this repository` }
          }
          const diff = git(root, `git diff --name-only ${vc}..HEAD -- ${scope.map((s) => JSON.stringify(s)).join(" ")}`) ?? ""
          const changed = diff.split("\n").filter(Boolean)
          const lines = [
            `path: ${rel}`,
            `verified_commit: ${vc}`,
            `covers: ${covers.length ? covers.join(", ") : "(self only)"}`,
          ]
          if (changed.length === 0) {
            lines.push("status: LIKELY_FRESH", "reason: no covered paths changed since verified_commit")
          } else {
            lines.push("status: STALE_CANDIDATES", "changed paths since verified_commit (semantic verification via Sherclaw required):", ...changed.map((c) => `  - ${c}`))
          }
          return { title: `wiki_freshness: ${rel}`, output: lines.join("\n") }
        },
      },

      wiki_save_concept: {
        description:
          "The ONLY sanctioned write path into .ai/docs. Saves one OKF Markdown document atomically: enforces path stays inside .ai/docs, " +
          "preserves unknown top-level OKF fields from the existing file, refreshes generated provenance (by: lorecat, date), validates the result. " +
          "When OpenWiki is installed, it is invoked to generate/update the document first, then PawCrew-specific metadata (x_wikiguy) is merged back. " +
          "Call only when the owning workflow has authorized the write (direct reconciliation, approved plan, or /lore-cat-save-it).",
        args: {
          path: z.string().describe("destination path inside .ai/docs"),
          frontmatter_yaml: z.string().describe("complete OKF frontmatter YAML (must include type; include x_wikiguy block with knowledge_kind/authority/verified_commit/covers as applicable)"),
          body: z.string().optional().describe("markdown body; omit to keep the existing body when updating"),
          preserve_unknown: z.boolean().optional().describe("preserve unknown top-level OKF fields from existing file (default true)"),
          openwiki_prompt: z.string().optional().describe("optional natural-language prompt for OpenWiki generation when creating a new concept"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const p = insideDocs(root, String(args?.path ?? ""))
          if (!p) return { title: "wiki_save_concept", output: `error: path must resolve inside .ai/docs (got: ${args?.path})` }
          const rel = path.relative(root, p)
          const fmNew = String(args?.frontmatter_yaml ?? "").trim()
          if (!fmNew) return { title: "wiki_save_concept", output: "error: frontmatter_yaml is required" }
          if (!/^type:/m.test(fmNew)) return { title: "wiki_save_concept", output: "error: frontmatter_yaml must include a top-level 'type' (Specification|Architecture|Decision|Workflow|Reference)" }

          const preserveUnknown = args?.preserve_unknown !== false
          const existed = isFile(p)
          const keptKeys: string[] = []
          if (preserveUnknown && existed) {
            const { fm: oldFm } = splitFrontmatterFile(p)
            const oldBlocks = topBlocks(oldFm)
            const newKeys = new Set(topBlocks(fmNew).keys())
            for (const [k, blk] of oldBlocks) {
              if (!newKeys.has(k) && !MANAGED_KEYS.has(k) && blk.trim()) keptKeys.push(k)
            }
          }

          let generatedBody = args?.body !== undefined ? String(args.body).trim() : existed ? splitFrontmatterFile(p).body.trim() : ""

          // If OpenWiki is available and we are creating a new concept, let OpenWiki draft the body.
          if (openwikiUsable(root) && !existed && args?.openwiki_prompt) {
            const owResult = runOpenWiki(root, ["--print", args.openwiki_prompt])
            if (owResult.ok) {
              const merged = mergeWithExisting(p, owResult.stdout)
              const split = splitFrontmatter(merged)
              if (split.body.trim()) generatedBody = split.body.trim()
            }
          }

          // Assemble final frontmatter: unknown-preserved keys first, then new blocks (ordered), then refreshed generated.
          const blocks = topBlocks(fmNew)
          blocks.delete("generated")
          const order = ["type", "title", "description", "status", "tags", "sources", "verified", "x_wikiguy"]
          const parts: string[] = []
          for (const k of keptKeys) parts.push(oldBlock(p, k)!)
          for (const k of order) if (blocks.has(k)) parts.push(blocks.get(k)!)
          for (const [k, v] of blocks) if (!order.includes(k)) parts.push(v)
          const now = new Date().toISOString()
          parts.push(["generated:", "  by: lorecat", `  at: ${now}`].join("\n"))
          const finalFm = parts.filter(Boolean).join("\n")

          fs.mkdirSync(path.dirname(p), { recursive: true })
          const tmp = p + ".lorecat.tmp"
          fs.writeFileSync(tmp, `---\n${finalFm}\n---\n\n${generatedBody}\n`)
          fs.renameSync(tmp, p)

          const chk = splitFrontmatterFile(p)
          const warnings: string[] = []
          if (!chk.fm) warnings.push("frontmatter failed to round-trip — inspect the file")
          if (/authority:\s*normative/.test(chk.fm) && !/verified_commit:/.test(chk.fm)) {
            warnings.push("normative document saved WITHOUT verified_commit — verify via Sherclaw and re-save with x_wikiguy.verified_commit")
          }

          // Sync OpenWiki-generated metadata (e.g., .last-update.json) into .ai/docs if present.
          if (openwikiAvailable(root)) {
            mergeOpenWikiOutput(root)
          }

          return {
            title: `wiki_save_concept: ${rel}`,
            output: [
              `${existed ? "updated" : "created"}: ${rel}`,
              keptKeys.length ? `preserved unknown OKF fields: ${keptKeys.join(", ")}` : "no unknown fields to preserve",
              ...warnings.map((w) => `WARNING: ${w}`),
              "Next: wiki_sync (indexes/log) then wiki_validate.",
            ].join("\n"),
          }
        },
      },

      wiki_validate: {
        description:
          "Validate the .ai/docs corpus: YAML frontmatter present, required type, x_wikiguy integrity (knowledge_kind; normative docs need verified_commit), " +
          "internal markdown links resolve, index.md and log.md exist at the corpus root. Delegates to OpenWiki validation when installed; otherwise runs PawCrew's native validator.",
        args: {},
        execute: async (_args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const docs = docsRoot(root)
          if (!fs.existsSync(docs)) return { title: "wiki_validate", output: `error: no .ai/docs corpus at ${docs}` }

          if (openwikiUsable(root)) {
            const res = runOpenWiki(root, ["--print", "validate the OpenWiki corpus and return a JSON error list"])
            if (res.ok) {
              try {
                const data = JSON.parse(res.stdout)
                const errors = (data?.errors ?? []).filter((e: any) => e.file !== ".ai/docs/INSTRUCTIONS.md")
                if (errors.length) {
                  return {
                    title: "wiki_validate: OpenWiki",
                    output: `${errors.length} problem(s):\n` + errors.map((e: any) => `- ${e.file ?? "corpus"}: ${e.message}`).join("\n"),
                  }
                }
                return { title: "wiki_validate: OpenWiki", output: "OpenWiki validation passed." }
              } catch {
                // fall through
              }
            }
          }

          const errors: string[] = []
          const files = walkMd(docs)
          for (const f of files) {
            const rel = path.relative(root, f)
            const isInfra = f === path.join(docs, "index.md") || f === path.join(docs, "log.md")
            const { fm, body } = splitFrontmatterFile(f)
            if (!fm && !isInfra) { errors.push(`${rel}: missing YAML frontmatter`); continue }
            if (isInfra) {
              for (const m of body.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:#[^)]*)?\)/g)) {
                const target = m[1]
                if (/^(https?:|mailto:|#)/.test(target)) continue
                if (!fs.existsSync(path.resolve(path.dirname(f), decodeURIComponent(target)))) {
                  errors.push(`${rel}: broken link -> ${target}`)
                }
              }
              continue
            }
            if (!/^type:/m.test(fm)) errors.push(`${rel}: missing required 'type'`)
            if (/^x_wikiguy:/m.test(fm)) {
              if (!/knowledge_kind:/.test(fm)) errors.push(`${rel}: x_wikiguy missing knowledge_kind`)
              if (/authority:\s*normative/.test(fm) && !/verified_commit:/.test(fm)) errors.push(`${rel}: normative authority without verified_commit`)
            }
            for (const m of body.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:#[^)]*)?\)/g)) {
              const target = m[1]
              if (/^(https?:|mailto:|#)/.test(target)) continue
              if (!fs.existsSync(path.resolve(path.dirname(f), decodeURIComponent(target)))) {
                errors.push(`${rel}: broken link -> ${target}`)
              }
            }
          }
          if (!fs.existsSync(path.join(docs, "index.md"))) errors.push("index.md: missing at corpus root")
          if (!fs.existsSync(path.join(docs, "log.md"))) errors.push("log.md: missing at corpus root")
          return {
            title: `wiki_validate: ${files.length} documents`,
            output: errors.length === 0
              ? `OK: ${files.length} documents valid. OKF structure, links, index, and log all pass.`
              : `${errors.length} problem(s) across ${files.length} documents:\n` + errors.map((e) => `- ${e}`).join("\n"),
          }
        },
      },

      wiki_sync: {
        description:
          "Synchronize corpus infrastructure after knowledge changes: regenerate .ai/docs/index.md from titles/descriptions, append a dated entry to log.md " +
          "for the changed paths, and no-op silently when nothing changed (no Git noise). When OpenWiki is installed, it handles index/log sync first; " +
          "PawCrew then refreshes the same files with its own grouping if needed.",
        args: {
          changed_paths: z.array(z.string()).describe("the .ai/docs paths created/updated in this transaction"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx)
          const docs = docsRoot(root)
          if (!fs.existsSync(docs)) return { title: "wiki_sync", output: `error: no .ai/docs corpus at ${docs}` }
          const changed: string[] = Array.isArray(args?.changed_paths) ? args.changed_paths.map(String) : []

          let openwikiMsg = ""
          if (openwikiUsable(root)) {
            const res = runOpenWiki(root, ["--update", "--print", "sync the OpenWiki index and log"])
            if (res.ok) {
              openwikiMsg = "OpenWiki sync: completed."
              mergeOpenWikiOutput(root)
            } else {
              openwikiMsg = `OpenWiki sync: skipped (${res.stderr.slice(0, 200)})`
            }
          }

          const files = walkMd(docs).filter((f) => !f.endsWith(`${path.sep}index.md`) && !f.endsWith(`${path.sep}log.md`))
          const groups = new Map<string, string[]>()
          for (const f of files) {
            const relDocs = path.relative(docs, f).split(path.sep).join("/")
            const { fm } = splitFrontmatterFile(f)
            const title = fm.match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? path.basename(f, ".md")
            const desc = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? ""
            const sec = relDocs.includes("/") ? relDocs.split("/")[0] : "misc"
            const line = `- [${title}](${relDocs})${desc ? ` — ${desc}` : ""}`
            groups.set(sec, [...(groups.get(sec) ?? []), line])
          }
          const idxParts = ["# Project Knowledge Index", "", "_Generated by wiki_sync — do not edit manually._", ""]
          for (const sec of [...groups.keys()].sort()) idxParts.push(`## ${sec}`, "", ...groups.get(sec)!, "")
          const want = idxParts.join("\n")
          const idxPath = path.join(docs, "index.md")
          const had = fs.existsSync(idxPath) ? fs.readFileSync(idxPath, "utf8") : ""
          const indexChanged = want.trim() !== had.trim()
          if (indexChanged) fs.writeFileSync(idxPath, want)

          let logChanged = false
          if (changed.length) {
            const today = new Date().toISOString().slice(0, 10)
            const entry = `- ${today} — updated: ${changed.map((c) => "`" + c + "`").join(", ")}`
            const logPath = path.join(docs, "log.md")
            const prev = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "# Knowledge Log\n"
            if (!prev.split("\n").some((l) => l.trim() === entry.trim())) {
              fs.writeFileSync(logPath, prev.replace(/\s*$/, "\n") + entry + "\n")
              logChanged = true
            }
          }

          if (!indexChanged && !logChanged) {
            return { title: "wiki_sync", output: [openwikiMsg, "No documentation changes required. Existing project knowledge is already current."].filter(Boolean).join("\n") }
          }
          return {
            title: "wiki_sync",
            output: [
              openwikiMsg,
              indexChanged ? "index.md: regenerated" : "index.md: unchanged (no-op)",
              logChanged ? `log.md: appended entry for ${changed.length} path(s)` : "log.md: unchanged (no-op)",
              "Next: wiki_validate.",
            ].filter(Boolean).join("\n"),
          }
        },
      },
    } as any,
  }
}

function oldBlock(file: string, key: string): string | null {
  if (!fs.existsSync(file)) return null
  const { fm } = splitFrontmatterFile(file)
  return topBlocks(fm).get(key) ?? null
}
