/**
 * Top-level route, for the same reason /manage-ai-skills and
 * /claude-code-for-teams are: the page answers a head query itself rather than
 * a task-shaped variation of it, so it does not sit under /guides. The path
 * does not end in `-skills`, so it carries its own Markdown negotiation
 * rewrite in `next.config.ts` the way /skill-examples does.
 */
export const agentSkillsByTheNumbersPath = "/agent-skills-by-the-numbers" as const

export type AgentSkillsByTheNumbersPath = typeof agentSkillsByTheNumbersPath
