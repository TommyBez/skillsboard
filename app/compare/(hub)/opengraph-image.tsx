import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { compareIndexOg, compareIndexOgAlt } from "@/lib/seo/compare"

export const alt = compareIndexOgAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, compareIndexOg)
}
