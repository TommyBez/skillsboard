import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { comparePaths, getComparison } from "@/lib/seo/compare"

const entry = getComparison(comparePaths.skillsVsSubagents)

export const alt = entry.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, entry.og)
}
