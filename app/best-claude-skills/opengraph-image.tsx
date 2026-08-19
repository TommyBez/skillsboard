import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { bestClaudeSkills } from "@/lib/seo/best-claude-skills"

export const alt = bestClaudeSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, bestClaudeSkills.og)
}
