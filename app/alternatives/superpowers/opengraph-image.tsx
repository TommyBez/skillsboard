import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { alternativePaths, getAlternative } from "@/lib/seo/alternatives"

const entry = getAlternative(alternativePaths.superpowers)

export const alt = entry.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, entry.og)
}
