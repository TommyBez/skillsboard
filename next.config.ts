import type { NextConfig } from 'next'

const nextConfig = {
  turbopack: {
    resolveAlias: {
      // The slim build keeps the full PostHog API but loads optional
      // extensions (session recorder, surveys, dead clicks, …) on demand
      // through the /ingest/static rewrite instead of bundling them into
      // every page's client JS.
      "posthog-js": "posthog-js/dist/module.slim",
    },
  },
  cacheComponents: true,
  cacheLife: {
    catalog: {
      stale: 60,
      revalidate: 60,
      expire: 3600,
    },
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ]
  },
  skipTrailingSlashRedirect: true,
} satisfies NextConfig

export default nextConfig
