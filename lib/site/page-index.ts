/**
 * Which pages the site publishes, and on which surfaces. No imports.
 *
 * This is the declarative half of the page registry, and it is the source
 * rather than a copy of one. `lib/site/pages` joins it with the content
 * definitions in `lib/seo/<page>` to produce the full registry, and
 * `next.config.ts` reads it directly.
 *
 * The absence of imports is the point, not an accident of the current
 * contents. Next.js documents that "module resolution in next.config.ts is
 * currently limited to CommonJS" and that the file "will not be parsed by
 * Webpack or Babel", so a config reaches a module through plain `require`
 * with no bundler and no path alias. Every other module here addresses its
 * neighbours as `@/...`, and an aliased specifier below a config is resolved
 * against the project root rather than against the importing file, which is
 * how the first attempt at this failed on the build machine:
 *
 *     Error: Cannot find module './lib/seo/alternatives'
 *     Require stack:
 *     - /vercel/path0/lib/site/pages.ts
 *     - /vercel/path0/next.config.compiled.js
 *
 * A file with no imports at all has nothing to resolve, so the config can read
 * this one, and the rewrites that negotiate on `Accept` can stay in the config
 * where the Next.js proxy guide says to prefer them. `tests/public-pages.test.mjs`
 * fails if an import ever appears here.
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
 * The head of a page that has no content definition to read it from.
 *
 * These five pages are written as markup rather than as data. Their titles and
 * dates have to live somewhere, and the index is still a data module with them
 * in it, so they live here instead of in a second registry.
 */
export type PageHead = {
  title: string
  /** The `<title>`, when it differs from the page title. */
  seoTitle?: string
  description: string
  publishedAt: string
  modifiedAt: string
}

export type PageIndexEntry = {
  path: string
  kind: PageKind
  /** Only the exceptions to the defaults of the kind. */
  surfaces?: Partial<PageSurfaces>
  /**
   * The title a social card carries, when it differs from the page title.
   *
   * These lived as a `socialTitle` constant at the top of each article's
   * `page.tsx`, next to the metadata they belonged to. The metadata is derived
   * now, so the one piece of copy that was not already in a content definition
   * is declared here, page by page.
   */
  socialTitle?: string
  /** Set for the pages with no content definition, and for no other. */
  head?: PageHead
}

/**
 * The pages in reading order: the home page, then each hub immediately above
 * the collection it indexes, then the pages that belong to no collection.
 *
 * This is the order an agent walks the site in, and it is the order every
 * derived surface inherits, the sitemap included.
 */
export const pageIndex: readonly PageIndexEntry[] = [
  { path: "/", kind: "landing" },
  {
    path: "/resources",
    kind: "hub",
    surfaces: { sitemap: { priority: 0.8, changeFrequency: "weekly" } },
  },
  { path: "/guides/shared-mcp-skill-library-for-teams", kind: "guide" },
  { path: "/guides/ai-skill-use-cases-for-teams", kind: "guide" },
  { path: "/guides/onboard-new-teammate-ai-skills-checklist", kind: "guide" },
  { path: "/guides/choose-first-ai-agent-skill-for-your-team", kind: "guide" },
  { path: "/guides/ai-coding-guidelines-template", kind: "guide" },
  { path: "/guides/ai-coding-team-onboarding", kind: "guide" },
  { path: "/guides/share-agent-skills-with-your-team", kind: "guide" },
  { path: "/guides/manage-skills-across-claude-codex-cursor", kind: "guide" },
  { path: "/guides/install-claude-skills-in-claude-code", kind: "guide" },
  { path: "/guides/how-to-write-a-skill-md", kind: "guide" },
  {
    path: "/agent-skills",
    kind: "article",
    socialTitle: "Agent Skills: the open standard",
  },
  {
    path: "/agent-skills-by-the-numbers",
    kind: "article",
    socialTitle: "Agent skills by the numbers",
  },
  {
    path: "/agent-skills-support",
    kind: "article",
    socialTitle: "Which AI clients read SKILL.md",
  },
  {
    path: "/anthropic-skills",
    kind: "article",
    socialTitle: "Anthropic skills",
  },
  {
    path: "/best-claude-skills",
    kind: "article",
    socialTitle: "Best Claude skills",
  },
  {
    path: "/claude-skills",
    kind: "article",
    socialTitle: "Claude Skills, explained",
  },
  {
    path: "/codex-skills",
    kind: "article",
    socialTitle: "Codex skills, explained",
  },
  {
    path: "/cowork-skills",
    kind: "article",
    socialTitle: "Claude Cowork skills",
  },
  {
    path: "/cursor-skills",
    kind: "article",
    socialTitle: "Cursor skills, explained",
  },
  {
    path: "/opencode-skills",
    kind: "article",
    socialTitle: "OpenCode skills, explained",
  },
  {
    path: "/skill-examples",
    kind: "article",
    socialTitle: "Skill examples: eight real SKILL.md files",
  },
  {
    path: "/vercel-skills",
    kind: "article",
    socialTitle: "Vercel skills, explained",
  },
  {
    path: "/copilot-skills",
    kind: "article",
    socialTitle: "GitHub Copilot skills: what Copilot supports",
  },
  {
    path: "/agents-md-vs-skill-md",
    kind: "article",
    socialTitle: "AGENTS.md vs SKILL.md",
  },
  {
    path: "/claude-code-for-teams",
    kind: "article",
    socialTitle: "Claude Code for teams: what a rollout configures",
  },
  {
    path: "/manage-ai-skills",
    kind: "article",
    socialTitle: "Manage AI skills across your organization",
  },
  {
    path: "/where-to-find-claude-skills",
    kind: "article",
    socialTitle: "Where to find Claude skills",
  },
  { path: "/alternatives", kind: "hub" },
  { path: "/alternatives/github-repo", kind: "alternative" },
  { path: "/alternatives/skills-sh", kind: "alternative" },
  { path: "/alternatives/smithery", kind: "alternative" },
  { path: "/alternatives/superpowers", kind: "alternative" },
  { path: "/compare", kind: "hub" },
  { path: "/compare/claude-skills-vs-subagents", kind: "comparison" },
  { path: "/compare/claude-skills-vs-mcp", kind: "comparison" },
  { path: "/compare/claude-skills-vs-plugins", kind: "comparison" },
  { path: "/compare/claude-skills-vs-slash-commands", kind: "comparison" },
  { path: "/developers", kind: "docs" },
  {
    path: "/pricing",
    kind: "landing",
    surfaces: { sitemap: { priority: 0.7, changeFrequency: "monthly" } },
  },
  { path: "/skill-creator", kind: "tool" },
  { path: "/check", kind: "tool" },
  {
    /**
     * No content definition yet, so no twin: the page is written as markup
     * rather than as data, and the registry does not invent prose for it.
     */
    path: "/about",
    kind: "article",
    socialTitle: "About Skills Board",
    head: {
      title: "About Skills Board",
      seoTitle: "About Skills Board | Shared AI Skills for Teams",
      /**
       * The same sentence `lib/seo/about-schema` exports, repeated because that
       * module reaches the OG template and the registry stays free of React.
       * `tests/public-pages.test.mjs` asserts the two agree.
       */
      description:
        "Skills Board gives teams one place to save, share, and reuse AI skills across agents. Learn why it exists, how it works, and how to get involved.",
      publishedAt: "2026-07-29",
      modifiedAt: "2026-08-06",
    },
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
    socialTitle: "Create your shared AI skill library | Skills Board",
    head: {
      title: "Create your shared AI skill library",
      description:
        "Create a free Skills Board account and start a shared AI skill library for your team.",
      publishedAt: "2026-07-29",
      modifiedAt: "2026-08-06",
    },
    surfaces: { sitemap: { priority: 0.7, changeFrequency: "monthly" } },
  },
  {
    path: "/privacy",
    kind: "legal",
    socialTitle: "Privacy Policy | Skills Board",
    head: {
      title: "Privacy Policy",
      description:
        "How Skills Board collects, uses, shares, and protects personal data.",
      publishedAt: "2026-07-29",
      modifiedAt: "2026-07-29",
    },
  },
  {
    path: "/terms",
    kind: "legal",
    socialTitle: "Terms of Service | Skills Board",
    head: {
      title: "Terms of Service",
      description:
        "Terms that apply when you use the hosted Skills Board service.",
      publishedAt: "2026-07-29",
      modifiedAt: "2026-07-29",
    },
  },
  {
    path: "/contact",
    kind: "legal",
    socialTitle: "Contact | Skills Board",
    head: {
      title: "Contact",
      description:
        "Contact Skills Board for product, account, privacy, or security questions.",
      publishedAt: "2026-07-29",
      modifiedAt: "2026-08-06",
    },
  },
]

/**
 * What a kind gets unless the page says otherwise.
 *
 * The defaults live in the kind rather than in the page so that a page
 * declares what makes it different and nothing else. A `tool` has no twin yet,
 * an `auth` page appears on no public surface, and everything that carries
 * prose answers in Markdown.
 */
export const surfaceDefaults: Record<PageKind, PageSurfaces> = {
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
export function surfacesFor(page: {
  kind: PageKind
  surfaces?: Partial<PageSurfaces>
}): PageSurfaces {
  return { ...surfaceDefaults[page.kind], ...page.surfaces }
}

/** Every public page, in reading order. */
export function publicPagePaths(): readonly string[] {
  return pageIndex.map((entry) => entry.path)
}

/** The pages that answer in Markdown, in reading order. */
export function markdownTwinPaths(): readonly string[] {
  return pageIndex
    .filter((entry) => surfacesFor(entry).markdown)
    .map((entry) => entry.path)
}
