import assert from "node:assert/strict"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { markdownTwinAlternates, markdownTwinPath, markdownTwinPaths, renderMarkdownTwin } =
  await import("../lib/markdown/twins.ts")
const { codexSkills } = await import("../lib/seo/codex-skills/index.ts")
const { home } = await import("../lib/seo/home.ts")
const { alternatives } = await import("../lib/seo/alternatives.ts")
const { comparisons } = await import("../lib/seo/compare/index.ts")
const { developers } = await import("../lib/seo/developers.ts")
const { alternativesHub, compareHub, resourcesHub } = await import("../lib/seo/hubs.ts")
const { resourceEntries } = await import("../lib/seo/resources.ts")
const { default: nextConfig } = await import("../next.config.ts")

const codexMarkdown = renderMarkdownTwin("/codex-skills")

test("every registered resource, alternative, and comparison has a Markdown twin", () => {
  // The home page and the developer docs are in no registry: the home page is
  // built from section components, with `lib/seo/home` as the content
  // definition written for it, and the developer docs describe an interface
  // rather than being a resource article, so they carry their own definition.
  // Each hub sits immediately above the collection it lists.
  const registered = [
    home,
    resourcesHub,
    ...resourceEntries,
    alternativesHub,
    ...alternatives,
    compareHub,
    ...comparisons,
    developers,
  ].map((entry) => entry.path)

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

test("the twin route answers whether or not the rewrite kept the extension", async () => {
  // `/compare/:slug` and the other negotiation rewrites match a slug pattern
  // that also accepts an extension, so `/compare/<slug>.md` asked for with
  // `Accept: text/markdown` reaches the handler as `?path=/compare/<slug>.md`
  // wherever the destination query survives, which is what Vercel does and
  // `next start` does not. `components/web-mcp.tsx` makes exactly that request
  // for every twin it reads, so the handler has to resolve both spellings.
  const { GET } = await import("../app/api/markdown/route.ts")

  const answers = async (url) => {
    const response = await GET(
      new Request(url, { headers: { Accept: "text/markdown" } }),
    )
    return { status: response.status, body: await response.text() }
  }

  const expected = renderMarkdownTwin("/compare/claude-skills-vs-plugins")

  for (const url of [
    // The rewrite destination, with and without the extension the slug ate.
    "https://www.skillsboard.sh/api/markdown?path=/compare/claude-skills-vs-plugins.md",
    "https://www.skillsboard.sh/api/markdown?path=/compare/claude-skills-vs-plugins",
    // The same request where the destination query was dropped.
    "https://www.skillsboard.sh/compare/claude-skills-vs-plugins.md",
    "https://www.skillsboard.sh/compare/claude-skills-vs-plugins",
  ]) {
    const { status, body } = await answers(url)
    assert.equal(status, 200, `${url} did not answer with the twin`)
    assert.equal(body, expected, `${url} answered with another document`)
  }

  // The home twin is the one URL that is not its page path plus `.md`.
  for (const url of [
    "https://www.skillsboard.sh/api/markdown?path=/",
    "https://www.skillsboard.sh/index.md",
  ]) {
    const { status, body } = await answers(url)
    assert.equal(status, 200, `${url} did not answer with the home twin`)
    assert.equal(body, renderMarkdownTwin("/"))
  }

  // A path with no twin is still a 404, whichever way it arrives.
  for (const url of [
    "https://www.skillsboard.sh/api/markdown?path=/pricing",
    "https://www.skillsboard.sh/api/markdown?path=/compare/not-a-pair.md",
  ]) {
    assert.equal((await answers(url)).status, 404, `${url} should not resolve`)
  }
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

test("the Accept rewrite reads media ranges, not the bare token", async () => {
  const { beforeFiles } = await nextConfig.rewrites()
  // `/index.md` is a plain path rewrite: it publishes the home twin at a URL
  // the generic `<path>.md` rule cannot spell, and negotiates nothing.
  const negotiating = beforeFiles.filter((rule) => rule.has)
  const values = new Set(negotiating.map((rule) => rule.has[0].value))
  assert.equal(values.size, 1, "the twin routes disagree on the Accept match")

  // The anchoring Next.js applies to a `has` value.
  const accept = new RegExp(`^${[...values][0]}$`)

  const negotiated = [
    "text/markdown",
    "text/markdown, text/html;q=0.9",
    "text/html;q=0.9, text/markdown;q=1.0",
    "text/markdown;charset=utf-8",
    // A positive weight is still an acceptable Markdown.
    "text/html, text/markdown;q=0.5",
  ]

  const html = [
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "*/*",
    "text/html",
    // q=0 is a refusal, whatever else the header asks for.
    "text/html, text/markdown;q=0",
    "text/html, text/markdown;q=0.0",
    "text/html, text/markdown; q=0",
    "text/html, text/markdown; charset=utf-8; q=0",
  ]

  for (const header of negotiated) {
    assert.match(header, accept, `should serve the twin: ${header}`)
  }
  for (const header of html) {
    assert.doesNotMatch(header, accept, `should keep the HTML page: ${header}`)
  }
})
