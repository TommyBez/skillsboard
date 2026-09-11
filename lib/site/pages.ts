import type { MarkdownContentEntry } from "@/lib/markdown/content-markdown"
import { alternatives } from "@/lib/seo/alternatives"
import { comparisons } from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { home } from "@/lib/seo/home"
import { alternativesHub, compareHub, resourcesHub } from "@/lib/seo/hubs"
import { pricing } from "@/lib/seo/pricing"
import { resourceEntries } from "@/lib/seo/resources"
import { skillCheck } from "@/lib/seo/skill-check"
import { skillCreator } from "@/lib/seo/skill-creator"
import {
  pageIndex,
  type PageIndexEntry,
  type PageKind,
  type PageSurfaces,
  type SitemapSurface,
  surfacesFor,
} from "@/lib/site/page-index"

export type {
  ChangeFrequency,
  PageKind,
  PageSurfaces,
  SitemapSurface,
} from "@/lib/site/page-index"
export { surfacesFor }

/**
 * Every public page of the site, once, with its content attached.
 *
 * Before this module the set of public pages was spelled out in six places
 * that had to be kept in step by hand: the Markdown twin list, its verbatim
 * copy in the WebMCP catalogue, the content negotiation rules in
 * `next.config.ts`, the trailing slash redirects next to them, the sitemap
 * with nine entries and their dates written as literals, and a per page test
 * that restated the twin list instead of deriving it. A page that reached five
 * of the six and missed one looked correct in review and was wrong in
 * production, which is how `/check` and `/skill-creator` ended up without
 * twins.
 *
 * The registry is a join, not a place to write things down. `lib/site/page-index`
 * says which pages exist, in which order, and on which surfaces;
 * `lib/seo/<page>` says what each one contains. This module matches the two on
 * the path and throws when an index entry has no content to join, so a page
 * declared and never written fails at the first import rather than in a head
 * that renders half empty.
 *
 * The module is deliberately free of React, of `server-only`, and of any
 * package import. It is reached from the root layout through the WebMCP
 * catalogue, so anything heavier lands in the module graph of the whole site,
 * and `tests/public-pages.test.mjs` asserts the import graph below it stays
 * plain data.
 */

/**
 * A content definition as the registry reads it.
 *
 * `MarkdownContentEntry` is the structural minimum the twin builder needs. The
 * rest is what a page optionally carries for its head, and every field is
 * optional so a definition that never had one is still a valid entry.
 */
type ContentEntry = MarkdownContentEntry & {
  eyebrow?: string
  seoTitle?: string
  socialTitle?: string
  ogAlt?: string
}

export type PublicPage = {
  path: string
  kind: PageKind
  title: string
  /** The `<title>`, when it differs from the page title. */
  seoTitle?: string
  /** The title a social card carries, when it differs from the page title. */
  socialTitle?: string
  description: string
  eyebrow?: string
  ogAlt?: string
  publishedAt: string
  modifiedAt: string
  /** Only the exceptions to the defaults of the kind. */
  surfaces?: Partial<PageSurfaces>
  /** The content definition, for the pages that have one. */
  content?: ContentEntry
}

/**
 * Every content definition the site publishes, by the path it claims.
 *
 * The collections are the second half of the join. A path that appears here
 * and not in the index is a page nothing links to and nothing serves;
 * `tests/public-pages.test.mjs` rejects that, since only the index can say
 * where in the reading order it would belong.
 */
const contentByPath = new Map<string, ContentEntry>(
  [
    home,
    resourcesHub,
    ...resourceEntries,
    alternativesHub,
    ...alternatives,
    compareHub,
    ...comparisons,
    developers,
    pricing,
    skillCreator,
    skillCheck,
  ].map((entry) => [entry.path, entry]),
)

/** The content definitions, in the order the collections declare them. */
export const contentPaths: readonly string[] = [...contentByPath.keys()]

function pageFor(entry: PageIndexEntry): PublicPage {
  if (entry.head) {
    return {
      path: entry.path,
      kind: entry.kind,
      title: entry.head.title,
      seoTitle: entry.head.seoTitle,
      socialTitle: entry.socialTitle,
      description: entry.head.description,
      publishedAt: entry.head.publishedAt,
      modifiedAt: entry.head.modifiedAt,
      surfaces: entry.surfaces,
    }
  }

  const content = contentByPath.get(entry.path)
  if (!content) {
    throw new Error(
      `lib/site/page-index lists ${entry.path} as a ${entry.kind}, and no content definition claims that path. ` +
        "Either add the page to a collection in lib/seo, or give its index entry a head of its own.",
    )
  }

  return {
    path: entry.path,
    kind: entry.kind,
    title: content.title,
    seoTitle: content.seoTitle,
    socialTitle: entry.socialTitle ?? content.socialTitle,
    description: content.description,
    eyebrow: content.eyebrow,
    ogAlt: content.ogAlt,
    publishedAt: content.publishedAt,
    modifiedAt: content.modifiedAt,
    surfaces: entry.surfaces,
    content,
  }
}

/** The index, joined with the content, in the order the index declares. */
export const publicPages: readonly PublicPage[] = pageIndex.map(pageFor)

const pagesByPath = new Map(publicPages.map((page) => [page.path, page]))

export function pageForPath(path: string): PublicPage | undefined {
  return pagesByPath.get(path)
}

/** Throws rather than returning a half filled head for a path with no entry. */
export function requirePage(path: string): PublicPage {
  const page = pagesByPath.get(path)
  if (!page) {
    throw new Error(`No public page registered for ${path}`)
  }
  return page
}

export const publicPagePaths: readonly string[] = publicPages.map(
  (page) => page.path,
)

function withSurface(
  predicate: (surfaces: PageSurfaces) => boolean,
): readonly PublicPage[] {
  return publicPages.filter((page) => predicate(surfacesFor(page)))
}

/**
 * A page that answers in Markdown always has a content definition to render:
 * the twin is generated from it, so `markdown: true` without `content` is a
 * declaration nothing can honour. The parity test rejects that combination,
 * and this filter would silently drop it, so it asserts instead.
 */
function contentOf(page: PublicPage): ContentEntry {
  if (!page.content) {
    throw new Error(`${page.path} claims a Markdown surface with no content`)
  }
  return page.content
}

/** The content definitions behind the Markdown twins, in reading order. */
export const markdownPages: readonly ContentEntry[] = withSurface(
  (surfaces) => surfaces.markdown,
).map(contentOf)

export const markdownPagePaths: readonly string[] = markdownPages.map(
  (entry) => entry.path,
)

/** The pages a WebMCP tool can read or navigate to. */
export const webMcpContentPages: readonly ContentEntry[] = withSurface(
  (surfaces) => surfaces.webMcp,
).map(contentOf)

export type SitemapPage = { page: PublicPage; sitemap: SitemapSurface }

/** The sitemap, still as data: one entry per page that asked to be listed. */
export const sitemapPages: readonly SitemapPage[] = publicPages.flatMap(
  (page) => {
    const { sitemap } = surfacesFor(page)
    return sitemap ? [{ page, sitemap }] : []
  },
)
