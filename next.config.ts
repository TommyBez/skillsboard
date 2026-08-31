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
      // The developer docs live at /developers. The other two spellings are
      // what a person types and what an agent probes when it is looking for an
      // API description, and both used to 404.
      {
        source: "/docs",
        destination: "/developers",
        permanent: true,
      },
      {
        source: "/docs/",
        destination: "/developers",
        permanent: true,
      },
      {
        source: "/api",
        destination: "/developers",
        permanent: true,
      },
      {
        source: "/developers/",
        destination: "/developers",
        permanent: true,
      },
      // The MCP endpoint is at /api/mcp, which is the audience every issued
      // token is bound to and cannot move. A client that guesses the
      // conventional root path is sent there rather than refused: 308 keeps the
      // method and the body, so a POSTed JSON-RPC call survives the hop.
      {
        source: "/mcp",
        destination: "/api/mcp",
        permanent: true,
      },
      // Connecting an agent moved out of settings to /connect: it is the first
      // thing a new team does, not a preference to adjust later. Bookmarks, an
      // open tab whose account menu still points at the old path, and any link
      // shared in a chat keep working.
      {
        source: "/settings/mcp",
        destination: "/connect",
        permanent: true,
      },
      {
        source: "/settings/mcp/",
        destination: "/connect",
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
        source: "/best-claude-skills/",
        destination: "/best-claude-skills",
        permanent: true,
      },
      {
        source: "/agent-skills-support/",
        destination: "/agent-skills-support",
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
        source: "/claude-code-for-teams/",
        destination: "/claude-code-for-teams",
        permanent: true,
      },
      {
        source: "/copilot-skills/",
        destination: "/copilot-skills",
        permanent: true,
      },
      {
        source: "/cursor-skills/",
        destination: "/cursor-skills",
        permanent: true,
      },
      {
        source: "/manage-ai-skills/",
        destination: "/manage-ai-skills",
        permanent: true,
      },
      {
        source: "/opencode-skills/",
        destination: "/opencode-skills",
        permanent: true,
      },
      {
        source: "/vercel-skills/",
        destination: "/vercel-skills",
        permanent: true,
      },
      {
        source: "/skill-creator/",
        destination: "/skill-creator",
        permanent: true,
      },
      {
        source: "/skill-examples/",
        destination: "/skill-examples",
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
      // `-skills`, a guide, an alternative, or a comparison. A request for a
      // page outside those shapes keeps returning HTML rather than a 404.
      beforeFiles: [
        // The home page. It is the URL an agent scanning the site reaches
        // first, so it is the one that most needs to answer in Markdown.
        {
          source: "/",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/",
        },
        // `/` + `.md` is not a path, so the home twin is published at
        // `/index.md`. Stated here because the generic `<path>.md` rule below
        // would resolve it to the page `/index`, which does not exist.
        {
          source: "/index.md",
          destination: "/api/markdown?path=/",
        },
        {
          source: "/:slug([^/]*-skills)",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/:slug",
        },
        {
          source: "/agent-skills-support",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/agent-skills-support",
        },
        {
          source: "/developers",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/developers",
        },
        {
          source: "/agents-md-vs-skill-md",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/agents-md-vs-skill-md",
        },
        // `/skill-examples` does not end in `-skills`, so the shared rule
        // above does not reach it and it needs a rule of its own.
        {
          source: "/skill-examples",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/skill-examples",
        },
        // `/claude-code-for-teams` does not end in `-skills` either.
        {
          source: "/claude-code-for-teams",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/claude-code-for-teams",
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
        {
          source: "/compare/:slug",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/compare/:slug",
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
        // leaves the hand written Markdown in `public` (`/pricing.md`,
        // `/auth.md`) serving itself as a static file. Paths with no twin
        // fall through to a 404 from the route handler.
        {
          source: "/:path(.*)\\.md",
          destination: "/api/markdown?path=/:path",
        },
      ],
      // Content negotiation for the paths nothing else claimed. `fallback`
      // runs after every page, public file, and dynamic route, so this is
      // reached only by a request that was going to 404 anyway: a real page
      // asked for in Markdown still answers from the rules above, and
      // `/llms.txt` still serves itself.
      //
      // What it buys is a 404 an agent can act on. Without it, a client that
      // asked for Markdown and guessed a URL wrong got an HTML error document
      // it has to parse to learn there is a sitemap.
      fallback: [
        {
          source: "/:path*",
          has: [MARKDOWN_ACCEPT],
          destination: "/api/markdown?path=/:path*",
        },
      ],
    }
  },
} satisfies NextConfig

export default nextConfig
