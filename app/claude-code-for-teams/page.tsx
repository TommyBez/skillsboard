import type { Metadata } from "next"

import { ClaudeCodeForTeamsPage } from "@/components/claude-code-for-teams/claude-code-for-teams-page"
import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import { claudeCodeForTeams } from "@/lib/seo/claude-code-for-teams"
import { siteConfig } from "@/lib/site"

const socialTitle = "Claude Code for teams: what a rollout configures"

export const metadata: Metadata = {
  title: { absolute: claudeCodeForTeams.seoTitle },
  description: claudeCodeForTeams.description,
  alternates: markdownTwinAlternates(claudeCodeForTeams.path),
  openGraph: {
    type: "article",
    url: claudeCodeForTeams.path,
    title: socialTitle,
    description: claudeCodeForTeams.description,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    publishedTime: claudeCodeForTeams.publishedAt,
    modifiedTime: claudeCodeForTeams.modifiedAt,
    images: [
      {
        url: `${claudeCodeForTeams.path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt: claudeCodeForTeams.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: claudeCodeForTeams.description,
    images: [
      {
        url: `${claudeCodeForTeams.path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt: claudeCodeForTeams.ogAlt,
      },
    ],
  },
}

export default function Page() {
  return <ClaudeCodeForTeamsPage entry={claudeCodeForTeams} />
}
