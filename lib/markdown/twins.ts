import type { Metadata } from "next"

import {
  buildContentMarkdown,
  markdownPathOf,
  type MarkdownContentEntry,
} from "@/lib/markdown/content-markdown"
import { alternatives } from "@/lib/seo/alternatives"
import { comparisons } from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { home } from "@/lib/seo/home"
import { alternativesHub, compareHub, resourcesHub } from "@/lib/seo/hubs"
import { pricing } from "@/lib/seo/pricing"
import { resourceEntries } from "@/lib/seo/resources"

/**
 * Every page with a Markdown twin, taken from the existing collections rather
 * than a list of its own. A page added to the resource registry, a new
 * alternative, or a new comparison gets a twin at `<path>.md` with no change
 * here.
 *
 * Each hub sits immediately above the collection it lists, which is the order
 * an agent reads them in: the hub twin names the pages below it, and each of
 * those names the hub above it. `lib/seo/hubs` holds the three definitions,
 * built from the same registries the HTML hubs render.
 *
 * The home page, the pricing page, and the developer docs are listed on their
 * own because none of them is in any collection: the home page is built from section
 * components, with `lib/seo/home` as the content definition written for the
 * twin, and the developer docs describe an interface rather than being a
 * resource article, so they carry their own definition too.
 */
const twinEntries: readonly MarkdownContentEntry[] = [
  home,
  resourcesHub,
  ...resourceEntries,
  alternativesHub,
  ...alternatives,
  compareHub,
  ...comparisons,
  developers,
  pricing,
]

const entriesByPath = new Map(twinEntries.map((entry) => [entry.path, entry]))

export const markdownTwinPaths: readonly string[] = twinEntries.map(
  (entry) => entry.path,
)

/** Reverse index, so `/index.md` resolves back to the home page. */
const entriesByMarkdownPath = new Map(
  twinEntries.map((entry) => [markdownPathOf(entry), entry]),
)

/** The twin of `/codex-skills` is `/codex-skills.md`; the twin of `/` is `/index.md`. */
export function markdownTwinPath(path: string): string {
  const entry = entriesByPath.get(normalizeContentPath(path))
  return entry ? markdownPathOf(entry) : `${path}.md`
}

/** Trailing slashes are the only shape difference we accept on a lookup. */
export function normalizeContentPath(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1)
  }
  return withLeadingSlash
}

/**
 * The content path a request for Markdown is asking about.
 *
 * A rewritten request reaches the route handler carrying the URL the client
 * typed, not the destination the rewrite named, so the `?path=` in
 * `next.config.ts` is not something the handler can rely on receiving. The
 * request's own path is: `/codex-skills.md` and `/codex-skills` sent with
 * `Accept: text/markdown` both address `/codex-skills`.
 *
 * Separate from `renderMarkdownTwin`, which stays strict: `/codex-skills.md` is
 * a URL, not a content path, and looking one up as the other would let a page
 * claim a twin at a path it does not own.
 */
export function contentPathForMarkdownRequest(pathname: string): string {
  const normalized = normalizeContentPath(pathname)
  const entry = entriesByMarkdownPath.get(normalized)
  if (entry) return entry.path

  return normalized.endsWith(".md")
    ? normalized.slice(0, -".md".length)
    : normalized
}

export function hasMarkdownTwin(path: string): boolean {
  return entriesByPath.has(normalizeContentPath(path))
}

export function renderMarkdownTwin(path: string): string | undefined {
  const entry = entriesByPath.get(normalizeContentPath(path))
  return entry ? buildContentMarkdown(entry) : undefined
}

/**
 * `<link rel="alternate" type="text/markdown" href="...">` for the page head,
 * merged into the page metadata alongside its canonical URL.
 */
export function markdownTwinAlternates(
  path: string,
): NonNullable<Metadata["alternates"]> {
  if (!hasMarkdownTwin(path)) return { canonical: path }

  return {
    canonical: path,
    types: { "text/markdown": markdownTwinPath(path) },
  }
}
