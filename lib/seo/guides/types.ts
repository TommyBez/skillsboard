import type { OgTemplateContent } from "@/lib/og/template"
import type { ClaudeSkillsPath } from "@/lib/seo/claude-skills/types"

export const guidePaths = {
  sharedMcpSkillLibrary: "/guides/shared-mcp-skill-library-for-teams",
  aiSkillUseCases: "/guides/ai-skill-use-cases-for-teams",
  onboardNewTeammateSkills: "/guides/onboard-new-teammate-ai-skills-checklist",
  chooseFirstTeamSkill: "/guides/choose-first-ai-agent-skill-for-your-team",
  shareTeamSkills: "/guides/share-agent-skills-with-your-team",
  manageCrossAgentSkills: "/guides/manage-skills-across-claude-codex-cursor",
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
  relatedGuidePaths: readonly (GuidePath | ClaudeSkillsPath)[]
  eyebrow: string
  title: string
  /** Full document <title>, including the brand suffix. */
  seoTitle: string
  description: string
  intro: string
  /** Concise, answer-first summary shown near the start of the guide. */
  answer: string
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
  stepsTitle: string
  stepsIntro: string
  steps: readonly {
    title: string
    body: string
    output: string
  }[]
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
  sources: readonly GuideSource[]
  /** Intentional social creative — not auto-derived from title. */
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}
