import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { bestClaudeSkills } from "@/lib/seo/best-claude-skills"

export const alt = bestClaudeSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, bestClaudeSkills.og)
}
