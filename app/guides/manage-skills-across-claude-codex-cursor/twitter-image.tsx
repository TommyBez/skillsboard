import { manageCrossAgentSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: manage skills across Claude Code, Codex, and Cursor."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, manageCrossAgentSkillsGuideOgContent)
}
