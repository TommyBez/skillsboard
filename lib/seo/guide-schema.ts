import type { GuideDefinition } from "@/lib/seo/guides"
import { OG_SIZE } from "@/lib/og/template"
import { resourcePaths } from "@/lib/seo/resources"
import { absoluteUrl, siteConfig } from "@/lib/site"

export function buildGuideSchema(guide: GuideDefinition) {
  const organizationId = absoluteUrl("/#organization")
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(guide.path)
  const articleImageId = `${pageUrl}#primaryimage`
  const articleImageUrl = absoluteUrl(`${guide.path}/opengraph-image`)
  const logoId = absoluteUrl("/#logo")
  const logoUrl = absoluteUrl("/apple-icon.png")

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
  } as const
}
