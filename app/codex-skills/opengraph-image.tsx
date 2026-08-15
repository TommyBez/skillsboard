import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { codexSkills } from "@/lib/seo/codex-skills"

export const alt = codexSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, codexSkills.og)
}
