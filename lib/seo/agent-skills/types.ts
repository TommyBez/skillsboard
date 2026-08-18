/**
 * Top-level route, for the same reason /claude-skills, /codex-skills, and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path ends
 * in `-skills`, so the Markdown content negotiation rewrite already covers it.
 */
export const agentSkillsPath = "/agent-skills" as const

export type AgentSkillsPath = typeof agentSkillsPath

/**
 * CTA placements on the vendor-neutral standard page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is agent_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type AgentSkillsCtaPlacement =
  `agent_skills_${"hero" | "inline" | "closing"}`
