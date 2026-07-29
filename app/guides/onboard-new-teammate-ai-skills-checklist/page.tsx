import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { onboardNewTeammateSkillsGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "AI Skills Onboarding Checklist for New Teammates | Skills Board" },
  description: onboardNewTeammateSkillsGuide.description,
  alternates: { canonical: onboardNewTeammateSkillsGuide.path },
  openGraph: {
    type: "article",
    url: onboardNewTeammateSkillsGuide.path,
    title: onboardNewTeammateSkillsGuide.title,
    description: onboardNewTeammateSkillsGuide.description,
    publishedTime: onboardNewTeammateSkillsGuide.publishedAt,
    modifiedTime: onboardNewTeammateSkillsGuide.modifiedAt,
  },
  twitter: {
    card: "summary_large_image",
    title: onboardNewTeammateSkillsGuide.title,
    description: onboardNewTeammateSkillsGuide.description,
  },
}

export default function OnboardNewTeammateSkillsPage() {
  return <GuidePage guide={onboardNewTeammateSkillsGuide} />
}
