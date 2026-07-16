import type { NextConfig } from 'next'

const nextConfig = {
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
