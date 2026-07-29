import { sharedMcpSkillLibraryGuideOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board guide: use a shared AI skill library through MCP."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, sharedMcpSkillLibraryGuideOgContent)
}
