import type { MarkdownContentEntry } from "@/lib/markdown/content-markdown"
import { alternatives } from "@/lib/seo/alternatives"
import { comparisons } from "@/lib/seo/compare"
import { developers } from "@/lib/seo/developers"
import { home } from "@/lib/seo/home"
import { alternativesHub, compareHub, resourcesHub } from "@/lib/seo/hubs"
import { pricing } from "@/lib/seo/pricing"
import { resourceEntries, resourcePaths } from "@/lib/seo/resources"
import { skillCheck } from "@/lib/seo/skill-check"
import { skillCreator } from "@/lib/seo/skill-creator"

/**
 * Every public page of the site, once.
 *
 * Before this module the set of public pages was spelled out in six places
 * that had to be kept in step by hand: the Markdown twin list, its verbatim
 * copy in the WebMCP catalogue, the content negotiation rules in
 * `next.config.ts`, the trailing slash redirects next to them, the sitemap
 * with nine entries and their dates written as literals, and a per page test
 * that restated the twin list instead of deriving it. A page that reached five
 * of the six and missed one looked correct in review and was wrong in
 * production, which is how `/check` and `/skill-creator` ended up without
 * twins.
 *
 * The registry is an index, not a second place to write content. Title,
 * description and dates are read from the content definition in
 * `lib/seo/<page>` rather than repeated here, and `content` keeps the
 * reference so the twin builder gets the same object it got before.
 *
 * The module is deliberately free of React, of `server-only`, and of any
 * package import. It is reached from the root layout through the WebMCP
 * catalogue, so anything heavier lands in the module graph of the whole site,
 * and `tests/public-pages.test.mjs` asserts the import graph below it stays
 * plain data. `next.config.ts` cannot require it even so, and reads the
 * mirror in `lib/site/page-paths` instead, for the reason written there.
 */

export type PageKind =
  | "landing"
  | "hub"
  | "article"
  | "guide"
  | "comparison"
  | "alternative"
  | "tool"
  | "docs"
  | "legal"
  | "auth"

/** The values `MetadataRoute.Sitemap` accepts, spelled without importing Next. */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never"

export type SitemapSurface = {
  priority: number
  changeFrequency: ChangeFrequency
}

export type PageSurfaces = {
  /** Answers at `<path>.md` and to `Accept: text/markdown`. */
  markdown: boolean
  /** Carries a JSON-LD node. Declared here, derived in a later change. */
  jsonLd: boolean
  /** Its line in `sitemap.xml`, or `false` for a page that stays out. */
  sitemap: SitemapSurface | false
  /** Listed in the WebMCP catalogue an agent reads from the root layout. */
  webMcp: boolean
}

/**
 * A content definition as the registry reads it.
 *
 * `MarkdownContentEntry` is the structural minimum the twin builder needs. The
 * rest is what a page optionally carries for its head, and every field is
 * optional so a definition that never had one is still a valid entry.
 */
type ContentEntry = MarkdownContentEntry & {
  eyebrow?: string
  seoTitle?: string
  socialTitle?: string
  ogAlt?: string
}

export type PublicPage = {
  path: string
  kind: PageKind
  title: string
  /** The `<title>`, when it differs from the page title. */
  seoTitle?: string
  /** The title a social card carries, when it differs from the page title. */
  socialTitle?: string
  description: string
  eyebrow?: string
  ogAlt?: string
  publishedAt: string
  modifiedAt: string
  /** Only the exceptions to the defaults of the kind. */
  surfaces?: Partial<PageSurfaces>
  /** The content definition, for the pages that have one. */
  content?: ContentEntry
}

/**
 * What a kind gets unless the page says otherwise.
 *
 * The defaults live in the kind rather than in the page so that a page
 * declares what makes it different and nothing else. A `tool` has no twin yet,
 * an `auth` page appears on no public surface, and everything that carries
 * prose answers in Markdown.
 */
const surfaceDefaults: Record<PageKind, PageSurfaces> = {
  landing: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 1, changeFrequency: "weekly" },
    webMcp: true,
  },
  hub: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  article: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  guide: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  comparison: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  alternative: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  docs: {
    markdown: true,
    jsonLd: true,
    sitemap: { priority: 0.7, changeFrequency: "monthly" },
    webMcp: true,
  },
  /**
   * A browser tool rather than an article. No twin today: the twin of a tool
   * is the explanation plus the endpoint that does the same job without a
   * browser, and neither `/check` nor `/skill-creator` has one written yet.
   */
  tool: {
    markdown: false,
    jsonLd: true,
    sitemap: { priority: 0.8, changeFrequency: "monthly" },
    webMcp: false,
  },
  legal: {
    markdown: false,
    jsonLd: true,
    sitemap: { priority: 0.3, changeFrequency: "yearly" },
    webMcp: false,
  },
  /** A form, not a document: nothing to read, nothing to index by default. */
  auth: {
    markdown: false,
    jsonLd: false,
    sitemap: false,
    webMcp: false,
  },
}

/** The surfaces a page actually has: the defaults of its kind, then its own. */
export function surfacesFor(page: PublicPage): PageSurfaces {
  return { ...surfaceDefaults[page.kind], ...page.surfaces }
}

function fromContent(
  entry: ContentEntry,
  kind: PageKind,
  overrides: Partial<Omit<PublicPage, "path" | "kind" | "content">> = {},
): PublicPage {
  return {
    path: entry.path,
    kind,
    title: entry.title,
    seoTitle: entry.seoTitle,
    socialTitle: entry.socialTitle,
    description: entry.description,
    eyebrow: entry.eyebrow,
    ogAlt: entry.ogAlt,
    publishedAt: entry.publishedAt,
    modifiedAt: entry.modifiedAt,
    content: entry,
    ...overrides,
  }
}

/**
 * The title a social card carries, where it differs from the page title.
 *
 * These lived as a `socialTitle` constant at the top of each article's
 * `page.tsx`, next to the forty six lines of metadata they belonged to. The
 * metadata is derived now, so the one piece of copy that was not already in a
 * content definition moves here rather than disappearing.
 */
const articleSocialTitles: Readonly<Record<string, string>> = {
  "/agent-skills": "Agent Skills: the open standard",
  "/agent-skills-by-the-numbers": "Agent skills by the numbers",
  "/agent-skills-support": "Which AI clients read SKILL.md",
  "/agents-md-vs-skill-md": "AGENTS.md vs SKILL.md",
  "/anthropic-skills": "Anthropic skills",
  "/best-claude-skills": "Best Claude skills",
  "/claude-code-for-teams": "Claude Code for teams: what a rollout configures",
  "/claude-skills": "Claude Skills, explained",
  "/codex-skills": "Codex skills, explained",
  "/copilot-skills": "GitHub Copilot skills: what Copilot supports",
  "/cowork-skills": "Claude Cowork skills",
  "/cursor-skills": "Cursor skills, explained",
  "/manage-ai-skills": "Manage AI skills across your organization",
  "/opencode-skills": "OpenCode skills, explained",
  "/skill-examples": "Skill examples: eight real SKILL.md files",
  "/vercel-skills": "Vercel skills, explained",
  "/where-to-find-claude-skills": "Where to find Claude skills",
}

/**
 * The pages in reading order: the home page, then each hub immediately above
 * the collection it indexes, then the pages that belong to no collection.
 *
 * This is the order an agent walks the site in, and it is the order every
 * derived surface inherits, the sitemap included.
 */
export const publicPages: readonly PublicPage[] = [
  fromContent(home, "landing"),
  fromContent(resourcesHub, "hub", {
    surfaces: { sitemap: { priority: 0.8, changeFrequency: "weekly" } },
  }),
  ...resourceEntries.map((entry) =>
    fromContent(entry, entry.contentType === "guide" ? "guide" : "article", {
      socialTitle: articleSocialTitles[entry.path],
    }),
  ),
  fromContent(alternativesHub, "hub"),
  ...alternatives.map((entry) => fromContent(entry, "alternative")),
  fromContent(compareHub, "hub"),
  ...comparisons.map((entry) => fromContent(entry, "comparison")),
  fromContent(developers, "docs"),
  fromContent(pricing, "landing", {
    surfaces: { sitemap: { priority: 0.7, changeFrequency: "monthly" } },
  }),
  fromContent(skillCreator, "tool"),
  fromContent(skillCheck, "tool"),
  {
    /**
     * No content definition yet, so no twin: the page is written as markup
     * rather than as data, and the registry does not invent prose for it.
     */
    path: resourcePaths.about,
    kind: "article",
    title: "About Skills Board",
    seoTitle: "About Skills Board | Shared AI Skills for Teams",
    socialTitle: "About Skills Board",
    /**
     * The same sentence `lib/seo/about-schema` exports, repeated because that
     * module reaches the OG template and the registry stays free of React.
     * `tests/public-pages.test.mjs` asserts the two agree.
     */
    description:
      "Skills Board gives teams one place to save, share, and reuse AI skills across agents. Learn why it exists, how it works, and how to get involved.",
    publishedAt: "2026-07-29",
    modifiedAt: "2026-08-06",
    surfaces: {
      markdown: false,
      webMcp: false,
      sitemap: { priority: 0.6, changeFrequency: "monthly" },
    },
  },
  {
    /** The only auth page in the sitemap: it is where an external link lands. */
    path: "/sign-up",
    kind: "auth",
    title: "Create your shared AI skill library",
    socialTitle: "Create your shared AI skill library | Skills Board",
    description:
      "Create a free Skills Board account and start a shared AI skill library for your team.",
    publishedAt: "2026-07-29",
    modifiedAt: "2026-08-06",
    surfaces: { sitemap: { priority: 0.7, changeFrequency: "monthly" } },
  },
  {
    path: "/privacy",
    kind: "legal",
    title: "Privacy Policy",
    socialTitle: "Privacy Policy | Skills Board",
    description:
      "How Skills Board collects, uses, shares, and protects personal data.",
    publishedAt: "2026-07-29",
    modifiedAt: "2026-07-29",
  },
  {
    path: "/terms",
    kind: "legal",
    title: "Terms of Service",
    socialTitle: "Terms of Service | Skills Board",
    description:
      "Terms that apply when you use the hosted Skills Board service.",
    publishedAt: "2026-07-29",
    modifiedAt: "2026-07-29",
  },
  {
    path: "/contact",
    kind: "legal",
    title: "Contact",
    socialTitle: "Contact | Skills Board",
    description:
      "Contact Skills Board for product, account, privacy, or security questions.",
    publishedAt: "2026-07-29",
    modifiedAt: "2026-08-06",
  },
]

const pagesByPath = new Map(publicPages.map((page) => [page.path, page]))

export function pageForPath(path: string): PublicPage | undefined {
  return pagesByPath.get(path)
}

/** Throws rather than returning a half filled head for a path with no entry. */
export function requirePage(path: string): PublicPage {
  const page = pagesByPath.get(path)
  if (!page) {
    throw new Error(`No public page registered for ${path}`)
  }
  return page
}

export const publicPagePaths: readonly string[] = publicPages.map(
  (page) => page.path,
)

function withSurface(
  predicate: (surfaces: PageSurfaces) => boolean,
): readonly PublicPage[] {
  return publicPages.filter((page) => predicate(surfacesFor(page)))
}

/**
 * A page that answers in Markdown always has a content definition to render:
 * the twin is generated from it, so `markdown: true` without `content` is a
 * declaration nothing can honour. The parity test rejects that combination,
 * and this filter would silently drop it, so it asserts instead.
 */
function contentOf(page: PublicPage): ContentEntry {
  if (!page.content) {
    throw new Error(`${page.path} claims a Markdown surface with no content`)
  }
  return page.content
}

/** The content definitions behind the Markdown twins, in reading order. */
export const markdownPages: readonly ContentEntry[] = withSurface(
  (surfaces) => surfaces.markdown,
).map(contentOf)

export const markdownPagePaths: readonly string[] = markdownPages.map(
  (entry) => entry.path,
)

/** The pages a WebMCP tool can read or navigate to. */
export const webMcpContentPages: readonly ContentEntry[] = withSurface(
  (surfaces) => surfaces.webMcp,
).map(contentOf)

export type SitemapPage = { page: PublicPage; sitemap: SitemapSurface }

/** The sitemap, still as data: one entry per page that asked to be listed. */
export const sitemapPages: readonly SitemapPage[] = publicPages.flatMap(
  (page) => {
    const { sitemap } = surfacesFor(page)
    return sitemap ? [{ page, sitemap }] : []
  },
)
