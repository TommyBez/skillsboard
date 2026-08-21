import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { manageAiSkills } from "@/lib/seo/manage-ai-skills"

export const alt = manageAiSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, manageAiSkills.og)
}
