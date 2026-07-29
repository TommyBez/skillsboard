import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { chooseFirstTeamSkillGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "Choose Your Team’s First AI Agent Skill | Skills Board" },
  description: chooseFirstTeamSkillGuide.description,
  alternates: { canonical: chooseFirstTeamSkillGuide.path },
  openGraph: {
    type: "article",
    url: chooseFirstTeamSkillGuide.path,
    title: chooseFirstTeamSkillGuide.title,
    description: chooseFirstTeamSkillGuide.description,
    publishedTime: chooseFirstTeamSkillGuide.publishedAt,
    modifiedTime: chooseFirstTeamSkillGuide.modifiedAt,
  },
  twitter: {
    card: "summary_large_image",
    title: chooseFirstTeamSkillGuide.title,
    description: chooseFirstTeamSkillGuide.description,
  },
}

export default function ChooseFirstTeamSkillPage() {
  return <GuidePage guide={chooseFirstTeamSkillGuide} />
}
