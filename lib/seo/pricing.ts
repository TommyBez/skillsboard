import {
  pricingDescription,
  pricingFaq,
  pricingPath,
} from "@/lib/seo/pricing-schema"
import { siteConfig } from "@/lib/site"

/**
 * The two plans, as data, so the page and its Markdown twin cannot describe
 * different products. The page renders them as cards; the twin renders one
 * section per plan.
 */
export const hostedFeatures = [
  "Unlimited team libraries",
  "Shared skill library with search and team-specific tags",
  "Original source visible for every saved skill",
  "Install commands and ZIP downloads of the latest source files",
  "Authenticated MCP access for compatible agents",
] as const

export const selfHostedFeatures = [
  "Core team-library features from the same open-source codebase",
  "Limits determined by your own infrastructure",
  "Email, OAuth, public catalog, and other integrations require your own provider configuration",
] as const

/**
 * The pricing page as a content definition.
 *
 * The page is built from section components rather than from a registry, so
 * like the home page and the developer docs it carries a definition written for
 * the twin. It replaces the hand written `public/pricing.md`: a document in
 * `public` serves itself as a plain static file, so a negotiated request for it
 * answered without the token estimate, the canonical and alternate links,
 * `X-Content-Type-Options`, and `Vary: Accept`. Every other negotiated page
 * gets those from `app/api/markdown/route.ts`, and now this one does too.
 */
export const pricing = {
  path: pricingPath,
  title: "Skills Board pricing: free forever",
  description: pricingDescription,
  publishedAt: "2026-08-06",
  modifiedAt: "2026-09-04",
  plansTitle: "Plans",
  plans: [
    {
      name: "Hosted",
      price: "$0 per month, free forever",
      limits: "Unlimited team libraries on the hosted product",
      features: [...hostedFeatures],
    },
    {
      name: "Self-hosted",
      price: "$0, open source",
      limits: "Determined by your own infrastructure",
      features: [...selfHostedFeatures],
      source: siteConfig.githubUrl,
    },
  ],
  agentAccessTitle: "What a connected agent can do over MCP",
  agentAccess: [
    {
      label: "Read",
      detail:
        "List and search team skills and collections, retrieve install commands, and discover public and repository skills",
    },
    {
      label: "Write",
      detail:
        "With the skills:write scope, save new skills, create collections, and add or remove saved skills from collections",
    },
    {
      label: "Not permitted",
      detail:
        "Editing or deleting saved team skills, installing a skill in an agent, or executing a skill",
    },
  ],
  notes: [
    "No trial, no credit card, and no paid tier. The hosted product is free forever and the code is open source.",
  ],
  faq: [...pricingFaq],
}
