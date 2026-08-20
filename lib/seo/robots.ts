import { siteConfig } from "@/lib/site"

/**
 * Paths kept out of crawl entirely. Not a Content Signal matter: these are
 * either machine surfaces with no page behind them, private views behind a
 * session, or URLs whose path carries a bearer-like identifier.
 */
export const disallowedPaths = [
  "/api/",
  "/library",
  "/discover",
  "/settings",
  // Invitation URLs contain bearer-like identifiers. Keep them out of crawl
  // paths even though the route also emits a noindex directive.
  "/invite/",
  // Installable collections use bearer-like unlisted share identifiers.
  "/p/",
] as const

/**
 * Content Signals (contentsignals.org), the preference layer robots.txt has no
 * vocabulary for: `Disallow` says who may fetch, a Content Signal says what may
 * be done with what was fetched.
 *
 * - `search=yes` — the public pages exist to be found; indexing them, including
 *   in an AI-assisted search product that links back, is the point.
 * - `ai-input=yes` — an agent reading a page to answer a question about Skills
 *   Board is the whole reason this site publishes Markdown twins, an llms.txt,
 *   and an MCP server. Saying no here would contradict every other file in this
 *   change.
 * - `ai-train=no` — training a model on this content is a different act from
 *   answering with it: it keeps no link back, and the pages describe a product
 *   whose details change. This is a declaration of preference, not an access
 *   control, and it is deliberately the one signal set to no.
 *
 * A signal left unset means no preference expressed, which is why all three are
 * stated rather than only the restrictive one.
 */
export const contentSignals = {
  "ai-train": "no",
  search: "yes",
  "ai-input": "yes",
} as const

export const contentSignalDirective = `Content-Signal: ${Object.entries(contentSignals)
  .map(([signal, value]) => `${signal}=${value}`)
  .join(", ")}`

/**
 * robots.txt, built by hand rather than through `MetadataRoute.Robots` because
 * that helper can only emit the directives Next.js knows about, and
 * `Content-Signal` is not one of them.
 */
export function buildRobotsTxt(): string {
  const lines = [
    "# Content Signals: what may be done with content fetched from this site.",
    "# https://contentsignals.org/",
    contentSignalDirective,
    "",
    "User-agent: *",
    contentSignalDirective,
    "Allow: /",
    ...disallowedPaths.map((path) => `Disallow: ${path}`),
    "",
    `Host: ${new URL(siteConfig.url).host}`,
    `Sitemap: ${siteConfig.url}/sitemap.xml`,
  ]

  return `${lines.join("\n")}\n`
}
