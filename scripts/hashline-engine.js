// hashline-engine.js — pure-JS hashline-compatible read/patch engine for PawCrew.
// Implements the subset of the hashline CLI contract used by the OpenCode plugin:
// read, patch (SWAP/DEL/INS.*), write, find-block, remove, rename.
// No external binary required.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

// xxh32 is not built into Node; use a simple, fast 32-bit hash that is
// deterministic and collision-resistant enough for line anchors.
// We use xxh32 via the npm package `xxhashjs` if installed, otherwise fall
// back to a 32-bit FNV-1a variant that produces 4-hex chars per anchor.
let xxh32;
try {
  const XXH = await import("xxhashjs");
  xxh32 = (str) => XXH.default.h32(str, 0x9747b28c).toString(16).padStart(8, "0");
} catch {
  xxh32 = fnv1a32Hex;
}

function fnv1a32Hex(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function lineHash(content) {
  return xxh32(content).slice(0, 4); // 4 hex chars => ~65k lines before 1% collision risk
}

export function fileHash(lines) {
  const h = crypto.createHash("sha256");
  for (const l of lines) h.update(l + "\n");
  return h.digest("hex").slice(0, 8);
}

function splitLines(content) {
  // Preserve the original line-ending style by remembering whether the file
  // ended with a newline. Splitting by \r?\n drops the final empty segment.
  const endsWithNewline = content.endsWith("\n");
  const lines = content.split(/\r?\n/);
  return { lines, endsWithNewline };
}

function joinLines(lines, endsWithNewline) {
  if (lines.length === 0) return "";
  return lines.join("\n") + (endsWithNewline ? "\n" : "");
}

export function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new HashlineError("io_error", `No such file or directory: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  const { lines, endsWithNewline } = splitLines(content);
  const result = {
    path: filePath,
    hash: fileHash(lines),
    lines: lines.map((content, idx) => ({
      n: idx + 1,
      hash: lineHash(content),
      content,
    })),
    endsWithNewline,
  };
  return result;
}

function parseAnchor(anchor) {
  const m = anchor.match(/^(\d+):([0-9a-fA-F]+)$/);
  if (!m) throw new HashlineError("bad_anchor", `Invalid anchor: ${anchor}`);
  return { lineNum: parseInt(m[1], 10), hash: m[2].toLowerCase() };
}

function verifyLine(state, anchor, requireHash = true) {
  const { lineNum, hash } = parseAnchor(anchor);
  if (lineNum < 1 || lineNum > state.lines.length) {
    throw new HashlineError("out_of_range", `line ${lineNum} out of range`);
  }
  const current = state.lines[lineNum - 1];
  const currentHash = lineHash(current);
  if (requireHash && currentHash !== hash) {
    throw new HashlineError(
      "stale_anchor",
      `line ${lineNum} content changed since last read (expected ${hash}, got ${currentHash})`,
    );
  }
  return { lineNum, hash, current };
}

function findMatchingLine(state, hash, preferredLineNum) {
  const matches = state.lines
    .map((content, idx) => ({ content, idx }))
    .filter((l) => lineHash(l.content) === hash);
  if (matches.length === 0) {
    throw new HashlineError("hash_not_found", `hash '${hash}' not found in ${state.path}`);
  }
  if (matches.length === 1) return matches[0].idx + 1;
  if (preferredLineNum) {
    const exact = matches.find((m) => m.idx + 1 === preferredLineNum);
    if (exact) return exact.idx + 1;
  }
  throw new HashlineError(
    "ambiguous_hash",
    `hash '${hash}' matches ${matches.length} lines; use a line-qualified anchor`,
  );
}

function applySingleOp(state, op) {
  const trimmed = op.trim();
  if (!trimmed) return [];

  // SWAP N:hh..M: (+payload)
  const swapRange = trimmed.match(/^SWAP\s+(\d+):([0-9a-fA-F]+)\.\.(\d+):([0-9a-fA-F]+)?\s*:/);
  if (swapRange) {
    const startLine = parseInt(swapRange[1], 10);
    const startHash = swapRange[2].toLowerCase();
    const endLine = parseInt(swapRange[3], 10);
    const payload = parsePayload(op, swapRange[0].length);
    verifyLine(state, `${startLine}:${startHash}`, true);
    const payloadLines = payload.length ? payload : [""];
    state.lines.splice(startLine - 1, endLine - startLine + 1, ...payloadLines);
    return [startLine];
  }

  // SWAP N:hh: (+payload)
  const swapSingle = trimmed.match(/^SWAP\s+(\d+):([0-9a-fA-F]+)\s*:/);
  if (swapSingle) {
    const startLine = parseInt(swapSingle[1], 10);
    const startHash = swapSingle[2].toLowerCase();
    const payload = parsePayload(op, swapSingle[0].length);
    verifyLine(state, `${startLine}:${startHash}`, true);
    if (payload.length === 0) {
      state.lines.splice(startLine - 1, 1);
    } else {
      state.lines[startLine - 1] = payload[0];
    }
    return [startLine];
  }

  // DEL N:hh..M
  const delRange = trimmed.match(/^DEL\s+(\d+):([0-9a-fA-F]+)\.\.(\d+)$/);
  if (delRange) {
    const startLine = parseInt(delRange[1], 10);
    const startHash = delRange[2].toLowerCase();
    const endLine = parseInt(delRange[3], 10);
    verifyLine(state, `${startLine}:${startHash}`, true);
    state.lines.splice(startLine - 1, endLine - startLine + 1);
    return [startLine];
  }

  // DEL N:hh
  const delSingle = trimmed.match(/^DEL\s+(\d+):([0-9a-fA-F]+)$/);
  if (delSingle) {
    const startLine = parseInt(delSingle[1], 10);
    const startHash = delSingle[2].toLowerCase();
    verifyLine(state, `${startLine}:${startHash}`, true);
    state.lines.splice(startLine - 1, 1);
    return [startLine];
  }

  // INS.POST N:hh: (+payload)
  const insPost = trimmed.match(/^INS\.POST\s+(\d+):([0-9a-fA-F]+)\s*:/);
  if (insPost) {
    const lineNum = parseInt(insPost[1], 10);
    const hash = insPost[2].toLowerCase();
    const payload = parsePayload(op, insPost[0].length);
    verifyLine(state, `${lineNum}:${hash}`, true);
    state.lines.splice(lineNum, 0, ...payload);
    return [lineNum];
  }

  // INS.PRE N:hh: (+payload)
  const insPre = trimmed.match(/^INS\.PRE\s+(\d+):([0-9a-fA-F]+)\s*:/);
  if (insPre) {
    const lineNum = parseInt(insPre[1], 10);
    const hash = insPre[2].toLowerCase();
    const payload = parsePayload(op, insPre[0].length);
    verifyLine(state, `${lineNum}:${hash}`, true);
    state.lines.splice(lineNum - 1, 0, ...payload);
    return [lineNum];
  }

  // INS.TAIL: (+payload)
  const insTail = trimmed.match(/^INS\.TAIL\s*:/);
  if (insTail) {
    const payload = parsePayload(op, insTail[0].length);
    state.lines.push(...payload);
    return [state.lines.length - payload.length + 1];
  }

  // INS.HEAD: (+payload)
  const insHead = trimmed.match(/^INS\.HEAD\s*:/);
  if (insHead) {
    const payload = parsePayload(op, insHead[0].length);
    state.lines.unshift(...payload);
    return [1];
  }

  throw new HashlineError("bad_patch", `Unrecognized patch op: ${trimmed.slice(0, 40)}`);
}

function parsePayload(patchText, headerLength) {
  const body = patchText.slice(headerLength);
  const rawLines = body.split(/\r?\n/);
  const result = [];
  let seenPayload = false;
  for (const raw of rawLines) {
    if (raw === "+") {
      result.push("");
      seenPayload = true;
    } else if (raw.startsWith("++")) {
      result.push("+" + raw.slice(2));
      seenPayload = true;
    } else if (raw.startsWith("+-") && raw.length > 2) {
      result.push("-" + raw.slice(2));
      seenPayload = true;
    } else if (raw.startsWith("+")) {
      result.push(raw.slice(1));
      seenPayload = true;
    } else if (raw.trim() === "") {
      if (seenPayload) break; // trailing blank line ends payload
      // otherwise ignore leading blank line right after header
    } else {
      throw new HashlineError("bad_patch", `Malformed payload line: ${raw}`);
    }
  }
  return result;
}

export function patchFile(filePath, patchText) {
  const { lines, endsWithNewline } = splitLines(fs.readFileSync(filePath, "utf8"));
  const state = { path: filePath, lines };

  // Strip envelope
  let ops = patchText
    .replace(/^\*\*\* Begin Patch\n/, "")
    .replace(/\n\*\*\* End Patch\n?$/, "")
    .trim();

  if (!ops) throw new HashlineError("no_op", "No patch operations provided");

  // Split into individual operations. Each op starts with a keyword at the
  // beginning of a line and consumes payload rows until the next op keyword.
  const opKeyword = /^(SWAP|DEL|INS\.POST|INS\.PRE|INS\.TAIL|INS\.HEAD)\b/m;
  const opStrings = [];
  let current = "";
  for (const rawLine of ops.split(/\r?\n/)) {
    if (opKeyword.test(rawLine)) {
      if (current) opStrings.push(current);
      current = rawLine;
    } else {
      current += "\n" + rawLine;
    }
  }
  if (current) opStrings.push(current);

  // Apply ops in reverse line order so later ops don't shift earlier anchors.
  const withStart = opStrings.map((op) => {
    const firstLine = op.split("\n")[0].trim();
    const startMatch = firstLine.match(/(?:SWAP|DEL|INS\.POST|INS\.PRE)\s+(\d+):/);
    return { op, startLine: startMatch ? parseInt(startMatch[1], 10) : 0 };
  });
  withStart.sort((a, b) => b.startLine - a.startLine);

  const changed = [];
  for (const { op } of withStart) {
    const affected = applySingleOp(state, op);
    changed.push(...affected);
  }

  const newContent = joinLines(state.lines, endsWithNewline);
  fs.writeFileSync(filePath, newContent);

  return {
    path: filePath,
    hash: fileHash(state.lines),
    editsApplied: opStrings.length,
    changedLines: [...new Set(changed)].sort((a, b) => a - b),
    lines: state.lines.map((content, idx) => ({
      n: idx + 1,
      hash: lineHash(content),
      content,
    })),
  };
}

export function writeFile(filePath, content, { force = false } = {}) {
  if (fs.existsSync(filePath) && !force) {
    throw new HashlineError("already_exists", `${filePath} already exists`);
  }
  fs.writeFileSync(filePath, content);
  return readFile(filePath);
}

export function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new HashlineError("io_error", `No such file or directory: ${filePath}`);
  }
  fs.unlinkSync(filePath);
  return { removed: filePath };
}

export function renameFile(src, dst, { force = false } = {}) {
  if (!fs.existsSync(src)) {
    throw new HashlineError("io_error", `No such file or directory: ${src}`);
  }
  if (fs.existsSync(dst) && !force) {
    throw new HashlineError("already_exists", `${dst} already exists`);
  }
  fs.renameSync(src, dst);
  return { from: src, to: dst };
}

export function findBlock(filePath, anchor) {
  const parsed = parseAnchor(anchor);
  const readResult = readFile(filePath);
  const rawLines = readResult.lines;
  const idx = parsed.lineNum - 1;
  if (idx < 0 || idx >= rawLines.length) {
    throw new HashlineError("out_of_range", `line ${parsed.lineNum} out of range`);
  }
  if (rawLines[idx].hash !== parsed.hash) {
    throw new HashlineError(
      "stale_anchor",
      `line ${parsed.lineNum} content changed since last read`,
    );
  }

  const content = rawLines[idx].content;
  const ext = path.extname(filePath).toLowerCase();
  const isPythonLike = [".py"].includes(ext);
  const isRubyLike = [".rb"].includes(ext);

  let start = idx;
  let end = idx;

  if (isPythonLike) {
    const baseIndent = content.match(/^(\s*)/)?.[1].length ?? 0;
    for (let i = idx + 1; i < rawLines.length; i++) {
      const lineIndent = rawLines[i].content.match(/^(\s*)/)?.[1].length ?? 0;
      if (rawLines[i].content.trim() === "") continue;
      if (lineIndent <= baseIndent) break;
      end = i;
    }
  } else if (isRubyLike) {
    let depth = 0;
    for (let i = idx; i < rawLines.length; i++) {
      if (/\bdef\b/.test(rawLines[i].content)) depth++;
      if (/\bend\b/.test(rawLines[i].content)) {
        depth--;
        if (depth <= 0) {
          end = i;
          break;
        }
      }
    }
  } else {
    let braceDepth = 0;
    let foundOpen = false;
    outer: for (let i = idx; i < rawLines.length; i++) {
      for (const ch of rawLines[i].content) {
        if (ch === "{" || ch === "(") {
          braceDepth++;
          foundOpen = true;
        } else if (ch === "}" || ch === ")") {
          braceDepth--;
          if (foundOpen && braceDepth <= 0) {
            end = i;
            break outer;
          }
        }
      }
    }
  }

  const blockLines = rawLines.slice(start, end + 1);
  return {
    language: ext.slice(1) || "unknown",
    line_count: blockLines.length,
    block_lines: blockLines.map((l) => ({
      n: l.n,
      hash: l.hash,
      content: l.content,
    })),
  };
}

export class HashlineError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind;
  }
}

export function formatRead(result, { offset = 1, limit } = {}) {
  const start = Math.max(1, offset);
  const end = limit ? Math.min(result.lines.length, start + limit - 1) : result.lines.length;
  const rows = result.lines
    .slice(start - 1, end)
    .map((l) => `${l.n}:${l.hash}|${l.content}`)
    .join("\n");
  return {
    text: `${path.basename(result.path)}#${result.hash}\n${rows}`,
    truncated: end < result.lines.length,
    startLine: start,
    endLine: end,
  };
}

export function formatPatchResult(result) {
  const changedRows = result.changedLines
    .map((n) => {
      const l = result.lines.find((x) => x.n === n);
      return `~${l.n}:${l.hash}|${l.content}`;
    })
    .join("\n");
  return `OK ${result.path}#${result.hash} edits=${result.editsApplied} changed=${result.changedLines.length}\n${changedRows}`;
}
