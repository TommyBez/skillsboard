import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { skillExamples } from "@/lib/seo/skill-examples"

export const alt = skillExamples.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, skillExamples.og)
}
