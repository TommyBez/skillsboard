import { Suspense } from "react"
import { notFound } from "next/navigation"

import { GuidePage } from "@/components/guides/guide-page"
import { Skeleton } from "@/components/ui/skeleton"
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

function GuideFallback() {
  return (
    <div className="min-h-[100dvh] bg-background px-4 py-16" aria-label="Loading guide">
      <div className="mx-auto grid w-full max-w-3xl gap-6">
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="h-16 w-full max-w-xl rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  )
}

/**
 * Keep URL data (`params`) behind Suspense so Partial Prefetching can share
 * one App Shell across every `/guides/[slug]` link.
 */
export default function GuideSlugPage({ params }: GuidePageProps) {
  return (
    <Suspense fallback={<GuideFallback />}>
      <GuideContent params={params} />
    </Suspense>
  )
}
