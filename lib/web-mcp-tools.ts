/**
 * One page in the WebMCP catalogue, as the in-page tools hand it to an agent.
 *
 * The catalogue itself is built in `lib/web-mcp-pages`, which reads the content
 * registries and therefore stays on the server. Everything in this module is
 * safe to pull into a client component: types and pure functions, no content.
 */
export interface WebMcpPage {
  path: string
  markdownPath: string
  title: string
  description: string
}

/**
 * The MCP endpoint of the deployment a page is being served from.
 *
 * Takes the origin rather than reading `siteConfig.url`, which is always
 * production: a preview that told an agent to connect to the production server
 * would send it, and whatever it writes, to the production database instead of
 * the branch Neon isolates for the preview. The browser knows the origin it
 * loaded, and that is the deployment whose MCP server it should name.
 */
export function mcpEndpointFor(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`
}

/**
 * Resolves a tool-supplied path against an origin, or returns undefined.
 *
 * A WebMCP tool call originates from a model reading page content, so the
 * destination is untrusted. The check is on the resolved origin, not on the
 * shape of the string: inspecting the string alone is not enough, because the
 * URL parser treats a backslash as a slash for http(s) URLs, so `/\host/x`
 * passes a "starts with exactly one slash" test and then resolves to
 * `https://host/x`. The leading-slash test stays as well, to keep the argument
 * a path rather than a URL.
 */
export function sameOriginDestination(
  requested: string,
  origin: string,
): string | undefined {
  if (!requested.startsWith("/")) return undefined

  let destination: URL
  try {
    destination = new URL(requested, origin)
  } catch {
    return undefined
  }

  return destination.origin === origin ? destination.toString() : undefined
}
