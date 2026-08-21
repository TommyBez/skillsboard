import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { vercelSkills } from "@/lib/seo/vercel-skills"

export const alt = vercelSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, vercelSkills.og)
}
