// hashline.ts — hash-anchored edit helpers for PawCrew.
// Provides deterministic read/edit tools that reject stale anchors.

import * as fs from "node:fs"
import * as path from "node:path"
import * as crypto from "node:crypto"
import { z } from "zod"

type Res = { title: string; output: string }
type Ctx = { directory?: string }

const HASH_LEN = 2

function resolveRoot(input: any): string {
  return path.resolve(input?.directory || input?.project || process.cwd())
}

function rootOf(ctx: any, pluginRoot: string): string {
  return path.resolve(ctx?.directory || pluginRoot)
}

function lineHash(line: string): string {
  const h = crypto.createHash("sha256").update(line).digest("base64url")
  return h.slice(0, HASH_LEN)
}

function formatLine(num: number, content: string): string {
  return `${num}#${lineHash(content)}| ${content}`
}

interface EditOp {
  anchor: string
  replace?: string
  after?: string
  before?: string
  delete?: boolean
}

function parseAnchor(anchor: string): { lineNum: number; hash: string } | null {
  const m = anchor.match(/^(\d+)#([A-Za-z0-9_-]+)$/)
  if (!m) return null
  return { lineNum: parseInt(m[1], 10), hash: m[2] }
}

export default (input: any) => {
  const pluginRoot = resolveRoot(input)

  return {
    tool: {
      hashline_view: {
        description:
          "Read a file and return every line tagged with LINE#ID hashes for hashline editing. " +
          "Use this before planning hashline edits.",
        args: {
          path: z.string().describe("relative or absolute file path"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx, pluginRoot)
          const filePath = path.resolve(root, args.path)
          if (!fs.existsSync(filePath)) {
            return { title: "hashline_view: file not found", output: `File not found: ${filePath}` }
          }
          const content = fs.readFileSync(filePath, "utf8")
          const lines = content.split(/\r?\n/)
          const tagged = lines.map((line, idx) => formatLine(idx + 1, line))
          return {
            title: `hashline_view: ${path.relative(root, filePath)}`,
            output: tagged.join("\n"),
          }
        },
      },

      hashline_edit: {
        description:
          "Apply edits anchored by LINE#ID hashes. Each operation is verified against the current " +
          "line content; mismatched anchors are rejected. Returns succeeded and failed operations.",
        args: {
          path: z.string().describe("relative or absolute file path"),
          ops: z.array(
            z.object({
              anchor: z.string().describe("LINE#ID anchor, e.g. 22#XJ"),
              replace: z.string().optional().describe("new line content replacing the anchored line"),
              after: z.string().optional().describe("content to insert after the anchored line"),
              before: z.string().optional().describe("content to insert before the anchored line"),
              delete: z.boolean().optional().describe("remove the anchored line"),
            })
          ).describe("list of edit operations"),
        },
        execute: async (args: any, ctx: any): Promise<Res> => {
          const root = rootOf(ctx, pluginRoot)
          const filePath = path.resolve(root, args.path)
          if (!fs.existsSync(filePath)) {
            return { title: "hashline_edit: file not found", output: `File not found: ${filePath}` }
          }

          const content = fs.readFileSync(filePath, "utf8")
          const lines = content.split(/\r?\n/)
          const ops: EditOp[] = Array.isArray(args.ops) ? args.ops : []
          const failed: string[] = []
          const succeeded: string[] = []

          // Sort ops by descending line number so insertions/deletions don't shift later anchors.
          const sorted = ops
            .map((op: EditOp) => {
              const parsed = parseAnchor(op.anchor)
              if (!parsed) {
                failed.push(`invalid anchor: ${op.anchor}`)
                return null
              }
              return { ...op, lineNum: parsed.lineNum, expectedHash: parsed.hash }
            })
            .filter(Boolean)
            .sort((a: any, b: any) => b.lineNum - a.lineNum)

          for (const op of sorted) {
            const idx = op.lineNum - 1
            if (idx < 0 || idx >= lines.length) {
              failed.push(`${op.anchor}: line number out of range`)
              continue
            }
            const currentHash = lineHash(lines[idx])
            if (currentHash !== op.expectedHash) {
              failed.push(`${op.anchor}: hash mismatch (expected ${op.expectedHash}, got ${currentHash})`)
              continue
            }

            if (op.delete) {
              lines.splice(idx, 1)
              succeeded.push(`${op.anchor}: deleted`)
            } else if (typeof op.replace === "string") {
              lines[idx] = op.replace
              succeeded.push(`${op.anchor}: replaced`)
            }
            if (typeof op.after === "string") {
              lines.splice(idx + 1, 0, op.after)
              succeeded.push(`${op.anchor}: inserted after`)
            }
            if (typeof op.before === "string") {
              lines.splice(idx, 0, op.before)
              succeeded.push(`${op.anchor}: inserted before`)
            }
          }

          if (succeeded.length > 0) {
            fs.writeFileSync(filePath, lines.join("\n"))
          }

          const output = [
            `file: ${path.relative(root, filePath)}`,
            `succeeded: ${succeeded.length}`,
            succeeded.length ? `- ${succeeded.join("\n- ")}` : "",
            `failed: ${failed.length}`,
            failed.length ? `- ${failed.join("\n- ")}` : "",
            "",
            failed.length
              ? "Some anchors were stale. Re-run hashline_view and retry."
              : "All anchors verified and applied.",
          ].join("\n")

          return {
            title: `hashline_edit: ${succeeded.length} ok, ${failed.length} failed`,
            output,
          }
        },
      },
    } as any,
  }
}
