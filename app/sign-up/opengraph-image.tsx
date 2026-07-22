import { signUpOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Create a free Skills Board account and start your team’s skill library."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, signUpOgContent)
}
