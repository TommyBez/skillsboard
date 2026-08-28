import { OG_SIZE } from "@/lib/og/size"
import {
  organizationId,
  organizationLogoNode,
  organizationNode,
} from "@/lib/seo/organization"
import { resourcePaths } from "@/lib/seo/resources"
import { absoluteUrl, siteConfig } from "@/lib/site"

/**
 * The shape a resource article has to expose to be described in JSON-LD.
 * Structural on purpose: each article keeps its own definition type and
 * satisfies this without importing anything from here.
 */
export interface ResourceArticleSchemaEntry {
  path: string
  eyebrow: string
  title: string
  description: string
  publishedAt: string
  modifiedAt: string
  ogAlt: string
  sources: readonly { href: string }[]
  faq: readonly { question: string; answer: string }[]
}

/** TechArticle, FAQPage, and BreadcrumbList for a top-level resource article. */
export function buildResourceArticleSchema(entry: ResourceArticleSchemaEntry) {
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(entry.path)
  const imageId = `${pageUrl}#primaryimage`
  const imageUrl = absoluteUrl(`${entry.path}/opengraph-image`)

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
        "@id": imageId,
        url: imageUrl,
        contentUrl: imageUrl,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        caption: entry.ogAlt,
      },
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        url: pageUrl,
        headline: entry.title,
        description: entry.description,
        datePublished: entry.publishedAt,
        dateModified: entry.modifiedAt,
        inLanguage: "en",
        mainEntityOfPage: pageUrl,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
        image: { "@id": imageId },
        thumbnailUrl: imageUrl,
        citation: entry.sources.map((source) => source.href),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        isPartOf: { "@id": websiteId },
        mainEntity: entry.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
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
            name: entry.title,
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
