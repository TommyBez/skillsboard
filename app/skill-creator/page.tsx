import type { Metadata } from "next"

import { SkillCreatorPage } from "@/components/skill-creator/skill-creator-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { skillCreator } from "@/lib/seo/skill-creator"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: { absolute: skillCreator.seoTitle },
  description: skillCreator.description,
  /**
   * No Markdown alternate. The twins are built from the content registries and
   * render a page as an article; this page is a generator, and the article an
   * agent should be handed for the same question is the SKILL.md guide.
   */
  alternates: { canonical: skillCreator.path },
  openGraph: {
    type: "website",
    url: skillCreator.path,
    title: skillCreator.socialTitle,
    description: skillCreator.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [
      {
        url: `${skillCreator.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: skillCreator.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: skillCreator.socialTitle,
    description: skillCreator.description,
    images: [
      {
        url: `${skillCreator.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: skillCreator.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <SkillCreatorPage entry={skillCreator} />
}
