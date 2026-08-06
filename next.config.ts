import type { NextConfig } from 'next'

const nextConfig = {
  cacheComponents: true,
  // PostHog capture endpoints use trailing slashes (for example, `/ingest/e/`).
  // Keep Next.js from normalizing those requests and handle canonical page URLs
  // explicitly below instead.
  skipTrailingSlashRedirect: true,
  cacheLife: {
    catalog: {
      stale: 60,
      revalidate: 60,
      expire: 3600,
    },
  },
  async redirects() {
    return [
      {
        source: "/resources/",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/guides/:slug/",
        destination: "/guides/:slug",
        permanent: true,
      },
      {
        source: "/sign-up/",
        destination: "/sign-up",
        permanent: true,
      },
      {
        source: "/privacy/",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms/",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/contact/",
        destination: "/contact",
        permanent: true,
      },
    ]
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
} satisfies NextConfig

export default nextConfig
