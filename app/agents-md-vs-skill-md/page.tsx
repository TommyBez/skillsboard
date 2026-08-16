import type { Metadata } from "next"

import { AgentsMdVsSkillMdPage } from "@/components/agents-md-vs-skill-md/agents-md-vs-skill-md-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { agentsMdVsSkillMd } from "@/lib/seo/agents-md-vs-skill-md"
import { siteConfig } from "@/lib/site"

const socialTitle = "AGENTS.md vs SKILL.md"

export const metadata: Metadata = {
  title: { absolute: agentsMdVsSkillMd.seoTitle },
  description: agentsMdVsSkillMd.description,
  alternates: markdownTwinAlternates(agentsMdVsSkillMd.path),
  openGraph: {
    type: "article",
    url: agentsMdVsSkillMd.path,
    title: socialTitle,
    description: agentsMdVsSkillMd.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: agentsMdVsSkillMd.publishedAt,
    modifiedTime: agentsMdVsSkillMd.modifiedAt,
    images: [
      {
        url: `${agentsMdVsSkillMd.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: agentsMdVsSkillMd.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: agentsMdVsSkillMd.description,
    images: [
      {
        url: `${agentsMdVsSkillMd.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: agentsMdVsSkillMd.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AgentsMdVsSkillMdPage entry={agentsMdVsSkillMd} />
}
