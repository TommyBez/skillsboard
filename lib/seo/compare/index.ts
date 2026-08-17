import type { OgTemplateContent } from "@/lib/og/template"
import { skillsVsMcp } from "@/lib/seo/compare/skills-vs-mcp"
import { skillsVsPlugins } from "@/lib/seo/compare/skills-vs-plugins"
import { skillsVsSlashCommands } from "@/lib/seo/compare/skills-vs-slash-commands"
import { skillsVsSubagents } from "@/lib/seo/compare/skills-vs-subagents"
import type {
  ComparePath,
  ComparisonDefinition,
} from "@/lib/seo/compare/types"

export {
  compareIndexPath,
  comparePaths,
  type CompareIndexPath,
  type ComparePath,
  type ComparisonCtaLocation,
  type ComparisonCtaPlacement,
  type ComparisonHeaderLocation,
  type ComparisonDefinition,
  type ComparisonFaqEntry,
  type ComparisonInlineLink,
  type ComparisonRelatedLink,
  type ComparisonSource,
} from "@/lib/seo/compare/types"

/**
 * Single registration point for the comparison hub: the index page, the
 * ItemList schema, and the sitemap all read this array, so adding a pair means
 * adding a content module and one entry here.
 */
export const comparisons: readonly ComparisonDefinition[] = [
  skillsVsSubagents,
  skillsVsMcp,
  skillsVsPlugins,
  skillsVsSlashCommands,
]

const comparisonsByPath = new Map(
  comparisons.map((entry) => [entry.path, entry]),
)

export function getComparison(path: ComparePath): ComparisonDefinition {
  const entry = comparisonsByPath.get(path)

  if (!entry) {
    throw new Error(`Missing comparison entry for ${path}`)
  }

  return entry
}

export const compareIndexTitle =
  "Comparisons: the AI agent primitives teams keep confusing"

export const compareIndexSeoTitle =
  "Compare AI Agent Primitives: Skills, Subagents, and More | Skills Board"

export const compareIndexDescription =
  "Short, sourced comparisons of the primitives an AI coding agent gives you. What each one is, where it lives, when it is the right choice, and what the documentation does not say."

export const compareIndexOgAlt =
  "Skills Board comparison hub: sourced comparisons of AI agent primitives such as skills, subagents, and MCP."

export const compareIndexOg: OgTemplateContent = {
  eyebrow: "Comparisons",
  title: [
    { text: "Two primitives," },
    { text: "one honest answer.", accent: true },
  ],
  description:
    "Sourced comparisons of the AI agent primitives that look interchangeable and are not.",
  contextLabel: "skillsboard.sh/compare",
  chips: ["Skills", "Subagents", "MCP"],
}

/** Newest modification across the set, used for the hub's sitemap entry. */
export const compareIndexModifiedAt = comparisons.reduce(
  (latest, entry) => (entry.modifiedAt > latest ? entry.modifiedAt : latest),
  "1970-01-01",
)
