import { OG_SIZE } from "@/lib/og/template"
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
  const organizationId = absoluteUrl("/#organization")
  const websiteId = absoluteUrl("/#website")
  const logoId = absoluteUrl("/#logo")
  const logoUrl = absoluteUrl("/apple-icon.png")
  const pageUrl = absoluteUrl(entry.path)
  const imageId = `${pageUrl}#primaryimage`
  const imageUrl = absoluteUrl(`${entry.path}/opengraph-image`)

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        logo: { "@id": logoId },
        sameAs: [siteConfig.githubUrl],
      },
      {
        "@type": "ImageObject",
        "@id": logoId,
        url: logoUrl,
        contentUrl: logoUrl,
        width: 180,
        height: 180,
        caption: `${siteConfig.name} logo`,
      },
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
            name: entry.eyebrow,
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
