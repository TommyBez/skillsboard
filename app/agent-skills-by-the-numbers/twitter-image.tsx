import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsByTheNumbers } from "@/lib/seo/agent-skills-by-the-numbers"

export const alt = agentSkillsByTheNumbers.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, agentSkillsByTheNumbers.og)
}
