/**
 * Top-level route, for the same reason /claude-skills and /codex-skills are:
 * the page answers the head query itself rather than a task-shaped variation
 * of it, so it does not sit under /guides.
 */
export const cursorSkillsPath = "/cursor-skills" as const

export type CursorSkillsPath = typeof cursorSkillsPath
