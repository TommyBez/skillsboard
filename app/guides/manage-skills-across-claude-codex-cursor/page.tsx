import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { manageCrossAgentSkillsGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "Manage Claude Code, Codex & Cursor Skills | Skills Board" },
  description: manageCrossAgentSkillsGuide.description,
  alternates: { canonical: manageCrossAgentSkillsGuide.path },
  openGraph: {
    type: "article",
    url: manageCrossAgentSkillsGuide.path,
    title: manageCrossAgentSkillsGuide.title,
    description: manageCrossAgentSkillsGuide.description,
    publishedTime: manageCrossAgentSkillsGuide.publishedAt,
    modifiedTime: manageCrossAgentSkillsGuide.modifiedAt,
  },
}

export default function ManageSkillsAcrossClaudeCodexCursorPage() {
  return <GuidePage guide={manageCrossAgentSkillsGuide} />
}
