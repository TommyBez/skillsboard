import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsAdoption } from "@/lib/seo/agent-skills-adoption"

export const alt = agentSkillsAdoption.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, agentSkillsAdoption.og)
}
