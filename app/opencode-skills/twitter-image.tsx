import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { opencodeSkills } from "@/lib/seo/opencode-skills"

export const alt = opencodeSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, opencodeSkills.og)
}
