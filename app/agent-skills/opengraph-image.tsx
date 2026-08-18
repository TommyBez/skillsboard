import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { agentSkills } from "@/lib/seo/agent-skills"

export const alt = agentSkills.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, agentSkills.og)
}
