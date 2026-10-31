import type { Metadata } from "next"

import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { requirePage, type PublicPage } from "@/lib/site/pages"
import { siteConfig } from "@/lib/site"

/** An article carries its dates in the head; a hub or a form has none to carry. */
const datedKinds = new Set<PublicPage["kind"]>([
  "article",
  "guide",
  "comparison",
  "alternative",
])

/**
 * The head of a public page, built from its registry entry.
 *
 * This replaces seventeen copies of the same forty six line block, one at the
 * top of each article's `page.tsx`, which differed only in the entry they read
 * and in a `socialTitle` constant that now lives in the registry with the rest
 * of the page's index data.
 *
 * `openGraph.images` and `twitter.images` are deliberately absent. Every page
 * keeps its own `opengraph-image.tsx` and `twitter-image.tsx`, and those file
 * conventions are what Next.js reads to write the image tags, including the
 * `alt` and the size each file exports. Setting the images here too meant
 * writing the same URL twice, in a shape that had to be kept in step with the
 * file next to it by hand.
 */
export function buildPageMetadata(page: PublicPage): Metadata {
  const socialTitle = page.socialTitle ?? page.title
  const dated = datedKinds.has(page.kind)

  return {
    title: { absolute: page.seoTitle ?? page.title },
    description: page.description,
    alternates: markdownTwinAlternates(page.path),
    openGraph: {
      type: dated ? "article" : "website",
      url: page.path,
      title: socialTitle,
      description: page.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      ...(dated
        ? { publishedTime: page.publishedAt, modifiedTime: page.modifiedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: page.description,
    },
  }
}

/** The same, addressed by URL: `export const metadata = pageMetadata("/codex-skills")`. */
export function pageMetadata(path: string): Metadata {
  return buildPageMetadata(requirePage(path))
}
