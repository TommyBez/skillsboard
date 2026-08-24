import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { claudeCodeForTeams } from "@/lib/seo/claude-code-for-teams"

export const alt = claudeCodeForTeams.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, claudeCodeForTeams.og)
}
