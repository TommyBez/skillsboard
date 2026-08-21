import type { Metadata } from "next"

import { OpencodeSkillsPage } from "@/components/opencode-skills/opencode-skills-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { opencodeSkills } from "@/lib/seo/opencode-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "OpenCode skills, explained"

export const metadata: Metadata = {
  title: { absolute: opencodeSkills.seoTitle },
  description: opencodeSkills.description,
  alternates: { canonical: opencodeSkills.path },
  openGraph: {
    type: "article",
    url: opencodeSkills.path,
    title: socialTitle,
    description: opencodeSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: opencodeSkills.publishedAt,
    modifiedTime: opencodeSkills.modifiedAt,
    images: [
      {
        url: `${opencodeSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: opencodeSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: opencodeSkills.description,
    images: [
      {
        url: `${opencodeSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: opencodeSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <OpencodeSkillsPage entry={opencodeSkills} />
}
