import { aiSkillUseCasesGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: eight repeatable AI agent skill use cases for teams."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, aiSkillUseCasesGuideOgContent)
}
