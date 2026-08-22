import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { skillExamples, skillExamplesPath } = await import(
  "../lib/seo/skill-examples/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { anthropicSkills } = await import(
  "../lib/seo/anthropic-skills/index.ts"
)
const { guides } = await import("../lib/seo/guides/index.ts")
const { guidePaths } = await import("../lib/seo/guides/types.ts")
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

const entry = skillExamples
const canonical = `https://www.skillsboard.sh${skillExamplesPath}`
const markdown = renderMarkdownTwin(skillExamplesPath) ?? ""
const pageSource = await readFile(
  new URL("../app/skill-examples/page.tsx", import.meta.url),
  "utf8",
)

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The tabled sections, in the order the page renders them. */
const tables = [
  entry.patterns,
  entry.frontmatter,
  entry.descriptions,
  entry.layout,
  entry.divergence,
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
  assert.equal(entry.path, "/skill-examples")
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
    layout.includes("skill_examples_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/skill-examples/skill-examples-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`skill_examples_${suffix}`),
      `the page never renders the skill_examples_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"skill_examples_${suffix}"`),
      `landing_cta_clicked cannot report skill_examples_${suffix}`,
    )
  }
})

test("the article is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")

  // The single `Last reviewed` line belongs to the pages reviewed on
  // 2026-08-19. Moving it forward would assert that every source behind every
  // other page was re-read today. This page re-read only its own, so the
  // shared line stays put and the page carries its own date, exactly as
  // /agent-skills-support, /opencode-skills and /vercel-skills did before it.
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

  // The path does not end in `-skills`, so the shared Accept rewrite that
  // covers the sibling articles never reaches it and it needs one of its own.
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

  assert.ok(
    pageSource.includes("markdownTwinAlternates(skillExamples.path)"),
    "the route does not advertise its Markdown twin in the page head",
  )

  for (const title of [
    ...tables.map((section) => section.title),
    entry.excerpts.title,
    entry.starter.title,
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

test("the page leads with the examples rather than with the format", () => {
  // The query is "skill examples", so the first section has to be the files.
  // A definition-first opening would answer the question /agent-skills owns.
  assert.equal(entry.patterns, tables[0], "the patterns table is not first")
  assert.equal(entry.patterns.rows.length, 8, "the example count moved")

  assert.deepEqual(
    entry.patterns.rows.map((row) => row.label),
    [
      "template/SKILL.md",
      "brand-guidelines",
      "internal-comms",
      "webapp-testing",
      "pdf",
      "xlsx",
      "claude-api",
      "skill-creator",
    ],
  )

  // Every example named in the table is a real path in the source repository,
  // so a renamed folder upstream shows up here rather than as a dead claim.
  for (const row of entry.patterns.rows) {
    const named = row.label.includes("/")
      ? row.label
      : `skills/${row.label}/SKILL.md`
    assert.ok(named.endsWith("SKILL.md"), `${row.label} is not a skill folder`)
  }
})

test("every quoted excerpt names its file and links to it", () => {
  assert.equal(entry.excerpts.entries.length, 5)

  for (const excerpt of entry.excerpts.entries) {
    // Pinned to a commit, not to main: a permalink onto a moving branch stops
    // matching the quote as soon as the file upstream changes.
    assert.match(
      excerpt.permalink,
      /^https:\/\/github\.com\/anthropics\/skills\/blob\/[0-9a-f]{40}\//,
      `${excerpt.title} does not link to a pinned source file`,
    )
    assert.ok(excerpt.file.length > 0, `${excerpt.title} names no file`)
    assert.ok(
      excerpt.template.trim().length > 0,
      `${excerpt.title} quotes nothing`,
    )
    // A quote that is retold rather than copied is not evidence.
    assert.ok(
      excerpt.template.includes("\n") || excerpt.template.length > 120,
      `${excerpt.title} is too short to be a quoted block`,
    )
    assert.ok(markdown.includes(excerpt.template), `${excerpt.title} lost its block`)
  }

  // The published typo is quoted as read, which is the point of the section.
  const quoted = entry.excerpts.entries.map((item) => item.template).join("\n")
  assert.ok(
    quoted.includes("abslutely"),
    "the webapp-testing excerpt was silently corrected",
  )
  assert.match(
    JSON.stringify(entry.excerpts.entries),
    /typo/,
    "the page quotes a typo without saying so",
  )
})

test("the frontmatter table reports what the examples use, not what is allowed", () => {
  assert.equal(entry.frontmatter.rows.length, 6, "the spec has six fields")
  assert.deepEqual(
    entry.frontmatter.rows.map((row) => row.label),
    [
      "name",
      "description",
      "license",
      "compatibility",
      "metadata",
      "allowed-tools",
    ],
  )

  // The three fields nobody uses are the finding, so they are pinned.
  const unused = entry.frontmatter.rows.filter((row) =>
    row.cells[1].startsWith("Used by none of the nineteen"),
  )
  assert.deepEqual(unused.map((row) => row.label), [
    "compatibility",
    "metadata",
    "allowed-tools",
  ])

  // The two documented readings of `name` disagree, and the page says so
  // rather than picking one, staying consistent with the authoring guide.
  assert.match(entry.frontmatter.rows[0].cells[1], /Claude Code/)
})

test("the divergence table is sourced on both sides of every row", () => {
  assert.equal(entry.divergence.rows.length, 6, "the divergence count moved")

  for (const row of entry.divergence.rows) {
    assert.ok(row.cells.length === 2, `${row.label} is missing a column`)
    assert.ok(
      row.cells[0].trim().length > 0 && row.cells[1].trim().length > 0,
      `${row.label} states a disagreement with an empty side`,
    )
  }

  // The only row that can break at runtime, and the reason this section
  // exists at all rather than being a list of style notes.
  const notes = entry.divergence.notes.join(" ")
  assert.match(notes, /case-sensitive filesystem|Only the fourth row/)
  assert.match(
    JSON.stringify(entry.divergence.rows),
    /REFERENCE\.md and FORMS\.md/,
    "the case mismatch in the pdf skill is not stated",
  )
})

test("the FAQ is self-contained, extractable, and on the query", () => {
  assert.ok(entry.faq.length >= 6)

  for (const item of entry.faq) {
    const words = item.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answer is ${words} words`,
    )
    assert.match(
      item.question,
      /example/i,
      `"${item.question}" does not name the subject`,
    )
  }

  for (const term of ["where", "minimal", "copy", "team"]) {
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

test("the product is never described as a shared library", () => {
  const copy = JSON.stringify(entry)
  assert.doesNotMatch(copy, /shared library/i)
  assert.match(
    entry.team.body.join(" "),
    /web application where a team keeps and shares its AI skills/,
  )
})

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      ...tables.map((section) => section.link.href),
      entry.excerpts.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 4, "fewer than four internal outbound links")

  // The twin guide is the complement: the rules there, the files here.
  assert.ok(
    outbound.has(guidePaths.writeSkillMd),
    "no link to the SKILL.md authoring guide",
  )
  // The catalog this page selects from.
  assert.ok(outbound.has(anthropicSkills.path), "no link to the catalog")

  for (const source of [anthropicSkills, agentSkills]) {
    assert.ok(
      source.related.some((link) => link.href === entry.path),
      `${source.path} does not link to ${entry.path}`,
    )
  }
})

test("the page stays distinct from the catalog and the authoring guide", () => {
  const writeGuide = guides.find(
    (guide) => guide.path === guidePaths.writeSkillMd,
  )
  assert.ok(writeGuide, "the authoring guide is missing")

  assert.notEqual(entry.title, anthropicSkills.title)
  assert.notEqual(entry.title, writeGuide.title)

  // The catalog owns the inventory of what Anthropic publishes and where each
  // set loads. This page selects eight files from it and never re-lists it.
  assert.ok(
    !JSON.stringify(entry).includes("bundled with Claude Code"),
    "the examples page repeats the catalog's set breakdown",
  )

  // The guide owns the authoring rules. This page never ships a decision
  // table of its own, it quotes files and reports what they do.
  assert.equal(entry.contentType, "article")
  assert.equal(writeGuide.contentType, "guide")
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
  assert.ok(entry.sources.length >= 10, "too few primary sources")

  const known = new Set(entry.sources.map((source) => source.id))
  const cited = [
    entry.answerSourceIds,
    ...tables.map((section) => section.sourceIds),
    entry.excerpts.sourceIds,
    entry.starter.sourceIds,
    entry.team.sourceIds,
    entry.openQuestions.sourceIds,
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

  // The sources that make this a first-party page rather than a summary of
  // other people's summaries: the repository, the files, the spec, the client.
  for (const href of [
    "https://github.com/anthropics/skills",
    "https://github.com/anthropics/skills/blob/3b3fad96af16a10759d930941b4520ba0c40edae/template/SKILL.md",
    "https://agentskills.io/specification",
    "https://code.claude.com/docs/en/skills",
  ]) {
    assert.ok(
      entry.sources.some((source) => source.href === href),
      `missing primary source: ${href}`,
    )
  }

  // Every excerpt permalink is a file the sources list also points at, so a
  // quote can always be traced back to a listed source.
  for (const excerpt of entry.excerpts.entries) {
    assert.ok(
      entry.sources.some((source) => source.href === excerpt.permalink),
      `${excerpt.permalink} is quoted but not listed as a source`,
    )
  }
})
