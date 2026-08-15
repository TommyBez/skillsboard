import type { Metadata } from "next"

import { ClaudeSkillsPage } from "@/components/claude-skills/claude-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { claudeSkills } from "@/lib/seo/claude-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Claude Skills, explained"

export const metadata: Metadata = {
  title: { absolute: claudeSkills.seoTitle },
  description: claudeSkills.description,
  alternates: markdownTwinAlternates(claudeSkills.path),
  openGraph: {
    type: "article",
    url: claudeSkills.path,
    title: socialTitle,
    description: claudeSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: claudeSkills.publishedAt,
    modifiedTime: claudeSkills.modifiedAt,
    images: [
      {
        url: `${claudeSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: claudeSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: claudeSkills.description,
    images: [
      {
        url: `${claudeSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: claudeSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <ClaudeSkillsPage entry={claudeSkills} />
}
