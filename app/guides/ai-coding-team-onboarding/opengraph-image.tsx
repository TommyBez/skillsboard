import { aiCodingTeamOnboardingGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: how to onboard an engineering team to AI coding tools."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, aiCodingTeamOnboardingGuideOgContent)
}
