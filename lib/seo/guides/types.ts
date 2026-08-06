import type { OgTemplateContent } from "@/lib/og/template"

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

export type GuidePath = (typeof guidePaths)[keyof typeof guidePaths]

export type GuideSlug = GuidePath extends `/guides/${infer S}` ? S : never

export interface GuideDefinition {
  path: GuidePath
  contentType: "guide"
  topics: readonly string[]
  relatedGuidePaths: readonly GuidePath[]
  eyebrow: string
  title: string
  /** Full document <title>, including the brand suffix. */
  seoTitle: string
  description: string
  intro: string
  /** Concise, answer-first summary shown near the start of the guide. */
  answer: string
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
  pitfallsTitle: string
  pitfalls: readonly {
    title: string
    body: string
  }[]
  checklist: readonly string[]
  sources: readonly {
    label: string
    href: string
    note: string
  }[]
  /** Intentional social creative — not auto-derived from title. */
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}
