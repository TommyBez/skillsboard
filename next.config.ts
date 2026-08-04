import type { NextConfig } from 'next'

/**
 * Config choices are grounded in the installed Next.js docs at
 * `node_modules/next/dist/docs/` (see AGENTS.md). Key pages:
 * - 01-app/02-guides/adopting-partial-prefetching.md
 * - 01-app/02-guides/instant-navigation.md
 * - 01-app/03-api-reference/05-config/01-next-config-js/{partialPrefetching,reactCompiler}.md
 */
const nextConfig = {
  // Instant Navigations: Cache Components + Partial Prefetching
  // (one reusable App Shell per route).
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    catalog: {
      stale: 60,
      revalidate: 60,
      expire: 3600,
    },
  },
  // Stable React Compiler (Babel path; see reactCompiler.md).
  reactCompiler: true,
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
