import type { Metadata } from "next"

import { AgentSkillsAdoptionPage } from "@/components/agent-skills-adoption/agent-skills-adoption-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsAdoption } from "@/lib/seo/agent-skills-adoption"
import { siteConfig } from "@/lib/site"

const socialTitle = "Agent skills adoption: the numbers"

export const metadata: Metadata = {
  title: { absolute: agentSkillsAdoption.seoTitle },
  description: agentSkillsAdoption.description,
  alternates: markdownTwinAlternates(agentSkillsAdoption.path),
  openGraph: {
    type: "article",
    url: agentSkillsAdoption.path,
    title: socialTitle,
    description: agentSkillsAdoption.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: agentSkillsAdoption.publishedAt,
    modifiedTime: agentSkillsAdoption.modifiedAt,
    images: [
      {
        url: `${agentSkillsAdoption.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: agentSkillsAdoption.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: agentSkillsAdoption.description,
    images: [
      {
        url: `${agentSkillsAdoption.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: agentSkillsAdoption.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AgentSkillsAdoptionPage entry={agentSkillsAdoption} />
}
