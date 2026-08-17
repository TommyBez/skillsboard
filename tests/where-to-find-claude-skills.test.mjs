import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { whereToFindClaudeSkills, whereToFindClaudeSkillsPath } = await import(
  "../lib/seo/where-to-find-claude-skills/index.ts"
)
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { chooseFirstTeamSkillGuide } = await import(
  "../lib/seo/guides/content/choose-first-team-skill.ts"
)
const { alternatives } = await import("../lib/seo/alternatives.ts")
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

const entry = whereToFindClaudeSkills
const canonical = `https://www.skillsboard.sh${whereToFindClaudeSkillsPath}`
const markdown = renderMarkdownTwin(whereToFindClaudeSkillsPath) ?? ""

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
  assert.equal(entry.path, "/where-to-find-claude-skills")
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

test("the article is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")
})

test("the canonical URL is reachable with and without a trailing slash", async () => {
  const { redirects, rewrites } = nextConfig
  const redirectRules = await redirects()
  const redirect = redirectRules.find(
    (rule) => rule.source === `${entry.path}/` && rule.destination === entry.path,
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

  const condition = negotiated.has?.find(
    (rule) => rule.type === "header" && rule.key === "accept",
  )
  assert.ok(condition?.value, "the Markdown rewrite has no Accept condition")
  const accept = new RegExp(`^${condition.value}$`)
  assert.match("text/markdown", accept)
  assert.doesNotMatch(
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    accept,
  )
})

test("the Markdown twin carries every section, the tables, and the FAQ", () => {
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    entry.landscape.title,
    entry.official.title,
    entry.catalogs.title,
    entry.community.title,
    entry.vetting.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(markdown.includes(`## ${title}`), `missing section heading: ${title}`)
  }

  for (const section of [entry.landscape, entry.vetting]) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page answers the commercial query with the documented reality", () => {
  const copy = JSON.stringify(entry)

  // The single most misunderstood fact in this cluster.
  assert.ok(
    copy.includes("There is no Anthropic skills marketplace"),
    "the page does not state that no Anthropic skills marketplace exists",
  )
  assert.ok(
    copy.includes("claude-plugins-official"),
    "the page does not name the official plugin marketplace",
  )
  assert.ok(
    copy.includes("claude.com/plugins"),
    "the page does not name the public plugin catalog",
  )

  // The name collision that sends this query to the wrong page.
  assert.ok(
    copy.includes("Claude Marketplace"),
    "the page does not disambiguate the Claude Marketplace product",
  )

  // Every documented channel is named in the landscape table.
  const channels = entry.landscape.rows.map((row) => row.label)
  for (const channel of [
    "claude-plugins-official",
    "claude.com/plugins",
    "anthropics/skills",
    "skills.sh",
  ]) {
    assert.ok(channels.includes(channel), `the landscape omits ${channel}`)
  }

  // Screening is stated per source rather than assumed.
  assert.equal(entry.vetting.rows.length, entry.landscape.rows.length)
  assert.ok(entry.sources.length >= 10, "too few primary sources")
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 3)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("self-reported"),
    "the page does not flag self-reported skill counts",
  )
  assert.ok(
    limits.includes("Anthropic verified"),
    "the page does not flag the undocumented verification badge",
  )
})

test("the FAQ is self-contained, extractable, and covers the cluster", () => {
  assert.ok(entry.faq.length >= 6)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(words >= 40 && words <= 60, `"${item.question}" answer is ${words} words`)
  }

  for (const term of ["marketplace", "directory", "skills.sh"]) {
    assert.ok(
      entry.faq.some((item) => item.question.includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 2000, `word count is ${words}`)
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      entry.landscape.link.href,
      entry.official.link.href,
      entry.vetting.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")

  // QW9: contextual inbound links, not only navigation.
  assert.equal(claudeSkills.ecosystem.link.href, entry.path)
  assert.equal(chooseFirstTeamSkillGuide.answerLink?.href, entry.path)

  assert.ok(
    claudeSkills.related.some((link) => link.href === entry.path),
    `${claudeSkills.path} does not link to ${entry.path}`,
  )
  const skillsSh = alternatives.find(
    (candidate) => candidate.path === "/alternatives/skills-sh",
  )
  assert.ok(
    skillsSh?.related.some((link) => link.href === entry.path),
    "the skills.sh alternative does not link to the discovery page",
  )
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
    entry.landscape.sourceIds,
    entry.official.sourceIds,
    entry.catalogs.sourceIds,
    entry.community.sourceIds,
    entry.vetting.sourceIds,
    entry.team.sourceIds,
    entry.openQuestions.sourceIds,
  ]

  for (const ids of cited) {
    assert.ok(ids.length > 0, "a section cites nothing")
    for (const id of ids) {
      assert.ok(known.has(id), `unknown source id: ${id}`)
    }
  }
})
