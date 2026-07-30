import { notFound } from "next/navigation"

import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { getGuideBySlug } from "@/lib/seo/guides"

type ImageProps = {
  params: Promise<{ slug: string }>
}

export async function generateImageMetadata({ params }: ImageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return []

  return [
    {
      id: "default",
      alt: guide.ogAlt,
      size: OG_SIZE,
      contentType: "image/png" as const,
    },
  ]
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  return createSocialImageResponse(OG_SIZE, guide.og)
}
