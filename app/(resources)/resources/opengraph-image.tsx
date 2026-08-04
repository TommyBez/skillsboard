import { resourcesOgContent } from "@/lib/og/pages"
import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"

export const alt = "Skills Board resources: playbooks for teams running AI skills."
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return createSocialImageResponse(size, resourcesOgContent)
}
