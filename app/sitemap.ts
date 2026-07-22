import type { MetadataRoute } from "next"

import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const resourceSitemapEntries: MetadataRoute.Sitemap = resourceEntries.map(
    (entry) => ({
      url: `${siteConfig.url}${entry.path}`,
      lastModified: new Date(entry.modifiedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  )

  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/sign-up`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}${resourcePaths.index}`,
      lastModified: new Date("2026-07-22"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...resourceSitemapEntries,
  ]
}
