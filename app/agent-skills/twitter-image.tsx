import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkills } from "@/lib/seo/agent-skills"

export const alt = agentSkills.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, agentSkills.og)
}
