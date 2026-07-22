import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { absoluteUrl, siteConfig } from "@/lib/site"

export function buildResourceIndexSchema() {
  const pageUrl = absoluteUrl(resourcePaths.index)
  const itemListId = `${pageUrl}#resources`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#page`,
        url: pageUrl,
        name: "Skills Board resources",
        description:
          "Practical resources for teams that share, review, and operate reusable AI skills.",
        inLanguage: "en",
        isPartOf: { "@id": absoluteUrl("/#website") },
        mainEntity: { "@id": itemListId },
      },
      {
        "@type": "ItemList",
        "@id": itemListId,
        name: "Skills Board resources",
        numberOfItems: resourceEntries.length,
        itemListElement: resourceEntries.map((entry, index) => ({
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
            name: "Resources",
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
