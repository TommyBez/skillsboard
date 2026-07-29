import { chooseFirstTeamSkillGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: choose the first AI agent skill for your team."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, chooseFirstTeamSkillGuideOgContent)
}
