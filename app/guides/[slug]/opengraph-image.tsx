import { notFound } from "next/navigation"

import { createSocialImageResponse, OG_SIZE } from "@/lib/og/template"
import { getGuideBySlug, guides, slugFromPath } from "@/lib/seo/guides"

export const size = OG_SIZE
export const contentType = "image/png"

type ImageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: slugFromPath(guide.path),
  }))
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  return createSocialImageResponse(size, guide.og)
}
