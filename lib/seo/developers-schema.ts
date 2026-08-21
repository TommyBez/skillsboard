import { developers, developersPath } from "@/lib/seo/developers"
import {
  organizationId,
  organizationLogoNode,
  organizationNode,
} from "@/lib/seo/organization"
import { absoluteUrl, siteConfig } from "@/lib/site"

/**
 * TechArticle and BreadcrumbList for the developer docs.
 *
 * `TechArticle` rather than `WebPage`: the page documents an interface, and the
 * type is what tells a consumer that the thing it found is API documentation
 * rather than marketing copy about an API.
 */
export function buildDevelopersSchema() {
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(developersPath)

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
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        headline: developers.title,
        description: developers.description,
        url: pageUrl,
        datePublished: developers.publishedAt,
        dateModified: developers.modifiedAt,
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        author: { "@id": organizationId },
        publisher: { "@id": organizationId },
        about: { "@id": absoluteUrl("/#software") },
        proficiencyLevel: "Expert",
        articleSection: [
          developers.publicSurface.title,
          developers.connectAnAgent.title,
          developers.tools.title,
          developers.authenticationAndScopes.title,
          developers.versioningAndDeprecation.title,
          developers.errors.title,
          developers.rateLimits.title,
        ],
        encoding: {
          "@type": "MediaObject",
          encodingFormat: "text/markdown",
          contentUrl: absoluteUrl(`${developersPath}.md`),
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Developers", item: pageUrl },
        ],
      },
    ],
  }
}
