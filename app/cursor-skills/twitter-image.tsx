import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { cursorSkills } from "@/lib/seo/cursor-skills"

export const alt = cursorSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, cursorSkills.og)
}
