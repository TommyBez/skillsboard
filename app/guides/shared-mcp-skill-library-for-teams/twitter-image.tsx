import { sharedMcpSkillLibraryGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: use a shared AI skill library through MCP."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, sharedMcpSkillLibraryGuideOgContent)
}
