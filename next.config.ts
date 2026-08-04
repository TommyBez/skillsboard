import type { NextConfig } from 'next'

const nextConfig = {
  cacheComponents: true,
  // Prefetch one reusable loading shell per route instead of one payload per
  // link. The library/collections/discover pages render long lists of links
  // that all point at the same few routes, so this collapses a burst of
  // per-link prefetches into a single cached shell per route.
  partialPrefetching: true,
  // Compile components with the React Compiler so memoization is handled at
  // build time rather than by hand-written `useMemo`/`memo`.
  reactCompiler: true,
  experimental: {
    // Run the React Compiler natively inside Turbopack instead of through
    // Babel, which keeps `next dev`/`next build` off the JS transform path.
    turbopackRustReactCompiler: true,
  },
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
