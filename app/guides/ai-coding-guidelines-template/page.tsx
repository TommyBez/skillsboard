import type { Metadata } from "next"

import { GuidePage } from "@/components/guides/guide-page"
import { aiCodingGuidelinesTemplateGuide } from "@/lib/seo/guides"

export const metadata: Metadata = {
  title: { absolute: "AI Coding Guidelines Template for Teams | Skills Board" },
  description: aiCodingGuidelinesTemplateGuide.description,
  alternates: { canonical: aiCodingGuidelinesTemplateGuide.path },
  openGraph: {
    type: "article",
    url: aiCodingGuidelinesTemplateGuide.path,
    title: aiCodingGuidelinesTemplateGuide.title,
    description: aiCodingGuidelinesTemplateGuide.description,
    publishedTime: aiCodingGuidelinesTemplateGuide.publishedAt,
    modifiedTime: aiCodingGuidelinesTemplateGuide.modifiedAt,
  },
  twitter: {
    card: "summary_large_image",
    title: aiCodingGuidelinesTemplateGuide.title,
    description: aiCodingGuidelinesTemplateGuide.description,
  },
}

export default function AiCodingGuidelinesTemplatePage() {
  return <GuidePage guide={aiCodingGuidelinesTemplateGuide} />
}
