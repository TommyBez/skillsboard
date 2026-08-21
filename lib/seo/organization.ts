import { absoluteUrl, siteConfig } from "@/lib/site"

/** Every page's JSON-LD points at the same organization and the same logo. */
export const organizationId = absoluteUrl("/#organization")
export const organizationLogoId = absoluteUrl("/#logo")
const organizationLogoUrl = absoluteUrl("/apple-icon.png")

/**
 * The publisher node, written once.
 *
 * Six page types used to carry their own copy of it, and the copies had drifted:
 * the home page and the about page named a way to reach the company, the four
 * article types named none, and none of them stated where the company is. An
 * assistant answering "who runs Skills Board, and how do I reach them" reads
 * whichever page it happened to fetch, so the answer depended on the page.
 *
 * `contactPoint` and `address` are both here because schema.org treats them as
 * the two halves of a reachable organization, and a consumer checking whether a
 * business is real looks for both.
 */
export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: { "@id": organizationLogoId },
    sameAs: [siteConfig.githubUrl],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: siteConfig.contactEmail,
      url: absoluteUrl("/contact"),
      availableLanguage: "English",
    },
    address: {
      "@type": "PostalAddress",
      ...siteConfig.address,
    },
  }
}

/** The logo the organization node references, as its own addressable node. */
export function organizationLogoNode() {
  return {
    "@type": "ImageObject",
    "@id": organizationLogoId,
    url: organizationLogoUrl,
    contentUrl: organizationLogoUrl,
    width: 180,
    height: 180,
    caption: `${siteConfig.name} logo`,
  }
}
