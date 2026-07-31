import { aiCodingGuidelinesTemplateGuide } from "@/lib/seo/guides/content/ai-coding-guidelines-template"
import { aiCodingTeamOnboardingGuide } from "@/lib/seo/guides/content/ai-coding-team-onboarding"
import { aiSkillUseCasesGuide } from "@/lib/seo/guides/content/ai-skill-use-cases"
import { chooseFirstTeamSkillGuide } from "@/lib/seo/guides/content/choose-first-team-skill"
import { manageCrossAgentSkillsGuide } from "@/lib/seo/guides/content/manage-cross-agent-skills"
import { onboardNewTeammateSkillsGuide } from "@/lib/seo/guides/content/onboard-new-teammate-skills"
import { shareTeamSkillsGuide } from "@/lib/seo/guides/content/share-team-skills"
import { sharedMcpSkillLibraryGuide } from "@/lib/seo/guides/content/shared-mcp-skill-library"
import type { GuideDefinition, GuidePath, GuideSlug } from "@/lib/seo/guides/types"

export {
  guidePaths,
  type GuideDefinition,
  type GuidePath,
  type GuideSlug,
} from "@/lib/seo/guides/types"

export {
  aiCodingGuidelinesTemplateGuide,
  aiCodingTeamOnboardingGuide,
  aiSkillUseCasesGuide,
  chooseFirstTeamSkillGuide,
  manageCrossAgentSkillsGuide,
  onboardNewTeammateSkillsGuide,
  shareTeamSkillsGuide,
  sharedMcpSkillLibraryGuide,
}

export const guides = [
  sharedMcpSkillLibraryGuide,
  aiSkillUseCasesGuide,
  onboardNewTeammateSkillsGuide,
  chooseFirstTeamSkillGuide,
  aiCodingGuidelinesTemplateGuide,
  aiCodingTeamOnboardingGuide,
  shareTeamSkillsGuide,
  manageCrossAgentSkillsGuide,
] as const satisfies readonly GuideDefinition[]

export function slugFromPath(guidePath: GuidePath): GuideSlug {
  return guidePath.slice("/guides/".length) as GuideSlug
}

export const guidesBySlug = new Map<GuideSlug, GuideDefinition>(
  guides.map((guide) => [slugFromPath(guide.path), guide]),
)

export const guidesByPath = new Map<GuidePath, GuideDefinition>(
  guides.map((guide) => [guide.path, guide]),
)

export function getGuideBySlug(slug: string): GuideDefinition | undefined {
  return guidesBySlug.get(slug as GuideSlug)
}

export function getGuideByPath(guidePath: string): GuideDefinition | undefined {
  return guidesByPath.get(guidePath as GuidePath)
}

export function getGuide(slugOrPath: string): GuideDefinition | undefined {
  if (slugOrPath.startsWith("/guides/")) {
    return getGuideByPath(slugOrPath)
  }
  return getGuideBySlug(slugOrPath)
}
