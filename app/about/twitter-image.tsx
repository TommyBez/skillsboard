import { aboutSocialImageAlt, aboutSocialImageContent } from "@/lib/seo/about-schema"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = aboutSocialImageAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, aboutSocialImageContent)
}
