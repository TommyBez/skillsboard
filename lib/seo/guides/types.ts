import type { OgTemplateContent } from "@/lib/og/template"
import type { AgentSkillsPath } from "@/lib/seo/agent-skills/types"
import type { AgentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import type { AnthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import type { ClaudeSkillsPath } from "@/lib/seo/claude-skills/types"
import type { CodexSkillsPath } from "@/lib/seo/codex-skills/types"
import type { CoworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import type { CursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import type { WhereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export const guidePaths = {
  sharedMcpSkillLibrary: "/guides/shared-mcp-skill-library-for-teams",
  aiSkillUseCases: "/guides/ai-skill-use-cases-for-teams",
  onboardNewTeammateSkills: "/guides/onboard-new-teammate-ai-skills-checklist",
  chooseFirstTeamSkill: "/guides/choose-first-ai-agent-skill-for-your-team",
  shareTeamSkills: "/guides/share-agent-skills-with-your-team",
  manageCrossAgentSkills: "/guides/manage-skills-across-claude-codex-cursor",
  installClaudeSkills: "/guides/install-claude-skills-in-claude-code",
  aiCodingTeamOnboarding: "/guides/ai-coding-team-onboarding",
  aiCodingGuidelinesTemplate: "/guides/ai-coding-guidelines-template",
} as const

export const guideEvidencePaths = {
  crossAgentCompatibilityFixture: "/cross-agent-skill-compatibility-fixture.md",
} as const

export type GuidePath = (typeof guidePaths)[keyof typeof guidePaths]

export type GuideSlug = GuidePath extends `/guides/${infer S}` ? S : never

export interface GuideSource {
  /** Stable key used by adjacent section citations. */
  id: string
  label: string
  href: string
  note: string
}

export interface GuideCitations {
  answer?: readonly string[]
  problem?: readonly string[]
  decision?: readonly string[]
  /** Zero-based step index mapped to the sources that support that step. */
  steps?: Readonly<Record<number, readonly string[]>>
}

/** One contextual link out of a section, rendered as a sentence. */
export interface GuideInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | AgentSkillsPath
    | AgentsMdVsSkillMdPath
    | AnthropicSkillsPath
    | ClaudeSkillsPath
    | CodexSkillsPath
    | CoworkSkillsPath
    | CursorSkillsPath
    | WhereToFindClaudeSkillsPath
  trail: string
}

/** Question and answer pair, extracted into FAQPage schema when present. */
export interface GuideFaqEntry {
  question: string
  answer: string
}

/**
 * Optional closing section for a guide whose workflow ends at a team handoff.
 * When a guide defines it, it replaces the generic library callout, so the page
 * keeps one product mention rather than two.
 */
export interface GuideTeamSection {
  title: string
  intro: string
  paths: readonly {
    label: string
    body: string
  }[]
  limits: readonly string[]
}

export interface GuideEvidenceAsset {
  eyebrow: string
  title: string
  summary: string
  version: string
  publishedAt: string
  status: string
  scope: readonly string[]
  methodology: readonly {
    title: string
    body: string
  }[]
  limitations: readonly string[]
  href: string
  linkLabel: string
}

export interface GuideDefinition {
  path: GuidePath
  contentType: "guide"
  topics: readonly string[]
  /** Curated related resources, rendered before topic matches. */
  relatedGuidePaths: readonly (
    | GuidePath
    | ClaudeSkillsPath
    | CodexSkillsPath
    | CursorSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document <title>, including the brand suffix. */
  seoTitle: string
  description: string
  intro: string
  /** Concise, answer-first summary shown near the start of the guide. */
  answer: string
  /** Contextual link out of the answer, for the page that defines the subject. */
  answerLink?: GuideInlineLink
  /** Source keys rendered beside the material claims they support. */
  citations?: GuideCitations
  corePrinciple: string
  problem: string
  decisionTitle: string
  decisionIntro: string
  comparisonColumns: readonly string[]
  comparisonRows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /**
   * True when the steps are an ordered procedure, which is what lets the page
   * publish a HowTo. A guide whose steps are independent alternatives sets
   * this to false, so the collection is not misread as positions in a single
   * procedure.
   */
  stepsAreSequential: boolean
  stepsTitle: string
  stepsIntro: string
  steps: readonly {
    title: string
    body: string
    output: string
  }[]
  /** Contextual link out of the workflow, for the guide that continues it. */
  stepsLink?: GuideInlineLink
  team?: GuideTeamSection
  templateTitle: string
  templateIntro: string
  templateFields: readonly {
    label: string
    value: string
  }[]
  copyTemplate?: string
  /** Optional first-party protocol or evidence artifact published with this guide. */
  evidenceAsset?: GuideEvidenceAsset
  pitfallsTitle: string
  pitfalls: readonly {
    title: string
    body: string
  }[]
  checklist: readonly string[]
  faq?: readonly GuideFaqEntry[]
  sources: readonly GuideSource[]
  /** Intentional social creative — not auto-derived from title. */
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}
