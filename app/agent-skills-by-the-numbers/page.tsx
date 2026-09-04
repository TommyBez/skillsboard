import type { Metadata } from "next"

import { AgentSkillsByTheNumbersPage } from "@/components/agent-skills-by-the-numbers/agent-skills-by-the-numbers-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { agentSkillsByTheNumbers } from "@/lib/seo/agent-skills-by-the-numbers"
import { siteConfig } from "@/lib/site"

const socialTitle = "Agent skills by the numbers"

export const metadata: Metadata = {
  title: { absolute: agentSkillsByTheNumbers.seoTitle },
  description: agentSkillsByTheNumbers.description,
  alternates: markdownTwinAlternates(agentSkillsByTheNumbers.path),
  openGraph: {
    type: "article",
    url: agentSkillsByTheNumbers.path,
    title: socialTitle,
    description: agentSkillsByTheNumbers.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: agentSkillsByTheNumbers.publishedAt,
    modifiedTime: agentSkillsByTheNumbers.modifiedAt,
    images: [
      {
        url: `${agentSkillsByTheNumbers.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: agentSkillsByTheNumbers.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: agentSkillsByTheNumbers.description,
    images: [
      {
        url: `${agentSkillsByTheNumbers.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: agentSkillsByTheNumbers.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AgentSkillsByTheNumbersPage entry={agentSkillsByTheNumbers} />
}
