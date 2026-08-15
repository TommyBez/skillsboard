import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { cursorSkills } from "@/lib/seo/cursor-skills"

export const alt = cursorSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, cursorSkills.og)
}
