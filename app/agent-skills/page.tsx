import type { Metadata } from "next"

import { AgentSkillsPage } from "@/components/agent-skills/agent-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkills } from "@/lib/seo/agent-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Agent Skills: the open standard"

export const metadata: Metadata = {
  title: { absolute: agentSkills.seoTitle },
  description: agentSkills.description,
  alternates: markdownTwinAlternates(agentSkills.path),
  openGraph: {
    type: "article",
    url: agentSkills.path,
    title: socialTitle,
    description: agentSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: agentSkills.publishedAt,
    modifiedTime: agentSkills.modifiedAt,
    images: [
      {
        url: `${agentSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: agentSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: agentSkills.description,
    images: [
      {
        url: `${agentSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: agentSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AgentSkillsPage entry={agentSkills} />
}
