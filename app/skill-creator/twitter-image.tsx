import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { skillCreator } from "@/lib/seo/skill-creator"

export const alt = skillCreator.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, skillCreator.og)
}
