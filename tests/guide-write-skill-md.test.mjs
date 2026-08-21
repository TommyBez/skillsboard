import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { guides, writeSkillMdGuide, estimateGuideWordCount } = await import(
  "../lib/seo/guides/index.ts"
)
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { chooseFirstTeamSkillGuide } = await import(
  "../lib/seo/guides/content/choose-first-team-skill.ts"
)
const { installClaudeSkillsGuide } = await import(
  "../lib/seo/guides/content/install-claude-skills.ts"
)
const { resourceClusters, resourceEntries } = await import("../lib/seo/resources.ts")
const { renderMarkdownTwin } = await import("../lib/markdown/twins.ts")
const { buildGuideSchema } = await import("../lib/seo/guide-schema.ts")
const { default: sitemap } = await import("../app/sitemap.ts")

const guide = writeSkillMdGuide
const guidePath = "/guides/how-to-write-a-skill-md"
const canonical = `https://www.skillsboard.sh${guidePath}`

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

test("the authoring guide is registered everywhere a resource is addressed", () => {
  assert.equal(guide.path, guidePath)
  assert.ok(guides.includes(guide), "missing from the guide registry")
  assert.ok(
    resourceEntries.some((entry) => entry.path === guidePath),
    "missing from the resource registry",
  )
  assert.ok(
    resourceClusters.some((cluster) =>
      cluster.entries.some((entry) => entry.path === guidePath),
    ),
    "missing from every topic cluster",
  )
  assert.ok(
    sitemap().some((entry) => entry.url === canonical),
    "missing from the sitemap",
  )
})

test("the authoring guide is listed in the static llms.txt", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")
  assert.ok(llms.includes(canonical), "missing from public/llms.txt")
})

test("the guide answers the format question with the specification fields", () => {
  for (const field of [
    "name",
    "description",
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
  ]) {
    assert.ok(
      guide.comparisonRows.some((row) => row.label === field),
      `missing frontmatter field: ${field}`,
    )
  }

  assert.ok(guide.answer.includes("SKILL.md"), "answer omits the file name")
  assert.ok(
    guide.answer.includes("name and description"),
    "answer omits the two required fields",
  )
  assert.ok(guide.sources.length >= 4, "too few primary sources")
  for (const source of guide.sources) {
    // Each note records the date that source was checked, not one fixed date,
    // so re-verifying a single source does not invalidate the others.
    assert.match(source.note, /Checked \d{1,2} [A-Z][a-z]+ \d{4}\.$/)
  }
})

test("every comparison row fills the declared columns", () => {
  for (const row of guide.comparisonRows) {
    assert.equal(
      row.cells.length,
      guide.comparisonColumns.length - 1,
      `row "${row.label}" does not fill the table`,
    )
  }
})

test("every FAQ answer is self-contained at 40 to 60 words", () => {
  assert.ok(guide.faq, "the guide has no FAQ")
  assert.ok(guide.faq.length >= 5, "fewer than five FAQ entries")

  for (const entry of guide.faq) {
    const words = entry.answer.trim().split(/\s+/).filter(Boolean).length
    assert.ok(
      words >= 40 && words <= 60,
      `"${entry.question}" answer is ${words} words`,
    )
  }
})

test("the guide reads as a full page rather than a stub", () => {
  const words = estimateGuideWordCount(guide)
  assert.ok(words >= 2000, `word count is ${words}`)
})

test("no guide copy uses an em dash or an en dash", () => {
  assert.doesNotMatch(JSON.stringify(guide), dashPattern)
  assert.doesNotMatch(JSON.stringify(claudeSkills.authoring.link), dashPattern)
  assert.doesNotMatch(JSON.stringify(chooseFirstTeamSkillGuide.stepsLink), dashPattern)
})

test("the guide is not described as a shared library product", () => {
  assert.ok(guide.team, "the guide has no team section")
  assert.doesNotMatch(guide.team.intro, /Skills Board is a shared library/)
  assert.ok(
    guide.team.intro.includes(
      "web app where a team keeps and shares the AI skills it recommends",
    ),
    "the team section drops the product definition",
  )
})

test("the guide links out to related pages and gets contextual links in", () => {
  const outbound = new Set([
    guide.answerLink?.href,
    guide.stepsLink?.href,
    ...guide.relatedGuidePaths,
  ])
  outbound.delete(undefined)
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")
  assert.equal(guide.answerLink?.href, "/agent-skills")
  assert.equal(guide.stepsLink?.href, installClaudeSkillsGuide.path)

  assert.equal(claudeSkills.authoring.link?.href, guidePath)
  assert.equal(chooseFirstTeamSkillGuide.stepsLink?.href, guidePath)
})

test("the authoring guide stays distinct from the install guide", () => {
  assert.notEqual(guide.title, installClaudeSkillsGuide.title)
  // The install guide owns the on-disk locations; this one owns the file.
  assert.ok(
    !guide.comparisonColumns.includes("Documented path"),
    "the authoring guide repeats the install guide's decision table",
  )
  assert.ok(
    installClaudeSkillsGuide.comparisonColumns.includes("Documented path"),
    "the install guide no longer owns the location table",
  )
})

test("the guide schema carries TechArticle, HowTo, and FAQPage", () => {
  const graph = buildGuideSchema(guide)["@graph"]
  const byType = (type) => graph.find((node) => node["@type"] === type)

  assert.equal(guide.stepsAreSequential, true)
  assert.ok(byType("TechArticle"), "missing TechArticle")
  assert.ok(byType("BreadcrumbList"), "missing BreadcrumbList")

  const howTo = byType("HowTo")
  assert.ok(howTo, "missing HowTo")
  assert.equal(howTo.step.length, guide.steps.length)
  assert.equal(howTo.step[0].name, guide.steps[0].title)
  assert.equal(howTo.step[0].url, `${canonical}#step-1`)

  const faq = byType("FAQPage")
  assert.ok(faq, "missing FAQPage")
  assert.equal(faq.mainEntity.length, guide.faq.length)
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, guide.faq[0].answer)
})

test("the Markdown twin carries the new sections", () => {
  const markdown = renderMarkdownTwin(guidePath)
  assert.ok(markdown, "missing Markdown twin")
  assert.ok(markdown.startsWith(`# ${guide.title}\n`))
  assert.ok(markdown.includes(`## ${guide.team.title}`), "missing the team section")
  assert.ok(
    markdown.includes("## Frequently asked questions"),
    "missing the FAQ heading",
  )

  for (const entry of guide.faq) {
    assert.ok(markdown.includes(`### ${entry.question}`), entry.question)
    assert.ok(markdown.includes(entry.answer), "missing FAQ answer")
  }

  assert.ok(
    markdown.includes("https://www.skillsboard.sh/agent-skills)"),
    "missing the contextual link out of the answer",
  )
  assert.ok(
    markdown.includes("name: release-notes"),
    "the copyable SKILL.md template was dropped",
  )
})
