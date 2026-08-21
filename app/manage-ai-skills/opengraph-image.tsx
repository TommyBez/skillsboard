import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { manageAiSkills } from "@/lib/seo/manage-ai-skills"

export const alt = manageAiSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, manageAiSkills.og)
}
