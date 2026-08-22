import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { copilotSkills } from "@/lib/seo/copilot-skills"

export const alt = copilotSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, copilotSkills.og)
}
