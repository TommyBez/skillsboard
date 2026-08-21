import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { agentSkillsSupport } from "@/lib/seo/agent-skills-support"

export const alt = agentSkillsSupport.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, agentSkillsSupport.og)
}
