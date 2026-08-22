/**
 * Top-level route, for the same reason /claude-skills, /codex-skills,
 * /cursor-skills, /opencode-skills and /vercel-skills are: the page answers the
 * head query itself rather than a task-shaped variation of it, so it does not
 * sit under /guides. The path ends in `-skills`, so the shared Accept rewrite
 * already serves the Markdown twin and no rule of its own is needed.
 */
export const copilotSkillsPath = "/copilot-skills" as const

export type CopilotSkillsPath = typeof copilotSkillsPath

/**
 * CTA placements on the GitHub Copilot skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is copilot_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type CopilotSkillsCtaPlacement =
  `copilot_skills_${"hero" | "inline" | "closing"}`
