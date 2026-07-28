import { shareTeamSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: how to share AI agent skills with your team."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, shareTeamSkillsGuideOgContent)
}
