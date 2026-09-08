/**
 * Top-level route, for the same reason /agent-skills and /cowork-skills are:
 * the page answers the head query itself rather than a task-shaped variation
 * of it, so it does not sit under /guides. The path ends in `-skills`, so the
 * shared Markdown content negotiation rewrite already covers it.
 */
export const manageAiSkillsPath = "/manage-ai-skills" as const

export type ManageAiSkillsPath = typeof manageAiSkillsPath
