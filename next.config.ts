import type { NextConfig } from 'next'

/**
 * Config choices are grounded in the installed Next.js docs at
 * `node_modules/next/dist/docs/` (see AGENTS.md). Key pages:
 * - 01-app/02-guides/adopting-partial-prefetching.md
 * - 01-app/02-guides/instant-navigation.md
 * - 01-app/02-guides/offline-support.md
 * - 01-app/03-api-reference/05-config/01-next-config-js/{partialPrefetching,reactCompiler,turbopackRustReactCompiler,useOffline,optimizePackageImports}.md
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
  // React Compiler via the Turbopack Rust port (no babel-plugin needed).
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
    // Retry soft navigations / RSC fetches / Server Actions when offline.
    useOffline: true,
    // Packages beyond Next's default optimizePackageImports list
    // (lucide-react and date-fns are already optimized by default).
    optimizePackageImports: ["@base-ui/react", "motion"],
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
