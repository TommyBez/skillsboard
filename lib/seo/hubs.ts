import {
  alternatives,
  alternativesIndexDescription,
  alternativesIndexModifiedAt,
  alternativesIndexPath,
} from "@/lib/seo/alternatives"
import {
  compareIndexDescription,
  compareIndexModifiedAt,
  compareIndexPath,
  compareIndexTitle,
  comparisons,
} from "@/lib/seo/compare"
import {
  resourceClusters,
  resourceEntries,
  resourcePaths,
} from "@/lib/seo/resources"

/**
 * The three hub pages as content definitions, so each one carries the Markdown
 * twin the pages under it already carry.
 *
 * Every page below a hub answers in Markdown, and until now no hub did: an
 * agent that arrived at `/compare/claude-skills-vs-plugins.md` could read that
 * page and nothing above it, because `/compare.md` answered 404. The descent
 * from a hub to a page existed only in HTML, and the climb back did not exist
 * at all.
 *
 * A hub states what it indexes and then lists what it indexes, and nothing
 * else: every claim belongs to the page it points at. The lists are derived
 * from the same registries the HTML hubs render, so a page added to a registry
 * appears in the twin with no change here.
 */

interface DatedEntry {
  publishedAt: string
  modifiedAt: string
}

interface ListedEntry {
  path: string
  title: string
  description: string
}

/** A hub is as old as the first page it lists. */
function firstPublished(entries: readonly DatedEntry[]): string {
  return entries.reduce(
    (earliest, entry) =>
      entry.publishedAt < earliest ? entry.publishedAt : earliest,
    entries[0]?.publishedAt ?? "1970-01-01",
  )
}

/** And as recent as the most recently changed one. */
function lastModified(entries: readonly DatedEntry[]): string {
  return entries.reduce(
    (latest, entry) => (entry.modifiedAt > latest ? entry.modifiedAt : latest),
    "1970-01-01",
  )
}

/**
 * One listed page, as a link the twin builder annotates.
 *
 * `note` rather than `description`: the builder treats `description` as the
 * page-level field it prints in the header and skips it everywhere else, and
 * `note` is the key the source lists on the comparison pages already use for
 * the sentence that follows a link.
 */
function hubLink(entry: ListedEntry, note = entry.description) {
  return { label: entry.title, href: entry.path, note }
}

const machineReadableIndex = {
  label: "Machine-readable site overview",
  href: "/llms.txt",
  note: "llms.txt, with the Markdown twin of every public page",
}

/**
 * The one sentence the resources hub says about itself, shared with the HTML
 * page so the two cannot describe the same URL differently.
 *
 * The hub describes itself as an index rather than as an answer: repeating the
 * head phrase of the pages it lists is one reason search engines routed their
 * queries here instead of to them.
 */
export const resourcesIndexDescription =
  "Browse the full index of Skills Board guides, comparisons, and reference pages, then open the one that answers your question."

export const resourcesHub = {
  path: resourcePaths.index,
  title: "Skills Board resources",
  description: resourcesIndexDescription,
  publishedAt: firstPublished(resourceEntries),
  modifiedAt: lastModified(resourceEntries),
  intro: [
    "This page is the index of the Skills Board resource pages: guides, skill format explainers, and reference pages for teams that share and operate AI skills. It answers nothing itself, and each entry below is the page that answers its own question.",
    "Every page in the topics below names its publisher, its first-party sources, and the date its claims were last checked. Every one of them is also published as Markdown at the same URL with a `.md` suffix.",
  ],
  clustersTitle: "Topics",
  clusters: resourceClusters.map((cluster) => ({
    title: cluster.title,
    intro: cluster.description,
    entries: cluster.entries.map((entry) => hubLink(entry)),
  })),
  relatedTitle: "Related resources",
  related: [
    {
      label: "Comparisons",
      href: compareIndexPath,
      note: "The hub for the AI agent primitives that look interchangeable",
    },
    {
      label: "Skills Board alternatives",
      href: alternativesIndexPath,
      note: "The hub for the other ways a team can share skills",
    },
    {
      label: "About Skills Board",
      href: resourcePaths.about,
      note: "Why Skills Board exists",
    },
    machineReadableIndex,
  ],
} as const

export const compareHub = {
  path: compareIndexPath,
  title: compareIndexTitle,
  description: compareIndexDescription,
  publishedAt: firstPublished(comparisons),
  modifiedAt: compareIndexModifiedAt,
  intro: [
    "This page is the index of the Skills Board comparisons: pairs of AI agent primitives that look interchangeable from the outside, set next to each other on the dimensions that decide between them.",
    "Each comparison opens with a short answer, then a table of what differs, then the cases where each side is the wrong pick. Every section names the first-party documentation behind it, and every page carries the date its claims were last checked. Where the documentation is silent, the page says so.",
  ],
  comparisonsTitle: "Comparisons",
  comparisons: comparisons.map((entry) => hubLink(entry, entry.cardSummary)),
  relatedTitle: "Related resources",
  related: [
    {
      label: "Skills Board resources",
      href: resourcePaths.index,
      note: "The guide and explainer index",
    },
    {
      label: "Skills Board alternatives",
      href: alternativesIndexPath,
      note: "The hub for the other ways a team can share skills",
    },
    machineReadableIndex,
  ],
} as const

export const alternativesHub = {
  path: alternativesIndexPath,
  title: "Skills Board alternatives",
  description: alternativesIndexDescription,
  publishedAt: firstPublished(alternatives),
  modifiedAt: alternativesIndexModifiedAt,
  intro: [
    "This page is the index of the Skills Board alternatives: one page per option a team already has for passing skills around, with Skills Board next to it.",
    "Each page says plainly when the other option is the better fit, and links every claim about it to a public page you can check yourself.",
  ],
  alternativesTitle: "Alternatives",
  alternatives: alternatives.map((entry) => hubLink(entry, entry.cardSummary)),
  relatedTitle: "Related resources",
  related: [
    {
      label: "Skills Board resources",
      href: resourcePaths.index,
      note: "The guide and explainer index",
    },
    {
      label: "Comparisons",
      href: compareIndexPath,
      note: "The hub for the AI agent primitives that look interchangeable",
    },
    machineReadableIndex,
  ],
} as const
