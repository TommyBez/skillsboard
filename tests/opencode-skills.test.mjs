import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { opencodeSkills, opencodeSkillsPath } = await import(
  "../lib/seo/opencode-skills/index.ts"
)
const { agentSkillsSupport } = await import(
  "../lib/seo/agent-skills-support/index.ts"
)
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

const entry = opencodeSkills
const canonical = `https://www.skillsboard.sh${opencodeSkillsPath}`
const markdown = renderMarkdownTwin(opencodeSkillsPath) ?? ""

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
  assert.equal(entry.path, "/opencode-skills")
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
    layout.includes("opencode_skills_header"),
    "the shell reports another page's location",
  )

  const page = await readFile(
    new URL(
      "../components/opencode-skills/opencode-skills-page.tsx",
      import.meta.url,
    ),
    "utf8",
  )
  for (const suffix of ["hero", "inline", "closing"]) {
    assert.ok(
      page.includes(`opencode_skills_${suffix}`),
      `the page never renders the opencode_skills_${suffix} CTA`,
    )
  }

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const suffix of ["header", "hero", "inline", "closing"]) {
    assert.ok(
      events.includes(`"opencode_skills_${suffix}"`),
      `landing_cta_clicked cannot report opencode_skills_${suffix}`,
    )
  }
})

test("the article is listed in the static llms.txt", async () => {
  const llms = await readFile(
    new URL("../public/llms.txt", import.meta.url),
    "utf8",
  )
  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")

  // The four sibling articles reviewed on 2026-08-19 pin the single
  // `Last reviewed` line to their own modifiedAt, so moving it forward would
  // assert that all of them were re-read today. This page re-read only its own
  // sources, so the shared line stays put and the page carries its own date,
  // exactly as /agent-skills-support did.
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
    entry.locations.title,
    entry.loading.title,
    entry.frontmatter.title,
    entry.permissions.title,
    entry.transfers.title,
    entry.install.title,
    entry.team.title,
    entry.openQuestions.title,
  ]) {
    assert.ok(
      markdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const section of [
    entry.locations,
    entry.loading,
    entry.frontmatter,
    entry.permissions,
    entry.transfers,
  ]) {
    const header = `| ${section.columns.join(" | ")} |`
    assert.ok(markdown.includes(header), `${section.title} lost its header row`)
  }

  for (const item of entry.faq) {
    assert.ok(markdown.includes(`### ${item.question}`), item.question)
    assert.ok(markdown.includes(item.answer), "missing FAQ answer")
  }
})

test("the page answers the OpenCode question rather than a generic one", () => {
  const copy = JSON.stringify(entry)

  assert.ok(
    entry.answer.includes("SKILL.md"),
    "the short answer never names the file",
  )
  assert.match(
    entry.answer,
    /skill tool/,
    "the short answer does not say how OpenCode loads a skill",
  )

  // The six documented locations, in the order the vendor documents them.
  assert.deepEqual(
    entry.locations.rows.map((row) => row.label),
    [
      ".opencode/skills/<name>/SKILL.md",
      "~/.config/opencode/skills/<name>/SKILL.md",
      ".claude/skills/<name>/SKILL.md",
      "~/.claude/skills/<name>/SKILL.md",
      ".agents/skills/<name>/SKILL.md",
      "~/.agents/skills/<name>/SKILL.md",
    ],
  )

  // The closed frontmatter allowlist, plus the row that says what happens to
  // everything else. Getting this wrong is the easiest way to publish fiction
  // about this client.
  assert.deepEqual(
    entry.frontmatter.rows.map((row) => row.label),
    [
      "name",
      "description",
      "license",
      "compatibility",
      "metadata",
      "Anything else",
    ],
  )
  assert.match(entry.frontmatter.rows.at(-1).cells[1], /[Ii]gnored/)
  assert.ok(
    copy.includes("allowed-tools"),
    "the page never mentions the spec field OpenCode does not read",
  )

  // The permission model is the vendor-specific section this page exists for.
  assert.ok(entry.permissions.rows.length >= 5)
  for (const value of ["allow", "ask", "deny"]) {
    assert.ok(
      JSON.stringify(entry.permissions).includes(value),
      `the permission section never mentions ${value}`,
    )
  }

  assert.ok(entry.install.steps.length >= 5)
  assert.ok(
    entry.install.template.includes("name:") &&
      entry.install.template.includes("description:"),
    "the SKILL.md template is missing a required field",
  )

  assert.ok(entry.sources.length >= 10, "too few primary sources")
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 4)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("context budget"),
    "the page does not flag the missing context budget for the skill listing",
  )
  assert.ok(
    limits.includes("share a name"),
    "the page does not flag the undocumented name collision behavior",
  )
  assert.ok(
    limits.includes("OPENCODE_CONFIG_DIR"),
    "the page does not flag the custom config directory gap",
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
      /OpenCode/,
      `"${item.question}" does not name the client`,
    )
  }

  for (const term of ["where", "install", "share", "plugins"]) {
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
      entry.locations.link.href,
      entry.loading.link.href,
      entry.frontmatter.link.href,
      entry.permissions.link.href,
      entry.transfers.link.href,
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")

  // Contextual inbound links, not only navigation.
  assert.equal(cursorSkills.locations.link?.href, entry.path)
  assert.equal(agentSkillsSupport.notDocumented.link?.href, entry.path)

  for (const sibling of [agentSkillsSupport, codexSkills, cursorSkills]) {
    assert.ok(
      sibling.related.some((link) => link.href === entry.path),
      `${sibling.path} does not link to ${entry.path}`,
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
  const cited = [
    entry.answerSourceIds,
    entry.locations.sourceIds,
    entry.loading.sourceIds,
    entry.frontmatter.sourceIds,
    entry.permissions.sourceIds,
    entry.transfers.sourceIds,
    entry.install.sourceIds,
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
