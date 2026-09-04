import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { claudeCodeForTeams, claudeCodeForTeamsPath } = await import(
  "../lib/seo/claude-code-for-teams/index.ts"
)
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { manageAiSkills } = await import("../lib/seo/manage-ai-skills/index.ts")
const { agentSkillsSupportPath } = await import(
  "../lib/seo/agent-skills-support/types.ts"
)
const { bestClaudeSkillsPath } = await import(
  "../lib/seo/best-claude-skills/types.ts"
)
const { guidePaths } = await import("../lib/seo/guides/types.ts")
const { manageAiSkillsPath } = await import(
  "../lib/seo/manage-ai-skills/types.ts"
)
const { resourceClusters, resourceEntries } = await import(
  "../lib/seo/resources.ts"
)
const { markdownTwinAlternates, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const { buildResourceArticleSchema } = await import(
  "../lib/seo/resource-article-schema.ts"
)
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig } = await import("../next.config.ts")

const entry = claudeCodeForTeams
const canonical = `https://www.skillsboard.sh${claudeCodeForTeamsPath}`
const markdown = renderMarkdownTwin(claudeCodeForTeamsPath) ?? ""
const pageSource = await readFile(
  new URL("../app/claude-code-for-teams/page.tsx", import.meta.url),
  "utf8",
)

const tables = [
  entry.plans,
  entry.settings,
  entry.conventions,
  entry.skills,
  entry.plugins,
  entry.mcp,
  entry.trust,
]

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the article is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/claude-code-for-teams")
  assert.ok(
    resourceEntries.some((candidate) => candidate.path === entry.path),
    "missing from the resource registry",
  )
  assert.ok(
    resourceClusters.some((cluster) =>
      cluster.entries.some((candidate) => candidate.path === entry.path),
    ),
    "missing from every topic cluster",
  )
  assert.ok(
    sitemap().some((candidate) => candidate.url === canonical),
    "missing from the sitemap",
  )
})

test("the route renders the page and its social images", async () => {
  for (const file of [
    "page.tsx",
    "layout.tsx",
    "opengraph-image.tsx",
    "twitter-image.tsx",
  ]) {
    assert.ok(
      await exists(`../app${entry.path}/${file}`),
      `app${entry.path}/${file} does not exist`,
    )
  }
})

test("the page mounts the four CTA placements", async () => {
  const layout = await readFile(
    new URL(`../app${entry.path}/layout.tsx`, import.meta.url),
    "utf8",
  )
  assert.ok(
    layout.includes("ResourceShell"),
    "the page does not mount the shared chrome, so it has no header CTA",
  )

  const page = await readFile(
    new URL(
      "../components/claude-code-for-teams/claude-code-for-teams-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`location="${suffix}"`),
      `the page never renders the ${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"${suffix}"`),
      `landing_cta_clicked cannot report ${suffix}`,
    )
  }
})

test("the article is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")

  // The shared `Last reviewed` line stays where the sibling pages left it. This
  // page re-read only its own sources, so moving the date forward would assert
  // a full re-review of every entry in the file that did not happen. Same
  // reasoning as /agent-skills-support, /manage-ai-skills, /vercel-skills and
  // /copilot-skills.
  assert.ok(
    llms.includes("Last reviewed: 2026-08-19"),
    "the shared review date moved without a full re-review",
  )
  assert.ok(
    entry.modifiedAt >= "2026-08-19",
    "the entry predates the last full llms.txt review",
  )
})

test("the canonical URL is reachable with and without a trailing slash", async () => {
  const { redirects, rewrites } = nextConfig
  const redirectRules = await redirects()
  const redirect = redirectRules.find(
    (rule) =>
      rule.source === `${entry.path}/` && rule.destination === entry.path,
  )
  assert.ok(redirect, "the trailing-slash spelling has no redirect")
  assert.equal(
    redirect.permanent,
    true,
    "the trailing-slash redirect is not permanent",
  )

  // The path does not end in `-skills`, so the shared Accept rewrite does not
  // reach it and it needs a rule of its own, the way /skill-examples does.
  assert.doesNotMatch(entry.path.slice(1), /^[^/]*-skills$/)
  const { beforeFiles } = await rewrites()
  const negotiated = beforeFiles.find((rule) => rule.source === entry.path)
  assert.ok(negotiated, "the Markdown Accept rewrite is missing")
  assert.equal(negotiated.destination, `/api/markdown?path=${entry.path}`)
})

test("the Markdown twin carries every section, the tables, and the FAQ", () => {
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  // The alternate has to reach the page head, not just the helper.
  assert.ok(
    pageSource.includes("markdownTwinAlternates(claudeCodeForTeams.path)"),
    "the route does not advertise its Markdown twin in the page head",
  )

  for (const title of [
    ...tables.map((section) => section.title),
    entry.install.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of tables) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page answers the team question rather than the single-developer one", () => {
  const copy = JSON.stringify(entry)

  // The four artifacts a team commits, all of them named in the short answer.
  for (const artifact of [
    ".claude/settings.json",
    "CLAUDE.md",
    ".claude/skills",
    ".mcp.json",
  ]) {
    assert.ok(
      entry.answer.includes(artifact),
      `the short answer omits ${artifact}`,
    )
  }
  assert.ok(
    entry.answer.includes("extraKnownMarketplaces"),
    "the short answer never names the mechanism that carries a plugin",
  )

  // The five settings layers, in the precedence order Anthropic publishes.
  assert.deepEqual(
    entry.settings.rows.map((row) => row.label),
    [
      "Managed settings",
      "Command line",
      "Project local",
      "Shared project",
      "User",
    ],
  )

  // The four skill locations Anthropic lists, then the three other ways a
  // folder reaches a session. Blurring the two groups publishes fiction.
  assert.deepEqual(
    entry.skills.rows.map((row) => row.label),
    [
      "Enterprise",
      "Personal",
      "Project",
      "Plugin",
      "Nested project",
      "Added directory",
      "Synced from claude.ai",
    ],
  )

  // Only one of the three developer MCP scopes is shared, and it is not the
  // one called local.
  const project = entry.mcp.rows.find((row) => row.label === "Project")
  assert.match(project.cells[0], /\.mcp\.json/)
  assert.match(project.cells[1], /^Yes/)
  for (const scope of ["Local", "User"]) {
    const row = entry.mcp.rows.find((item) => item.label === scope)
    assert.match(row.cells[1], /^No\./, `${scope} is not reported as private`)
  }

  assert.ok(entry.install.steps.length >= 6)
  assert.ok(
    entry.install.template.includes("permissions") &&
      entry.install.template.includes("extraKnownMarketplaces"),
    "the shared settings template is missing a team key",
  )
  assert.ok(
    copy.includes("/plugin marketplace add TommyBez/skillsboard"),
    "the page never shows the first-party plugin install",
  )

  assert.ok(entry.sources.length >= 12, "too few primary sources")
})

test("enforcement and guidance are kept apart, with the vendor's own sentence", () => {
  const copy = JSON.stringify(entry)

  // Anthropic states the distinction outright, and the page quotes its shape
  // rather than inventing a rule of its own.
  assert.match(copy, /enforced by the client/)
  assert.match(copy, /not a hard enforcement layer/)

  // The managed CLAUDE.md paths, which are the ones an administrator deploys.
  const managed = entry.conventions.rows.find(
    (row) => row.label === "Managed policy",
  )
  assert.match(managed.cells[0], /\/etc\/claude-code\/CLAUDE\.md/)
  assert.match(managed.cells[1], /cannot be excluded/)

  // The managed-only keys the page claims exist, each spelled as documented.
  for (const key of [
    "strictKnownMarketplaces",
    "strictPluginOnlyCustomization",
    "disableSideloadFlags",
  ]) {
    const row = entry.plugins.rows.find((item) => item.label.includes(key))
    assert.ok(row, `the plugins table omits ${key}`)
    assert.match(
      row.cells[0],
      /Managed settings only/,
      `${key} is not attributed to managed settings`,
    )
  }
})

test("the trust section reports both columns rather than one", () => {
  assert.equal(entry.trust.columns.length, 3)
  assert.equal(entry.trust.rows.length, 6)

  // The one row where trust changes nothing, stated as such.
  const hooks = entry.trust.rows.find((row) => row.label.startsWith("Hooks"))
  assert.equal(hooks.cells[0], "Used")
  assert.match(hooks.cells[1], /never gates a skill's allowed-tools/)

  // The row teams actually hit: allow rules from a repository wait for trust.
  const allow = entry.trust.rows.find((row) =>
    row.label.startsWith("permissions.allow"),
  )
  assert.match(allow.cells[0], /Not used until you accept the trust dialog/)
  assert.match(allow.cells[1], /Not used/)

  // Deny and ask are unaffected, which is why the page tells teams to lead
  // with them. Asserting it keeps a future edit from flattening the asymmetry.
  const notes = entry.trust.notes.join(" ")
  assert.match(notes, /Deny and ask rules/)
})

test("no table row repeats a cell value in a way the renderer cannot key", () => {
  for (const section of tables) {
    for (const row of section.rows) {
      assert.equal(
        row.cells.length,
        section.columns.length - 1,
        `${section.title}: row "${row.label}" does not fill the table`,
      )
    }
  }
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 5)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("managed policy directory"),
    "the page does not flag the unpublished enterprise skills path",
  )
  assert.ok(
    limits.includes("seat type"),
    "the page does not flag the gap between the plan matrix and the seat types",
  )
  assert.ok(
    limits.includes("registry"),
    "the page does not flag the absence of a catalog to browse",
  )
})

test("the FAQ is self-contained, extractable, and covers the cluster", () => {
  assert.ok(entry.faq.length >= 6)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    assert.match(
      item.question,
      /Claude Code|team/,
      `"${item.question}" does not name the subject`,
    )
  }

  for (const term of [
    "plan",
    "settings",
    "skills",
    "mcp",
    "claude.md",
    "lock down",
  ]) {
    assert.ok(
      entry.faq.some((item) => item.question.toLowerCase().includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 2500, `word count is ${words}`)
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the product copy follows the current category narrative", () => {
  const copy = JSON.stringify(entry)

  // Skills Board is a web app a team signs in to. "Shared library" is never
  // the definition, and the team's skills are never described as recommended.
  assert.ok(
    copy.includes("the web app where a team keeps and shares its AI skills"),
    "the team section does not use the approved product sentence",
  )
  assert.doesNotMatch(copy, /shared library/i)
  assert.doesNotMatch(copy, /recommend(s|ed|ation|ations)\b/i)
})

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      ...tables.map((section) => section.link.href),
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 6, "fewer than six internal outbound links")

  // The three neighbours this page is differentiated against: the org-level
  // page above it, the compatibility matrix beside it, and the selection page
  // that answers the half no setting covers.
  for (const path of [
    manageAiSkillsPath,
    agentSkillsSupportPath,
    bestClaudeSkillsPath,
    guidePaths.writeSkillMd,
  ]) {
    assert.ok(outbound.has(path), `no link to ${path}`)
  }

  for (const source of [claudeSkills, manageAiSkills]) {
    assert.ok(
      source.related.some((link) => link.href === entry.path),
      `${source.path} does not link to ${entry.path}`,
    )
  }
})

test("the schema carries TechArticle, FAQPage, and a breadcrumb", () => {
  const graph = buildResourceArticleSchema(entry)["@graph"]
  const byType = (type) => graph.find((node) => node["@type"] === type)

  const article = byType("TechArticle")
  assert.ok(article, "missing TechArticle")
  assert.equal(article.headline, entry.title)
  assert.equal(article.url, canonical)
  assert.deepEqual(
    article.citation,
    entry.sources.map((source) => source.href),
  )

  const faq = byType("FAQPage")
  assert.ok(faq, "missing FAQPage")
  assert.equal(faq.mainEntity.length, entry.faq.length)
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, entry.faq[0].answer)

  const breadcrumbs = byType("BreadcrumbList")
  assert.ok(breadcrumbs, "missing BreadcrumbList")
  assert.equal(breadcrumbs.itemListElement.at(-1).item, canonical)
})

test("every section cites a source that the page actually lists", () => {
  const known = new Set(entry.sources.map((source) => source.id))
  const cited = [
    entry.answerSourceIds,
    ...tables.map((section) => section.sourceIds),
    entry.install.sourceIds,
    entry.team.sourceIds,
    entry.openQuestions.sourceIds,
  ]

  for (const ids of cited) {
    assert.ok(ids.length > 0, "a section cites nothing")
    for (const id of ids) {
      assert.ok(known.has(id), `unknown source id: ${id}`)
    }
  }

  // Every listed source is actually used by a section.
  const used = new Set(cited.flat())
  for (const source of entry.sources) {
    assert.ok(used.has(source.id), `${source.id} is listed but never cited`)
  }
})

test("every cited source is a first-party Anthropic page", () => {
  for (const source of entry.sources) {
    assert.match(
      source.href,
      /^https:\/\/(code|support|platform)\.claude\.com\//,
      `${source.id} is not a first-party source`,
    )
  }
})
