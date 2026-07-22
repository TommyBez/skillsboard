import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { shareTeamSkillsGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: "How to Share AI Agent Skills With Your Team",
  description: shareTeamSkillsGuide.description,
  alternates: { canonical: shareTeamSkillsGuide.path },
  openGraph: {
    type: "article",
    url: shareTeamSkillsGuide.path,
    title: shareTeamSkillsGuide.title,
    description: shareTeamSkillsGuide.description,
    publishedTime: shareTeamSkillsGuide.publishedAt,
    modifiedTime: shareTeamSkillsGuide.modifiedAt,
  },
}

export default function ShareAgentSkillsWithYourTeamPage() {
  return <GuidePage guide={shareTeamSkillsGuide} />
}
