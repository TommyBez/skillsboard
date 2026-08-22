import type { Metadata } from "next"

import { CopilotSkillsPage } from "@/components/copilot-skills/copilot-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { copilotSkills } from "@/lib/seo/copilot-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "GitHub Copilot skills: what Copilot supports"

export const metadata: Metadata = {
  title: { absolute: copilotSkills.seoTitle },
  description: copilotSkills.description,
  alternates: markdownTwinAlternates(copilotSkills.path),
  openGraph: {
    type: "article",
    url: copilotSkills.path,
    title: socialTitle,
    description: copilotSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: copilotSkills.publishedAt,
    modifiedTime: copilotSkills.modifiedAt,
    images: [
      {
        url: `${copilotSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: copilotSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: copilotSkills.description,
    images: [
      {
        url: `${copilotSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: copilotSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <CopilotSkillsPage entry={copilotSkills} />
}
