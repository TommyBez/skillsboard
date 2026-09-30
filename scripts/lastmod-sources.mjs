/**
 * Pure helpers behind `scripts/check-lastmod.mjs`: which files make up a
 * registry page, and which commits touched them after its `modifiedAt`.
 *
 * Nothing here runs git or reads the disk on its own. The caller passes an
 * `exists` function and the raw `git log` text, so the rules can be tested
 * without a checkout.
 */

/**
 * Content definitions that do not follow the `lib/seo/<slug>` convention,
 * by page path. Guides, comparisons and alternatives share a collection
 * module, and the hubs derive their date from the pages they list.
 */
const contentOverrides = {
  "/": [
    "lib/seo/home.ts",
    "lib/seo/landing-faq.ts",
    "lib/seo/landing-flow.ts",
    "lib/seo/landing-schema.ts",
    "components/landing",
  ],
  "/resources": ["lib/seo/hubs.ts", "components/resources"],
  "/compare": ["lib/seo/hubs.ts", "lib/seo/compare/index.ts"],
  "/alternatives": ["lib/seo/hubs.ts"],
  "/check": ["lib/seo/skill-check.ts", "components/skill-check"],
  "/about": ["lib/seo/about-schema.ts"],
  "/guides/shared-mcp-skill-library-for-teams": [
    "lib/seo/guides/content/shared-mcp-skill-library.ts",
  ],
  "/guides/ai-skill-use-cases-for-teams": [
    "lib/seo/guides/content/ai-skill-use-cases.ts",
  ],
  "/guides/onboard-new-teammate-ai-skills-checklist": [
    "lib/seo/guides/content/onboard-new-teammate-skills.ts",
  ],
  "/guides/choose-first-ai-agent-skill-for-your-team": [
    "lib/seo/guides/content/choose-first-team-skill.ts",
  ],
  "/guides/ai-coding-guidelines-template": [
    "lib/seo/guides/content/ai-coding-guidelines-template.ts",
  ],
  "/guides/ai-coding-team-onboarding": [
    "lib/seo/guides/content/ai-coding-team-onboarding.ts",
  ],
  "/guides/share-agent-skills-with-your-team": [
    "lib/seo/guides/content/share-team-skills.ts",
  ],
  "/guides/manage-skills-across-claude-codex-cursor": [
    "lib/seo/guides/content/manage-cross-agent-skills.ts",
  ],
  "/guides/install-claude-skills-in-claude-code": [
    "lib/seo/guides/content/install-claude-skills.ts",
  ],
  "/guides/how-to-write-a-skill-md": [
    "lib/seo/guides/content/write-skill-md.ts",
  ],
  "/compare/claude-skills-vs-subagents": [
    "lib/seo/compare/skills-vs-subagents.ts",
  ],
  "/compare/claude-skills-vs-mcp": ["lib/seo/compare/skills-vs-mcp.ts"],
  "/compare/claude-skills-vs-plugins": [
    "lib/seo/compare/skills-vs-plugins.ts",
  ],
  "/compare/claude-skills-vs-slash-commands": [
    "lib/seo/compare/skills-vs-slash-commands.ts",
  ],
}

/** Route folders that are not `app/<path>`. */
const routeOverrides = {
  "/": "app/(landing)",
  "/compare": "app/compare/(hub)",
}

/**
 * The files and folders a page is written in: its route folder, its content
 * definition and its own components. Shared templates (the guide, comparison
 * and alternative page components, the legal shell) are left out on purpose,
 * since a change there is rarely a change to what one page says.
 *
 * Returns repo relative paths, only the ones `exists` accepts. A folder means
 * everything below it. For a route folder only the files directly in it
 * count, so `/alternatives` does not pick up its four children.
 */
export function sourcesFor(pagePath, exists) {
  const segments = pagePath.split("/").filter(Boolean)
  const slug = segments.at(-1) ?? ""

  const route = pagePath.startsWith("/guides/")
    ? "app/guides/[slug]"
    : (routeOverrides[pagePath] ?? `app${pagePath}`)

  let content = contentOverrides[pagePath]
  if (!content && pagePath.startsWith("/alternatives/")) {
    content = ["lib/seo/alternatives.ts"]
  }
  if (!content) {
    content = [
      `lib/seo/${slug}`,
      `lib/seo/${slug}.ts`,
      `lib/seo/${slug}-schema.ts`,
      `components/${slug}`,
    ]
  }

  return {
    route: exists(route) ? route : undefined,
    content: content.filter((candidate) => exists(candidate)),
  }
}

/**
 * The registry module. The pages written as markup keep their title,
 * description and dates in their entry there, and every entry can carry a
 * social title, so an entry is page copy too.
 */
export const REGISTRY = "lib/site/page-index.ts"

/**
 * The 1-based, inclusive line range of one page's entry in the `pageIndex`
 * array of `REGISTRY`, given the file's text, or `undefined` when the page has
 * no entry. Tracking only that range keeps an edit to one entry from flagging
 * every page.
 *
 * Entries sit two spaces in, as the formatter writes them: either one line
 * (`  { path: "/", kind: "landing" },`) or an object that opens with `  {` and
 * closes with `  },`, with the `path` somewhere inside it.
 */
export function registryEntryLines(source, pagePath) {
  const lines = source.split("\n")
  const begin = lines.findIndex((line) =>
    line.startsWith("export const pageIndex"),
  )
  if (begin === -1) return undefined
  const needle = `path: ${JSON.stringify(pagePath)},`
  const at = lines.findIndex(
    (line, index) => index > begin && line.includes(needle),
  )
  if (at === -1) return undefined
  if (/^  \{.*\},?\s*$/.test(lines[at])) return { start: at + 1, end: at + 1 }

  let start = at
  while (start > begin && !/^  \{\s*$/.test(lines[start])) start -= 1
  let end = at
  while (end < lines.length && !/^  \},?\s*$/.test(lines[end])) end += 1
  if (start === begin || end === lines.length) return undefined
  return { start: start + 1, end: end + 1 }
}

/** The separator `gitLogArgs` asks git to put between fields. */
export const FIELD = "\u001f"

/**
 * The arguments for `git log` that `parseGitLog` reads back. Dates are the
 * committer day in UTC, which is when a squash merge landed on main, so the
 * caller must run git with `TZ=UTC`.
 */
export const gitLogArgs = [
  "log",
  "--no-merges",
  `--format=@@${FIELD}%H${FIELD}%cd${FIELD}%s`,
  "--date=format-local:%Y-%m-%d",
  "--name-only",
]

/**
 * The arguments for a `git log` of one line range of `REGISTRY`, printed like
 * `gitLogArgs` but with no file list, since `-L` has no pathspec. git follows
 * the range back through the edits above it.
 */
export function registryLogArgs({ start, end }) {
  return [
    ...gitLogArgs.filter((arg) => arg !== "--name-only"),
    "-s",
    `-L${start},${end}:${REGISTRY}`,
  ]
}

/** Parses the output of `git log` run with `gitLogArgs`. */
export function parseGitLog(text) {
  const commits = []
  let current
  for (const line of text.split("\n")) {
    if (line.startsWith(`@@${FIELD}`)) {
      const [, sha, date, subject] = line.split(FIELD)
      current = { sha, date, subject, files: [] }
      commits.push(current)
    } else if (current && line.trim()) {
      current.files.push(line.trim())
    }
  }
  return commits
}

/**
 * Commits that landed on a later day than `modifiedAt`. Both are
 * `YYYY-MM-DD`, so a string comparison orders them.
 */
export function commitsAfter(commits, modifiedAt) {
  return commits.filter((commit) => commit.date > modifiedAt)
}

/**
 * What the check prints last, and the exit code. A page whose history could
 * not be read makes the count meaningless, so failures replace the summary
 * and fail the run rather than passing for "nothing to update".
 */
export function summarize({ stale, total, failures }) {
  if (failures.length > 0) {
    return {
      exitCode: 1,
      lines: [
        `\ncheck-lastmod: could not read the git history of ${failures.length} of ${total} pages:`,
        ...failures.map(({ path, error }) => `  ${path}: ${error}`),
        "No summary: the pages above were not checked.",
      ],
    }
  }
  return {
    exitCode: 0,
    lines: [
      `\n${stale} of ${total} pages have commits after their modifiedAt. ` +
        "Bump modifiedAt only where the change is to what the page says.",
    ],
  }
}
