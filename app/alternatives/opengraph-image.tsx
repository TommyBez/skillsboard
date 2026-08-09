import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import {
  alternativesIndexOg,
  alternativesIndexOgAlt,
} from "@/lib/seo/alternatives"

export const alt = alternativesIndexOgAlt
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, alternativesIndexOg)
}
