import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

const privatePaths = [
  "/api/",
  "/library",
  "/discover",
  "/settings",
  "/onboarding",
  "/consent",
  "/invite/",
  "/sign-in",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: privatePaths,
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: new URL(siteConfig.url).host,
  }
}
