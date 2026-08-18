import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { coworkSkills, coworkSkillsPath } = await import(
  "../lib/seo/cowork-skills/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
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

const entry = coworkSkills
const canonical = `https://www.skillsboard.sh${coworkSkillsPath}`
const markdown = renderMarkdownTwin(coworkSkillsPath) ?? ""

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
  assert.equal(entry.path, "/cowork-skills")
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
    layout.includes("cowork_skills_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/cowork-skills/cowork-skills-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`cowork_skills_${suffix}`),
      `the page never renders the cowork_skills_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"cowork_skills_${suffix}"`),
      `landing_cta_clicked cannot report cowork_skills_${suffix}`,
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
  assert.ok(markdown.startsWith(`# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  for (const title of [
    entry.format.title,
    entry.loading.title,
    entry.channels.title,
    entry.surfaces.title,
    entry.authoring.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of [
    entry.format,
    entry.loading,
    entry.channels,
    entry.surfaces,
  ]) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page answers the Cowork question rather than the Claude one", () => {
  const copy = JSON.stringify(entry)

  assert.ok(
    entry.answer.includes("SKILL.md"),
    "the short answer never names the file",
  )
  assert.match(
    entry.answer,
    /claude\.ai account/,
    "the short answer does not say where a Cowork session gets its skills",
  )

  // The four documented delivery channels, and only those.
  assert.deepEqual(
    entry.channels.rows.map((row) => row.label),
    ["Anthropic skills", "Your own upload", "Your organization", "A plugin"],
  )

  // The desktop split is the other half of the head query.
  assert.deepEqual(entry.surfaces.columns, [
    "Capability",
    "Desktop",
    "Web and mobile",
  ])
  assert.ok(
    copy.includes("desktop app"),
    "the page never says which capabilities need the desktop app",
  )

  // Writing a skill is part of the cluster, not a separate page.
  assert.ok(entry.authoring.steps.length >= 5)
  assert.ok(
    entry.authoring.template.includes("name:") &&
      entry.authoring.template.includes("description:"),
    "the SKILL.md template is missing a required field",
  )

  assert.ok(entry.sources.length >= 10, "too few primary sources")
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 4)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("No published context budget"),
    "the page does not flag the missing Cowork context budget",
  )
  assert.ok(
    limits.includes("collision rule"),
    "the page does not flag the undocumented name collision behavior",
  )
  assert.ok(
    limits.includes("Chrome side panel"),
    "the page does not flag the surface the per-surface table omits",
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
      /Cowork/,
      `"${item.question}" does not name the surface`,
    )
  }

  for (const term of ["use", "plugins", "create", "library"]) {
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
      entry.format.link.href,
      entry.loading.link.href,
      entry.channels.link.href,
      entry.surfaces.link.href,
      entry.authoring.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")

  // Contextual inbound links, not only navigation.
  assert.equal(claudeSkills.surfaces.link?.href, entry.path)
  assert.equal(agentSkills.loading.link?.href, entry.path)

  assert.ok(
    claudeSkills.related.some((link) => link.href === entry.path),
    `${claudeSkills.path} does not link to ${entry.path}`,
  )
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
    entry.format.sourceIds,
    entry.loading.sourceIds,
    entry.channels.sourceIds,
    entry.surfaces.sourceIds,
    entry.authoring.sourceIds,
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
