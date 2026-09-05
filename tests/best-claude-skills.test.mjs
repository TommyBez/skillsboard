import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { bestClaudeSkills, bestClaudeSkillsPath } = await import(
  "../lib/seo/best-claude-skills/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { anthropicSkills } = await import("../lib/seo/anthropic-skills/index.ts")
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

const entry = bestClaudeSkills
const canonical = `https://www.skillsboard.sh${bestClaudeSkillsPath}`
const markdown = renderMarkdownTwin(bestClaudeSkillsPath) ?? ""

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The four register sections, in the order the page renders them. */
const registers = [
  entry.engineering,
  entry.interfaces,
  entry.delivery,
  entry.authoring,
]

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the article is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/best-claude-skills")
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
      "../components/best-claude-skills/best-claude-skills-page.tsx",
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
  assert.ok(
    llms.includes(`Last reviewed: ${entry.modifiedAt}`),
    "llms.txt was not re-reviewed alongside the new entry",
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
    entry.method.title,
    ...registers.map((section) => section.title),
    entry.dropped.title,
    entry.openQuestions.title,
    entry.team.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of registers) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the selection method is stated before the selection", () => {
  // Seven pass-or-fail criteria, numbered so a reader can cite one back.
  assert.equal(entry.method.criteria.length, 7)
  entry.method.criteria.forEach((criterion, index) => {
    assert.ok(
      criterion.label.startsWith(`${index + 1}. `),
      `criterion ${index + 1} is not numbered in order`,
    )
    assert.ok(criterion.body.length > 120, `${criterion.label} is a stub`)
  })

  // The two criteria that did the removing have to be present by name.
  const method = JSON.stringify(entry.method)
  assert.ok(method.includes("SKILL.md"), "the page never says it read the file")
  assert.ok(method.includes("license"), "no license criterion")
  assert.ok(method.includes("ninety days"), "no maintenance window")

  // Popularity is explicitly excluded rather than silently unused.
  assert.ok(
    method.includes("Popularity is not on the list"),
    "the page does not say popularity was excluded",
  )
})

test("the register is grouped, complete, and cites how each entry ships", () => {
  const rows = registers.flatMap((section) => section.rows)
  assert.equal(rows.length, 27, `the register holds ${rows.length} entries`)

  // The unit is the entry. One entry, Prisma's, is a curated set of nine
  // folders that share a single job, so twenty-seven entries cover
  // thirty-five individual skills and the copy has to say both numbers.
  const prismaSet = rows.find((row) => row.label === "The Prisma set")
  assert.ok(prismaSet, "the Prisma set is no longer a single entry")
  assert.match(
    prismaSet.cells[0],
    /^Nine folders/,
    "the Prisma entry no longer describes nine folders",
  )
  const individualSkills = rows.length - 1 + 9
  assert.equal(
    individualSkills,
    35,
    `the entries cover ${individualSkills} individual skills`,
  )

  const copy = JSON.stringify(entry)
  assert.ok(
    copy.includes("thirty-five"),
    "the page never states how many individual skills the entries cover",
  )
  assert.doesNotMatch(
    copy,
    /twenty-seven (?:Claude )?skills/i,
    "the page still counts twenty-seven entries as twenty-seven skills",
  )

  const labels = rows.map((row) => row.label)
  assert.equal(
    new Set(labels).size,
    labels.length,
    "a skill is listed in two groups",
  )

  for (const section of registers) {
    assert.equal(section.columns.length, 3, `${section.title} is not a triple`)
    for (const row of section.rows) {
      assert.equal(
        row.cells.length,
        2,
        `${row.label} has the wrong cell count`,
      )
      assert.ok(
        row.cells[0].length > 140,
        `${row.label} has no substantive description`,
      )
      assert.match(
        row.cells[1],
        /MIT|Apache 2\.0|proprietary/,
        `${row.label} does not name a license`,
      )
    }
  }
})

test("the page says what it dropped and why", () => {
  assert.ok(entry.dropped.entries.length >= 8)

  const dropped = JSON.stringify(entry.dropped)
  // The three disqualifiers a popularity list would have ignored.
  assert.ok(dropped.includes("NOASSERTION"), "no unnamed-license drop")
  assert.ok(dropped.includes("no SKILL.md"), "no not-a-skill drop")
  assert.ok(
    dropped.includes("awesome"),
    "the awesome lists are not addressed",
  )

  for (const item of entry.dropped.entries) {
    assert.ok(item.body.length > 200, `${item.title} gives no reason`)
  }
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 5)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("No usage number exists"),
    "the page does not flag the missing per-skill usage data",
  )
  assert.ok(
    limits.includes("measures a CLI"),
    "the page does not flag what the install count measures",
  )
  assert.ok(
    limits.includes("eval"),
    "the page does not flag the absence of published evals",
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
      /skill/i,
      `"${item.question}" does not name the subject`,
    )
  }

  for (const term of ["best", "coding", "github", "awesome", "top", "list"]) {
    assert.ok(
      entry.faq.some((item) => item.question.toLowerCase().includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("the article reads as a full page rather than a stub", () => {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  assert.ok(words >= 3200, `word count is ${words}`)
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the page links out, and the sibling pages link in", () => {
  const outbound = new Set(
    [
      entry.method.link.href,
      ...registers.map((section) => section.link.href),
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 4, "fewer than four internal outbound links")

  // The three sibling pages this one must not cannibalise are all linked.
  for (const sibling of [
    whereToFindClaudeSkills.path,
    anthropicSkills.path,
    claudeSkills.path,
  ]) {
    assert.ok(outbound.has(sibling), `no link to ${sibling}`)
  }

  // Contextual inbound links, not only navigation.
  assert.equal(whereToFindClaudeSkills.community.link.href, entry.path)
  assert.equal(anthropicSkills.catalog.link.href, entry.path)

  for (const source of [
    agentSkills,
    anthropicSkills,
    claudeSkills,
    whereToFindClaudeSkills,
  ]) {
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
  assert.ok(entry.sources.length >= 15, "too few primary sources")

  const cited = [
    entry.answerSourceIds,
    entry.method.sourceIds,
    ...registers.map((section) => section.sourceIds),
    entry.dropped.sourceIds,
    entry.openQuestions.sourceIds,
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
})
