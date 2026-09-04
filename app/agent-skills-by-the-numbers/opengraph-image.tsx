import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { agentSkillsByTheNumbers } from "@/lib/seo/agent-skills-by-the-numbers"

export const alt = agentSkillsByTheNumbers.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, agentSkillsByTheNumbers.og)
}
