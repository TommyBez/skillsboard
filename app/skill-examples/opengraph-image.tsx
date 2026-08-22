import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { skillExamples } from "@/lib/seo/skill-examples"

export const alt = skillExamples.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, skillExamples.og)
}
