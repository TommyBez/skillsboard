import { notFound } from "next/navigation"

import { GuidePage } from "@/components/guides/guide-page"
import { buildGuideMetadata } from "@/lib/seo/guide-metadata"
import { getGuideBySlug, guides, slugFromPath } from "@/lib/seo/guides"

type GuidePageProps = {
  params: Promise<{ slug: string }>
}

/**
 * The guide set is a closed, build-time list, so `generateStaticParams` below
 * prerenders every slug a reader can actually reach and those navigations are
 * already instant. The only uncovered case is an unknown slug, which resolves
 * to a 404 — there is no partial UI worth streaming ahead of it, so this route
 * opts out of the instant-navigation requirement and blocks instead.
 */
export const instant = false

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
