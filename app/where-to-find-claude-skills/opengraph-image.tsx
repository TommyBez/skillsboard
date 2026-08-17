import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { whereToFindClaudeSkills } from "@/lib/seo/where-to-find-claude-skills"

export const alt = whereToFindClaudeSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, whereToFindClaudeSkills.og)
}
