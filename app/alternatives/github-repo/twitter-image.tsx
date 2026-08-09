import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { alternativePaths, getAlternative } from "@/lib/seo/alternatives"

const entry = getAlternative(alternativePaths.githubRepo)

export const alt = entry.ogAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, entry.og)
}
