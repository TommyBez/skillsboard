import assert from "node:assert/strict"
import { access, readdir, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { agentSkillsByTheNumbers, agentSkillsByTheNumbersPath } = await import(
  "../lib/seo/agent-skills-by-the-numbers/index.ts"
)
const {
  ecosystemSnapshots,
  latestSnapshot,
  noComparisonYet,
  formatCount,
  monthlyChange,
  topicChange,
} = await import("../lib/seo/agent-skills-by-the-numbers/snapshots.ts")
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

const dataDirectory = new URL(
  "../lib/seo/agent-skills-by-the-numbers/data/",
  import.meta.url,
)

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the article is registered everywhere a resource is addressed", () => {
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
  assert.ok(
    agentSkills.related.some((link) => link.href === entry.path),
    "the Agent Skills page does not link to the statistics page",
  )
})

test("the route ships every file a resource article needs", async () => {
  for (const file of [
    "../app/agent-skills-by-the-numbers/page.tsx",
    "../app/agent-skills-by-the-numbers/layout.tsx",
    "../app/agent-skills-by-the-numbers/opengraph-image.tsx",
    "../app/agent-skills-by-the-numbers/twitter-image.tsx",
    "../components/agent-skills-by-the-numbers/agent-skills-by-the-numbers-page.tsx",
    "../scripts/ecosystem-stats/collect.mjs",
  ]) {
    assert.ok(await exists(file), `${file} is missing`)
  }
})

test("the Markdown twin is reachable through content negotiation", async () => {
  const alternates = markdownTwinAlternates(entry.path)
  assert.equal(alternates.canonical, entry.path)

  const { rewrites, redirects } = nextConfig
  const configuredRewrites = await rewrites()
  const beforeFiles = configuredRewrites.beforeFiles ?? []
  assert.ok(
    beforeFiles.some(
      (rule) =>
        rule.source === entry.path &&
        rule.destination === `/api/markdown?path=${entry.path}`,
    ),
    "no Accept: text/markdown rewrite for the page",
  )

  const configuredRedirects = await redirects()
  assert.ok(
    configuredRedirects.some(
      (rule) => rule.source === `${entry.path}/` && rule.destination === entry.path,
    ),
    "no trailing slash redirect for the page",
  )
})

test("every committed snapshot matches the schema the page reads", async () => {
  const files = (await readdir(dataDirectory)).filter((name) =>
    name.endsWith(".json"),
  )
  assert.ok(files.length >= 1, "no snapshot is committed")
  assert.equal(files.length, ecosystemSnapshots.length, "a snapshot is not imported")

  for (const file of files) {
    const payload = JSON.parse(
      await readFile(new URL(file, dataDirectory), "utf8"),
    )

    assert.match(payload.snapshot, /^\d{4}-\d{2}$/, `${file} snapshot key`)
    assert.equal(`${payload.snapshot}.json`, file, `${file} name and key differ`)
    assert.match(
      payload.collectedAt,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      `${file} collectedAt`,
    )

    assert.ok(payload.repositoryTopics.length >= 3, `${file} topics`)
    for (const topic of payload.repositoryTopics) {
      assert.equal(typeof topic.topic, "string")
      assert.ok(
        Number.isInteger(topic.repositories) && topic.repositories > 0,
        `${file} topic ${topic.topic} count`,
      )
    }

    const usage = payload.declaredUsage
    assert.ok(Number.isInteger(usage.readmeMatches) && usage.readmeMatches > 0)
    assert.equal(usage.readmeMatchPrecision, "bucketed")
    assert.equal(usage.npmPackage, "skills")
    assert.ok(
      Number.isInteger(usage.npmDownloadsLastMonth) &&
        usage.npmDownloadsLastMonth > 0,
    )
    assert.equal(
      usage.downloadsPerMatchingReadme,
      Math.round(usage.npmDownloadsLastMonth / usage.readmeMatches),
      `${file} ratio is not derived from its own two figures`,
    )
    assert.equal(
      usage.downloadsPerDeclaringProject,
      undefined,
      `${file} still carries the old per project field name`,
    )
    for (const day of [usage.npmWindowStart, usage.npmWindowEnd]) {
      assert.match(day, /^\d{4}-\d{2}-\d{2}$/, `${file} npm window`)
    }

    const series = payload.monthlyDownloads
    assert.equal(series.package, "skills")
    assert.ok(series.months.length >= 8, `${file} series length`)
    for (const month of series.months) {
      assert.match(month.month, /^\d{4}-\d{2}$/)
      assert.ok(Number.isInteger(month.downloads) && month.downloads >= 0)
      assert.equal(typeof month.partial, "boolean")
    }
    assert.deepEqual(
      series.months.map((month) => month.month),
      [...series.months.map((month) => month.month)].sort(),
      `${file} series is out of order`,
    )

    assert.ok(payload.notes.length >= 3, `${file} notes`)
  }
})

test("the page renders every figure in the most recent snapshot", () => {
  const rendered = [
    entry.answer,
    ...entry.answerNotes,
    ...entry.intro,
    entry.description,
    ...[entry.declarations, entry.repositories, entry.downloads].flatMap(
      (section) => [
        section.intro,
        ...section.rows.flatMap((row) => [row.label, ...row.cells]),
        ...section.notes,
      ],
    ),
    ...entry.method.steps,
    ...entry.faq.flatMap((item) => [item.question, item.answer]),
  ].join(" ")

  for (const topic of latestSnapshot.repositoryTopics) {
    assert.ok(
      rendered.includes(formatCount(topic.repositories)),
      `topic:${topic.topic} count is missing from the page`,
    )
    assert.ok(rendered.includes(topic.topic), `topic:${topic.topic} is unnamed`)
  }

  const usage = latestSnapshot.declaredUsage
  for (const value of [
    usage.readmeMatches,
    usage.npmDownloadsLastMonth,
    usage.downloadsPerMatchingReadme,
  ]) {
    assert.ok(
      rendered.includes(formatCount(value)),
      `${value} is missing from the page`,
    )
  }

  for (const month of latestSnapshot.monthlyDownloads.months) {
    assert.ok(
      rendered.includes(formatCount(month.downloads)),
      `${month.month} downloads are missing from the page`,
    )
  }
})

test("the change columns handle one snapshot and keep working with more", () => {
  const months = latestSnapshot.monthlyDownloads.months

  if (ecosystemSnapshots.length === 1) {
    for (const topic of latestSnapshot.repositoryTopics) {
      assert.equal(topicChange(topic.topic), noComparisonYet)
    }
  } else {
    for (const topic of latestSnapshot.repositoryTopics) {
      assert.notEqual(topicChange(topic.topic), noComparisonYet)
    }
  }

  assert.equal(monthlyChange(months, 0), "First month in the range")
  for (const [index, month] of months.entries()) {
    const label = monthlyChange(months, index)
    assert.equal(typeof label, "string")
    assert.ok(label.length > 0)
    if (month.partial) {
      assert.match(label, /^Partial month/)
    }
  }
})

test("the method section says where each figure comes from", () => {
  const method = [entry.method.intro, ...entry.method.steps].join(" ")
  assert.ok(method.length > 0)
  assert.ok(
    entry.method.steps.length >= 4 && entry.method.steps.length <= 6,
    `the method is ${entry.method.steps.length} lines`,
  )
  assert.match(method, /search\/repositories/)
  assert.match(method, /search\/code/)
  assert.match(method, /api\.npmjs\.org/)
  assert.match(method, /exact/)
  assert.match(method, /buckets/)
  assert.match(method, /scripts\/ecosystem-stats\/collect\.mjs/)
})

test("the June step is stated as a hypothesis rather than a finding", () => {
  const prose = [
    ...entry.answerNotes,
    ...entry.downloads.notes,
    ...entry.faq.map((item) => item.answer),
  ].join(" ")

  assert.match(prose, /open question/)
  assert.match(prose, /no attribution|carries no attribution/)
  assert.ok(
    /automat/i.test(prose),
    "the page never names automation as a possible cause",
  )
})

test("the FAQ is self-contained and sized for extraction", () => {
  assert.equal(entry.faq.length, 3)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    assert.match(item.question, /\?$/)
  }
})

test("the copy follows the house rules", () => {
  const copy = [
    entry.title,
    entry.seoTitle,
    entry.description,
    entry.dataNote,
    ...entry.intro,
    entry.answer,
    ...entry.answerNotes,
    ...[entry.declarations, entry.repositories, entry.downloads].flatMap(
      (section) => [
        section.title,
        section.intro,
        ...section.columns,
        ...section.rows.flatMap((row) => [row.label, ...row.cells]),
        ...section.notes,
        section.link.lead,
        section.link.label,
        section.link.trail,
      ],
    ),
    entry.method.title,
    entry.method.intro,
    ...entry.method.steps,
    ...entry.faq.flatMap((item) => [item.question, item.answer]),
    ...entry.sources.flatMap((source) => [source.label, source.note]),
    ...entry.related.flatMap((link) => [link.label, link.description]),
    entry.closing.title,
    entry.closing.body,
    entry.ogAlt,
  ]

  for (const line of copy) {
    assert.ok(!dashPattern.test(line), `dash in: ${line}`)
    assert.ok(
      !/recommend/i.test(line),
      `"recommend" describes a team's own skills in: ${line}`,
    )
    assert.ok(!/shared library/i.test(line), `"shared library" in: ${line}`)
    assert.ok(!/a small site/i.test(line), `"a small site" in: ${line}`)
    assert.ok(!/nobody publishes/i.test(line), `"nobody publishes" in: ${line}`)
  }

  assert.ok(!dashPattern.test(markdown), "a dash reached the Markdown twin")
})

test("the page opens on the question and the first number", () => {
  const [first] = entry.intro
  const sentences = first.split(/(?<=[.?])\s+/)

  assert.match(sentences[0], /\?$/, "the page does not open on a question")
  assert.ok(
    /\d/.test(sentences[0]) || /\d/.test(sentences[1] ?? ""),
    "no figure inside the first two sentences",
  )
  assert.ok(
    sentences[1].includes(
      formatCount(latestSnapshot.declaredUsage.npmDownloadsLastMonth),
    ),
    "the download figure is not in the second sentence",
  )
})

test("the closing sentence uses the approved description of the product", () => {
  assert.ok(
    entry.closing.body.includes(
      "the web app where a team keeps and shares its AI skills",
    ),
    "the closing paragraph does not describe Skills Board the approved way",
  )
})

test("the Markdown twin carries the tables, the method, and the FAQ", () => {
  assert.ok(markdown.startsWith("# Agent skills by the numbers"))
  assert.ok(markdown.includes(canonical))

  for (const section of [entry.declarations, entry.repositories, entry.downloads]) {
    assert.ok(
      markdown.includes(`| ${section.columns.join(" | ")} |`),
      `${section.title} lost its header row`,
    )
  }

  for (const step of entry.method.steps) {
    assert.ok(markdown.includes(step.slice(0, 40)), "a method line is missing")
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the structured data describes the article, the crumbs, and the FAQ", () => {
  const graph = buildResourceArticleSchema(entry)["@graph"]
  const byType = (type) => graph.find((node) => node["@type"] === type)

  const article = byType("TechArticle")
  assert.ok(article, "missing TechArticle")
  assert.equal(article.url, canonical)
  assert.equal(article.headline, entry.title)
  assert.equal(article.datePublished, entry.publishedAt)

  const breadcrumb = byType("BreadcrumbList")
  assert.ok(breadcrumb, "missing BreadcrumbList")
  assert.equal(
    breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1].item,
    canonical,
  )

  const faq = byType("FAQPage")
  assert.ok(faq, "missing FAQPage")
  assert.equal(faq.mainEntity.length, entry.faq.length)
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, entry.faq[0].answer)
})

test("the collector reads its token from the environment only", async () => {
  const script = await readFile(
    new URL("../scripts/ecosystem-stats/collect.mjs", import.meta.url),
    "utf8",
  )

  assert.match(script, /process\.env\.GITHUB_TOKEN/)
  assert.ok(
    !/ghp_|github_pat_|\.credentials/.test(script),
    "the collector reads a token from somewhere other than the environment",
  )

  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  )
  assert.equal(
    packageJson.scripts["stats:collect"],
    "node scripts/ecosystem-stats/collect.mjs",
  )
})

test("the page counts README files and never claims to count projects", () => {
  const copy = [
    entry.description,
    ...entry.intro,
    entry.answer,
    ...entry.answerNotes,
    ...[entry.declarations, entry.repositories, entry.downloads].flatMap(
      (section) => [
        section.title,
        section.intro,
        ...section.rows.flatMap((row) => [row.label, ...row.cells]),
        ...section.notes,
      ],
    ),
    ...entry.method.steps,
    ...entry.faq.flatMap((item) => [item.question, item.answer]),
    markdown,
  ]

  for (const line of copy) {
    assert.ok(
      !/declaring project|per project|per declaring/i.test(line),
      `the page reads the code search total as projects in: ${line}`,
    )
  }

  assert.match(entry.declarations.title, /README/)
  assert.ok(
    entry.declarations.rows.some(
      (row) => row.label === "Downloads per matching README",
    ),
    "the ratio row does not name the README as its denominator",
  )

  const caveat = [entry.declarations.intro, ...entry.declarations.notes].join(" ")
  assert.match(
    caveat,
    /counted once for each|counts files rather than repositories/,
    "the page never says a repository with several READMEs is counted twice",
  )
  assert.match(
    caveat,
    /lower than or equal/,
    "the page never says the project count sits below the file count",
  )
})


test("the npm range source link is built from the snapshot it describes", () => {
  const source = entry.sources.find((candidate) => candidate.id === "npm-range")
  assert.ok(source, "the npm range source is missing")

  const { package: name, rangeStart, rangeEnd } = latestSnapshot.monthlyDownloads
  assert.equal(
    source.href,
    `https://api.npmjs.org/downloads/range/${rangeStart}:${rangeEnd}/${name}`,
  )
})

test("the collector refuses a GitHub search that came back incomplete", async () => {
  const { assertCompleteSearch } = await import(
    "../scripts/ecosystem-stats/collect.mjs"
  )

  assert.deepEqual(
    assertCompleteSearch({ incomplete_results: false, total_count: 12 }, "topic search"),
    { incomplete_results: false, total_count: 12 },
  )

  assert.throws(
    () => assertCompleteSearch({ incomplete_results: true, total_count: 3 }, "code search"),
    /incomplete_results for code search/,
  )
  assert.throws(
    () => assertCompleteSearch({ incomplete_results: true }, "code search"),
    /No snapshot was written/,
  )

  const script = await readFile(
    new URL("../scripts/ecosystem-stats/collect.mjs", import.meta.url),
    "utf8",
  )
  const guards = script.match(/assertCompleteSearch\(/g) ?? []
  assert.ok(
    guards.length >= 3,
    "the guard is not applied to both the repository search and the code search",
  )
  assert.match(script, /repository search`\)/)
  assert.match(script, /code search for/)
})
