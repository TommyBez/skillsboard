/**
 * Top-level route, for the same reason /claude-skills, /codex-skills, and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. It is not a
 * /compare page either, because the two subjects are file formats rather than
 * two agent primitives inside one product.
 */
export const agentsMdVsSkillMdPath = "/agents-md-vs-skill-md" as const

export type AgentsMdVsSkillMdPath = typeof agentsMdVsSkillMdPath

/**
 * CTA placements on the AGENTS.md vs SKILL.md page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is agents_md_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type AgentsMdVsSkillMdCtaPlacement =
  `agents_md_${"hero" | "inline" | "closing"}`
