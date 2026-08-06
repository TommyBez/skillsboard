import { aboutSocialImageAlt, aboutSocialImageContent } from "@/lib/seo/about-schema"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = aboutSocialImageAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, aboutSocialImageContent)
}
