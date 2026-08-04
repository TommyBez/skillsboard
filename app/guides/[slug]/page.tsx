import { Suspense } from "react"
import { notFound } from "next/navigation"

import { GuidePage, GuidePageFallback } from "@/components/guides/guide-page"
import { buildGuideMetadata } from "@/lib/seo/guide-metadata"
import { getGuideBySlug, guides, slugFromPath } from "@/lib/seo/guides"

type GuidePageProps = {
  params: Promise<{ slug: string }>
}

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

async function GuideContent({ params }: GuidePageProps) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) notFound()
  return <GuidePage guide={guide} />
}

/**
 * `params` is runtime data even though `generateStaticParams` covers every
 * reachable slug, so awaiting it in the page body would block the navigation.
 * Reading it inside a Suspense-wrapped child lets the shell render immediately
 * and the guide stream into the fallback; the eight prerendered slugs still
 * serve complete HTML on a direct visit.
 */
export default function GuideSlugPage({ params }: GuidePageProps) {
  return (
    <Suspense fallback={<GuidePageFallback />}>
      <GuideContent params={params} />
    </Suspense>
  )
}
