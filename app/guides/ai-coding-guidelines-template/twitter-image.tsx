import { aiCodingGuidelinesTemplateGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: AI coding guidelines template for engineering teams."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, aiCodingGuidelinesTemplateGuideOgContent)
}
