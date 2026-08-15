import type { Metadata } from "next"

import { CodexSkillsPage } from "@/components/codex-skills/codex-skills-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { codexSkills } from "@/lib/seo/codex-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Codex skills, explained"

export const metadata: Metadata = {
  title: { absolute: codexSkills.seoTitle },
  description: codexSkills.description,
  alternates: { canonical: codexSkills.path },
  openGraph: {
    type: "article",
    url: codexSkills.path,
    title: socialTitle,
    description: codexSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: codexSkills.publishedAt,
    modifiedTime: codexSkills.modifiedAt,
    images: [
      {
        url: `${codexSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: codexSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: codexSkills.description,
    images: [
      {
        url: `${codexSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: codexSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <CodexSkillsPage entry={codexSkills} />
}
