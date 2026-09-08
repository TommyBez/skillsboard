import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { comparePaths, comparisons, getComparison } = await import(
  "../lib/seo/compare/index.ts"
)
const { default: sitemap } = await import("../app/sitemap.ts")

const comparePath = "/compare/claude-skills-vs-plugins"
const canonical = `https://www.skillsboard.sh${comparePath}`
const entry = getComparison(comparePath)

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[\u2013\u2014]/

/** Every string in the definition, so a check covers copy added later too. */
function collectStrings(value, out = []) {
  if (typeof value === "string") {
    out.push(value)
  } else if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out)
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, out)
  }

  return out
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length
}

/**
 * The prose a reader actually sees, minus the code template and the metadata
 * fields, which is what the "short by choice" budget is about.
 */
function bodyWordCount(definition) {
  const prose = [
    ...definition.intro,
    definition.answer,
    ...definition.answerNotes,
    definition.sideBySide.intro,
    ...definition.sideBySide.rows.flatMap((row) => [row.label, ...row.cells]),
    ...definition.sideBySide.notes,
    ...[definition.leftCase, definition.rightCase].flatMap((side) => [
      side.title,
      side.intro,
      ...side.cases.flatMap((item) => [item.title, item.body]),
      side.counterweightTitle,
      ...side.counterweight,
    ]),
    definition.together.title,
    definition.together.intro,
    ...definition.together.directions.rows.flatMap((row) => [
      row.label,
      ...row.cells,
    ]),
    ...definition.together.notes,
    ...definition.faq.flatMap((item) => [item.question, item.answer]),
    definition.closing.title,
    definition.closing.body,
  ]

  return prose.reduce((total, text) => total + countWords(text), 0)
}

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("the plugins comparison is registered everywhere a comparison is addressed", () => {
  assert.equal(entry.path, comparePath)
  assert.equal(comparePaths.skillsVsPlugins, comparePath)
  assert.ok(comparisons.includes(entry), "missing from the comparison registry")
  assert.ok(
    sitemap().some((url) => url.url === canonical),
    "missing from the sitemap",
  )
})

test("the plugins comparison is listed in the static llms.txt", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")

  assert.ok(llms.includes(`${canonical})`), "missing from public/llms.txt")
})

test("the plugins comparison mounts the four CTA placements", async () => {
  const layout = await readFile(
    new URL(`../app${comparePath}/layout.tsx`, import.meta.url),
    "utf8",
  )

  assert.ok(
    layout.includes("ResourceShell"),
    "the page does not mount the shared chrome, so it has no header CTA",
  )
  assert.ok(await exists(`../app${comparePath}/page.tsx`), "missing page route")

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

test("no em dash or en dash anywhere in the comparison copy", () => {
  for (const value of collectStrings(entry)) {
    assert.ok(
      !dashPattern.test(value),
      `em or en dash in published copy: ${value}`,
    )
  }
})

test("the page stays short by choice", () => {
  const words = bodyWordCount(entry)

  assert.ok(
    words >= 700 && words <= 1200,
    `body is ${words} words, outside the 700 to 1200 budget this page was planned at, where 1200 is a deliberate ceiling and not a target`,
  )
  assert.equal(
    entry.team,
    undefined,
    "the team section is deliberately omitted to keep this page short",
  )
})

test("the FAQ is sized for extraction", () => {
  assert.ok(
    entry.faq.length >= 4 && entry.faq.length <= 6,
    `expected 4 to 6 questions, found ${entry.faq.length}`,
  )

  for (const item of entry.faq) {
    const words = countWords(item.answer)

    assert.ok(
      words >= 40 && words <= 60,
      `"${item.question}" answers in ${words} words, outside the 40 to 60 range`,
    )
  }
})

test("every claim cites a declared first-party source", () => {
  const declared = new Set(entry.sources.map((source) => source.id))

  const referenced = [
    ...entry.answerSourceIds,
    ...entry.sideBySide.sourceIds,
    ...entry.leftCase.sourceIds,
    ...entry.rightCase.sourceIds,
    ...entry.together.sourceIds,
  ]

  for (const id of referenced) {
    assert.ok(declared.has(id), `section cites undeclared source ${id}`)
  }

  for (const id of declared) {
    assert.ok(referenced.includes(id), `source ${id} is declared but never cited`)
  }

  const allowedHosts = new Set([
    "code.claude.com",
    "platform.claude.com",
    "agentskills.io",
  ])

  for (const source of entry.sources) {
    assert.ok(
      allowedHosts.has(new URL(source.href).host),
      `${source.href} is not one of the first-party documentation hosts this page was written from`,
    )
    assert.ok(source.note.length > 0, `source ${source.id} has no note`)
  }
})

test("the comparison answers the query with both documented namespaces", () => {
  const copy = collectStrings(entry).join(" ")

  for (const documented of [
    ".claude/skills/<name>/SKILL.md",
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    "plugin-name:skill-name",
  ]) {
    assert.ok(copy.includes(documented), `missing documented detail: ${documented}`)
  }
})
