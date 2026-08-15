import type { Metadata } from "next"

import {
  buildContentMarkdown,
  type MarkdownContentEntry,
} from "@/lib/markdown/content-markdown"
import { alternatives } from "@/lib/seo/alternatives"
import { resourceEntries } from "@/lib/seo/resources"

/**
 * Every page with a Markdown twin, taken from the existing collections rather
 * than a list of its own. A page added to the resource registry, or a new
 * alternative, gets a twin at `<path>.md` with no change here.
 */
const twinEntries: readonly MarkdownContentEntry[] = [
  ...resourceEntries,
  ...alternatives,
]

const entriesByPath = new Map(twinEntries.map((entry) => [entry.path, entry]))

export const markdownTwinPaths: readonly string[] = twinEntries.map(
  (entry) => entry.path,
)

/** The twin of `/codex-skills` is `/codex-skills.md`. */
export function markdownTwinPath(path: string): string {
  return `${path}.md`
}

/** Trailing slashes are the only shape difference we accept on a lookup. */
export function normalizeContentPath(path: string): string {
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`
  if (withLeadingSlash.length > 1 && withLeadingSlash.endsWith("/")) {
    return withLeadingSlash.slice(0, -1)
  }
  return withLeadingSlash
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
