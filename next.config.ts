import type { NextConfig } from 'next'

/**
 * A literal that matches in any case.
 *
 * A `has` rule's value is compiled with `new RegExp(\`^${value}$\`)` and no
 * flags, so the match is case sensitive, and the flag cannot be passed from
 * here. Media types and parameter names are case insensitive (RFC 9110), and a
 * client that sends `Text/Markdown` or `Q=0` is within spec, so each letter is
 * written as the pair it can arrive as.
 */
function anyCase(literal: string): string {
  return literal.replace(
    /[a-z]/gi,
    (letter) => `[${letter.toLowerCase()}${letter.toUpperCase()}]`,
  )
}

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
  value: String.raw`.*` +
    anyCase("text/markdown") +
    String.raw`(?![^,]*;\s*` +
    anyCase("q") +
    String.raw`\s*=\s*0(?:\.0*)?(?![.\d])).*`,
} as const

/**
 * The URLs that answer in two representations.
 *
 * One list, so the rewrite that serves Markdown when the request asks for it
 * is declared in a single place rather than once per URL.
 *
 * `source` is matched by the router, so it carries the slug patterns; the
 * scope is deliberately narrow rather than site wide: `/<something>-skills`, a
 * top-level article that does not end in `-skills`, one of the three hubs, a
 * guide, an alternative, or a comparison. A request for a page outside those
 * shapes keeps returning HTML rather than a 404.
 */
const NEGOTIATED_PAGES: readonly { source: string; markdown: string }[] = [
  // The home page. It is the URL an agent scanning the site reaches first, so
  // it is the one that most needs to answer in Markdown.
  { source: "/", markdown: "/api/markdown?path=/" },
  { source: "/:slug([^/]*-skills)", markdown: "/api/markdown?path=/:slug" },
  {
    source: "/agent-skills-support",
    markdown: "/api/markdown?path=/agent-skills-support",
  },
  // `/agent-skills-by-the-numbers` does not end in `-skills` either, so the
  // shared rule above never reaches it.
  {
    source: "/agent-skills-by-the-numbers",
    markdown: "/api/markdown?path=/agent-skills-by-the-numbers",
  },
  { source: "/developers", markdown: "/api/markdown?path=/developers" },
  {
    source: "/agents-md-vs-skill-md",
    markdown: "/api/markdown?path=/agents-md-vs-skill-md",
  },
  // `/skill-examples` does not end in `-skills`, so the shared rule above does
  // not reach it and it needs a rule of its own.
  { source: "/skill-examples", markdown: "/api/markdown?path=/skill-examples" },
  // `/claude-code-for-teams` does not end in `-skills` either.
  {
    source: "/claude-code-for-teams",
    markdown: "/api/markdown?path=/claude-code-for-teams",
  },
  // The pricing page reaches the twin generator like every other negotiated
  // page. It used to be sent to a hand written document in `public`, which a
  // static file server answers without the token estimate, the canonical and
  // alternate links, `X-Content-Type-Options`, or `Vary: Accept`: a Markdown
  // body cached under the page URL with no `Vary` is a body a shared cache can
  // hand to a browser. `lib/seo/pricing` is the content definition that
  // replaced the document.
  { source: "/pricing", markdown: "/api/markdown?path=/pricing" },
  // The three hubs. Each one is a page in its own right, so the rules below
  // it, which all carry a slug, never match it.
  { source: "/resources", markdown: "/api/markdown?path=/resources" },
  { source: "/alternatives", markdown: "/api/markdown?path=/alternatives" },
  { source: "/compare", markdown: "/api/markdown?path=/compare" },
  { source: "/guides/:slug", markdown: "/api/markdown?path=/guides/:slug" },
  {
    source: "/alternatives/:slug",
    markdown: "/api/markdown?path=/alternatives/:slug",
  },
  { source: "/compare/:slug", markdown: "/api/markdown?path=/compare/:slug" },
]

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
        source: "/agent-skills-by-the-numbers/",
        destination: "/agent-skills-by-the-numbers",
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
      // `text/markdown`, so ordinary page traffic never reaches these. The
      // URLs are `NEGOTIATED_PAGES`, the single list the tests read too.
      beforeFiles: [
        // `/` + `.md` is not a path, so the home twin is published at
        // `/index.md`. Stated here because the generic `<path>.md` rule below
        // would resolve it to the page `/index`, which does not exist.
        {
          source: "/index.md",
          destination: "/api/markdown?path=/",
        },
        ...NEGOTIATED_PAGES.map(({ source, markdown }) => ({
          source,
          has: [MARKDOWN_ACCEPT],
          destination: markdown,
        })),
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
        // leaves the hand written Markdown in `public` (`/auth.md`) serving
        // itself as a static file. Paths with no twin fall through to a 404
        // from the route handler.
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

export { MARKDOWN_ACCEPT, NEGOTIATED_PAGES }
export default nextConfig
