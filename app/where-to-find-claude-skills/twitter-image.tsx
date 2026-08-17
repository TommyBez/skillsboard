import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { whereToFindClaudeSkills } from "@/lib/seo/where-to-find-claude-skills"

export const alt = whereToFindClaudeSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, whereToFindClaudeSkills.og)
}
