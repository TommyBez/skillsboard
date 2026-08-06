import { guides } from "@/lib/seo/guides"

export const resourcePaths = {
  index: "/resources",
} as const

export type ResourceContentType = "guide" | "article"

export interface ResourceIndexEntry {
  path: string
  contentType: ResourceContentType
  eyebrow: string
  title: string
  description: string
  topics: readonly string[]
  publishedAt: string
  modifiedAt: string
}

/** Single registration point: guide modules feed the resources hub, related links, and sitemap. */
export const resourceEntries = guides satisfies readonly ResourceIndexEntry[]

const resourceEntriesByPath = new Map(
  resourceEntries.map((entry) => [entry.path, entry]),
)

export const resourceSections = [
  {
    contentType: "guide",
    title: "Guides",
    description: "Practical workflows for adopting AI agents, standardizing team guidance, and sharing reusable skills.",
  },
  {
    contentType: "article",
    title: "Articles",
    description: "Focused perspectives on how teams build and operate with reusable AI skills.",
  },
] as const satisfies readonly {
  contentType: ResourceContentType
  title: string
  description: string
}[]

export function getRelatedResources(
  currentPath: string,
  limit = 3,
): readonly ResourceIndexEntry[] {
  const current = resourceEntries.find((entry) => entry.path === currentPath)
  const curatedEntries = (current?.relatedGuidePaths ?? []).flatMap((path) => {
    const entry = resourceEntriesByPath.get(path)
    return entry ? [entry] : []
  })
  const curatedPaths = new Set(curatedEntries.map((entry) => entry.path))

  const topicMatches = resourceEntries
    .filter(
      (entry) =>
        entry.path !== currentPath && !curatedPaths.has(entry.path),
    )
    .map((entry) => ({
      entry,
      sharedTopics: current
        ? entry.topics.filter((topic) => current.topics.includes(topic)).length
        : 0,
    }))
    .sort(
      (a, b) =>
        b.sharedTopics - a.sharedTopics ||
        b.entry.modifiedAt.localeCompare(a.entry.modifiedAt) ||
        a.entry.title.localeCompare(b.entry.title),
    )
    .map(({ entry }) => entry)

  return [...curatedEntries, ...topicMatches].slice(0, limit)
}
