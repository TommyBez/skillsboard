import type { MetadataRoute } from "next"

import {
  alternatives,
  alternativesIndexModifiedAt,
  alternativesIndexPath,
} from "@/lib/seo/alternatives"
import {
  compareIndexModifiedAt,
  compareIndexPath,
  comparisons,
} from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { skillCreator } from "@/lib/seo/skill-creator"
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

  const comparisonSitemapEntries: MetadataRoute.Sitemap = comparisons.map(
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
      url: `${siteConfig.url}${developers.path}`,
      lastModified: new Date(developers.modifiedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}${resourcePaths.about}`,
      lastModified: new Date("2026-08-06"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      /**
       * Listed on its own rather than through the resource registry: the page
       * is a browser tool, not an article, so it is not one of the entries
       * that feed the /resources hub and the Markdown twins.
       */
      url: `${siteConfig.url}${skillCreator.path}`,
      lastModified: new Date(skillCreator.modifiedAt),
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
    {
      url: `${siteConfig.url}${alternativesIndexPath}`,
      lastModified: new Date(alternativesIndexModifiedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...alternativeSitemapEntries,
    {
      url: `${siteConfig.url}${compareIndexPath}`,
      lastModified: new Date(compareIndexModifiedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...comparisonSitemapEntries,
  ]
}
