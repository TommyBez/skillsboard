import type { NextConfig } from 'next'

const nextConfig = {
  // Instant Navigations foundation (already on) + Partial Prefetching for
  // one reusable App Shell per route instead of one prefetch per link.
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    catalog: {
      stale: 60,
      revalidate: 60,
      expire: 3600,
    },
  },
  // Auto-memoize components via the Rust React Compiler inside Turbopack.
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
    // Seed client caches from real navigations for instant return trips.
    cachedNavigations: true,
    // Upgrade shell prefetches to runtime prefetches on hover intent.
    dynamicOnHover: true,
    // Keep soft navigations / RSC fetches / Server Actions pending offline
    // and retry when connectivity returns.
    useOffline: true,
    // Tree-shake large icon / UI barrels in both Turbopack and webpack.
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "date-fns",
      "motion",
    ],
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
