import type { Metadata } from "next"

import { SkillExamplesPage } from "@/components/skill-examples/skill-examples-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { skillExamples } from "@/lib/seo/skill-examples"
import { siteConfig } from "@/lib/site"

const socialTitle = "Skill examples: eight real SKILL.md files"

export const metadata: Metadata = {
  title: { absolute: skillExamples.seoTitle },
  description: skillExamples.description,
  alternates: markdownTwinAlternates(skillExamples.path),
  openGraph: {
    type: "article",
    url: skillExamples.path,
    title: socialTitle,
    description: skillExamples.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: skillExamples.publishedAt,
    modifiedTime: skillExamples.modifiedAt,
    images: [
      {
        url: `${skillExamples.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: skillExamples.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: skillExamples.description,
    images: [
      {
        url: `${skillExamples.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: skillExamples.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <SkillExamplesPage entry={skillExamples} />
}
