import { signInOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "Sign in to Skills Board and open your team’s shared skill library."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, signInOgContent)
}
