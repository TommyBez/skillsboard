/**
 * Top-level route, for the same reason /agent-skills, /best-claude-skills, and
 * /cursor-skills are: the page answers the head query itself rather than a
 * task-shaped variation of it, so it does not sit under /guides. The path does
 * not end in `-skills`, so it needs a Markdown content negotiation rewrite of
 * its own, the way /agents-md-vs-skill-md does.
 */
export const agentSkillsSupportPath = "/agent-skills-support" as const

export type AgentSkillsSupportPath = typeof agentSkillsSupportPath

/**
 * CTA placements on the support matrix, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is
 * agent_skills_support_header, following the naming every other marketing
 * chrome uses for its nav slot.
 */
export type AgentSkillsSupportCtaPlacement =
  `agent_skills_support_${"hero" | "inline" | "closing"}`
