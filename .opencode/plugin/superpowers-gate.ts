// superpowers-gate.ts — strips the Superpowers bootstrap injection from
// agents that do not use Superpowers process skills.
//
// Problem: the superpowers plugin injects its bootstrap ("<EXTREMELY_IMPORTANT>
// You have superpowers...") into the first user message of EVERY session step
// via `experimental.chat.messages.transform`. The hook input is empty — the
// plugin cannot tell which agent is running — so subagent sessions (sherclaw,
// lorecat, ...) pay the token cost for instructions they are forbidden to
// follow. (Hidden internal agents like title/summary generate titles through
// a separate LLM path that does not route through this transform, but they
// are kept in the strip list as defense-in-depth in case that changes.)
//
// Mechanism: plugin hooks run sequentially in registration order. Config-
// declared plugins (superpowers) register before auto-discovered ones (this
// file, under ~/.config/opencode/plugin/ or the project's .opencode/plugin/).
// This gate therefore runs AFTER superpowers injected the bootstrap and
// removes it in-place from the message array the LLM actually sees.
//
// Policy: STRIP-list, allow-by-default. Only the agents listed below lose the
// bootstrap; unknown agents keep it. If upstream superpowers changes its
// bootstrap format, the marker check below stops matching and this gate
// no-ops back to current behavior (fail-safe).

const STRIP_AGENTS = new Set([
  // crewkit agents that do not use Superpowers process skills
  "sherclaw",
  "searchpurr",
  "elderpaw",
  "lorecat",
  "letmeowcook",
  "judgewhiskers",
  "guardclaw",
  "pawfessor",
  // native agents replaced by crewkit agents
  "general",
  "scout",
  "explore",
  // hidden internal agents
  "title",
  "summary",
  "compaction",
])

// Identifies the superpowers bootstrap part (see superpowers.js getBootstrapContent).
// Three-marker conjunction: loose enough to survive minor upstream rewording of
// the body, tight enough that a user *quoting* the bootstrap in a real question
// is only dropped if their message both starts and ends with the exact tags.
const isBootstrapPart = (text: string) =>
  text.startsWith("<EXTREMELY_IMPORTANT>") &&
  text.includes("You have superpowers.") &&
  text.trimEnd().endsWith("</EXTREMELY_IMPORTANT>")

type MessageWithParts = {
  info?: { role?: string; agent?: string }
  parts?: { type?: string; text?: unknown }[]
}

export const SuperpowersGatePlugin = async () => {
  return {
    "experimental.chat.messages.transform": async (_input: unknown, output: { messages?: MessageWithParts[] }) => {
      const messages = output?.messages
      if (!Array.isArray(messages) || messages.length === 0) return

      // The agent of the current step is the one that produced the latest user
      // message (subagent child sessions set their agent on every user message).
      const lastUser = [...messages].reverse().find((m) => m.info?.role === "user")
      const agent = lastUser?.info?.agent
      if (!agent || !STRIP_AGENTS.has(agent)) return

      // In-place splice only — reassigning `output.messages` is a no-op
      // (opencode keeps using its own array reference after the hook).
      for (const msg of messages) {
        if (msg.info?.role !== "user" || !Array.isArray(msg.parts)) continue
        for (let i = msg.parts.length - 1; i >= 0; i--) {
          const part = msg.parts[i]
          if (part?.type === "text" && typeof part.text === "string" && isBootstrapPart(part.text)) {
            msg.parts.splice(i, 1)
          }
        }
      }
    },
  }
}

export default SuperpowersGatePlugin
