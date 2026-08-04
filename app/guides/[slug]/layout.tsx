import { ResourceShell } from "@/components/resources/resource-chrome"
import { getGuideBySlug } from "@/lib/seo/guides"
import { resourcePaths } from "@/lib/seo/resources"

/**
 * Guide chrome.
 *
 * It sits on `[slug]` rather than on `guides/` because the header's analytics
 * carry the guide's own path, and only a layout on the dynamic segment is
 * handed the slug. An unknown slug still renders this layout around the
 * not-found body, so the path falls back to the resource index.
 */
export default async function GuideLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  return (
    <ResourceShell
      landingPath={guide?.path ?? resourcePaths.index}
      location="guide_header"
    >
      {children}
    </ResourceShell>
  )
}
