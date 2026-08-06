import type { Metadata } from "next"

import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import type { GuideDefinition } from "@/lib/seo/guides"
import { siteConfig } from "@/lib/site"

export function buildGuideMetadata(guide: GuideDefinition): Metadata {
  const openGraphImage = {
    url: `${guide.path}/opengraph-image`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: guide.ogAlt,
  }
  const twitterImage = {
    url: `${guide.path}/twitter-image`,
    width: TWITTER_SIZE.width,
    height: TWITTER_SIZE.height,
    alt: guide.ogAlt,
  }

  return {
    title: { absolute: guide.seoTitle },
    description: guide.description,
    alternates: { canonical: guide.path },
    openGraph: {
      type: "article",
      url: guide.path,
      title: guide.title,
      description: guide.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.modifiedAt,
      images: [openGraphImage],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [twitterImage],
    },
  }
}
