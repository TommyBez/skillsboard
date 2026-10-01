import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"
import { sitemapPages } from "@/lib/site/pages"

/**
 * The sitemap, derived from the page registry.
 *
 * There is nothing to add here when a page is added: `lib/site/pages` decides
 * which pages are listed, with what priority, and how often they change, and
 * the dates come from the same content definition the page and its Markdown
 * twin read. This file used to carry nine entries written by hand, four of
 * them with the last modified date spelled as a literal that drifted from the
 * date the page itself published.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapPages.map(({ page, sitemap }) => ({
    // The home page is `siteConfig.url`, not `siteConfig.url` plus a slash.
    url: page.path === "/" ? siteConfig.url : `${siteConfig.url}${page.path}`,
    lastModified: new Date(page.modifiedAt),
    changeFrequency: sitemap.changeFrequency,
    priority: sitemap.priority,
  }))
}
