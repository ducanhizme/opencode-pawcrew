#!/usr/bin/env node
// goal-persistence.js — CLI helper for active goals under .ai/superpowers/goals/
// Usage:
//   node scripts/goal-persistence.js list
//   node scripts/goal-persistence.js latest
//   node scripts/goal-persistence.js create "Goal title" "Objective one-liner"
//   node scripts/goal-persistence.js close <slug> [completed|cancelled]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const CWD = process.cwd();
const GOALS_DIR = path.join(CWD, ".ai", "superpowers", "goals");

function ensureDir() {
  if (!fs.existsSync(GOALS_DIR)) {
    fs.mkdirSync(GOALS_DIR, { recursive: true });
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function listGoals() {
  ensureDir();
  const files = fs.readdirSync(GOALS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(GOALS_DIR, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (files.length === 0) {
    console.log("No goal records found.");
    return;
  }

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    const statusMatch = content.match(/- \*\*Status\*\*: (\S+)/);
    const titleMatch = content.match(/^# Goal: (.+)$/m);
    const status = statusMatch ? statusMatch[1] : "unknown";
    const title = titleMatch ? titleMatch[1] : path.basename(f, ".md");
    console.log(`${path.relative(CWD, f)} [${status}] ${title}`);
  }
}

function latestGoal() {
  ensureDir();
  const files = fs.readdirSync(GOALS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(GOALS_DIR, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  const active = files.filter((f) => {
    const content = fs.readFileSync(f, "utf8");
    return /- \*\*Status\*\*: active/.test(content);
  });

  const target = active[0] || files[0];
  if (!target) {
    console.log("No goal records found.");
    return;
  }
  console.log(fs.readFileSync(target, "utf8"));
}

function createGoal(title, objective) {
  ensureDir();
  const slug = slugify(title);
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(GOALS_DIR, `${date}-${slug}.md`);

  const template = `# Goal: ${title}

- **Created**: ${new Date().toISOString().slice(0, 16).replace("T", " ")}
- **Agent**: <agent name>
- **Status**: active
- **Source**: user message

## Objective

${objective}

## Success criteria

- [ ] <criterion 1>
- [ ] <criterion 2>

## Current state

Not started.

## Next action

<first concrete step>

## Blockers

None

## Related artifacts

- Plan Record: 
- Run Log: 
`;

  fs.writeFileSync(file, template);
  console.log(`Created goal: ${path.relative(CWD, file)}`);
}

function closeGoal(slug, finalStatus = "completed") {
  ensureDir();
  const files = fs.readdirSync(GOALS_DIR)
    .filter((f) => f.endsWith(".md") && f.includes(slug))
    .map((f) => path.join(GOALS_DIR, f));

  if (files.length === 0) {
    console.error(`No goal matching "${slug}" found.`);
    process.exit(1);
  }

  const target = files[0];
  let content = fs.readFileSync(target, "utf8");
  content = content.replace(/- \*\*Status\*\*: \S+/, `- **Status**: ${finalStatus}`);
  content += `\n- **Closed at**: ${new Date().toISOString().slice(0, 16).replace("T", " ")}\n`;
  fs.writeFileSync(target, content);
  console.log(`Closed goal: ${path.relative(CWD, target)} → ${finalStatus}`);
}

function main() {
  const [, , cmd, ...args] = process.argv;
  switch (cmd) {
    case "list":
      listGoals();
      break;
    case "latest":
      latestGoal();
      break;
    case "create":
      if (args.length < 2) {
        console.error("Usage: create <title> <objective>");
        process.exit(1);
      }
      createGoal(args[0], args[1]);
      break;
    case "close":
      if (args.length < 1) {
        console.error("Usage: close <slug> [completed|cancelled]");
        process.exit(1);
      }
      closeGoal(args[0], args[1] || "completed");
      break;
    default:
      console.log(`Usage: node ${path.relative(CWD, __filename)} <list|latest|create|close>`);
      process.exit(0);
  }
}

main();
