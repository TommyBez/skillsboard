import type { NextConfig } from 'next'

// Two arrays of strings rather than the registry they mirror: a config is
// compiled and required before any bundler exists, and the `@/` alias survives
// that path only for the config itself. The note in `lib/site/page-paths.ts`
// has the detail.
import {
  markdownPagePathList,
  publicPagePathList,
} from '@/lib/site/page-paths'

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
 * One rule per page with a Markdown surface, read from the page registry. It
 * used to be a hand written list of router patterns, `/:slug([^/]*-skills)`
 * among them, with a commented exception for each of the four articles whose
 * slug does not end in `-skills`. A pattern cannot say which URLs exist, so
 * every page outside the shapes it happened to cover was a page that answered
 * only in HTML, and the exceptions had to be noticed by a reviewer.
 *
 * Exact sources also mean the rewrite reaches nothing but a page that has a
 * twin: a request for any other URL keeps returning HTML rather than a 404.
 */
const NEGOTIATED_PAGES: readonly { source: string; markdown: string }[] =
  markdownPagePathList.map((path) => ({
    source: path,
    markdown: `/api/markdown?path=${path}`,
  }))

/**
 * One canonical spelling per public page.
 *
 * `skipTrailingSlashRedirect` is on, because PostHog's capture endpoints use
 * trailing slashes and Next.js would rewrite them, so the canonical form of a
 * page URL is declared here instead. Derived rather than written out: the hand
 * written list covered twenty nine of the forty eight public pages, and the
 * ones it missed either served the page twice under two URLs or answered 404.
 */
const TRAILING_SLASH_REDIRECTS = publicPagePathList
  .filter((path) => path !== "/")
  .map((path) => ({
    source: `${path}/`,
    destination: path,
    permanent: true,
  }))

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
      ...TRAILING_SLASH_REDIRECTS,
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

export { MARKDOWN_ACCEPT, NEGOTIATED_PAGES, TRAILING_SLASH_REDIRECTS }
export default nextConfig
