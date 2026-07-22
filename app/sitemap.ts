import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"
import { guidePaths } from "@/lib/seo/guides"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

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
      url: `${siteConfig.url}${guidePaths.shareTeamSkills}`,
      lastModified: new Date("2026-07-22"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}${guidePaths.manageCrossAgentSkills}`,
      lastModified: new Date("2026-07-22"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ]
}
