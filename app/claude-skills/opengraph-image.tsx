import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { claudeSkills } from "@/lib/seo/claude-skills"

export const alt = claudeSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, claudeSkills.og)
}
