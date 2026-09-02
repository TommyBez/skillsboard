import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { agentSkillsAdoption } from "@/lib/seo/agent-skills-adoption"

export const alt = agentSkillsAdoption.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, agentSkillsAdoption.og)
}
