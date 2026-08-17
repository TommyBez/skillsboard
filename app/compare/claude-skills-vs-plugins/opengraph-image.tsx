import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { comparePaths, getComparison } from "@/lib/seo/compare"

const entry = getComparison(comparePaths.skillsVsPlugins)

export const alt = entry.ogAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, entry.og)
}
