import type { Metadata } from "next"

import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import {
  compareIndexDescription,
  compareIndexOgAlt,
  compareIndexPath,
  compareIndexSeoTitle,
  type ComparisonDefinition,
} from "@/lib/seo/compare"
import { siteConfig } from "@/lib/site"

function socialImages(path: string, alt: string) {
  return {
    openGraph: [
      {
        url: `${path}/opengraph-image`,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        alt,
      },
    ],
    twitter: [
      {
        url: `${path}/twitter-image`,
        width: TWITTER_SIZE.width,
        height: TWITTER_SIZE.height,
        alt,
      },
    ],
  }
}

export function buildComparisonMetadata(
  entry: ComparisonDefinition,
): Metadata {
  const images = socialImages(entry.path, entry.ogAlt)

  return {
    title: { absolute: entry.seoTitle },
    description: entry.description,
    alternates: { canonical: entry.path },
    openGraph: {
      type: "article",
      url: entry.path,
      title: entry.socialTitle,
      description: entry.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      publishedTime: entry.publishedAt,
      modifiedTime: entry.modifiedAt,
      images: images.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.socialTitle,
      description: entry.description,
      images: images.twitter,
    },
  }
}

const indexSocialTitle = "AI agent primitives, compared"

export function buildCompareIndexMetadata(): Metadata {
  const images = socialImages(compareIndexPath, compareIndexOgAlt)

  return {
    title: { absolute: compareIndexSeoTitle },
    description: compareIndexDescription,
    alternates: { canonical: compareIndexPath },
    openGraph: {
      type: "website",
      url: compareIndexPath,
      title: indexSocialTitle,
      description: compareIndexDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: images.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: indexSocialTitle,
      description: compareIndexDescription,
      images: images.twitter,
    },
  }
}
