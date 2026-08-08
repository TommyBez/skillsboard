import type { MetadataRoute } from "next"

import { siteConfig } from "@/lib/site"

const privatePaths = [
  "/api/",
  "/library",
  "/discover",
  "/settings",
  // Invitation URLs contain bearer-like identifiers. Keep them out of crawl
  // paths even though the route also emits a noindex directive.
  "/invite/",
  // Installable collections use bearer-like unlisted share identifiers.
  "/p/",
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
