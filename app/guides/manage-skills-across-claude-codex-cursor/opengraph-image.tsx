import { manageCrossAgentSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: manage skills across Claude Code, Codex, and Cursor."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, manageCrossAgentSkillsGuideOgContent)
}
