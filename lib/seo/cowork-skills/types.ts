/**
 * Top-level route, for the same reason /claude-skills, /codex-skills, and
 * /agent-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path ends
 * in `-skills`, so the Markdown content negotiation rewrite already covers it.
 */
export const coworkSkillsPath = "/cowork-skills" as const

export type CoworkSkillsPath = typeof coworkSkillsPath

/**
 * CTA placements on the Cowork page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is cowork_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type CoworkSkillsCtaPlacement =
  `cowork_skills_${"hero" | "inline" | "closing"}`
