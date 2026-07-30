import { notFound } from "next/navigation"

import { GuidePage } from "@/components/guides/guide-page"
import { buildGuideMetadata } from "@/lib/seo/guide-metadata"
import { getGuideBySlug, guides, slugFromPath } from "@/lib/seo/guides"

type GuidePageProps = {
  params: Promise<{ slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return guides.map((guide) => ({
    slug: slugFromPath(guide.path),
  }))
}

export async function generateMetadata({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}
  return buildGuideMetadata(guide)
}

export default async function GuideSlugPage({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  return <GuidePage guide={guide} />
}
