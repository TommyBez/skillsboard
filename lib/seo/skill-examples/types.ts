/**
 * Top-level route, for the same reason /claude-skills, /codex-skills,
 * /cursor-skills, /opencode-skills and /vercel-skills are: the page answers the
 * head query itself rather than a task-shaped variation of it, so it does not
 * sit under /guides. The task-shaped sibling is
 * /guides/how-to-write-a-skill-md, which this page links to instead of
 * repeating.
 */
export const skillExamplesPath = "/skill-examples" as const

export type SkillExamplesPath = typeof skillExamplesPath
