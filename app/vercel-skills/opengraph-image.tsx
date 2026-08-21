import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { vercelSkills } from "@/lib/seo/vercel-skills"

export const alt = vercelSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, vercelSkills.og)
}
