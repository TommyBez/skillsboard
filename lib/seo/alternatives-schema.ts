import { OG_SIZE } from "@/lib/og/template"
import {
  alternatives,
  alternativesIndexDescription,
  alternativesIndexPath,
  type AlternativeDefinition,
} from "@/lib/seo/alternatives"
import { absoluteUrl, siteConfig } from "@/lib/site"

const organizationId = absoluteUrl("/#organization")
const websiteId = absoluteUrl("/#website")
const logoId = absoluteUrl("/#logo")
const logoUrl = absoluteUrl("/apple-icon.png")

function sharedGraphNodes() {
  return [
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
  ] as const
}

export function buildAlternativeSchema(entry: AlternativeDefinition) {
  const pageUrl = absoluteUrl(entry.path)
  const imageId = `${pageUrl}#primaryimage`
  const imageUrl = absoluteUrl(`${entry.path}/opengraph-image`)

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...sharedGraphNodes(),
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
        "@type": "WebPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: entry.title,
        headline: entry.title,
        description: entry.description,
        datePublished: entry.publishedAt,
        dateModified: entry.modifiedAt,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        publisher: { "@id": organizationId },
        primaryImageOfPage: { "@id": imageId },
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
            name: "Alternatives",
            item: absoluteUrl(alternativesIndexPath),
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

export function buildAlternativesIndexSchema() {
  const pageUrl = absoluteUrl(alternativesIndexPath)
  const itemListId = `${pageUrl}#comparisons`

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...sharedGraphNodes(),
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: "Skills Board alternatives",
        description: alternativesIndexDescription,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        mainEntity: { "@id": itemListId },
        image: absoluteUrl(`${alternativesIndexPath}/opengraph-image`),
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Skills Board alternatives",
        numberOfItems: alternatives.length,
        itemListElement: alternatives.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.title,
          url: absoluteUrl(entry.path),
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
            name: "Alternatives",
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
