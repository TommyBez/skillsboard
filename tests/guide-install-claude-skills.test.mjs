import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { guides, installClaudeSkillsGuide, estimateGuideWordCount } = await import(
  "../lib/seo/guides/index.ts"
)
const { claudeSkills } = await import("../lib/seo/claude-skills/index.ts")
const { manageCrossAgentSkillsGuide } = await import(
  "../lib/seo/guides/content/manage-cross-agent-skills.ts"
)
const { resourceClusters, resourceEntries } = await import("../lib/seo/resources.ts")
const { renderMarkdownTwin } = await import("../lib/markdown/twins.ts")
const { buildGuideSchema } = await import("../lib/seo/guide-schema.ts")
const { default: sitemap } = await import("../app/sitemap.ts")

const guide = installClaudeSkillsGuide
const guidePath = "/guides/install-claude-skills-in-claude-code"
const canonical = `https://www.skillsboard.sh${guidePath}`

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

test("the install guide is registered everywhere a resource is addressed", () => {
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

test("the install guide is listed in the static llms.txt", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")
  assert.ok(llms.includes(canonical), "missing from public/llms.txt")
})

test("the install guide answers the query with the documented paths", () => {
  for (const documentedPath of [
    "~/.claude/skills/<skill-name>/SKILL.md",
    ".claude/skills/<skill-name>/SKILL.md",
  ]) {
    assert.ok(
      guide.comparisonRows.some((row) => row.cells.includes(documentedPath)),
      `missing documented path: ${documentedPath}`,
    )
  }

  assert.ok(guide.answer.includes("~/.claude/skills/"), "answer omits the personal path")
  assert.ok(guide.sources.length >= 4, "too few primary sources")
  for (const source of guide.sources) {
    // Each note has to record the date it was checked, not one fixed date, so
    // re-verifying a single source does not break the others.
    assert.match(source.note, /Checked \d{1,2} [A-Z][a-z]+ \d{4}\.$/)
  }
})

test("every FAQ answer is self-contained at 40 to 60 words", () => {
  assert.ok(guide.faq, "the guide has no FAQ")
  assert.ok(guide.faq.length >= 4 && guide.faq.length <= 6)

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
  assert.ok(words >= 1500, `word count is ${words}`)
})

test("no guide copy uses an em dash or an en dash", () => {
  const copy = JSON.stringify(guide)
  assert.doesNotMatch(copy, dashPattern)
  assert.doesNotMatch(JSON.stringify(claudeSkills.install.link), dashPattern)
  assert.doesNotMatch(JSON.stringify(manageCrossAgentSkillsGuide.stepsLink), dashPattern)
})

test("the guide links out to related pages and gets contextual links in", () => {
  const outbound = new Set([
    guide.answerLink?.href,
    guide.stepsLink?.href,
    ...guide.relatedGuidePaths,
  ])
  outbound.delete(undefined)
  assert.ok(outbound.size >= 3, "fewer than three internal outbound links")
  assert.equal(guide.answerLink?.href, "/claude-skills")

  assert.equal(claudeSkills.install.link?.href, guidePath)
  assert.equal(manageCrossAgentSkillsGuide.stepsLink?.href, guidePath)
})

test("the guide schema carries TechArticle, HowTo, and FAQPage", () => {
  const graph = buildGuideSchema(guide)["@graph"]
  const byType = (type) => graph.find((node) => node["@type"] === type)

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

test("a guide without an FAQ still gets HowTo and no FAQPage", () => {
  const graph = buildGuideSchema(manageCrossAgentSkillsGuide)["@graph"]
  assert.ok(graph.some((node) => node["@type"] === "HowTo"))
  assert.ok(!graph.some((node) => node["@type"] === "FAQPage"))
})

test("only a sequential guide publishes HowTo", () => {
  assert.equal(guide.stepsAreSequential, true)

  const collection = guides.find((entry) => !entry.stepsAreSequential)
  assert.ok(collection, "no guide models its steps as a collection")
  assert.equal(collection.path, "/guides/ai-skill-use-cases-for-teams")

  const graph = buildGuideSchema(collection)["@graph"]
  assert.ok(
    !graph.some((node) => node["@type"] === "HowTo"),
    "independent alternatives were published as HowTo steps",
  )
  assert.ok(graph.some((node) => node["@type"] === "TechArticle"))
})

test("the Markdown twin carries the new sections", () => {
  const markdown = renderMarkdownTwin(guidePath)
  assert.ok(markdown, "missing Markdown twin")
  assert.ok(markdown.includes(`\n\n# ${guide.title}\n`))
  assert.ok(markdown.includes(`## ${guide.team.title}`), "missing the team section")
  assert.ok(
    markdown.includes("## Frequently asked questions"),
    "missing the FAQ heading",
  )

  for (const entry of guide.faq) {
    assert.ok(markdown.includes(`### ${entry.question}`), entry.question)
    // Placeholder paths keep their angle brackets by escaping them.
    assert.ok(
      markdown.includes(entry.answer.replaceAll("<", "\\<")),
      "missing FAQ answer",
    )
  }

  assert.ok(
    markdown.includes("https://www.skillsboard.sh/claude-skills)"),
    "missing the contextual link out of the answer",
  )
  assert.ok(
    markdown.includes("~/.claude/skills/\\<skill-name>/SKILL.md"),
    "the placeholder path was swallowed as markup",
  )
})
