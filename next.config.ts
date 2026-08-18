import type { NextConfig } from 'next'

/**
 * Requests that ask for Markdown get the twin of the page they addressed.
 *
 * `q=0` on a media range means the client refuses it (RFC 9110), so the token
 * cannot be matched anywhere in the header. The lookahead reads the parameters
 * of this media range only, stopping at the comma that starts the next one, and
 * rejects a zero weight (`q=0`, `q=0.0`) while leaving a positive one (`q=0.5`,
 * `q=1`) alone.
 */
const MARKDOWN_ACCEPT = {
  type: "header",
  key: "accept",
  value: String.raw`.*text/markdown(?![^,]*;\s*q\s*=\s*0(?:\.0*)?(?![.\d])).*`,
} as const

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
        // Site wide pointer to the machine readable description of the site,
        // so an agent that only reads response headers can find llms.txt
        // without fetching a page first.
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: '</llms.txt>; rel="describedby"; type="text/markdown"',
          },
        ],
      },
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
      // There is no guides index: the guides live under `/guides/<slug>` and
      // the hub that lists them is `/resources`. Both spellings of the bare
      // segment used to 404, wasting crawl budget on a path that external
      // links and manual URL edits reach often enough to matter.
      {
        source: "/guides",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/guides/",
        destination: "/resources",
        permanent: true,
      },
      {
        source: "/agent-skills/",
        destination: "/agent-skills",
        permanent: true,
      },
      {
        source: "/agents-md-vs-skill-md/",
        destination: "/agents-md-vs-skill-md",
        permanent: true,
      },
      {
        source: "/anthropic-skills/",
        destination: "/anthropic-skills",
        permanent: true,
      },
      {
        source: "/claude-skills/",
        destination: "/claude-skills",
        permanent: true,
      },
      {
        source: "/codex-skills/",
        destination: "/codex-skills",
        permanent: true,
      },
      {
        source: "/cowork-skills/",
        destination: "/cowork-skills",
        permanent: true,
      },
      {
        source: "/cursor-skills/",
        destination: "/cursor-skills",
        permanent: true,
      },
      {
        source: "/where-to-find-claude-skills/",
        destination: "/where-to-find-claude-skills",
        permanent: true,
      },
      {
        source: "/compare/",
        destination: "/compare",
        permanent: true,
      },
      {
        source: "/compare/:slug/",
        destination: "/compare/:slug",
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
    return {
      // Content negotiation. `beforeFiles` is what makes these win over the
      // HTML page that owns the same URL. The header value is matched as an
      // anchored regular expression, and no browser or RSC request asks for
      // `text/markdown`, so ordinary page traffic never reaches these.
      //
      // Scoped to the URL shapes that have a Markdown twin instead of the whole
      // site: `/<something>-skills`, a top-level article that does not end in
      // `-skills`, a guide, or an alternative. A request for a page outside
      // those shapes keeps returning HTML rather than a 404.
      beforeFiles: [
        {
          source: "/:slug([^/]*-skills)",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/:slug",
        },
        {
          source: "/agents-md-vs-skill-md",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/agents-md-vs-skill-md",
        },
        {
          source: "/guides/:slug",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/guides/:slug",
        },
        {
          source: "/alternatives/:slug",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/alternatives/:slug",
        },
      ],
      afterFiles: [
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
        // The Markdown twin of every data driven content page. `afterFiles`
        // leaves the hand written Markdown in `public` (`/pricing.md`, the
        // compatibility fixture) serving itself as a static file. Paths with no
        // twin fall through to a 404 from the route handler.
        {
          source: "/:path(.*)\\.md",
          destination: "/api/markdown?path=/:path",
        },
      ],
    }
  },
} satisfies NextConfig

export default nextConfig
