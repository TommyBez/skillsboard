import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { anthropicSkills, anthropicSkillsPath } = await import(
  "../lib/seo/anthropic-skills/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { whereToFindClaudeSkills } = await import(
  "../lib/seo/where-to-find-claude-skills/index.ts"
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

const entry = anthropicSkills
const canonical = `https://www.skillsboard.sh${anthropicSkillsPath}`
const markdown = renderMarkdownTwin(anthropicSkillsPath) ?? ""

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
  assert.equal(entry.path, "/anthropic-skills")
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
      "../components/anthropic-skills/anthropic-skills-page.tsx",
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

  // The sibling articles pin the single `Last reviewed` line to their own
  // modifiedAt, so moving it forward asserts that every one of them was
  // re-reviewed on the new date. This page re-read the Claude Code commands
  // reference on 2026-09-03 and nothing else, so the shared line stays at the
  // date of that full review and this page carries its own date instead.
  assert.ok(
    llms.includes("Last reviewed: 2026-08-19"),
    "the shared review date moved without a full re-review",
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

  // The path ends in `-skills`, so the existing Accept rewrite already covers
  // it and no rule of its own is needed.
  const { beforeFiles } = await rewrites()
  const negotiated = beforeFiles.find(
    (rule) => rule.source === "/:slug([^/]*-skills)",
  )
  assert.ok(negotiated, "the shared -skills Markdown rewrite is missing")
  assert.match(entry.path.slice(1), /^[^/]*-skills$/)
})

test("the Markdown twin carries every section, the tables, and the FAQ", () => {
  assert.ok(markdown.includes(`\n\n# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    entry.sets.title,
    entry.catalog.title,
    entry.bundled.title,
    entry.surfaces.title,
    entry.licensing.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of [
    entry.sets,
    entry.catalog,
    entry.bundled,
    entry.surfaces,
    entry.licensing,
  ]) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page is a registry rather than a second definition page", () => {
  // A catalog earns its place by listing things. The three sets are the spine.
  assert.deepEqual(
    entry.sets.rows.map((row) => row.label),
    [
      "Pre-built document skills",
      "The anthropics/skills repository",
      "Claude Code bundled skills",
    ],
  )

  // Every folder in anthropics/skills on the day the page was written.
  const repositorySkills = [
    "academy-guide",
    "algorithmic-art",
    "brand-guidelines",
    "canvas-design",
    "claude-api",
    "discernment-nudge",
    "doc-coauthoring",
    "docx",
    "frontend-design",
    "internal-comms",
    "mcp-builder",
    "pdf",
    "pptx",
    "skill-creator",
    "slack-gif-creator",
    "theme-factory",
    "web-artifacts-builder",
    "webapp-testing",
    "xlsx",
  ]
  assert.deepEqual(
    entry.catalog.rows.map((row) => row.label),
    repositorySkills,
    "the catalog no longer matches the repository we verified",
  )

  // The bundled Claude Code skills are first-party too, and are the half of
  // the answer the repository does not carry.
  assert.equal(entry.bundled.rows.length, 15)
  for (const row of entry.bundled.rows) {
    assert.match(row.label, /^\/[a-z-]+$/, `${row.label} is not a command`)
  }

  // Four surfaces at minimum, because "where does it load" is the head query.
  const surfaces = entry.surfaces.rows.map((row) => row.label)
  for (const surface of [
    "Claude Code",
    "claude.ai",
    "Claude Cowork",
    "Claude API",
  ]) {
    assert.ok(surfaces.includes(surface), `no row for ${surface}`)
  }

  // The licensing split is the fact most write-ups get wrong.
  const licensing = JSON.stringify(entry.licensing)
  assert.ok(licensing.includes("Apache 2.0"), "no Apache row")
  assert.ok(
    licensing.includes("Source-available"),
    "the source-available document skills are not called out",
  )

  assert.ok(entry.sources.length >= 10, "too few primary sources")
})

test("every catalogued skill names the plugin or license that ships it", () => {
  for (const row of entry.catalog.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.match(
      row.cells[1],
      /example-skills|document-skills|its own plugin|Apache 2\.0|Proprietary|no LICENSE\.txt/,
      `${row.label} does not say how it ships`,
    )
  }
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 4)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("No published index"),
    "the page does not flag the missing repository index",
  )
  assert.ok(
    limits.includes("reserved-word rule"),
    "the page does not flag the reserved-word contradiction",
  )
  assert.ok(
    limits.includes("No license on the repository as a whole"),
    "the page does not flag the missing repository-level license",
  )
})

test("the FAQ is self-contained, extractable, and names the vendor", () => {
  assert.ok(entry.faq.length >= 6)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    assert.match(
      item.question,
      /Anthropic/,
      `"${item.question}" does not name the vendor`,
    )
  }

  for (const term of ["how many", "document", "open source", "install"]) {
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

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      entry.sets.link.href,
      entry.catalog.link.href,
      entry.bundled.link.href,
      entry.surfaces.link.href,
      entry.licensing.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")

  // Contextual inbound links, not only navigation.
  assert.equal(whereToFindClaudeSkills.official.link?.href, entry.path)
  assert.equal(agentSkills.examples.link?.href, entry.path)

  for (const source of [claudeSkills, agentSkills, whereToFindClaudeSkills]) {
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
    entry.sets.sourceIds,
    entry.catalog.sourceIds,
    entry.bundled.sourceIds,
    entry.surfaces.sourceIds,
    entry.licensing.sourceIds,
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
