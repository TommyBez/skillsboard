/**
 * Top-level route, for the same reason /claude-skills, /agent-skills, and
 * /anthropic-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path ends
 * in `-skills`, so the Markdown content negotiation rewrite already covers it.
 */
export const bestClaudeSkillsPath = "/best-claude-skills" as const

export type BestClaudeSkillsPath = typeof bestClaudeSkillsPath

/**
 * CTA placements on the curated register, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is best_claude_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type BestClaudeSkillsCtaPlacement =
  `best_claude_skills_${"hero" | "inline" | "closing"}`
