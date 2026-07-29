import { onboardNewTeammateSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: onboard a new teammate through one useful AI skill."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, onboardNewTeammateSkillsGuideOgContent)
}
