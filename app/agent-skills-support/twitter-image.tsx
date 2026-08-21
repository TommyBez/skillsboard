import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsSupport } from "@/lib/seo/agent-skills-support"

export const alt = agentSkillsSupport.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, agentSkillsSupport.og)
}
