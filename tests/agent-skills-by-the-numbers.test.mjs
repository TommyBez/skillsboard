import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { agentSkillsByTheNumbers, agentSkillsByTheNumbersPath } = await import(
  "../lib/seo/agent-skills-by-the-numbers/index.ts"
)
const {
  allDatapoints,
  datapointColumns,
  installColumns,
  installDatapoints,
  readOn,
  shortDetailIds,
} = await import("../lib/seo/agent-skills-by-the-numbers/datapoints.ts")
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

const entry = agentSkillsByTheNumbers
const canonical = `https://www.skillsboard.sh${agentSkillsByTheNumbersPath}`
const markdown = renderMarkdownTwin(agentSkillsByTheNumbersPath) ?? ""

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[–—]/

/** The three figure sections, in the order the page renders them. */
const sections = [entry.clients, entry.installs, entry.repositories]

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the statistics page is registered everywhere a resource is addressed", () => {
  assert.equal(entry.path, "/agent-skills-by-the-numbers")
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

test("no trace of the route this page was first published under", async () => {
  assert.ok(!(await exists("../app/agent-skills-adoption")))
  assert.ok(!(await exists("../lib/seo/agent-skills-adoption")))
  assert.ok(!(await exists("../components/agent-skills-adoption")))

  for (const file of ["../public/llms.txt", "../next.config.ts"]) {
    const contents = await readFile(new URL(file, import.meta.url), "utf8")
    assert.ok(
      !contents.includes("agent-skills-adoption"),
      `${file} still addresses the old route`,
    )
  }
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
    layout.includes("agent_skills_by_the_numbers_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/agent-skills-by-the-numbers/agent-skills-by-the-numbers-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`agent_skills_by_the_numbers_${suffix}`),
      `the page never renders the agent_skills_by_the_numbers_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"agent_skills_by_the_numbers_${suffix}"`),
      `landing_cta_clicked cannot report agent_skills_by_the_numbers_${suffix}`,
    )
  }
  assert.ok(
    !events.includes("agent_skills_adoption"),
    "the old CTA location names survive in the event union",
  )
})

test("the page is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")

  // The sibling articles pin the single `Last reviewed` line to the date of
  // the last full re-review of every pinned page. This page re-read its own
  // sources only, so the shared line stays where it is and the page carries
  // its own date instead, in `modifiedAt` and on the page itself.
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
    ...sections.map((section) => section.title),
    entry.notDocumented.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of sections) {
    for (const table of section.tables) {
      const header = `| ${table.columns.join(" | ")} |`
      assert.ok(markdown.includes(header), `${table.caption} lost its header`)
    }
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
    // An install row uses the detail column for the publishing repository.
    // Every other row has to say what its figure counts.
    if (!shortDetailIds.has(datapoint.id)) {
      assert.ok(
        datapoint.detail.length > 80,
        `${datapoint.id} does not say what it counts`,
      )
    }
  }

  // The refresh reads every figure on the same day, except where a row is
  // explicitly carried from an earlier, dated reading of vendor documentation.
  assert.equal(readOn, entry.modifiedAt)
  assert.ok(
    allDatapoints.filter((datapoint) => datapoint.measuredOn === readOn)
      .length >= allDatapoints.length - 1,
    "more than one figure is older than the refresh",
  )
})

test("every figure on the page comes from a public source", () => {
  const copy = JSON.stringify(entry)
  for (const banned of [
    "log drain",
    "Search Console",
    "Googlebot",
    "crawler",
    "impression",
    "one small site",
    "this site's logs",
  ]) {
    assert.ok(
      !copy.toLowerCase().includes(banned.toLowerCase()),
      `the page still publishes a first-party measurement: ${banned}`,
    )
  }

  for (const source of entry.sources) {
    assert.match(source.href, /^https:\/\//, `${source.id} has no public URL`)
  }
})

test("every table renders the data module rather than its own numbers", () => {
  const rowCount = sections.reduce(
    (total, section) =>
      total +
      section.tables.reduce((count, table) => count + table.rows.length, 0),
    0,
  )
  assert.equal(rowCount, allDatapoints.length, "a datapoint renders nowhere")

  const seen = new Set()
  for (const section of sections) {
    for (const table of section.tables) {
      assert.ok(
        table.columns.length === 4 && table.columns.at(-1) === "Read on",
        `${table.caption} does not date its rows`,
      )
      for (const row of table.rows) {
        assert.equal(
          row.cells.length,
          3,
          `${row.label} has the wrong cell count`,
        )
        const datapoint = allDatapoints.find(
          (candidate) => candidate.label === row.label,
        )
        assert.ok(datapoint, `${row.label} is not backed by a datapoint`)
        assert.ok(!seen.has(datapoint.id), `${datapoint.id} renders twice`)
        seen.add(datapoint.id)
        assert.equal(row.cells[0], datapoint.value)
        assert.equal(row.cells[1], datapoint.detail)
        assert.equal(row.cells[2], datapoint.measuredOn)
      }
    }
  }
  assert.equal(seen.size, allDatapoints.length)
})

test("the install table is the strongest public figure and says what it misses", () => {
  const installTable = entry.installs.tables.find(
    (table) => table.columns[0] === "Skill",
  )
  assert.ok(installTable, "the install table is missing")
  assert.deepEqual(installTable.columns, [...installColumns])
  assert.ok(
    installDatapoints.length >= 5 && installDatapoints.length <= 10,
    "the install table is outside the five to ten row range",
  )
  assert.equal(installTable.rows.length, installDatapoints.length)

  const counts = installDatapoints.map((datapoint) =>
    Number(datapoint.value.replaceAll(",", "")),
  )
  assert.deepEqual(
    counts,
    [...counts].sort((left, right) => right - left),
    "the install table is not in descending order",
  )

  const notes = entry.installs.notes.join(" ")
  assert.ok(
    notes.includes("npx skills add"),
    "the page does not say which tool the install figures come from",
  )
  assert.ok(
    /install is also not a use/i.test(notes),
    "the page does not declare the limit of install telemetry",
  )
})

test("the answer opens on the figures and the intro does not open on a caveat", () => {
  assert.ok(entry.answer.startsWith("On September 2, 2026"))
  for (const figure of ["46", "9,704", "3,220,754"]) {
    assert.ok(entry.answer.includes(figure), `the answer omits ${figure}`)
  }

  const first = entry.intro[0]
  assert.match(
    first,
    /^Forty-six/,
    "the intro does not open on a figure",
  )
  assert.doesNotMatch(
    first,
    /^(No |Nobody|There is no|Neither)/,
    "the intro opens on a negation",
  )
})

test("the page declares its limits without padding them", () => {
  assert.ok(
    entry.notDocumented.entries.length >= 4,
    "fewer than four declared limits",
  )
  for (const item of entry.notDocumented.entries) {
    assert.ok(item.body.length > 150, `${item.title} gives no detail`)
  }

  const gaps = JSON.stringify(entry.notDocumented)
  for (const claim of [
    "No source counts them",
    "It does not",
    "They do not",
  ]) {
    assert.ok(gaps.includes(claim), `the limits section drops: ${claim}`)
  }
})

test("the page carries a dateline and a refresh cadence", () => {
  assert.equal(entry.dataNote, "Data as of September 2, 2026, refreshed monthly.")
  assert.ok(markdown.includes(entry.dataNote), "the twin drops the dateline")
})

test("the FAQ is self-contained, extractable, and cites its own dates", () => {
  assert.ok(entry.faq.length >= 4 && entry.faq.length <= 5)

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
    "how many agent skills exist",
    "products support agent skills",
    "most installed agent skill",
    "how often is this page updated",
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

  const description = "agent-native skills registry for teams"
  assert.ok(
    copy.includes(description),
    "the page does not use the agreed product description",
  )
  assert.equal(
    copy.split(description).length - 1,
    1,
    "the product is described more than once",
  )
})

test("the page links out, and a sibling page links in", () => {
  const outbound = new Set(
    [
      ...sections.map((section) => section.link.href),
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 6, "fewer than six internal outbound links")

  for (const destination of [
    "/agent-skills",
    "/agent-skills-support",
    "/claude-skills",
    "/where-to-find-claude-skills",
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
  assert.equal(known.size, entry.sources.length, "a source id is duplicated")

  const cited = [
    entry.answerSourceIds,
    ...sections.map((section) => section.sourceIds),
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

  // datapointColumns is the shape every count table shares.
  assert.deepEqual(entry.clients.tables[0].columns, [...datapointColumns])
})
