import type { Metadata } from "next"

import { SkillCheckPage } from "@/components/skill-check/skill-check-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { skillCheck } from "@/lib/seo/skill-check"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: skillCheck.seoTitle },
  description: skillCheck.description,
  /**
   * No Markdown alternate. The twins render a content page as an article, and
   * this page is a tool; the Markdown an agent wants here is the report
   * itself, served by /api/check with format=md.
   */
  alternates: { canonical: skillCheck.path },
  openGraph: {
    type: "website",
    url: skillCheck.path,
    title: skillCheck.socialTitle,
    description: skillCheck.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [
      {
        url: `${skillCheck.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: skillCheck.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: skillCheck.socialTitle,
    description: skillCheck.description,
    images: [
      {
        url: `${skillCheck.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: skillCheck.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <SkillCheckPage entry={skillCheck} />
}
