import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { copilotSkills, copilotSkillsPath } = await import(
  "../lib/seo/copilot-skills/index.ts"
)
const { agentSkills } = await import("../lib/seo/agent-skills/index.ts")
const { agentSkillsSupport } = await import(
  "../lib/seo/agent-skills-support/index.ts"
)
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

const entry = copilotSkills
const canonical = `https://www.skillsboard.sh${copilotSkillsPath}`
const markdown = renderMarkdownTwin(copilotSkillsPath) ?? ""
const pageSource = await readFile(
  new URL("../app/copilot-skills/page.tsx", import.meta.url),
  "utf8",
)

const tables = [
  entry.surfaces,
  entry.locations,
  entry.frontmatter,
  entry.invocation,
  entry.instructions,
  entry.distribution,
]

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
  assert.equal(entry.path, "/copilot-skills")
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
      "../components/copilot-skills/copilot-skills-page.tsx",
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

  // The shared `Last reviewed` line stays where the sibling pages left it. This
  // page re-read only its own sources, so moving the date forward would assert
  // a full re-review of every entry in the file that did not happen. Same
  // reasoning as /agent-skills-support, /manage-ai-skills and /vercel-skills.
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
  assert.ok(markdown.includes(`\n\n# ${entry.title}\n`))
  assert.ok(markdown.includes(`Canonical URL: ${canonical}`))
  assert.deepEqual(markdownTwinAlternates(entry.path), {
    canonical: entry.path,
    types: { "text/markdown": `${entry.path}.md` },
  })

  // The alternate has to reach the page head, not just the helper. Two sibling
  // routes shipped without wiring it up, so this asserts the route file uses it.
  assert.ok(
    pageSource.includes("markdownTwinAlternates(copilotSkills.path)"),
    "the route does not advertise its Markdown twin in the page head",
  )

  for (const title of [
    ...tables.map((section) => section.title),
    entry.install.title,
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

test("the page answers the Copilot question rather than a generic one", () => {
  const copy = JSON.stringify(entry)

  assert.ok(
    entry.answer.includes("SKILL.md"),
    "the short answer never names the file",
  )
  // The five directories docs.github.com publishes, all of them in the answer.
  for (const directory of [
    ".github/skills",
    ".claude/skills",
    ".agents/skills",
    "~/.copilot/skills",
    "~/.agents/skills",
  ]) {
    assert.ok(
      entry.answer.includes(directory),
      `the short answer omits ${directory}`,
    )
  }

  // The five documented directories in the order GitHub lists them, then the
  // three that only VS Code, a plugin, or an extension provides.
  assert.deepEqual(
    entry.locations.rows.map((row) => row.label),
    [
      ".github/skills/<name>/SKILL.md",
      ".claude/skills/<name>/SKILL.md",
      ".agents/skills/<name>/SKILL.md",
      "~/.copilot/skills/<name>/SKILL.md",
      "~/.agents/skills/<name>/SKILL.md",
      "~/.claude/skills/<name>/SKILL.md",
      "chat.agentSkillsLocations",
      "Plugin skills directory",
      "VS Code extension contribution",
    ],
  )

  // The six specification fields first, then the four VS Code adds. Blurring
  // the two groups is the easiest way to publish fiction about this client.
  assert.deepEqual(
    entry.frontmatter.rows.map((row) => row.label),
    [
      "name",
      "description",
      "license",
      "compatibility",
      "metadata",
      "allowed-tools",
      "argument-hint",
      "user-invocable",
      "disable-model-invocation",
      "context",
    ],
  )
  for (const field of [
    "argument-hint",
    "user-invocable",
    "disable-model-invocation",
    "context",
  ]) {
    const row = entry.frontmatter.rows.find((item) => item.label === field)
    assert.match(
      row.cells[0],
      /Not in the specification\./,
      `${field} is not marked as an extension`,
    )
    assert.match(
      row.cells[1],
      /VS Code only/,
      `${field} is not attributed to VS Code`,
    )
  }

  assert.ok(entry.install.steps.length >= 5)
  assert.ok(
    entry.install.template.includes("name:") &&
      entry.install.template.includes("description:"),
    "the SKILL.md template is missing a required field",
  )
  assert.ok(
    copy.includes("gh skill"),
    "the page never mentions the first-party install command",
  )

  assert.ok(entry.sources.length >= 12, "too few primary sources")
})

test("the three GitHub surface lists are reported rather than blended", () => {
  // GitHub's own pages disagree, so the page has to name the disagreement and
  // say which source it follows. Smoothing it over would be the easy fiction.
  const intro = entry.intro.join(" ")
  assert.match(intro, /JetBrains/)
  assert.match(intro, /cheat sheet/)

  const surfaces = JSON.stringify(entry.surfaces)
  for (const surface of [
    "Visual Studio Code",
    "Visual Studio",
    "JetBrains IDEs",
    "Eclipse",
    "Xcode",
    "GitHub.com",
    "Copilot CLI",
  ]) {
    assert.ok(
      entry.surfaces.rows.some((row) => row.label === surface),
      `the surfaces table omits ${surface}`,
    )
  }

  // Preview and unsupported are stated as such, not rounded up to supported.
  const jetbrains = entry.surfaces.rows.find(
    (row) => row.label === "JetBrains IDEs",
  )
  assert.equal(jetbrains.cells[0], "Preview")
  for (const surface of ["Eclipse", "Xcode"]) {
    const row = entry.surfaces.rows.find((item) => item.label === surface)
    assert.equal(
      row.cells[0],
      "Not supported",
      `${surface} is not reported as unsupported`,
    )
  }

  // The one Copilot surface with a narrower documented directory list.
  const codeReview = entry.surfaces.rows.find(
    (row) => row.label === "Copilot code review",
  )
  assert.match(codeReview.cells[1], /\.github\/skills/)
})

test("skills and custom instructions are separated, with the vendor's own rule", () => {
  const instructions = JSON.stringify(entry.instructions)
  for (const file of [
    ".github/copilot-instructions.md",
    ".github/instructions/**/*.instructions.md",
    "AGENTS.md",
    ".github/prompts/*.prompt.md",
    "applyTo",
  ]) {
    assert.ok(
      instructions.includes(file),
      `the instructions table omits ${file}`,
    )
  }

  // GitHub publishes its own rule for choosing between the two, and the
  // page quotes its shape rather than inventing one.
  assert.match(instructions, /custom instructions for simple/)
  assert.match(instructions, /only access when relevant/)
})

test("no table row repeats a cell value in a way the renderer cannot key", () => {
  for (const section of tables) {
    for (const row of section.rows) {
      assert.equal(
        row.cells.length,
        section.columns.length - 1,
        `${section.title}: row "${row.label}" does not fill the table`,
      )
    }
  }
})

test("undocumented claims are declared rather than asserted", () => {
  assert.ok(entry.openQuestions.entries.length >= 5)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("precedence rule"),
    "the page does not flag the missing precedence rule between directories",
  )
  assert.ok(
    limits.includes("organization"),
    "the page does not flag the missing organization-level skills setting",
  )
  assert.ok(
    limits.includes("compatibility") && limits.includes("metadata"),
    "the page does not flag the two specification fields Copilot never addresses",
  )
  assert.ok(
    limits.includes("provenance"),
    "the page does not flag the unpublished gh skill provenance keys",
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
      /Copilot/,
      `"${item.question}" does not name the client`,
    )
  }

  for (const term of [
    "where",
    "install",
    "custom instructions",
    "vs code",
    "share",
  ]) {
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

test("the product copy follows the current category narrative", () => {
  const copy = JSON.stringify(entry)

  // Skills Board is a web app a team signs in to. "Shared library" is never
  // the definition, and the team's skills are never described as recommended.
  assert.ok(
    copy.includes("the web app where a team keeps and shares its AI skills"),
    "the team section does not use the approved product sentence",
  )
  assert.doesNotMatch(copy, /shared library/i)
  assert.doesNotMatch(copy, /recommend(s|ed|ation|ations)\b/i)
})

test("the page links out, and existing pages link in", () => {
  const outbound = new Set(
    [
      ...tables.map((section) => section.link.href),
      entry.team.link.href,
      ...entry.related.map((link) => link.href),
    ].filter((href) => href.startsWith("/")),
  )
  assert.ok(outbound.size >= 4, "fewer than four internal outbound links")

  // The compatibility matrix is the page this one drills into, and the
  // authoring guide is the complement: the rules there, the client here.
  assert.ok(
    outbound.has(agentSkillsSupport.path),
    "no link to the compatibility matrix",
  )
  assert.ok(
    outbound.has(guidePaths.writeSkillMd),
    "no link to the SKILL.md authoring guide",
  )

  for (const source of [agentSkillsSupport, agentSkills]) {
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
  const cited = [
    entry.answerSourceIds,
    ...tables.map((section) => section.sourceIds),
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
