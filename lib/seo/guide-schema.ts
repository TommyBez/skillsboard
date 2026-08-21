import type { GuideDefinition } from "@/lib/seo/guides"
import { OG_SIZE } from "@/lib/og/size"
import { resourcePaths } from "@/lib/seo/resources"
import {
  organizationId,
  organizationLogoNode,
  organizationNode,
} from "@/lib/seo/organization"
import { absoluteUrl, siteConfig } from "@/lib/site"

/** Anchor of the nth workflow step, shared by the page markup and HowTo. */
export function stepAnchorId(index: number): string {
  return `step-${index + 1}`
}

export function buildGuideSchema(guide: GuideDefinition) {
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(guide.path)
  const articleImageId = `${pageUrl}#primaryimage`
  const articleImageUrl = absoluteUrl(`${guide.path}/opengraph-image`)

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationNode(),
      organizationLogoNode(),
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "ImageObject",
        "@id": articleImageId,
        url: articleImageUrl,
        contentUrl: articleImageUrl,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        caption: guide.ogAlt,
      },
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.modifiedAt,
        inLanguage: "en",
        mainEntityOfPage: pageUrl,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
        image: { "@id": articleImageId },
        thumbnailUrl: articleImageUrl,
        citation: guide.sources.map((source) => source.href),
      },
      /**
       * Only an ordered procedure is published as a HowTo. A guide whose steps
       * are independent alternatives would otherwise be read as positions in
       * one procedure, which is not what the page says.
       */
      ...(guide.stepsAreSequential
        ? [
            {
              "@type": "HowTo",
              "@id": `${pageUrl}#howto`,
              name: guide.stepsTitle,
              description: guide.stepsIntro,
              inLanguage: "en",
              mainEntityOfPage: pageUrl,
              isPartOf: { "@id": websiteId },
              step: guide.steps.map((step, index) => ({
                "@type": "HowToStep",
                position: index + 1,
                name: step.title,
                text: step.body,
                url: `${pageUrl}#${stepAnchorId(index)}`,
              })),
            },
          ]
        : []),
      ...(guide.faq?.length
        ? [
            {
              "@type": "FAQPage",
              "@id": `${pageUrl}#faq`,
              isPartOf: { "@id": websiteId },
              mainEntity: guide.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: { "@type": "Answer", text: item.answer },
              })),
            },
          ]
        : []),
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: siteConfig.name,
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Resources",
            item: absoluteUrl(resourcePaths.index),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: pageUrl,
          },
        ],
      },
    ],
  }
}
