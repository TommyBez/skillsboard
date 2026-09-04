import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { vercelSkills, vercelSkillsPath } = await import(
  "../lib/seo/vercel-skills/index.ts"
)
const { bestClaudeSkills } = await import(
  "../lib/seo/best-claude-skills/index.ts"
)
const { opencodeSkills } = await import("../lib/seo/opencode-skills/index.ts")
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

const entry = vercelSkills
const canonical = `https://www.skillsboard.sh${vercelSkillsPath}`
const markdown = renderMarkdownTwin(vercelSkillsPath) ?? ""
const pageSource = await readFile(
  new URL("../app/vercel-skills/page.tsx", import.meta.url),
  "utf8",
)

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** The tabled sections, in the order the page renders them. */
const tables = [
  entry.meanings,
  entry.catalog,
  entry.names,
  entry.weight,
  entry.caution,
  entry.drift,
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
  assert.equal(entry.path, "/vercel-skills")
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
      "../components/vercel-skills/vercel-skills-page.tsx",
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

  // The single `Last reviewed` line belongs to the pages reviewed on
  // 2026-08-19. Moving it forward would assert that every source behind every
  // other page was re-read today. This page re-read only its own, so the
  // shared line stays put and the page carries its own date, exactly as
  // /agent-skills-support and /opencode-skills did before it.
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

  assert.ok(
    pageSource.includes("markdownTwinAlternates(vercelSkills.path)"),
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

test("the ambiguous head term is disambiguated before anything else", () => {
  // "vercel skills" is a head term that also names a CLI command and a
  // separate tool. The first table on the page has to separate them, or the
  // page answers a question a large share of the traffic did not ask.
  assert.equal(entry.meanings, tables[0], "the meanings table is not first")
  assert.equal(entry.meanings.rows.length, 6)

  const labels = entry.meanings.rows.map((row) => row.label)
  assert.deepEqual(labels, [
    "vercel-labs/agent-skills",
    "vercel skills",
    "npx skills",
    "skills.sh",
    "Vercel published skills",
    "Other Vercel repositories",
  ])

  // The two repositories that get quoted as one thing.
  const copy = JSON.stringify(entry)
  assert.ok(copy.includes("vercel-labs/agent-skills"))
  assert.ok(copy.includes("vercel-labs/skills"))

  // The honest half of the disambiguation: the traffic this page cannot help.
  assert.match(
    entry.intro.join(" "),
    /job at Vercel/,
    "the page never says which readers it cannot help",
  )
})

test("the catalog pins all nine skills and what each one declares", () => {
  assert.equal(entry.catalog.rows.length, 9, "the collection is not nine rows")

  // Frontmatter names, not folder names, because that is what the installer
  // and the directory both use.
  assert.deepEqual(
    entry.catalog.rows.map((row) => row.label),
    [
      "vercel-react-best-practices",
      "web-design-guidelines",
      "vercel-composition-patterns",
      "vercel-react-native-skills",
      "deploy-to-vercel",
      "vercel-react-view-transitions",
      "vercel-cli-with-tokens",
      "vercel-optimize",
      "writing-guidelines",
    ],
  )

  // Four declare MIT in their own frontmatter and five declare nothing. This
  // is the claim on the page most likely to change, and the one a reader is
  // most likely to act on, so it is pinned by count.
  const licensed = entry.catalog.rows.filter((row) =>
    row.cells[1].startsWith("MIT, declared in its own frontmatter."),
  )
  const unlicensed = entry.catalog.rows.filter((row) =>
    row.cells[1].startsWith("No license field."),
  )
  assert.equal(licensed.length, 4, "the licensed count moved")
  assert.equal(unlicensed.length, 5, "the unlicensed count moved")
  assert.equal(licensed.length + unlicensed.length, entry.catalog.rows.length)

  assert.deepEqual(
    unlicensed.map((row) => row.label),
    [
      "web-design-guidelines",
      "deploy-to-vercel",
      "vercel-cli-with-tokens",
      "vercel-optimize",
      "writing-guidelines",
    ],
  )

  // The repository itself has nothing to fall back on.
  const notes = entry.catalog.notes.join(" ")
  assert.match(notes, /no license file anywhere in the tree/)
})

test("the folder and name mismatch is stated for all nine folders", () => {
  assert.equal(entry.names.rows.length, 9)
  for (const row of entry.names.rows) {
    assert.match(row.label, /^skills\//, `${row.label} is not a repository path`)
    assert.ok(["Yes", "No"].includes(row.cells[1]), row.label)
  }

  const mismatched = entry.names.rows.filter((row) => row.cells[1] === "No")
  assert.equal(mismatched.length, 4, "the mismatch count moved")
  assert.deepEqual(
    mismatched.map((row) => row.label),
    [
      "skills/composition-patterns",
      "skills/react-best-practices",
      "skills/react-native-skills",
      "skills/react-view-transitions",
    ],
  )

  // Every mismatched folder is prefixed rather than renamed, so the pattern is
  // legible: the frontmatter name is the folder with a vercel- prefix.
  for (const row of mismatched) {
    const folder = row.label.replace("skills/", "")
    assert.equal(row.cells[0], `vercel-${folder}`, row.label)
  }

  // What the installer does about it, and what a manual copy does not.
  const notes = entry.names.notes.join(" ")
  assert.match(notes, /npx skills add/)
  assert.match(notes, /rename the folder when you copy/)
})

test("the measured cost of the collection is stated as numbers", () => {
  const weight = JSON.stringify(entry.weight)
  for (const value of ["302", "2.2 MB", "3,000 characters", "346 lines"]) {
    assert.ok(weight.includes(value), `the cost table lost ${value}`)
  }
  assert.equal(entry.weight.rows.length, 7)
})

test("the skills that reach outside their folder are named", () => {
  assert.ok(entry.caution.rows.length >= 5)
  const caution = JSON.stringify(entry.caution)

  // The three behaviours a team has to decide about before adopting.
  assert.match(caution, /tarball/, "the deploy upload is not described")
  assert.match(caution, /\.env/, "the token file scan is not described")
  assert.match(
    caution,
    /command\.md/,
    "the two skills that fetch their rules are not described",
  )

  // The two thin skills have an environment requirement and no compatibility
  // field, which is the spec field written for exactly that.
  assert.match(caution, /compatibility field/)
})

test("the repository drift is recorded against what the files say", () => {
  assert.equal(entry.drift.rows.length, 7)
  const drift = JSON.stringify(entry.drift)
  for (const claim of [
    "react-native-guidelines",
    "vercel-deploy-claimable",
    "13 skills",
    "40 or more rules",
  ]) {
    assert.ok(drift.includes(claim), `the drift table omits ${claim}`)
  }
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
  assert.ok(entry.openQuestions.entries.length >= 4)

  const limits = JSON.stringify(entry.openQuestions)
  assert.ok(
    limits.includes("license"),
    "the page does not flag the license gap it spent a section on",
  )
  assert.ok(
    limits.includes("zip archives"),
    "the page does not flag the undocumented committed archives",
  )
  assert.ok(
    limits.includes("retired") || limits.includes("retires"),
    "the page does not flag the undocumented directory retirement behaviour",
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
      /[Vv]ercel/,
      `"${item.question}" does not name the vendor`,
    )
  }

  for (const term of ["where", "install", "license", "share"]) {
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
  assert.match(entry.team.body.join(" "), /web application/)
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

  // The sibling this page must not cannibalise is the register that already
  // covers four of these nine skills.
  assert.ok(outbound.has(bestClaudeSkills.path), "no link to the register")

  // Contextual inbound links, not only navigation.
  assert.equal(bestClaudeSkills.interfaces.link.href, entry.path)

  for (const source of [
    bestClaudeSkills,
    opencodeSkills,
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
  assert.ok(entry.sources.length >= 10, "too few primary sources")

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

  const used = new Set(cited.flat())
  for (const source of entry.sources) {
    assert.ok(used.has(source.id), `${source.id} is listed but never cited`)
  }

  // The sources that make this a first-party page rather than a summary of
  // other people's summaries.
  for (const href of [
    "https://github.com/vercel-labs/agent-skills",
    "https://github.com/vercel-labs/skills",
    "https://vercel.com/docs/cli/skills",
    "https://agentskills.io/specification",
  ]) {
    assert.ok(
      entry.sources.some((source) => source.href === href),
      `missing primary source: ${href}`,
    )
  }
})
