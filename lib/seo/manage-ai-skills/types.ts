/**
 * Top-level route, for the same reason /agent-skills and /cowork-skills are:
 * the page answers the head query itself rather than a task-shaped variation
 * of it, so it does not sit under /guides. The path ends in `-skills`, so the
 * shared Markdown content negotiation rewrite already covers it.
 */
export const manageAiSkillsPath = "/manage-ai-skills" as const

export type ManageAiSkillsPath = typeof manageAiSkillsPath

/**
 * CTA placements on this page, kept in sync with the landing_cta_clicked
 * union. The sticky shell CTA is manage_ai_skills_header, following the naming
 * every other marketing chrome uses for its nav slot.
 */
export type ManageAiSkillsCtaPlacement =
  `manage_ai_skills_${"hero" | "inline" | "closing"}`
