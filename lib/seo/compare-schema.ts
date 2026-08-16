import { OG_SIZE } from "@/lib/og/template"
import {
  compareIndexDescription,
  compareIndexPath,
  compareIndexTitle,
  comparisons,
  type ComparisonDefinition,
} from "@/lib/seo/compare"
import { absoluteUrl, siteConfig } from "@/lib/site"

const organizationId = absoluteUrl("/#organization")
const websiteId = absoluteUrl("/#website")
const logoId = absoluteUrl("/#logo")
const logoUrl = absoluteUrl("/apple-icon.png")
const compareUrl = absoluteUrl(compareIndexPath)

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

/** TechArticle, FAQPage, and BreadcrumbList for one comparison page. */
export function buildComparisonSchema(entry: ComparisonDefinition) {
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
            name: "Comparisons",
            item: compareUrl,
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

/** CollectionPage, ItemList, and BreadcrumbList for the comparison hub. */
export function buildCompareIndexSchema() {
  const itemListId = `${compareUrl}#comparisons`

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...sharedGraphNodes(),
      {
        "@type": "CollectionPage",
        "@id": `${compareUrl}#page`,
        url: compareUrl,
        name: compareIndexTitle,
        description: compareIndexDescription,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        mainEntity: { "@id": itemListId },
        image: absoluteUrl(`${compareIndexPath}/opengraph-image`),
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "AI agent primitive comparisons",
        numberOfItems: comparisons.length,
        itemListElement: comparisons.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.title,
          url: absoluteUrl(entry.path),
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${compareUrl}#breadcrumbs`,
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
            name: "Comparisons",
            item: compareUrl,
          },
        ],
      },
    ],
  } as const
}
