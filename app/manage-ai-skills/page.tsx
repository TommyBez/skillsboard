import type { Metadata } from "next"

import { ManageAiSkillsPage } from "@/components/manage-ai-skills/manage-ai-skills-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { manageAiSkills } from "@/lib/seo/manage-ai-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Manage AI skills across an organization"

export const metadata: Metadata = {
  title: { absolute: manageAiSkills.seoTitle },
  description: manageAiSkills.description,
  alternates: markdownTwinAlternates(manageAiSkills.path),
  openGraph: {
    type: "article",
    url: manageAiSkills.path,
    title: socialTitle,
    description: manageAiSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: manageAiSkills.publishedAt,
    modifiedTime: manageAiSkills.modifiedAt,
    images: [
      {
        url: `${manageAiSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: manageAiSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: manageAiSkills.description,
    images: [
      {
        url: `${manageAiSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: manageAiSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <ManageAiSkillsPage entry={manageAiSkills} />
}
