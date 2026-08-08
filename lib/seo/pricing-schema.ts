import { absoluteUrl, siteConfig } from "@/lib/site"

export const pricingPath = "/pricing"

export const pricingDescription =
  "The hosted product is free forever — no trial, no credit card, no paid tier. The code is open source and can be self-hosted."

export const pricingFaq = [
  {
    question: "Is Skills Board really free forever?",
    answer:
      "Yes. The hosted product is free forever: unlimited team libraries, shared skill library, search, team-specific tags, original source links, install commands, ZIP downloads, and authenticated MCP access. There is no trial and no paid tier.",
  },
  {
    question: "Do I need a credit card to sign up?",
    answer:
      "No. Creating an account and a team library requires no payment details.",
  },
  {
    question: "What is the difference between hosted and self-hosted?",
    answer:
      "Both run the same open-source codebase. The hosted product at skillsboard.sh is operated for you and free forever. Self-hosting is also free, but limits and integrations — email, OAuth, and the public catalog — depend on your own infrastructure and provider configuration.",
  },
  {
    question: "What can a connected agent do through MCP?",
    answer:
      "With the granted scopes, a compatible agent can list and search team skills and collections, retrieve install commands, discover public and repository skills, save new skills, and organize collections. It cannot edit or delete saved team skills, install them in an agent, or execute them.",
  },
] as const

export function buildPricingSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: siteConfig.url,
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description:
            "The hosted product is free forever. No trial, no credit card, no paid tier.",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: pricingFaq.map((entry) => ({
          "@type": "Question",
          name: entry.question,
          acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Pricing",
            item: absoluteUrl(pricingPath),
          },
        ],
      },
    ],
  }
}
