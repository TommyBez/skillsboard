/**
 * Top-level route, for the same reason /claude-skills and /codex-skills are:
 * the page answers the head query itself rather than a task-shaped variation
 * of it, so it does not sit under /guides.
 */
export const cursorSkillsPath = "/cursor-skills" as const

export type CursorSkillsPath = typeof cursorSkillsPath

/**
 * CTA placements on the Cursor skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is cursor_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type CursorSkillsCtaPlacement =
  `cursor_skills_${"hero" | "inline" | "closing"}`
