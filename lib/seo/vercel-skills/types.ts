/**
 * Top-level route, for the same reason /claude-skills, /codex-skills,
 * /cursor-skills and /opencode-skills are: the page answers the head query
 * itself rather than a task-shaped variation of it, so it does not sit under
 * /guides.
 */
export const vercelSkillsPath = "/vercel-skills" as const

export type VercelSkillsPath = typeof vercelSkillsPath
