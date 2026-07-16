import { ImageResponse } from "next/og"

import { SocialImage } from "@/components/social-image"

export const alt = "Skills Board — One shared library. Different agents."
export const size = { width: 1200, height: 675 }
export const contentType = "image/png"

export default function TwitterImage() {
  return new ImageResponse(<SocialImage height={size.height} />, size)
}
