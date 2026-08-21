/**
 * Top-level route, for the same reason /claude-skills, /codex-skills and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides.
 */
export const opencodeSkillsPath = "/opencode-skills" as const

export type OpencodeSkillsPath = typeof opencodeSkillsPath

/**
 * CTA placements on the OpenCode skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is opencode_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type OpencodeSkillsCtaPlacement =
  `opencode_skills_${"hero" | "inline" | "closing"}`
