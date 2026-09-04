/**
 * Top-level route, for the same reason /claude-skills, /codex-skills and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides.
 */
export const opencodeSkillsPath = "/opencode-skills" as const

export type OpencodeSkillsPath = typeof opencodeSkillsPath
