import { OG_SIZE, type OgTemplateContent } from "@/lib/og/template"
import { resourcePaths } from "@/lib/seo/resources"
import {
  organizationId,
  organizationLogoNode,
  organizationNode,
} from "@/lib/seo/organization"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const aboutDescription =
  "Skills Board gives teams one place to save, share, and reuse AI skills across agents. Learn why it exists, how it works, and how to get involved."

export const aboutSocialImageAlt =
  "About Skills Board, a shared AI skill library for teams."

export const aboutSocialImageContent: OgTemplateContent = {
  eyebrow: "About Skills Board",
  title: [
    { text: "AI skills worth sharing." },
    { text: "One place to keep them.", accent: true },
  ],
  description:
    "A free, open-source library for your team's AI skills.",
  contextLabel: "skillsboard.sh/about",
  chips: ["Team library", "MCP", "Open source"],
}

export function buildAboutSchema() {
  const websiteId = absoluteUrl("/#website")
  const pageUrl = absoluteUrl(resourcePaths.about)
  const pageId = `${pageUrl}#page`
  const primaryImageId = `${pageUrl}#primaryimage`
  const primaryImageUrl = absoluteUrl(`${resourcePaths.about}/opengraph-image`)

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
        "@id": primaryImageId,
        url: primaryImageUrl,
        contentUrl: primaryImageUrl,
        width: OG_SIZE.width,
        height: OG_SIZE.height,
        caption: aboutSocialImageAlt,
      },
      {
        "@type": "AboutPage",
        "@id": pageId,
        url: pageUrl,
        name: "About Skills Board",
        description: aboutDescription,
        dateModified: "2026-08-06",
        inLanguage: "en",
        isPartOf: { "@id": websiteId },
        about: { "@id": organizationId },
        mainEntity: { "@id": organizationId },
        publisher: { "@id": organizationId },
        primaryImageOfPage: { "@id": primaryImageId },
        breadcrumb: { "@id": `${pageUrl}#breadcrumbs` },
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
            name: "About",
            item: pageUrl,
          },
        ],
      },
    ],
  } as const
}
