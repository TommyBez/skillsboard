import type { Metadata } from "next"

import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { VercelSkillsPage } from "@/components/vercel-skills/vercel-skills-page"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { vercelSkills } from "@/lib/seo/vercel-skills"
import { siteConfig } from "@/lib/site"

const socialTitle = "Vercel skills, explained"

export const metadata: Metadata = {
  title: { absolute: vercelSkills.seoTitle },
  description: vercelSkills.description,
  alternates: markdownTwinAlternates(vercelSkills.path),
  openGraph: {
    type: "article",
    url: vercelSkills.path,
    title: socialTitle,
    description: vercelSkills.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: vercelSkills.publishedAt,
    modifiedTime: vercelSkills.modifiedAt,
    images: [
      {
        url: `${vercelSkills.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: vercelSkills.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: vercelSkills.description,
    images: [
      {
        url: `${vercelSkills.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: vercelSkills.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <VercelSkillsPage entry={vercelSkills} />
}
