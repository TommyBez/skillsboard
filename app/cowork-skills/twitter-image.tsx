import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { coworkSkills } from "@/lib/seo/cowork-skills"

export const alt = coworkSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, coworkSkills.og)
}
