import { markdownTwinPath } from "@/lib/markdown/twins"
import { alternatives } from "@/lib/seo/alternatives"
import { home } from "@/lib/seo/home"
import { resourceEntries } from "@/lib/seo/resources"
import { siteConfig } from "@/lib/site"

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
 * Built from the same registries the twins are built from, so a page added to
 * the resource registry becomes reachable from an agent with no change here.
 */
export const webMcpPages: readonly WebMcpPage[] = [home, ...resourceEntries, ...alternatives].map(
  (entry) => ({
    path: entry.path,
    markdownPath: markdownTwinPath(entry.path),
    title: entry.title,
    description: entry.description,
  }),
)

export const mcpEndpoint = `${siteConfig.url}/api/mcp`
