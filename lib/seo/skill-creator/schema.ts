import { OG_SIZE } from "@/lib/og/size"
import {
  organizationId,
  organizationLogoNode,
  organizationNode,
} from "@/lib/seo/organization"
import { absoluteUrl, siteConfig } from "@/lib/site"

/**
 * The shape the tool page exposes to be described in JSON-LD. Structural on
 * purpose, the same way resource-article-schema works: the content module
 * keeps its own definition type and satisfies this without importing
 * anything from here.
 */
export interface SkillCreatorSchemaEntry {
  path: string
  eyebrow: string
  title: string
  description: string
  ogAlt: string
  sources: readonly { href: string }[]
  faq: readonly { question: string; answer: string }[]
}

/**
 * WebApplication rather than TechArticle.
 *
 * The other marketing pages describe themselves as articles because that is
 * what they are. This one is a generator that runs in the browser, and
 * describing it as an article would claim the wrong thing about the page. The
 * FAQ and the breadcrumb are the same nodes every other page emits.
 */
export function buildSkillCreatorSchema(entry: SkillCreatorSchemaEntry) {
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
        "@type": "WebApplication",
        "@id": `${pageUrl}#tool`,
        url: pageUrl,
        name: entry.title,
        description: entry.description,
        applicationCategory: "DeveloperApplication",
        browserRequirements: "Requires JavaScript",
        operatingSystem: "Any",
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        image: { "@id": imageId },
        citation: entry.sources.map((source) => source.href),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
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
            name: entry.eyebrow,
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
