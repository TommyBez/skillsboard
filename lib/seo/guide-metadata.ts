import type { Metadata } from "next"

import type { GuideDefinition } from "@/lib/seo/guides"

export function buildGuideMetadata(guide: GuideDefinition): Metadata {
  return {
    title: { absolute: guide.seoTitle },
    description: guide.description,
    alternates: { canonical: guide.path },
    openGraph: {
      type: "article",
      url: guide.path,
      title: guide.title,
      description: guide.description,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.modifiedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  }
}
