import { markdownTwinPath } from "@/lib/markdown/twins"
import { alternatives } from "@/lib/seo/alternatives"
import { comparisons } from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { home } from "@/lib/seo/home"
import { alternativesHub, compareHub, resourcesHub } from "@/lib/seo/hubs"
import { resourceEntries } from "@/lib/seo/resources"
import type { WebMcpPage } from "@/lib/web-mcp-tools"

/**
 * The pages a WebMCP tool can read or navigate to: every page with a Markdown
 * twin, which is exactly the set that can be handed back as text.
 *
 * Built from the same registries the twins are built from, and in the same
 * order, so a page added to the resource registry becomes reachable from an
 * agent with no change here.
 *
 * This module is server only, and the root layout is what imports it. Reaching
 * a registry means reaching the whole body of every page in it, around 100 KB
 * of prose for the comparisons alone, and the catalogue keeps three short
 * strings per page. Importing this from the client component would put all of
 * that source in the module graph of every route to produce a list that fits
 * in a few kilobytes, so the list is built here and handed over as a prop.
 */
export const webMcpPages: readonly WebMcpPage[] = [
  home,
  resourcesHub,
  ...resourceEntries,
  alternativesHub,
  ...alternatives,
  compareHub,
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
