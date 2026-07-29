import { aiSkillUseCasesGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: eight repeatable AI agent skill use cases for teams."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, aiSkillUseCasesGuideOgContent)
}
