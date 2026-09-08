/**
 * Top-level route, for the same reason /claude-skills, /agent-skills-support
 * and /manage-ai-skills are: the page answers the head query itself rather than
 * a task-shaped variation of it, so it does not sit under /guides. The path
 * does not end in `-skills`, so the shared Accept rewrite does not reach it and
 * `next.config.ts` carries a rule of its own, the way /skill-examples does.
 */
export const claudeCodeForTeamsPath = "/claude-code-for-teams" as const

export type ClaudeCodeForTeamsPath = typeof claudeCodeForTeamsPath
