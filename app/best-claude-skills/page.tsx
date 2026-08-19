import type { Metadata } from "next"

import { BestClaudeSkillsPage } from "@/components/best-claude-skills/best-claude-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { bestClaudeSkills } from "@/lib/seo/best-claude-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Best Claude skills"

export const metadata: Metadata = {
  title: { absolute: bestClaudeSkills.seoTitle },
  description: bestClaudeSkills.description,
  alternates: markdownTwinAlternates(bestClaudeSkills.path),
  openGraph: {
    type: "article",
    url: bestClaudeSkills.path,
    title: socialTitle,
    description: bestClaudeSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: bestClaudeSkills.publishedAt,
    modifiedTime: bestClaudeSkills.modifiedAt,
    images: [
      {
        url: `${bestClaudeSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: bestClaudeSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: bestClaudeSkills.description,
    images: [
      {
        url: `${bestClaudeSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: bestClaudeSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <BestClaudeSkillsPage entry={bestClaudeSkills} />
}
