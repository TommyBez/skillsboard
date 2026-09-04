/**
 * Top-level route, for the same reason /claude-skills, /codex-skills, and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path ends
 * in `-skills`, so the Markdown content negotiation rewrite already covers it.
 */
export const agentSkillsPath = "/agent-skills" as const

export type AgentSkillsPath = typeof agentSkillsPath
