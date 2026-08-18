import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { anthropicSkills } from "@/lib/seo/anthropic-skills"

export const alt = anthropicSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, anthropicSkills.og)
}
