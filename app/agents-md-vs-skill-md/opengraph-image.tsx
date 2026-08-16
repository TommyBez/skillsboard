import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { agentsMdVsSkillMd } from "@/lib/seo/agents-md-vs-skill-md"

export const alt = agentsMdVsSkillMd.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, agentsMdVsSkillMd.og)
}
