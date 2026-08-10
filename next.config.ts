import type { NextConfig } from 'next'

const nextConfig = {
  cacheComponents: true,
  experimental: {
    // Enables the @next/playwright instant() testing API on measured builds
    // (local EXPOSE_TESTING_API=1 builds, Vercel previews). Never in production.
    exposeTestingApiInProductionBuild:
      process.env.EXPOSE_TESTING_API === "1" ||
      process.env.VERCEL_ENV === "preview",
  },
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
  async headers() {
    return [
      {
        source: "/p/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/resources/",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/about/",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/guides/:slug/",
        destination: "/guides/:slug",
        permanent: true,
      },
      {
        source: "/pricing/",
        destination: "/pricing",
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
