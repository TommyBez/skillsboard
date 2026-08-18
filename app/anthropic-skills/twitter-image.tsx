import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { anthropicSkills } from "@/lib/seo/anthropic-skills"

export const alt = anthropicSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, anthropicSkills.og)
}
