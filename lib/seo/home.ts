import { landingFaqs } from "@/lib/seo/landing-faq"
import { landingFlowSteps } from "@/lib/seo/landing-flow"
import { siteConfig } from "@/lib/site"

export const homePath = "/"

/**
 * The home page as a content definition, so it gets the same Markdown twin
 * every other page has.
 *
 * The home page is not in the resource registry: it is a scroll-driven
 * composition built from section components rather than a data file, and there
 * is no honest way to derive prose from its animation frames. What it can do is
 * state the same facts in the same order, reading the steps and the FAQ from
 * the modules the page itself renders, so the two cannot drift on the parts
 * that are shared.
 */
export const home = {
  path: homePath,
  // `/` + `.md` is not a URL, so the twin is published at `/index.md`.
  markdownPath: "/index.md",
  title: "Skills Board, the agent-native skills registry for teams",
  description: siteConfig.description,
  publishedAt: "2026-01-15",
  modifiedAt: "2026-08-22",
  intro: [
    "Skills Board is the agent-native skills registry for teams, the web app where a team keeps and shares its AI skills. Teammates search that library, see where each skill came from, and pick the way of using it that fits their agent.",
    "A saved skill is a team's own choice. It is not a security review, an approval, or a compatibility certification, and Skills Board follows the latest version at the saved source rather than pinning the version a teammate used earlier.",
  ],
  workflowTitle: "How it works",
  workflow: landingFlowSteps.map((step) => ({
    title: `${step.index}. ${step.title}`,
    body: step.copy,
  })),
  usageTitle: "Four ways to use a saved skill",
  usage: [
    "Open the original source, which stays linked to every entry.",
    "Copy an install command compatible with the teammate's agent.",
    "Download the latest source files as a ZIP.",
    "Search the same library from a connected MCP agent.",
  ],
  mcp: {
    title: "MCP access",
    intro:
      "Connect Skills Board through MCP and, within the scopes granted, an agent can search team skills and collections, retrieve install commands, and discover public or repository skills. With write access it can save skills and organize collections.",
    endpoint: `${siteConfig.url}/api/mcp (streamable HTTP, OAuth protected).`,
    columns: ["Scope", "Needed for", "What it covers"],
    rows: [
      {
        label: "skills:read",
        cells: [
          "Every tool",
          "List and search team skills and collections, get install commands, discover public and repository skills",
        ],
      },
      {
        label: "skills:write",
        cells: [
          "The write tools only",
          "Save new skills, create collections, add or remove skills from a collection",
        ],
      },
    ],
    limits: [
      "No scope allows editing or deleting a skill already saved to a team library.",
      "Skills Board records what a team keeps; it does not install a skill into an agent or run one.",
    ],
  },
  mcpSetup: {
    lead: "Registration and token details for an agent are in",
    label: "auth.md",
    href: "/auth.md",
    trail: ".",
  },
  plugin: {
    title: "Claude Code plugin",
    intro:
      "The same MCP server ships as a Claude Code plugin, so a teammate can add the marketplace and the plugin instead of configuring the server by hand.",
    template: `/plugin marketplace add TommyBez/skillsboard
/plugin install skills-board@skills-board`,
  },
  pricingTitle: "Pricing",
  pricing: [
    "The hosted product is free forever: no trial, no credit card, and no paid tier.",
    "The code is open source under MIT, so a team that would rather run it themselves can.",
  ],
  faq: landingFaqs,
  relatedTitle: "Related resources",
  related: [
    { label: "Resources", href: "/resources", description: "Guides for teams sharing and operating AI skills" },
    { label: "Agent Skills: the open standard", href: "/agent-skills", description: "What the specification defines and which agents implement it" },
    { label: "Pricing", href: "/pricing", description: "What the free hosted product includes" },
    { label: "About Skills Board", href: "/about", description: "Why the shared team library exists" },
    { label: "Machine-readable site overview", href: "/llms.txt", description: "llms.txt, with the Markdown twin of every public page" },
  ],
} as const
