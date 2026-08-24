import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { claudeCodeForTeams } from "@/lib/seo/claude-code-for-teams"

export const alt = claudeCodeForTeams.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, claudeCodeForTeams.og)
}
