import type { Metadata } from "next"

import { AnthropicSkillsPage } from "@/components/anthropic-skills/anthropic-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { anthropicSkills } from "@/lib/seo/anthropic-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Anthropic skills"

export const metadata: Metadata = {
  title: { absolute: anthropicSkills.seoTitle },
  description: anthropicSkills.description,
  alternates: markdownTwinAlternates(anthropicSkills.path),
  openGraph: {
    type: "article",
    url: anthropicSkills.path,
    title: socialTitle,
    description: anthropicSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: anthropicSkills.publishedAt,
    modifiedTime: anthropicSkills.modifiedAt,
    images: [
      {
        url: `${anthropicSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: anthropicSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: anthropicSkills.description,
    images: [
      {
        url: `${anthropicSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: anthropicSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <AnthropicSkillsPage entry={anthropicSkills} />
}
