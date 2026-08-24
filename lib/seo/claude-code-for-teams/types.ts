/**
 * Top-level route, for the same reason /claude-skills, /agent-skills-support
 * and /manage-ai-skills are: the page answers the head query itself rather than
 * a task-shaped variation of it, so it does not sit under /guides. The path
 * does not end in `-skills`, so the shared Accept rewrite does not reach it and
 * `next.config.ts` carries a rule of its own, the way /skill-examples does.
 */
export const claudeCodeForTeamsPath = "/claude-code-for-teams" as const

export type ClaudeCodeForTeamsPath = typeof claudeCodeForTeamsPath

/**
 * CTA placements on the Claude Code for teams page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is
 * claude_code_for_teams_header, following the naming every other marketing
 * chrome uses for its nav slot.
 */
export type ClaudeCodeForTeamsCtaPlacement =
  `claude_code_for_teams_${"hero" | "inline" | "closing"}`
