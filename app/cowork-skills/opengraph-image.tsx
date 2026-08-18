import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { coworkSkills } from "@/lib/seo/cowork-skills"

export const alt = coworkSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, coworkSkills.og)
}
