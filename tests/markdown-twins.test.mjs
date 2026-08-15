import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { markdownTwinAlternates, markdownTwinPaths, renderMarkdownTwin } =
  await import("../lib/markdown/twins.ts")
const { codexSkills } = await import("../lib/seo/codex-skills/index.ts")
const { alternatives } = await import("../lib/seo/alternatives.ts")
const { resourceEntries } = await import("../lib/seo/resources.ts")

const codexMarkdown = renderMarkdownTwin("/codex-skills")

test("every registered resource and alternative has a Markdown twin", () => {
  const registered = [...resourceEntries, ...alternatives].map((entry) => entry.path)

  assert.deepEqual([...markdownTwinPaths], registered)

  for (const path of registered) {
    const markdown = renderMarkdownTwin(path)
    assert.ok(markdown, `missing Markdown twin for ${path}`)
    assert.match(markdown, /^# .+/)
  }
})

test("the /codex-skills twin carries the title, the sections, and the FAQ", () => {
  assert.ok(codexMarkdown.startsWith(`# ${codexSkills.title}\n`))
  assert.ok(codexMarkdown.includes(codexSkills.description))
  assert.ok(codexMarkdown.includes("Canonical URL: https://www.skillsboard.sh/codex-skills"))

  const sectionTitles = [
    codexSkills.locations.title,
    codexSkills.transfers.title,
    codexSkills.install.title,
    codexSkills.team.title,
    codexSkills.openQuestions.title,
  ]

  for (const title of sectionTitles) {
    assert.ok(
      codexMarkdown.includes(`## ${title}`),
      `missing section heading: ${title}`,
    )
  }

  for (const entry of codexSkills.faq) {
    assert.ok(
      codexMarkdown.includes(`### ${entry.question}`),
      `missing FAQ question: ${entry.question}`,
    )
    assert.ok(codexMarkdown.includes(entry.answer), "missing FAQ answer")
  }
})

test("the /codex-skills twin renders tables as Markdown, not as markup", () => {
  const headerRow = `| ${codexSkills.locations.columns.join(" | ")} |`
  assert.ok(codexMarkdown.includes(headerRow), "missing table header row")
  assert.ok(
    codexMarkdown.includes(`| ${codexSkills.locations.columns.map(() => "---").join(" | ")} |`),
    "missing table divider row",
  )

  const firstRow = codexSkills.locations.rows[0]
  assert.ok(
    codexMarkdown.includes(`| ${firstRow.label} | ${firstRow.cells.join(" | ")} |`),
    "missing table body row",
  )
})

test("the /codex-skills twin contains no HTML tags", () => {
  const htmlTag =
    /<\/?(?:a|br|div|em|h[1-6]|hr|img|li|ol|p|pre|section|span|strong|table|tbody|td|th|thead|tr|ul)\b[^>]*>/i

  assert.doesNotMatch(codexMarkdown, htmlTag)
  for (const path of markdownTwinPaths) {
    assert.doesNotMatch(renderMarkdownTwin(path) ?? "", htmlTag)
  }
})

test("internal links in a twin are absolute", () => {
  for (const path of markdownTwinPaths) {
    const markdown = renderMarkdownTwin(path) ?? ""
    assert.doesNotMatch(
      markdown,
      /\]\(\//,
      `relative Markdown link in the twin of ${path}`,
    )
  }
})

test("a trailing slash resolves, an unknown path does not", () => {
  assert.equal(renderMarkdownTwin("/codex-skills/"), codexMarkdown)
  assert.equal(renderMarkdownTwin("/codex-skills.md"), undefined)
  assert.equal(renderMarkdownTwin("/pricing"), undefined)
})

test("only a page with a twin advertises the Markdown alternate", () => {
  assert.deepEqual(markdownTwinAlternates("/codex-skills"), {
    canonical: "/codex-skills",
    types: { "text/markdown": "/codex-skills.md" },
  })
  assert.deepEqual(markdownTwinAlternates("/pricing"), { canonical: "/pricing" })
})

/** Everything outside a fenced block, where Markdown syntax is live. */
function prose(markdown) {
  let inFence = false
  return markdown
    .split("\n")
    .filter((line) => {
      if (/^`{3,}$/.test(line.trim())) {
        inFence = !inFence
        return false
      }
      return !inFence
    })
    .join("\n")
}

test("angle-bracket placeholders read as text rather than as markup", () => {
  const claudeMarkdown = renderMarkdownTwin("/claude-skills") ?? ""

  assert.ok(
    claudeMarkdown.includes("~/.claude/skills/\\<name>/SKILL.md"),
    "the placeholder path lost its escape",
  )

  for (const path of markdownTwinPaths) {
    assert.doesNotMatch(
      prose(renderMarkdownTwin(path) ?? ""),
      /(?<!\\)</,
      `unescaped angle bracket in the twin of ${path}`,
    )
  }
})
