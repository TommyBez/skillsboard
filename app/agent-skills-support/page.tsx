import type { Metadata } from "next"

import { AgentSkillsSupportPage } from "@/components/agent-skills-support/agent-skills-support-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsSupport } from "@/lib/seo/agent-skills-support"
import { siteConfig } from "@/lib/site"

const socialTitle = "Which AI clients read SKILL.md"

export const metadata: Metadata = {
  title: { absolute: agentSkillsSupport.seoTitle },
  description: agentSkillsSupport.description,
  alternates: markdownTwinAlternates(agentSkillsSupport.path),
  openGraph: {
    type: "article",
    url: agentSkillsSupport.path,
    title: socialTitle,
    description: agentSkillsSupport.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: agentSkillsSupport.publishedAt,
    modifiedTime: agentSkillsSupport.modifiedAt,
    images: [
      {
        url: `${agentSkillsSupport.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: agentSkillsSupport.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: agentSkillsSupport.description,
    images: [
      {
        url: `${agentSkillsSupport.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: agentSkillsSupport.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AgentSkillsSupportPage entry={agentSkillsSupport} />
}
