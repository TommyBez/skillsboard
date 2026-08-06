import type { MetadataRoute } from "next"

import { guideEvidencePaths } from "@/lib/seo/guides/types"
import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const resourceIndexLastModified = resourceEntries.reduce(
    (latest, entry) =>
      entry.modifiedAt > latest ? entry.modifiedAt : latest,
    "1970-01-01",
  )
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
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/sign-up`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/privacy`,
      lastModified: new Date("2026-07-29"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms`,
      lastModified: new Date("2026-07-29"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/contact`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}${resourcePaths.about}`,
      lastModified: new Date("2026-08-06"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${siteConfig.url}${guideEvidencePaths.crossAgentCompatibilityFixture}`,
      lastModified: new Date("2026-08-06"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}${resourcePaths.index}`,
      lastModified: new Date(resourceIndexLastModified),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...resourceSitemapEntries,
  ]
}
