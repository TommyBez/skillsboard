import { onboardNewTeammateSkillsGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: onboard a new teammate through one useful AI skill."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, onboardNewTeammateSkillsGuideOgContent)
}
