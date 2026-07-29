import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { aiSkillUseCasesGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "AI Agent Skill Use Cases for Teams | Skills Board" },
  description: aiSkillUseCasesGuide.description,
  alternates: { canonical: aiSkillUseCasesGuide.path },
  openGraph: {
    type: "article",
    url: aiSkillUseCasesGuide.path,
    title: aiSkillUseCasesGuide.title,
    description: aiSkillUseCasesGuide.description,
    publishedTime: aiSkillUseCasesGuide.publishedAt,
    modifiedTime: aiSkillUseCasesGuide.modifiedAt,
  },
  twitter: {
    card: "summary_large_image",
    title: aiSkillUseCasesGuide.title,
    description: aiSkillUseCasesGuide.description,
  },
}

export default function AiSkillUseCasesPage() {
  return <GuidePage guide={aiSkillUseCasesGuide} />
}
