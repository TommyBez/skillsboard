import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import { compareIndexOg, compareIndexOgAlt } from "@/lib/seo/compare"

export const alt = compareIndexOgAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, compareIndexOg)
}
