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
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
      // Explicit allows for AI citation crawlers (see ai-seo skill).
      {
        userAgent: ["GPTBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "anthropic-ai", "Google-Extended"],
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
