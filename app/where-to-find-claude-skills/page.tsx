import type { Metadata } from "next"

import { WhereToFindClaudeSkillsPage } from "@/components/where-to-find-claude-skills/where-to-find-claude-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { siteConfig } from "@/lib/site"
import { whereToFindClaudeSkills } from "@/lib/seo/where-to-find-claude-skills"

const socialTitle = "Where to find Claude skills"

export const metadata: Metadata = {
  title: { absolute: whereToFindClaudeSkills.seoTitle },
  description: whereToFindClaudeSkills.description,
  alternates: markdownTwinAlternates(whereToFindClaudeSkills.path),
  openGraph: {
    type: "article",
    url: whereToFindClaudeSkills.path,
    title: socialTitle,
    description: whereToFindClaudeSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: whereToFindClaudeSkills.publishedAt,
    modifiedTime: whereToFindClaudeSkills.modifiedAt,
    images: [
      {
        url: `${whereToFindClaudeSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: whereToFindClaudeSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: whereToFindClaudeSkills.description,
    images: [
      {
        url: `${whereToFindClaudeSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: whereToFindClaudeSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <WhereToFindClaudeSkillsPage entry={whereToFindClaudeSkills} />
}
