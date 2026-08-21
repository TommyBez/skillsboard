/**
 * Top-level route, for the same reason /claude-skills, /codex-skills,
 * /cursor-skills and /opencode-skills are: the page answers the head query
 * itself rather than a task-shaped variation of it, so it does not sit under
 * /guides.
 */
export const vercelSkillsPath = "/vercel-skills" as const

export type VercelSkillsPath = typeof vercelSkillsPath

/**
 * CTA placements on the Vercel skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is vercel_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type VercelSkillsCtaPlacement =
  `vercel_skills_${"hero" | "inline" | "closing"}`
