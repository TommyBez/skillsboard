import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { agentSkillsAdoption, agentSkillsAdoptionPath } = await import(
  "../lib/seo/agent-skills-adoption/index.ts"
)
const { allDatapoints, crawlWindow, datapointColumns } = await import(
  "../lib/seo/agent-skills-adoption/datapoints.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
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

const entry = agentSkillsAdoption
const canonical = `https://www.skillsboard.sh${agentSkillsAdoptionPath}`
const markdown = renderMarkdownTwin(agentSkillsAdoptionPath) ?? ""

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The three figure tables, in the order the page renders them. */
const tables = [entry.ecosystem, entry.crawlers, entry.search]

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the statistics page is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/agent-skills-adoption")
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
    layout.includes("agent_skills_adoption_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/agent-skills-adoption/agent-skills-adoption-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`agent_skills_adoption_${suffix}`),
      `the page never renders the agent_skills_adoption_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"agent_skills_adoption_${suffix}"`),
      `landing_cta_clicked cannot report agent_skills_adoption_${suffix}`,
    )
  }
})

test("the page is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")

  // The sibling articles pin the single `Last reviewed` line to the date of
  // the last full re-review of every pinned page. This page re-read its own
  // ten sources only, so the shared line stays where it is and the page
  // carries its own date instead, in `modifiedAt` and on the page itself.
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

  // The path does not end in `-skills`, so the shared Accept rewrite does not
  // reach it and it carries a rule of its own.
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

  for (const title of [
    entry.method.title,
    ...tables.map((section) => section.title),
    entry.notDocumented.title,
    entry.reuse.title,
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

test("every published figure lives in the data module, dated and sourced", () => {
  assert.ok(allDatapoints.length >= 12, "fewer than twelve datapoints")

  const known = new Set(entry.sources.map((source) => source.id))
  const ids = new Set()

  for (const datapoint of allDatapoints) {
    assert.ok(!ids.has(datapoint.id), `duplicate datapoint id: ${datapoint.id}`)
    ids.add(datapoint.id)
    assert.match(
      datapoint.measuredOn,
      /^\d{4}-\d{2}-\d{2}$/,
      `${datapoint.id} has no reading date`,
    )
    assert.ok(
      datapoint.measuredOn <= entry.modifiedAt,
      `${datapoint.id} claims to have been read after the page was checked`,
    )
    assert.ok(
      known.has(datapoint.sourceId),
      `${datapoint.id} cites an unknown source: ${datapoint.sourceId}`,
    )
    assert.ok(
      datapoint.detail.length > 80,
      `${datapoint.id} does not say what it counts`,
    )
  }
})

test("every table renders the data module rather than its own numbers", () => {
  const columns = [...datapointColumns]
  const rowCount = tables.reduce(
    (total, section) => total + section.rows.length,
    0,
  )
  assert.equal(rowCount, allDatapoints.length, "a datapoint renders nowhere")

  for (const section of tables) {
    assert.deepEqual(section.columns, columns)
    for (const row of section.rows) {
      assert.equal(row.cells.length, 3, `${row.label} has the wrong cell count`)
      const datapoint = allDatapoints.find(
        (candidate) => candidate.label === row.label,
      )
      assert.ok(datapoint, `${row.label} is not backed by a datapoint`)
      assert.equal(row.cells[0], datapoint.value)
      assert.equal(row.cells[2], datapoint.measuredOn)
    }
  }
})

test("the page states the window behind the crawler figures", () => {
  assert.equal(crawlWindow.days, 7)
  assert.ok(entry.crawlers.intro.includes(crawlWindow.end))
  const crawlers = JSON.stringify(entry.crawlers)
  assert.ok(
    crawlers.includes("9.3x"),
    "the page hides that the same ratio read differently a week earlier",
  )
  assert.ok(
    crawlers.includes("23,365"),
    "the page does not declare the traffic it excluded",
  )
})

test("the page declares its own size rather than implying a market", () => {
  const copy = JSON.stringify(entry)
  assert.ok(copy.includes("one small site"), "the page hides its own size")
  assert.ok(
    entry.notDocumented.entries.length >= 5,
    "fewer than five declared limits",
  )
  for (const item of entry.notDocumented.entries) {
    assert.ok(item.body.length > 200, `${item.title} gives no detail`)
  }

  const gaps = JSON.stringify(entry.notDocumented)
  assert.ok(
    gaps.includes("No source counts them"),
    "the page does not say that no census of skills exists",
  )
  assert.ok(
    gaps.includes("It should not be assumed to"),
    "the page does not rule out generalizing from one site",
  )
})

test("the FAQ is self-contained, extractable, and cites its own dates", () => {
  assert.ok(entry.faq.length >= 5)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    // An answer that quotes a figure has to date it. An answer with no
    // figure in it has nothing to date.
    if (/\d/.test(item.answer)) {
      assert.match(
        item.answer,
        /2026/,
        `"${item.question}" gives a figure without a date`,
      )
    }
  }

  for (const term of [
    "how many agent skills",
    "support agent skills",
    "cite these agent skills statistics",
  ]) {
    assert.ok(
      entry.faq.some((item) => item.question.toLowerCase().includes(term)),
      `no FAQ entry addresses ${term}`,
    )
  }
})

test("no copy on the page uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(entry), dashPattern)
  assert.doesNotMatch(markdown, dashPattern)
})

test("the product copy follows the positioning rules", () => {
  const copy = JSON.stringify(entry)
  assert.doesNotMatch(copy, /shared library/i)
  assert.doesNotMatch(copy, /recommend/i)
  assert.ok(
    copy.includes("agent-native skills registry for teams"),
    "the page does not use the agreed product description",
  )
})

test("the page links out, and a sibling page links in", () => {
  const outbound = new Set(
    [
      ...tables.map((section) => section.link.href),
      entry.reuse.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 6, "fewer than six internal outbound links")

  for (const destination of [
    "/agent-skills",
    "/agent-skills-support",
    "/claude-skills",
    "/pricing",
  ]) {
    assert.ok(outbound.has(destination), `no link to ${destination}`)
  }

  assert.ok(
    agentSkills.related.some((link) => link.href === entry.path),
    `${agentSkills.path} does not link to ${entry.path}`,
  )
})

test("the schema carries TechArticle, FAQPage, and a breadcrumb", () => {
  const graph = buildResourceArticleSchema(entry)["@graph"]
  const byType = (type) => graph.find((node) => node["@type"] === type)

  const article = byType("TechArticle")
  assert.ok(article, "missing TechArticle")
  assert.equal(article.headline, entry.title)
  assert.equal(article.url, canonical)
  assert.equal(article.dateModified, entry.modifiedAt)
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
  assert.ok(entry.sources.length >= 9, "too few sources")

  const cited = [
    entry.answerSourceIds,
    entry.method.sourceIds,
    ...tables.map((section) => section.sourceIds),
    entry.notDocumented.sourceIds,
    entry.reuse.sourceIds,
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
})
