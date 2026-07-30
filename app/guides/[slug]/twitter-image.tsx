import { notFound } from "next/navigation"

import { createSocialImageResponse, TWITTER_SIZE } from "@/lib/og/template"
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
      size: TWITTER_SIZE,
      contentType: "image/png" as const,
    },
  ]
}

export default async function TwitterImage({ params }: ImageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  return createSocialImageResponse(TWITTER_SIZE, guide.og)
}
