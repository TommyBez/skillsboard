import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { manageAiSkills, manageAiSkillsPath } = await import(
  "../lib/seo/manage-ai-skills/index.ts"
)
const { agentSkillsSupport } = await import(
  "../lib/seo/agent-skills-support/index.ts"
)
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

const entry = manageAiSkills
const canonical = `https://www.skillsboard.sh${manageAiSkillsPath}`
const markdown = renderMarkdownTwin(manageAiSkillsPath) ?? ""

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The three tables, in the order the page renders them. */
const tables = [entry.scatter, entry.mechanisms, entry.channels]

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the article is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/manage-ai-skills")
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

test("the page mounts its own four CTA locations", async () => {
  const layout = await readFile(
    new URL(`../app${entry.path}/layout.tsx`, import.meta.url),
    "utf8",
  )
  assert.ok(
    layout.includes("manage_ai_skills_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/manage-ai-skills/manage-ai-skills-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`manage_ai_skills_${suffix}`),
      `the page never renders the manage_ai_skills_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"manage_ai_skills_${suffix}"`),
      `landing_cta_clicked cannot report manage_ai_skills_${suffix}`,
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
  // re-reviewed on the new date. This page re-read its own eleven sources
  // only, so the shared line stays where the last full review left it and
  // this page carries its own date instead.
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
  assert.equal(redirect.permanent, true, "the redirect is not permanent")

  // The path ends in `-skills`, so the shared Accept rewrite already covers it
  // and no rule of its own is needed.
  assert.match(entry.path.slice(1), /^[^/]*-skills$/)
  const { beforeFiles } = await rewrites()
  const negotiated = beforeFiles.find(
    (rule) => rule.source === "/:slug([^/]*-skills)",
  )
  assert.ok(negotiated, "the shared Markdown rewrite is gone")
  assert.equal(negotiated.destination, "/api/markdown?path=/:slug")
})

test("the Markdown twin carries every section, the tables, and the FAQ", () => {
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    ...tables.map((section) => section.title),
    entry.requirements.title,
    entry.team.title,
    entry.notDocumented.title,
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

test("both spellings of the target query appear in the copy", () => {
  const copy = JSON.stringify(entry)
  assert.match(copy, /across an organization/i)
  assert.match(copy, /across an organisation/i)
})

test("every documented mechanism states where it stops", () => {
  assert.deepEqual(entry.mechanisms.columns, [
    "Mechanism",
    "What the vendor documents",
    "Where it stops",
  ])
  assert.ok(
    entry.mechanisms.rows.length >= 8,
    "fewer than eight documented mechanisms",
  )

  for (const row of entry.mechanisms.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.ok(
      row.cells[0].length > 150,
      `${row.label} does not say what the vendor documents`,
    )
    assert.ok(
      row.cells[1].length > 150,
      `${row.label} never states where the mechanism stops`,
    )
  }

  // The four vendors whose mechanisms a mixed-agent team actually meets.
  const labels = entry.mechanisms.rows.map((row) => row.label).join(" | ")
  for (const vendor of ["Claude Code", "claude.ai", "Claude API", "Codex", "Cursor"]) {
    assert.ok(labels.includes(vendor), `no mechanism row for ${vendor}`)
  }

  const mechanisms = JSON.stringify(entry.mechanisms)
  assert.ok(
    mechanisms.includes("August 21, 2026"),
    "the section does not state the date the sources were fetched",
  )
})

test("the requirements are numbered and stated before the product", () => {
  assert.equal(entry.requirements.rules.length, 5)
  entry.requirements.rules.forEach((rule, index) => {
    assert.ok(
      rule.label.startsWith(`${index + 1}. `),
      `rule ${index + 1} is not numbered in order`,
    )
    assert.ok(rule.body.length > 150, `${rule.label} is a stub`)
  })

  const requirements = JSON.stringify(entry.requirements)
  assert.ok(
    requirements.includes("None of the five requires a product"),
    "the page does not admit the requirements can be met without it",
  )
})

test("every delivery channel names what it does not do", () => {
  assert.ok(entry.channels.rows.length >= 6, "fewer than six channels")
  for (const row of entry.channels.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.ok(row.cells[1].length > 80, `${row.label} claims no limit`)
  }

  const channels = JSON.stringify(entry.channels)
  for (const shipped of [
    "npx skills add",
    "skills:read",
    "skills:write",
    "twenty-five skills",
    "noindex",
  ]) {
    assert.ok(channels.includes(shipped), `the channel table omits ${shipped}`)
  }
})

test("the limits say what the product cannot do", () => {
  assert.ok(entry.team.limits.length >= 5)
  const limits = entry.team.limits.join(" ")
  assert.ok(
    limits.includes("not an administration control plane"),
    "the page does not rule out the admin claim",
  )
  assert.ok(
    limits.includes("team recommendation"),
    "the page does not state what a save means",
  )
  assert.ok(
    limits.includes("cannot install or execute"),
    "the MCP limit is missing",
  )
})

test("undocumented behavior is declared rather than asserted", () => {
  assert.ok(entry.notDocumented.entries.length >= 5)

  const gaps = JSON.stringify(entry.notDocumented)
  assert.ok(
    gaps.includes("No mechanism crosses a vendor boundary"),
    "the cross-vendor gap is missing",
  )
  assert.ok(
    gaps.includes("Two Anthropic pages disagree"),
    "the contradiction between the two Anthropic sources is not recorded",
  )
  assert.ok(
    gaps.includes("usage analytics are not currently available"),
    "the absence of usage reporting is not recorded",
  )

  for (const item of entry.notDocumented.entries) {
    assert.ok(item.body.length > 200, `${item.title} gives no detail`)
  }
})

test("the FAQ is self-contained, extractable, and covers the cluster", () => {
  assert.ok(entry.faq.length >= 5)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    assert.match(
      item.question,
      /skill/i,
      `"${item.question}" does not name the subject`,
    )
  }

  for (const term of [
    "across an organization",
    "across an organisation",
    "share ai agent skills with a team",
    "share claude skills with your team",
    "different agents",
  ]) {
    assert.ok(
      entry.faq.some((item) => item.question.toLowerCase().includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  // The band is the family the sibling twins already occupy: 5,031 for
  // /where-to-find-claude-skills up to 5,590 for /agent-skills-support. A page
  // that drifts far below it has lost a table; far above it has lost an edit.
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 4600, `word count is ${words}`)
  assert.ok(words <= 5600, `word count is ${words}`)
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the product is never described as a shared library", () => {
  const copy = JSON.stringify(entry)
  assert.doesNotMatch(copy, /shared library/i)
  assert.ok(
    copy.includes(
      "a web application where a team keeps, searches, and shares the AI skills it recommends",
    ),
    "the page does not use the agreed product description",
  )
})

test("the page links out, and the sibling pages link in", () => {
  const outbound = new Set(
    [
      ...tables.map((section) => section.link.href),
      entry.requirements.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 6, "fewer than six internal outbound links")

  for (const destination of [
    "/agent-skills",
    "/agent-skills-support",
    "/where-to-find-claude-skills",
    "/pricing",
  ]) {
    assert.ok(outbound.has(destination), `no link to ${destination}`)
  }

  for (const source of [agentSkillsSupport, whereToFindClaudeSkills]) {
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
  assert.ok(entry.sources.length >= 11, "too few sources")

  const cited = [
    entry.answerSourceIds,
    ...tables.map((section) => section.sourceIds),
    entry.requirements.sourceIds,
    entry.team.sourceIds,
    entry.notDocumented.sourceIds,
  ]

  for (const ids of cited) {
    assert.ok(ids.length > 0, "a section cites nothing")
    for (const id of ids) {
      assert.ok(known.has(id), `unknown source id: ${id}`)
    }
  }

  const used = new Set(cited.flat())
  for (const source of entry.sources) {
    assert.ok(used.has(source.id), `${source.id} is listed but never cited`)
  }

  // The vendor documentation behind the mechanism table, all fetched the same
  // day, plus the two Anthropic pages that disagree with each other.
  for (const id of [
    "claude-code-skills",
    "anthropic-skills-overview",
    "anthropic-skills-enterprise",
    "claude-provision-skills",
    "codex-skills",
    "cursor-skills",
  ]) {
    assert.ok(
      entry.mechanisms.sourceIds.includes(id) ||
        entry.notDocumented.sourceIds.includes(id),
      `${id} backs no mechanism and no gap`,
    )
  }
})
