import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { codexSkills } from "@/lib/seo/codex-skills"

export const alt = codexSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, codexSkills.og)
}
