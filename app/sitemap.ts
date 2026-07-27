import type { MetadataRoute } from "next"

import { launchPath } from "@/lib/launch"
import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
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
      url: `${siteConfig.url}${launchPath}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
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
