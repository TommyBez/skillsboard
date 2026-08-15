import type { MetadataRoute } from "next"

import {
  alternatives,
  alternativesIndexModifiedAt,
  alternativesIndexPath,
} from "@/lib/seo/alternatives"
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

  const alternativeSitemapEntries: MetadataRoute.Sitemap = alternatives.map(
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
      lastModified: new Date("2026-08-12"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/sign-up`,
      lastModified: new Date("2026-08-06"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: new Date("2026-08-07"),
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
      lastModified: new Date("2026-08-06"),
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
    {
      url: `${siteConfig.url}${alternativesIndexPath}`,
      lastModified: new Date(alternativesIndexModifiedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...alternativeSitemapEntries,
  ]
}
