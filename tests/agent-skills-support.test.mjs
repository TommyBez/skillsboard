import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { agentSkillsSupport, agentSkillsSupportPath } = await import(
  "../lib/seo/agent-skills-support/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { codexSkills } = await import("../lib/seo/codex-skills/index.ts")
const { cursorSkills } = await import("../lib/seo/cursor-skills/index.ts")
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

const entry = agentSkillsSupport
const canonical = `https://www.skillsboard.sh${agentSkillsSupportPath}`
const markdown = renderMarkdownTwin(agentSkillsSupportPath) ?? ""

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The three matrices, in the order the page renders them. */
const matrices = [entry.documented, entry.showcase, entry.paths]

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the article is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/agent-skills-support")
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
    layout.includes("agent_skills_support_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/agent-skills-support/agent-skills-support-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`agent_skills_support_${suffix}`),
      `the page never renders the agent_skills_support_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"agent_skills_support_${suffix}"`),
      `landing_cta_clicked cannot report agent_skills_support_${suffix}`,
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
  // re-reviewed on the new date. This page did not re-read the twenty-seven
  // repository sources behind /best-claude-skills, so the shared line stays on
  // the date of that review and this page carries its own date instead.
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

  // The path does not end in `-skills`, so the shared rewrite does not cover
  // it and it needs a rule of its own, the way /agents-md-vs-skill-md does.
  assert.doesNotMatch(entry.path.slice(1), /^[^/]*-skills$/)
  const { beforeFiles } = await rewrites()
  const negotiated = beforeFiles.find((rule) => rule.source === entry.path)
  assert.ok(negotiated, "no Markdown content negotiation rewrite")
  assert.equal(negotiated.destination, `/api/markdown?path=${entry.path}`)
})

test("the Markdown twin carries every section, the tables, and the FAQ", () => {
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    entry.criteria.title,
    ...matrices.map((section) => section.title),
    entry.notDocumented.title,
    entry.team.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of matrices) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the support criteria are stated before the matrices", () => {
  // Five pass-or-fail rules, numbered so a reader can cite one back.
  assert.equal(entry.criteria.rules.length, 5)
  entry.criteria.rules.forEach((rule, index) => {
    assert.ok(
      rule.label.startsWith(`${index + 1}. `),
      `rule ${index + 1} is not numbered in order`,
    )
    assert.ok(rule.body.length > 120, `${rule.label} is a stub`)
  })

  const criteria = JSON.stringify(entry.criteria)
  assert.ok(
    criteria.includes("SKILL.md"),
    "the bar never names the file that has to be read",
  )
  assert.ok(
    criteria.includes("August 20, 2026"),
    "the criteria do not state the date the sources were fetched",
  )
  assert.ok(
    criteria.includes("Popularity is not a criterion"),
    "the page does not say popularity was excluded",
  )
  assert.ok(
    criteria.includes("Silence is recorded as silence"),
    "the page does not commit to reporting undocumented behavior",
  )
})

test("the two evidence levels stay separate and are labelled", () => {
  // Eleven vendor-documented clients, each with a first-party source.
  assert.equal(entry.documented.rows.length, 11)
  for (const row of entry.documented.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.ok(
      row.cells[0].length > 200,
      `${row.label} has no substantive description of what is documented`,
    )
    assert.ok(row.cells[1].length > 40, `${row.label} names no location`)
  }

  // The showcase held forty-six entries; ten of them are in the matrix above.
  assert.equal(entry.showcase.rows.length, 36)
  assert.equal(entry.documented.rows.length + entry.showcase.rows.length, 47)
  for (const row of entry.showcase.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.match(
      row.cells[1],
      /^(Linked|None listed)$/,
      `${row.label} does not state whether setup instructions are published`,
    )
  }

  // Exactly one showcase entry publishes no setup instructions.
  const unlinked = entry.showcase.rows.filter(
    (row) => row.cells[1] === "None listed",
  )
  assert.equal(unlinked.length, 1)
  assert.equal(unlinked[0].label, "Piebald")

  // The weaker level says out loud that it is the weaker level.
  const showcase = JSON.stringify(entry.showcase)
  assert.ok(showcase.includes("self-nomination"), "the weaker bar is not named")
  assert.ok(
    showcase.includes("forty-six"),
    "the showcase count on the check date is missing",
  )

  const labels = [...entry.documented.rows, ...entry.showcase.rows].map(
    (row) => row.label,
  )
  assert.equal(new Set(labels).size, labels.length, "a client is listed twice")
})

test("the directory matrix names the neutral path and the Claude Code gap", () => {
  const paths = JSON.stringify(entry.paths)
  assert.ok(paths.includes(".agents/skills/"), "the neutral path is missing")
  assert.ok(paths.includes(".claude/skills/"), "the Claude path is missing")
  assert.ok(
    paths.includes("Claude Code's documentation never mentions it"),
    "the page does not flag that Claude Code omits the neutral path",
  )
  assert.ok(
    paths.includes("No filesystem path at all"),
    "the surfaces without a filesystem are not separated out",
  )

  for (const row of entry.paths.rows) {
    assert.equal(row.cells.length, 2, `${row.label} has the wrong cell count`)
    assert.ok(row.cells[1].length > 100, `${row.label} explains nothing`)
  }
})

test("undocumented behavior is declared rather than asserted", () => {
  assert.ok(entry.notDocumented.entries.length >= 5)

  const gaps = JSON.stringify(entry.notDocumented)
  assert.ok(
    gaps.includes("No client publishes a conformance result"),
    "the page does not flag the absence of conformance testing",
  )
  assert.ok(
    gaps.includes("does not mention either .codex directory"),
    "the Codex directory silence is not recorded",
  )
  assert.ok(
    gaps.includes("do not sync across surfaces"),
    "the Anthropic cross-surface limit is missing",
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
    "support",
    "which ai agents",
    "showcase",
    "directory",
    "claude",
    "copilot",
  ]) {
    assert.ok(
      entry.faq.some((item) => item.question.toLowerCase().includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 4800, `word count is ${words}`)
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
      "a web application where a team keeps and shares its AI skills",
    ),
    "the page does not use the agreed product description",
  )
})

test("the page links out, and the sibling pages link in", () => {
  const outbound = new Set(
    [
      entry.criteria.link.href,
      ...matrices.map((section) => section.link.href),
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 5, "fewer than five internal outbound links")

  // The three sibling pages this one must not cannibalise are all linked.
  for (const sibling of [agentSkills.path, cursorSkills.path, codexSkills.path]) {
    assert.ok(outbound.has(sibling), `no link to ${sibling}`)
  }

  for (const source of [agentSkills, cursorSkills, codexSkills]) {
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
  assert.ok(entry.sources.length >= 13, "too few primary sources")

  const cited = [
    entry.answerSourceIds,
    entry.criteria.sourceIds,
    ...matrices.map((section) => section.sourceIds),
    entry.notDocumented.sourceIds,
    entry.team.sourceIds,
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

  // Every documented client row is backed by a first-party source.
  assert.equal(entry.documented.sourceIds.length, 10)
})
