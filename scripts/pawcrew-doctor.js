#!/usr/bin/env node
// pawcrew-doctor.js — diagnose PawCrew installation, config, and environment.

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const KIT_DIR = path.resolve(path.dirname(__filename), "..");
const HOME = os.homedir();
const GLOBAL_CONFIG = path.join(HOME, ".config", "opencode");
const SUPERGLOBALS = path.join(KIT_DIR, "node_modules", ".bin");

const checks = [];
const warnings = [];
const errors = [];

function log(check, status, detail = "") {
  const line = detail ? `${check}: ${status} — ${detail}` : `${check}: ${status}`;
  if (status === "OK") checks.push(line);
  else if (status === "WARN") warnings.push(line);
  else errors.push(line);
}

function isSymlinkPointingTo(src, expected) {
  try {
    const resolved = fs.realpathSync(src);
    return resolved.startsWith(expected);
  } catch {
    return false;
  }
}

function checkSymlinks() {
  const src = path.join(KIT_DIR, ".opencode");
  const categories = fs.readdirSync(src, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  for (const cat of categories) {
    const catSrc = path.join(src, cat);
    const catDst = path.join(GLOBAL_CONFIG, cat);
    if (!fs.existsSync(catDst)) {
      log(`symlink:${cat}`, "MISSING", `expected at ${catDst}`);
      continue;
    }

    const entries = fs.readdirSync(catSrc, { withFileTypes: true });
    for (const entry of entries) {
      const dst = path.join(catDst, entry.name);
      if (!fs.existsSync(dst)) {
        log(`symlink:${cat}/${entry.name}`, "MISSING", `expected at ${dst}`);
        continue;
      }

      if (entry.isDirectory()) {
        // Directory may contain symlinked files; verify the directory exists and at least one direct child is a symlink into the kit.
        const children = fs.readdirSync(dst, { withFileTypes: true });
        const anySymlinkToKit = children.some((c) => {
          if (!c.isSymbolicLink()) return false;
          const childPath = path.join(dst, c.name);
          return isSymlinkPointingTo(childPath, KIT_DIR);
        });
        if (!anySymlinkToKit) {
          log(`symlink:${cat}/${entry.name}`, "WARN", `no child symlink points to kit`);
        }
      } else if (entry.isFile()) {
        if (!isSymlinkPointingTo(dst, KIT_DIR)) {
          log(`symlink:${cat}/${entry.name}`, "WARN", `${dst} is not a symlink to kit`);
        }
      }
    }
  }
}

function checkOpenCodeConfig() {
  const candidates = [
    path.join(GLOBAL_CONFIG, "opencode.json"),
    path.join(GLOBAL_CONFIG, "opencode.jsonc"),
  ];
  let configRaw = "";
  for (const cfg of candidates) {
    if (fs.existsSync(cfg)) {
      configRaw = fs.readFileSync(cfg, "utf8");
      break;
    }
  }
  if (!configRaw) {
    log("opencode config", "MISSING", `no opencode.json/jsonc in ${GLOBAL_CONFIG}`);
    return;
  }

  const stripped = configRaw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
  if (/"superpowers"/.test(stripped) || /superpowers/.test(stripped)) {
    log("superpowers plugin", "OK", "registered in opencode config");
  } else {
    log("superpowers plugin", "WARN", "not found in opencode config");
  }

  if (/"lore-cat"/.test(stripped) || /lore-cat\.ts/.test(stripped)) {
    log("lore-cat plugin", "OK", "registered in opencode config");
  } else {
    log("lore-cat plugin", "WARN", "not found in opencode config");
  }

  if (/"hashline"/.test(stripped) || /hashline\.ts/.test(stripped)) {
    log("hashline plugin", "OK", "registered in opencode config");
  } else {
    log("hashline plugin", "WARN", "not found in opencode config");
  }
}

function checkPluginsExist() {
  const plugins = ["lore-cat.ts", "superpowers-gate.ts", "frontend-guardian.ts", "hashline.ts"];
  for (const p of plugins) {
    const f = path.join(KIT_DIR, ".opencode", "plugin", p);
    if (fs.existsSync(f)) log(`plugin:${p}`, "OK");
    else log(`plugin:${p}`, "MISSING", f);
  }
}

function checkOpenWiki() {
  const openwikiBin = path.join(SUPERGLOBALS, "openwiki");
  if (fs.existsSync(openwikiBin)) {
    log("openwiki cli", "OK", openwikiBin);
  } else {
    log("openwiki cli", "WARN", "not found in node_modules/.bin");
  }

  const bridge = path.join(KIT_DIR, ".ai", ".openwiki-bridge.json");
  if (fs.existsSync(bridge)) log("openwiki bridge", "OK", bridge);
  else log("openwiki bridge", "WARN", "missing");
}

function checkAstGrep() {
  let sg = "";
  try {
    sg = execSync("command -v sg || command -v ast-grep", { encoding: "utf8", shell: true }).trim();
  } catch {
    /* ignore */
  }
  if (sg) {
    try {
      const version = execSync(`${sg} --version`, { encoding: "utf8" }).trim();
      log("ast-grep", "OK", `${version} at ${sg}`);
    } catch {
      log("ast-grep", "WARN", `${sg} exists but --version failed`);
    }
  } else {
    log("ast-grep", "WARN", "not in PATH; ast-grep skill falls back to grep+LSP");
  }
}

function checkDiagramDesign() {
  const skill = path.join(GLOBAL_CONFIG, "skills", "diagram-design", "SKILL.md");
  if (fs.existsSync(skill)) {
    log("diagram-design skill", "OK", skill);
  } else {
    log(
      "diagram-design skill",
      "WARN",
      "not installed; Pawfessor diagram deliverables fall back to embedded mermaid",
    );
  }
}

function checkKitRepo() {
  const gitDir = path.join(KIT_DIR, ".git");
  if (fs.existsSync(gitDir)) {
    try {
      const status = execSync("git status --porcelain", { cwd: KIT_DIR, encoding: "utf8" }).trim();
      if (status) {
        log("kit repo", "WARN", "has uncommitted changes");
      } else {
        log("kit repo", "OK", "clean");
      }
    } catch {
      log("kit repo", "WARN", "git status failed");
    }
  } else {
    log("kit repo", "WARN", "not a git repo");
  }
}

function main() {
  console.log(`PawCrew Doctor — kit: ${KIT_DIR}`);
  console.log("");

  checkSymlinks();
  checkOpenCodeConfig();
  checkPluginsExist();
  checkOpenWiki();
  checkAstGrep();
  checkDiagramDesign();
  checkKitRepo();

  console.log("OK:");
  if (checks.length === 0) console.log("  (none)");
  for (const c of checks) console.log(`  ${c}`);

  console.log("");
  console.log("WARNINGS:");
  if (warnings.length === 0) console.log("  (none)");
  for (const w of warnings) console.log(`  ${w}`);

  console.log("");
  console.log("ERRORS:");
  if (errors.length === 0) console.log("  (none)");
  for (const e of errors) console.log(`  ${e}`);

  console.log("");
  const exitCode = errors.length > 0 ? 1 : 0;
  console.log(`Result: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(exitCode);
}

main();
