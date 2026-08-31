import type { Metadata } from "next"

import { markdownTwinAlternates } from "@/lib/markdown/twins"
import { OG_SIZE, TWITTER_SIZE } from "@/lib/og/template"
import {
  alternativesIndexDescription,
  alternativesIndexOgAlt,
  alternativesIndexPath,
  type AlternativeDefinition,
} from "@/lib/seo/alternatives"
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

export function buildAlternativeMetadata(
  entry: AlternativeDefinition,
): Metadata {
  const images = socialImages(entry.path, entry.ogAlt)

  return {
    title: { absolute: entry.seoTitle },
    description: entry.description,
    alternates: markdownTwinAlternates(entry.path),
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

const indexSocialTitle = "Skills Board alternatives, compared"

export function buildAlternativesIndexMetadata(): Metadata {
  const images = socialImages(alternativesIndexPath, alternativesIndexOgAlt)

  return {
    title: {
      absolute:
        "Skills Board Alternatives: Honest Comparisons for Team AI Skills",
    },
    description: alternativesIndexDescription,
    alternates: markdownTwinAlternates(alternativesIndexPath),
    openGraph: {
      type: "website",
      url: alternativesIndexPath,
      title: indexSocialTitle,
      description: alternativesIndexDescription,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: images.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      title: indexSocialTitle,
      description: alternativesIndexDescription,
      images: images.twitter,
    },
  }
}
