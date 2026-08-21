import type { Metadata } from "next"

import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { CursorSkillsPage } from "@/components/cursor-skills/cursor-skills-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { cursorSkills } from "@/lib/seo/cursor-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Cursor skills, explained"

export const metadata: Metadata = {
  title: { absolute: cursorSkills.seoTitle },
  description: cursorSkills.description,
  alternates: markdownTwinAlternates(cursorSkills.path),
  openGraph: {
    type: "article",
    url: cursorSkills.path,
    title: socialTitle,
    description: cursorSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: cursorSkills.publishedAt,
    modifiedTime: cursorSkills.modifiedAt,
    images: [
      {
        url: `${cursorSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: cursorSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: cursorSkills.description,
    images: [
      {
        url: `${cursorSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: cursorSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <CursorSkillsPage entry={cursorSkills} />
}
