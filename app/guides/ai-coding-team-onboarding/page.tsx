import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { aiCodingTeamOnboardingGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "AI Coding Team Onboarding Guide | Skills Board" },
  description: aiCodingTeamOnboardingGuide.description,
  alternates: { canonical: aiCodingTeamOnboardingGuide.path },
  openGraph: {
    type: "article",
    url: aiCodingTeamOnboardingGuide.path,
    title: aiCodingTeamOnboardingGuide.title,
    description: aiCodingTeamOnboardingGuide.description,
    publishedTime: aiCodingTeamOnboardingGuide.publishedAt,
    modifiedTime: aiCodingTeamOnboardingGuide.modifiedAt,
  },
}

export default function AiCodingTeamOnboardingPage() {
  return <GuidePage guide={aiCodingTeamOnboardingGuide} />
}
