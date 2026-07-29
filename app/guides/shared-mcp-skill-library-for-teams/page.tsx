import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { sharedMcpSkillLibraryGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "Shared MCP Skill Library for Teams | Skills Board" },
  description: sharedMcpSkillLibraryGuide.description,
  alternates: { canonical: sharedMcpSkillLibraryGuide.path },
  openGraph: {
    type: "article",
    url: sharedMcpSkillLibraryGuide.path,
    title: sharedMcpSkillLibraryGuide.title,
    description: sharedMcpSkillLibraryGuide.description,
    publishedTime: sharedMcpSkillLibraryGuide.publishedAt,
    modifiedTime: sharedMcpSkillLibraryGuide.modifiedAt,
  },
  twitter: {
    card: "summary_large_image",
    title: sharedMcpSkillLibraryGuide.title,
    description: sharedMcpSkillLibraryGuide.description,
  },
}

export default function SharedMcpSkillLibraryPage() {
  return <GuidePage guide={sharedMcpSkillLibraryGuide} />
}
