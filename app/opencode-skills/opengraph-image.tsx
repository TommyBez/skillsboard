import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { opencodeSkills } from "@/lib/seo/opencode-skills"

export const alt = opencodeSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, opencodeSkills.og)
}
