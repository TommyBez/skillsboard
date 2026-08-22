import { agentSkillsSupport } from "@/lib/seo/agent-skills-support"
import {
  agentSkillsSupportPath,
  type AgentSkillsSupportPath,
} from "@/lib/seo/agent-skills-support/types"
import { agentSkills } from "@/lib/seo/agent-skills"
import { agentSkillsPath, type AgentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentsMdVsSkillMd } from "@/lib/seo/agents-md-vs-skill-md"
import {
  agentsMdVsSkillMdPath,
  type AgentsMdVsSkillMdPath,
} from "@/lib/seo/agents-md-vs-skill-md/types"
import { anthropicSkills } from "@/lib/seo/anthropic-skills"
import {
  anthropicSkillsPath,
  type AnthropicSkillsPath,
} from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkills } from "@/lib/seo/best-claude-skills"
import {
  bestClaudeSkillsPath,
  type BestClaudeSkillsPath,
} from "@/lib/seo/best-claude-skills/types"
import { claudeSkills } from "@/lib/seo/claude-skills"
import { claudeSkillsPath, type ClaudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkills } from "@/lib/seo/codex-skills"
import { codexSkillsPath, type CodexSkillsPath } from "@/lib/seo/codex-skills/types"
import { coworkSkills } from "@/lib/seo/cowork-skills"
import { coworkSkillsPath, type CoworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { cursorSkills } from "@/lib/seo/cursor-skills"
import { cursorSkillsPath, type CursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { guides } from "@/lib/seo/guides"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkills } from "@/lib/seo/manage-ai-skills"
import {
  manageAiSkillsPath,
  type ManageAiSkillsPath,
} from "@/lib/seo/manage-ai-skills/types"
import { skillExamples } from "@/lib/seo/skill-examples"
import {
  skillExamplesPath,
  type SkillExamplesPath,
} from "@/lib/seo/skill-examples/types"
import { opencodeSkills } from "@/lib/seo/opencode-skills"
import {
  opencodeSkillsPath,
  type OpencodeSkillsPath,
} from "@/lib/seo/opencode-skills/types"
import { vercelSkills } from "@/lib/seo/vercel-skills"
import {
  vercelSkillsPath,
  type VercelSkillsPath,
} from "@/lib/seo/vercel-skills/types"
import { whereToFindClaudeSkills } from "@/lib/seo/where-to-find-claude-skills"
import {
  whereToFindClaudeSkillsPath,
  type WhereToFindClaudeSkillsPath,
} from "@/lib/seo/where-to-find-claude-skills/types"

export const resourcePaths = {
  index: "/resources",
  about: "/about",
} as const

export type ResourceContentType = "guide" | "article"

/** Every path the resource hub, related links, and sitemap can address. */
export type ResourcePath =
  | GuidePath
  | AgentSkillsPath
  | AgentSkillsSupportPath
  | AgentsMdVsSkillMdPath
  | AnthropicSkillsPath
  | BestClaudeSkillsPath
  | ClaudeSkillsPath
  | CodexSkillsPath
  | CoworkSkillsPath
  | CursorSkillsPath
  | ManageAiSkillsPath
  | OpencodeSkillsPath
  | SkillExamplesPath
  | VercelSkillsPath
  | WhereToFindClaudeSkillsPath

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

/** Single registration point: content modules feed the resources hub, related links, and sitemap. */
export const resourceEntries = [
  ...guides,
  agentSkills,
  agentSkillsSupport,
  anthropicSkills,
  bestClaudeSkills,
  claudeSkills,
  codexSkills,
  coworkSkills,
  cursorSkills,
  opencodeSkills,
  skillExamples,
  vercelSkills,
  agentsMdVsSkillMd,
  manageAiSkills,
  whereToFindClaudeSkills,
] satisfies readonly ResourceIndexEntry[]

const resourceEntriesByPath = new Map(
  resourceEntries.map((entry) => [entry.path, entry]),
)

interface ResourceClusterDefinition {
  id: "cross-agent-sharing" | "team-governance-onboarding" | "ai-coding-practices"
  title: string
  description: string
  paths: readonly ResourcePath[]
}

const resourceClusterDefinitions = [
  {
    id: "cross-agent-sharing",
    title: "Cross-agent sharing",
    description:
      "Keep one team recommendation visible while teammates use Claude Code, Codex, Cursor, MCP, or a direct source workflow.",
    paths: [
      agentSkillsPath,
      agentSkillsSupportPath,
      anthropicSkillsPath,
      claudeSkillsPath,
      guidePaths.writeSkillMd,
      skillExamplesPath,
      guidePaths.installClaudeSkills,
      codexSkillsPath,
      cursorSkillsPath,
      opencodeSkillsPath,
      vercelSkillsPath,
      coworkSkillsPath,
      agentsMdVsSkillMdPath,
      guidePaths.shareTeamSkills,
      guidePaths.manageCrossAgentSkills,
      guidePaths.sharedMcpSkillLibrary,
    ],
  },
  {
    id: "team-governance-onboarding",
    title: "Team governance and onboarding",
    description:
      "Choose useful skills, define accountable workflows, and help a second teammate reproduce the result without private context.",
    paths: [
      manageAiSkillsPath,
      whereToFindClaudeSkillsPath,
      bestClaudeSkillsPath,
      guidePaths.chooseFirstTeamSkill,
      guidePaths.onboardNewTeammateSkills,
      guidePaths.aiSkillUseCases,
    ],
  },
  {
    id: "ai-coding-practices",
    title: "AI coding practices",
    description:
      "Turn coding-agent experiments into bounded team guidance, review gates, and repeatable engineering workflows.",
    paths: [
      guidePaths.aiCodingGuidelinesTemplate,
      guidePaths.aiCodingTeamOnboarding,
    ],
  },
] as const satisfies readonly ResourceClusterDefinition[]

const clusteredPaths = resourceClusterDefinitions.flatMap(({ paths }) => paths)
const uniqueClusteredPaths = new Set(clusteredPaths)

if (uniqueClusteredPaths.size !== clusteredPaths.length) {
  throw new Error("A resource guide appears in more than one topic cluster")
}

const unclusteredEntries = resourceEntries.filter(
  (entry) => !uniqueClusteredPaths.has(entry.path),
)

if (unclusteredEntries.length > 0) {
  throw new Error(
    `Resource guides missing a topic cluster: ${unclusteredEntries.map((entry) => entry.path).join(", ")}`,
  )
}

function getResourceEntry(path: ResourcePath): ResourceIndexEntry {
  const entry = resourceEntriesByPath.get(path)

  if (!entry) {
    throw new Error(`Missing resource entry for ${path}`)
  }

  return entry
}

/** Topic-led architecture for the public resource hub. Every guide appears once. */
export const resourceClusters = resourceClusterDefinitions.map(
  ({ paths, ...cluster }) => ({
    ...cluster,
    entries: paths.map(getResourceEntry),
  }),
)

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
