import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { copilotSkills } from "@/lib/seo/copilot-skills"

export const alt = copilotSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, copilotSkills.og)
}
