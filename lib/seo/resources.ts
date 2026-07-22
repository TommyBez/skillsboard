import {
  manageCrossAgentSkillsGuide,
  shareTeamSkillsGuide,
} from "@/lib/seo/guides"

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

export const resourceEntries = [
  shareTeamSkillsGuide,
  manageCrossAgentSkillsGuide,
] satisfies readonly ResourceIndexEntry[]

export const resourceSections = [
  {
    contentType: "guide",
    title: "Guides",
    description: "Practical workflows for making team skills easier to review, share, and use.",
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

  return resourceEntries
    .filter((entry) => entry.path !== currentPath)
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
    .slice(0, limit)
    .map(({ entry }) => entry)
}
