/**
 * Top-level route, for the same reason /agent-skills, /best-claude-skills, and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path does
 * not end in `-skills`, so it needs a Markdown content negotiation rewrite of
 * its own, the way /agents-md-vs-skill-md does.
 */
export const agentSkillsSupportPath = "/agent-skills-support" as const

export type AgentSkillsSupportPath = typeof agentSkillsSupportPath
