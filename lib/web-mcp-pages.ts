import { markdownTwinPath } from "@/lib/markdown/twins"
import { webMcpContentPages } from "@/lib/site/pages"
import type { WebMcpPage } from "@/lib/web-mcp-tools"

/**
 * The pages a WebMCP tool can read or navigate to.
 *
 * Read from the page registry, which is also where the Markdown twins come
 * from, so the two lists cannot disagree: they used to be two copies of the
 * same array in two files. A page added to `lib/site/pages` becomes reachable
 * from an agent with no change here.
 *
 * This module is server only, and the root layout is what imports it. Reaching
 * the registry means reaching the whole body of every page in it, around 100 KB
 * of prose for the comparisons alone, and the catalogue keeps three short
 * strings per page. Importing this from the client component would put all of
 * that source in the module graph of every route to produce a list that fits
 * in a few kilobytes, so the list is built here and handed over as a prop.
 */
export const webMcpPages: readonly WebMcpPage[] = webMcpContentPages.map(
  (entry) => ({
    path: entry.path,
    markdownPath: markdownTwinPath(entry.path),
    title: entry.title,
    description: entry.description,
  }),
)
