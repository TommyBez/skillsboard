import type { NextConfig } from 'next'

const nextConfig = {
  cacheComponents: true,
  // Prefetch one reusable loading shell per route instead of one payload per
  // link, so a list of links to the same route costs one prefetch rather than
  // one each. Baseline on /resources is 15 prefetch responses (48.2 KB).
  // It also unlocks per-link runtime prefetching via the `prefetch` prop, which
  // the guide links spend part of that saving on — see app/resources/page.tsx.
  partialPrefetching: true,
  // Compile components with the React Compiler so memoization is handled at
  // build time rather than by hand-written `useMemo`/`memo`. This runs through
  // Babel via `babel-plugin-react-compiler`; the Rust port that runs inside
  // Turbopack is still experimental.
  reactCompiler: true,
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
