/**
 * Top-level route, for the same reason /claude-skills is one: the page answers
 * the head query itself rather than a task-shaped variation of it, so it does
 * not sit under /guides.
 */
export const codexSkillsPath = "/codex-skills" as const

export type CodexSkillsPath = typeof codexSkillsPath
