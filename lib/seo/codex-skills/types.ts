/**
 * Top-level route, for the same reason /claude-skills is one: the page answers
 * the head query itself rather than a task-shaped variation of it, so it does
 * not sit under /guides.
 */
export const codexSkillsPath = "/codex-skills" as const

export type CodexSkillsPath = typeof codexSkillsPath

/**
 * CTA placements on the Codex skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is codex_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type CodexSkillsCtaPlacement =
  `codex_skills_${"hero" | "inline" | "closing"}`
