import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { skillCreator } from "@/lib/seo/skill-creator"

export const alt = skillCreator.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, skillCreator.og)
}
