import type { OgTemplateContent } from "@/lib/og/template"

/**
 * Top-level route on purpose: the page answers the head query itself rather
 * than a task-shaped variation of it, so it does not sit under /guides.
 */
export const claudeSkillsPath = "/claude-skills" as const

export type ClaudeSkillsPath = typeof claudeSkillsPath
