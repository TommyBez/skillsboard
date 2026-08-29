import { markdownTwinPath } from "@/lib/markdown/twins"
import { alternatives } from "@/lib/seo/alternatives"
import { comparisons } from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { home } from "@/lib/seo/home"
import { resourceEntries } from "@/lib/seo/resources"

export interface WebMcpPage {
  path: string
  markdownPath: string
  title: string
  description: string
}

/**
 * The pages a WebMCP tool can read or navigate to: every page with a Markdown
 * twin, which is exactly the set that can be handed back as text.
 *
 * Built from the same registries the twins are built from, and in the same
 * order, so a page added to the resource registry becomes reachable from an
 * agent with no change here.
 */
export const webMcpPages: readonly WebMcpPage[] = [
  home,
  ...resourceEntries,
  ...alternatives,
  ...comparisons,
  developers,
].map(
  (entry) => ({
    path: entry.path,
    markdownPath: markdownTwinPath(entry.path),
    title: entry.title,
    description: entry.description,
  }),
)

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
