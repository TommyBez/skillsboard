import type { Metadata } from "next"

import { CoworkSkillsPage } from "@/components/cowork-skills/cowork-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { coworkSkills } from "@/lib/seo/cowork-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Claude Cowork skills"

export const metadata: Metadata = {
  title: { absolute: coworkSkills.seoTitle },
  description: coworkSkills.description,
  alternates: markdownTwinAlternates(coworkSkills.path),
  openGraph: {
    type: "article",
    url: coworkSkills.path,
    title: socialTitle,
    description: coworkSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: coworkSkills.publishedAt,
    modifiedTime: coworkSkills.modifiedAt,
    images: [
      {
        url: `${coworkSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: coworkSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: coworkSkills.description,
    images: [
      {
        url: `${coworkSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: coworkSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <CoworkSkillsPage entry={coworkSkills} />
}
