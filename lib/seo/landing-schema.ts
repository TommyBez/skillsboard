import { landingFaqs } from "@/lib/seo/landing-faq"
import { absoluteUrl, siteConfig } from "@/lib/site"

export function buildLandingSchema() {
  const organizationId = absoluteUrl("/#organization")
  const websiteId = absoluteUrl("/#website")
  const softwareId = absoluteUrl("/#software")

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        sameAs: [siteConfig.githubUrl],
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
        "@type": "SoftwareApplication",
        "@id": softwareId,
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        url: siteConfig.url,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": organizationId },
        isPartOf: { "@id": websiteId },
      },
      {
        "@type": "FAQPage",
        "@id": absoluteUrl("/#faq"),
        mainEntity: landingFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
        isPartOf: { "@id": websiteId },
      },
    ],
  } as const
}
