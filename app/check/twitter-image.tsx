import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { skillCheck } from "@/lib/seo/skill-check"

export const alt = skillCheck.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, skillCheck.og)
}
