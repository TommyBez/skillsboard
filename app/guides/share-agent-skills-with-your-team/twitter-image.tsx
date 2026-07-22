import { shareTeamSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: how to share AI agent skills with your team."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, shareTeamSkillsGuideOgContent)
}
