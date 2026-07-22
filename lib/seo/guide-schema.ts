import type { GuideDefinition } from "@/lib/seo/guides"
import { absoluteUrl, siteConfig } from "@/lib/site"

export function buildGuideSchema(guide: GuideDefinition) {
  const organizationId = absoluteUrl("/#organization")
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(guide.path)

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: guide.title,
        description: guide.description,
        datePublished: guide.publishedAt,
        dateModified: guide.modifiedAt,
        inLanguage: "en",
        mainEntityOfPage: pageUrl,
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
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
            name: guide.title,
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
