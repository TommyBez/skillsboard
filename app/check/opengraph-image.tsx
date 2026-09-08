import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { skillCheck } from "@/lib/seo/skill-check"

export const alt = skillCheck.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, skillCheck.og)
}
