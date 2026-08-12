import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { claudeSkills } from "@/lib/seo/claude-skills"

export const alt = claudeSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, claudeSkills.og)
}
