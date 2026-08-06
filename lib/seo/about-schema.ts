import { OG_SIZE, type OgTemplateContent } from "@/lib/og/template"
import { resourcePaths } from "@/lib/seo/resources"
import { absoluteUrl, siteConfig } from "@/lib/site"

export const aboutDescription =
  "Learn who publishes Skills Board, how its guides are sourced and reviewed, when they are updated, and which product boundaries readers should keep visible."

export const aboutSocialImageAlt =
  "About Skills Board: organization identity, editorial method, sources, and updates."

export const aboutSocialImageContent: OgTemplateContent = {
  eyebrow: "Organization & editorial method",
  title: [
    { text: "About Skills Board" },
    { text: "and how we publish.", accent: true },
  ],
  description:
    "Who publishes Skills Board guides, how sources are selected and reviewed, and where product boundaries are documented.",
  contextLabel: "skillsboard.sh/about",
  chips: ["Identity", "Sources", "Updates"],
}

export function buildAboutSchema() {
  const organizationId = absoluteUrl("/#organization")
  const websiteId = absoluteUrl("/#website")
  const logoId = absoluteUrl("/#logo")
  const logoUrl = absoluteUrl("/apple-icon.png")
  const pageUrl = absoluteUrl(resourcePaths.about)
  const pageId = `${pageUrl}#page`
  const primaryImageId = `${pageUrl}#primaryimage`
  const primaryImageUrl = absoluteUrl(`${resourcePaths.about}/opengraph-image`)

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
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: siteConfig.contactEmail,
        },
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
        name: "About Skills Board and its editorial method",
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
