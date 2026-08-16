import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { agentsMdVsSkillMd, agentsMdVsSkillMdPath } = await import(
  "../lib/seo/agents-md-vs-skill-md/index.ts"
)
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { codexSkills } = await import("../lib/seo/codex-skills/index.ts")
const { cursorSkills } = await import("../lib/seo/cursor-skills/index.ts")
const { aiCodingGuidelinesTemplateGuide } = await import(
  "../lib/seo/guides/content/ai-coding-guidelines-template.ts"
)
const { resourceClusters, resourceEntries } = await import("../lib/seo/resources.ts")
const { markdownTwinAlternates, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const { buildResourceArticleSchema } = await import(
  "../lib/seo/resource-article-schema.ts"
)
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig } = await import("../next.config.ts")

const entry = agentsMdVsSkillMd
const canonical = `https://www.skillsboard.sh${agentsMdVsSkillMdPath}`
const markdown = renderMarkdownTwin(agentsMdVsSkillMdPath) ?? ""

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
  assert.equal(entry.path, "/agents-md-vs-skill-md")
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
  for (const file of ["page.tsx", "layout.tsx", "opengraph-image.tsx", "twitter-image.tsx"]) {
    assert.ok(
      await exists(`../app${entry.path}/${file}`),
      `app${entry.path}/${file} does not exist`,
    )
  }
})

test("the article is listed in the static llms.txt", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")
})

test("the canonical URL is reachable with and without a trailing slash", async () => {
  const { redirects, rewrites } = nextConfig
  const redirectRules = await redirects()
  assert.ok(
    redirectRules.some(
      (rule) => rule.source === `${entry.path}/` && rule.destination === entry.path,
    ),
    "the trailing-slash spelling has no permanent redirect",
  )

  const { beforeFiles } = await rewrites()
  const negotiated = beforeFiles.find((rule) => rule.source === entry.path)
  assert.ok(
    negotiated,
    "the path does not end in -skills, so it needs its own Accept rewrite to serve the twin",
  )
  assert.equal(negotiated.destination, `/api/markdown?path=${entry.path}`)
})

test("the Markdown twin carries every section, both files, and the FAQ", () => {
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    entry.comparison.title,
    entry.support.title,
    entry.examples.title,
    entry.together.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(markdown.includes(`## ${title}`), `missing section heading: ${title}`)
  }

  const header = `| ${entry.comparison.columns.join(" | ")} |`
  assert.ok(markdown.includes(header), "the comparison table lost its header row")

  for (const example of entry.examples.entries) {
    assert.ok(
      markdown.includes(example.template),
      `the ${example.title} example is not rendered verbatim`,
    )
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page answers the cluster with the documented behavior", () => {
  const copy = JSON.stringify(entry)

  // The single most misunderstood fact in this cluster.
  assert.ok(
    copy.includes("reads CLAUDE.md, not AGENTS.md"),
    "the page does not state that Claude Code reads CLAUDE.md rather than AGENTS.md",
  )
  assert.ok(
    copy.includes("project_doc_max_bytes"),
    "the page does not name the documented Codex size cap",
  )

  const agents = entry.support.rows.map((row) => row.label)
  assert.deepEqual(agents, ["Claude Code", "Codex", "Cursor"])

  // Every claim is attributable, and both formats have a real example.
  assert.ok(entry.sources.length >= 8, "too few primary sources")
  assert.equal(entry.examples.entries.length, 2)
  assert.ok(
    entry.examples.entries.some((example) => example.template.startsWith("# AGENTS.md")),
    "missing a minimal AGENTS.md example",
  )
  assert.ok(
    entry.examples.entries.some((example) => example.template.startsWith("---\nname:")),
    "missing a minimal SKILL.md example",
  )
})

test("the FAQ is self-contained, extractable, and covers the cluster", () => {
  assert.ok(entry.faq.length >= 6)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(words >= 35 && words <= 75, `"${item.question}" answer is ${words} words`)
  }

  for (const agent of ["Claude Code", "Codex", "Cursor"]) {
    assert.ok(
      entry.faq.some((item) => item.question.includes(agent.split(" ")[0])),
      `no FAQ entry addresses ${agent}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 1500, `word count is ${words}`)
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      entry.comparison.link.href,
      entry.together.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")

  // QW9: contextual inbound links, not only navigation.
  assert.equal(codexSkills.locations.link.href, entry.path)
  assert.equal(aiCodingGuidelinesTemplateGuide.answerLink?.href, entry.path)

  for (const source of [claudeSkills, codexSkills, cursorSkills]) {
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
  assert.deepEqual(article.citation, entry.sources.map((source) => source.href))

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
    entry.comparison.sourceIds,
    entry.support.sourceIds,
    entry.examples.sourceIds,
    entry.together.sourceIds,
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
