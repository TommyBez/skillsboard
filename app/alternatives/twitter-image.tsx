import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
import {
  alternativesIndexOg,
  alternativesIndexOgAlt,
} from "@/lib/seo/alternatives"

export const alt = alternativesIndexOgAlt
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, alternativesIndexOg)
}
