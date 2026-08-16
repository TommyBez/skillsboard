import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { agentsMdVsSkillMd } from "@/lib/seo/agents-md-vs-skill-md"

export const alt = agentsMdVsSkillMd.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, agentsMdVsSkillMd.og)
}
