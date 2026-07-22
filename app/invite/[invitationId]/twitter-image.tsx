import { inviteOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"

export const alt = "You’re invited to a shared skill library on Skills Board."
export const size = TWITTER_SIZE
export const contentType = "image/png"

export default function TwitterImage() {
  return createSocialImageResponse(size, inviteOgContent)
}
