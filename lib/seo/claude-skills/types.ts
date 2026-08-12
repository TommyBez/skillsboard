import type { OgTemplateContent } from "@/lib/og/template"

/**
 * Top-level route on purpose: the page answers the head query itself rather
 * than a task-shaped variation of it, so it does not sit under /guides.
 */
export const claudeSkillsPath = "/claude-skills" as const

export type ClaudeSkillsPath = typeof claudeSkillsPath

/**
 * CTA placements on the Claude Skills page, kept in sync with the
 * landing_cta_clicked union. The sticky shell CTA is claude_skills_header,
 * following the naming every other marketing chrome uses for its nav slot.
 */
export type ClaudeSkillsCtaPlacement =
  `claude_skills_${"hero" | "inline" | "closing"}`
