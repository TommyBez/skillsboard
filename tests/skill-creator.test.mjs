import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { skillCreator, skillCreatorPath } = await import(
  "../lib/seo/skill-creator/index.ts"
)
const { buildSkillCreatorSchema } = await import(
  "../lib/seo/skill-creator/schema.ts"
)
const {
  buildSkillMd,
  countBodyLines,
  emptySkillDraft,
  formatYamlScalar,
  hasBlockingIssue,
  isPlainYamlScalar,
  normalizeSkillBody,
  SKILL_BODY_LINE_BUDGET,
  SKILL_COMPATIBILITY_MAX_LENGTH,
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_NAME_MAX_LENGTH,
  skillArchivePath,
  skillDirectoryTree,
  validateSkillDraft,
} = await import("../lib/skill-creator/skill-md.ts")
const { resourceEntries } = await import("../lib/seo/resources.ts")
const { markdownTwinPaths, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig } = await import("../next.config.ts")

const entry = skillCreator
const canonical = `https://www.skillsboard.sh${skillCreatorPath}`

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[–—]/

/** Every string the page renders, so one sweep can assert over all of it. */
function copyStrings(value) {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(copyStrings)
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      key === "href" || key === "path" || key === "id" ? [] : copyStrings(nested),
    )
  }
  return []
}

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

function draft(overrides = {}) {
  return {
    ...emptySkillDraft,
    name: "reviewing-pull-requests",
    description:
      "Reviews a pull request against the team conventions. Use when the user asks for a code review.",
    body: "# Reviewing pull requests",
    ...overrides,
  }
}

/* -------------------------------------------------------------------------- */
/* Routing and registration                                                    */
/* -------------------------------------------------------------------------- */

test("the tool is addressed from the sitemap and nowhere it does not belong", () => {
  assert.equal(entry.path, "/skill-creator")
  assert.equal(entry.contentType, "tool")
  assert.ok(
    sitemap().some((candidate) => candidate.url === canonical),
    "missing from the sitemap",
  )
  assert.ok(
    !resourceEntries.some((candidate) => candidate.path === entry.path),
    "a tool page does not belong in the resource article registry",
  )
})

test("the tool page has no Markdown twin, and asking for one 404s rather than lying", () => {
  assert.ok(!markdownTwinPaths.includes(entry.path))
  assert.equal(renderMarkdownTwin(entry.path), undefined)
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

test("the trailing slash redirects to the canonical path", async () => {
  const { redirects } = nextConfig
  const rules = await redirects()
  const rule = rules.find((candidate) => candidate.source === `${entry.path}/`)
  assert.ok(rule, "no trailing slash redirect")
  assert.equal(rule.destination, entry.path)
  assert.equal(rule.permanent, true)
})

test("the page declares its own CTA locations and no hero one", async () => {
  const layout = await readFile(
    new URL(`../app${entry.path}/layout.tsx`, import.meta.url),
    "utf8",
  )
  assert.ok(layout.includes("skill_creator_header"))

  const page = await readFile(
    new URL("../components/skill-creator/skill-creator-page.tsx", import.meta.url),
    "utf8",
  )
  assert.ok(page.includes("skill_creator_inline"))
  assert.ok(page.includes("skill_creator_closing"))
  assert.ok(
    !page.includes("skill_creator_hero"),
    "the generator owns the space above the fold",
  )

  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  for (const location of [
    "skill_creator_header",
    "skill_creator_inline",
    "skill_creator_closing",
  ]) {
    assert.ok(
      events.includes(`"${location}"`),
      `${location} is missing from the landing_cta_clicked union`,
    )
  }
})

test("the one custom event records what a pageview cannot", async () => {
  const events = await readFile(
    new URL("../analytics/posthog/events.ts", import.meta.url),
    "utf8",
  )
  assert.ok(events.includes("skill_md_generated"))

  const builder = await readFile(
    new URL("../components/skill-creator/skill-md-builder.tsx", import.meta.url),
    "utf8",
  )
  for (const output of ["clipboard", "folder_zip", "skill_md"]) {
    assert.ok(
      builder.includes(`"${output}"`),
      `the builder never reports the ${output} output`,
    )
  }
})

test("validation errors gate the copy the same way they gate the downloads", async () => {
  const builder = await readFile(
    new URL("../components/skill-creator/skill-md-builder.tsx", import.meta.url),
    "utf8",
  )
  const copyButton = await readFile(
    new URL("../components/copy-button.tsx", import.meta.url),
    "utf8",
  )

  assert.ok(
    /<CopyButton[\s\S]*?disabled=\{blocked\}[\s\S]*?\/>/.test(builder),
    "the copy control is not gated on the blocked state",
  )
  assert.equal(
    (builder.match(/disabled=\{blocked\}/g) ?? []).length,
    3,
    "the copy control and the two download controls all read the blocked state",
  )
  assert.ok(copyButton.includes("disabled?: boolean"), "CopyButton takes no disabled prop")
  assert.ok(
    copyButton.includes("if (disabled) return"),
    "a disabled CopyButton still runs its copy handler",
  )
})

test("llms.txt points an agent at the tool", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")
  assert.ok(llms.includes(canonical), "the tool is missing from llms.txt")
})

test("every marketing page links to the tool from the shared footer", async () => {
  const chrome = await readFile(
    new URL("../components/resources/resource-chrome.tsx", import.meta.url),
    "utf8",
  )
  assert.ok(chrome.includes("skillCreatorPath"), "no footer link to the tool")
})

/* -------------------------------------------------------------------------- */
/* Copy                                                                        */
/* -------------------------------------------------------------------------- */

test("no em dash or en dash anywhere in the page copy", () => {
  for (const value of copyStrings(entry)) {
    assert.doesNotMatch(value, dashPattern, `dash in: ${value.slice(0, 80)}`)
  }
})

test("the product is never described as recommending a team's skills", () => {
  for (const value of copyStrings(entry)) {
    assert.doesNotMatch(
      value,
      /\bshared library\b/i,
      `Skills Board is not a shared library: ${value.slice(0, 80)}`,
    )
  }

  const claims = copyStrings(entry).filter((value) => /recommend/i.test(value))
  for (const claim of claims) {
    assert.match(
      claim,
      /specification recommends|Anthropic|guidance/,
      `an unattributed recommendation: ${claim.slice(0, 120)}`,
    )
  }
})

test("the head term and both secondary terms appear where they can rank", () => {
  assert.match(entry.seoTitle, /Claude Skill Creator/i)
  assert.match(entry.title, /claude skill creator/i)

  const faq = entry.faq.map((item) => `${item.question} ${item.answer}`).join(" ")
  assert.match(faq, /skill creator skill/i)
  assert.match(faq, /claude skills creator/i)
})

test("every section cites a source the page actually lists", () => {
  const known = new Set(entry.sources.map((source) => source.id))
  const sections = [entry.tool, entry.fields, entry.checks, entry.official]

  for (const section of sections) {
    assert.ok(section.sourceIds.length > 0, `${section.title} cites nothing`)
    for (const sourceId of section.sourceIds) {
      assert.ok(known.has(sourceId), `unknown source id: ${sourceId}`)
    }
  }

  for (const source of entry.sources) {
    assert.match(source.href, /^https:\/\//)
    assert.match(source.note, /Checked \d{1,2} \w+ 2026\./)
  }
})

test("the page positions the official skill honestly rather than against it", () => {
  const official = `${entry.official.intro} ${entry.official.entries
    .map((item) => `${item.title} ${item.body}`)
    .join(" ")} ${entry.official.notes.join(" ")}`

  assert.match(official, /anthropics\/skills/)
  assert.match(official, /skill-creator/)
  assert.match(official, /Claude session|inside Claude/i)
  assert.ok(
    entry.official.sourceIds.includes("anthropic-skill-creator"),
    "the section describing the official skill has to cite it",
  )
})

test("the schema describes a tool, with its FAQ and its breadcrumb", () => {
  const graph = buildSkillCreatorSchema(entry)["@graph"]
  const types = graph.map((node) => node["@type"])

  assert.ok(types.includes("WebApplication"))
  assert.ok(!types.includes("TechArticle"), "this page is not an article")
  assert.ok(types.includes("FAQPage"))
  assert.ok(types.includes("BreadcrumbList"))

  const tool = graph.find((node) => node["@type"] === "WebApplication")
  assert.equal(tool.url, canonical)
  assert.equal(tool.offers.price, "0")

  const faq = graph.find((node) => node["@type"] === "FAQPage")
  assert.equal(faq.mainEntity.length, entry.faq.length)
})

/* -------------------------------------------------------------------------- */
/* The generator                                                               */
/* -------------------------------------------------------------------------- */

test("the example the tool opens with is a file with nothing wrong in it", () => {
  const issues = validateSkillDraft(entry.tool.exampleDraft)
  assert.deepEqual(issues, [], "the worked example has to be exemplary")
  assert.equal(
    entry.tool.exampleDraft.name,
    entry.tool.exampleDraft.name.toLowerCase(),
  )
})

test("a minimal draft renders frontmatter and body in the documented shape", () => {
  const file = buildSkillMd(
    draft({ body: "# Reviewing pull requests\n\nRead the diff first." }),
  )

  assert.equal(
    file,
    [
      "---",
      "name: reviewing-pull-requests",
      "description: Reviews a pull request against the team conventions. Use when the user asks for a code review.",
      "---",
      "",
      "# Reviewing pull requests",
      "",
      "Read the diff first.",
      "",
    ].join("\n"),
  )
})

test("only the six specification fields are ever written", () => {
  const file = buildSkillMd(
    draft({
      license: "Apache-2.0",
      compatibility: "Requires git",
      allowedTools: "Read Grep",
      metadata: [{ key: "author", value: "example-org" }],
    }),
  )

  const frontmatter = file.split("---")[1]
  const keys = frontmatter
    .split("\n")
    .filter((line) => /^[a-z-]+:/.test(line))
    .map((line) => line.split(":")[0])

  assert.deepEqual(keys, [
    "name",
    "description",
    "license",
    "compatibility",
    "allowed-tools",
    "metadata",
  ])
  assert.ok(file.includes("metadata:\n  author: example-org"))
})

test("an empty body leaves a valid file rather than a stray blank line", () => {
  const file = buildSkillMd(draft({ body: "" }))
  assert.equal(file, "---\nname: reviewing-pull-requests\ndescription: Reviews a pull request against the team conventions. Use when the user asks for a code review.\n---\n")
})

test("a value that would change meaning unquoted is quoted", () => {
  assert.equal(isPlainYamlScalar("Extracts text from PDF files. Use when asked."), true)
  assert.equal(isPlainYamlScalar("Drafts notes: grouped by type"), false)
  assert.equal(isPlainYamlScalar("no"), false)
  assert.equal(isPlainYamlScalar("1.0"), false)
  assert.equal(isPlainYamlScalar("- leading hyphen"), false)
  assert.equal(isPlainYamlScalar("trailing colon:"), false)
  assert.equal(isPlainYamlScalar("a comment # here"), false)
  assert.equal(isPlainYamlScalar(" padded "), false)
  assert.equal(isPlainYamlScalar(""), false)

  assert.equal(formatYamlScalar("Apache-2.0"), "Apache-2.0")
  // A quote inside a plain scalar is text; a quote that opens one is not.
  assert.equal(formatYamlScalar('He said "go"'), 'He said "go"')
  assert.equal(formatYamlScalar('"go", he said'), '"\\"go\\", he said"')
  assert.equal(formatYamlScalar("two\nlines"), '"two\\nlines"')
  assert.equal(formatYamlScalar("yes"), '"yes"')
})

test("a description carrying a colon survives the round trip", async () => {
  const { parse } = await import("yaml")
  const description = "Drafts release notes: one line per change. Use when tagging."
  const file = buildSkillMd(draft({ description }))
  const frontmatter = parse(file.split("---")[1])

  assert.equal(frontmatter.description, description)
  assert.equal(frontmatter.name, "reviewing-pull-requests")
})

test("newlines in a description collapse rather than break the document", async () => {
  const { parse } = await import("yaml")
  const file = buildSkillMd(
    draft({ description: "Reviews a diff.\n\nUse when a pull request opens." }),
  )
  const frontmatter = parse(file.split("---")[1])

  assert.equal(frontmatter.description, "Reviews a diff. Use when a pull request opens.")
})

test("a metadata key YAML would read as a number, a boolean, or null stays a string", async () => {
  const { parse } = await import("yaml")
  const file = buildSkillMd(
    draft({
      metadata: [
        { key: "1.0", value: "first" },
        { key: "1", value: "second" },
        { key: "true", value: "third" },
        { key: "null", value: "fourth" },
      ],
    }),
  )
  const frontmatter = parse(file.split("---")[1])

  // Written raw, `1.0` would parse as the number 1 and collide with `1`,
  // `true` as a boolean, and `null` as the null key.
  // An integer-like key sorts first in a JavaScript object, so compare sorted.
  assert.deepEqual(Object.keys(frontmatter.metadata).sort(), ["1", "1.0", "null", "true"])
  assert.deepEqual(frontmatter.metadata, {
    "1.0": "first",
    1: "second",
    true: "third",
    null: "fourth",
  })
})

test("a special float value keeps its text rather than parsing as a number", async () => {
  const { parse } = await import("yaml")

  assert.equal(isPlainYamlScalar(".inf"), false)
  assert.equal(isPlainYamlScalar(".Inf"), false)
  assert.equal(isPlainYamlScalar(".INF"), false)
  assert.equal(isPlainYamlScalar("+.inf"), false)
  assert.equal(isPlainYamlScalar(".nan"), false)
  assert.equal(isPlainYamlScalar(".NaN"), false)
  assert.equal(formatYamlScalar(".inf"), '".inf"')

  const file = buildSkillMd(
    draft({
      metadata: [
        { key: "limit", value: ".inf" },
        { key: "score", value: ".nan" },
      ],
    }),
  )
  const frontmatter = parse(file.split("---")[1])

  assert.deepEqual(frontmatter.metadata, { limit: ".inf", score: ".nan" })
})

test("every generated file parses back into the fields it was built from", async () => {
  const { parse } = await import("yaml")
  const file = buildSkillMd(
    draft({
      license: "Proprietary. LICENSE.txt has complete terms",
      compatibility: "Requires git, docker, jq, and access to the internet",
      allowedTools: "Bash(git:*) Bash(jq:*) Read",
      metadata: [
        { key: "author", value: "example-org" },
        { key: "version", value: "1.0" },
      ],
    }),
  )
  const frontmatter = parse(file.split("---")[1])

  assert.equal(frontmatter["allowed-tools"], "Bash(git:*) Bash(jq:*) Read")
  assert.equal(frontmatter.license, "Proprietary. LICENSE.txt has complete terms")
  assert.deepEqual(frontmatter.metadata, { author: "example-org", version: "1.0" })
})

/* -------------------------------------------------------------------------- */
/* Validation                                                                  */
/* -------------------------------------------------------------------------- */

function fields(issues, level) {
  return issues.filter((issue) => issue.level === level).map((issue) => issue.field)
}

test("the two required fields are required", () => {
  const issues = validateSkillDraft(emptySkillDraft)
  assert.deepEqual(fields(issues, "error"), ["name", "description"])
  assert.ok(hasBlockingIssue(issues))
})

test("the name rules follow the specification, one message per broken rule", () => {
  assert.deepEqual(fields(validateSkillDraft(draft({ name: "PDF-Processing" })), "error"), [
    "name",
  ])
  assert.deepEqual(fields(validateSkillDraft(draft({ name: "-pdf" })), "error"), ["name"])
  assert.deepEqual(fields(validateSkillDraft(draft({ name: "pdf-" })), "error"), ["name"])
  assert.deepEqual(
    fields(validateSkillDraft(draft({ name: "pdf--processing" })), "error"),
    ["name"],
  )
  assert.deepEqual(
    fields(validateSkillDraft(draft({ name: "a".repeat(SKILL_NAME_MAX_LENGTH + 1) })), "error"),
    ["name"],
  )
  assert.deepEqual(
    fields(validateSkillDraft(draft({ name: "a".repeat(SKILL_NAME_MAX_LENGTH) })), "error"),
    [],
  )
})

test("a name with a space names the character it cannot keep", () => {
  const [issue] = validateSkillDraft(draft({ name: "pdf processing" }))
  assert.equal(issue.level, "error")
  assert.match(issue.message, /space/)
})

test("the reserved words are a warning, because the specification allows them", () => {
  const issues = validateSkillDraft(draft({ name: "claude-helper" }))
  assert.deepEqual(fields(issues, "error"), [])
  assert.deepEqual(fields(issues, "warning"), ["name"])
  assert.match(issues[0].message, /Anthropic/)
})

test("the description limits and the missing trigger are separate findings", () => {
  const long = validateSkillDraft(
    draft({ description: "Use when reviewing. ".repeat(60) }),
  )
  assert.deepEqual(fields(long, "error"), ["description"])
  assert.match(long[0].message, new RegExp(String(SKILL_DESCRIPTION_MAX_LENGTH)))

  const untriggered = validateSkillDraft(
    draft({ description: "Reviews pull requests for the team." }),
  )
  assert.deepEqual(fields(untriggered, "error"), [])
  assert.deepEqual(fields(untriggered, "warning"), ["description"])
})

test("an XML tag in a description is reported with the source that forbids it", () => {
  const issues = validateSkillDraft(
    draft({ description: "Reviews <diff> output. Use when a pull request opens." }),
  )
  const warning = issues.find((issue) => issue.field === "description")
  assert.ok(warning)
  assert.match(warning.message, /XML tags/)
})

test("compatibility is capped where the specification caps it", () => {
  const under = validateSkillDraft(
    draft({ compatibility: "a".repeat(SKILL_COMPATIBILITY_MAX_LENGTH) }),
  )
  assert.deepEqual(fields(under, "error"), [])

  const over = validateSkillDraft(
    draft({ compatibility: "a".repeat(SKILL_COMPATIBILITY_MAX_LENGTH + 1) }),
  )
  assert.deepEqual(fields(over, "error"), ["compatibility"])
})

test("allowed-tools always warns, and warns twice when it is comma separated", () => {
  const spaced = validateSkillDraft(draft({ allowedTools: "Read Grep" }))
  assert.deepEqual(fields(spaced, "warning"), ["allowed-tools"])
  assert.match(spaced[0].message, /experimental/)

  const commas = validateSkillDraft(draft({ allowedTools: "Read, Grep" }))
  assert.deepEqual(fields(commas, "warning"), ["allowed-tools", "allowed-tools"])
})

test("a metadata pair has to be a usable key and a value", () => {
  assert.deepEqual(
    fields(validateSkillDraft(draft({ metadata: [{ key: "", value: "x" }] })), "error"),
    ["metadata"],
  )
  assert.deepEqual(
    fields(validateSkillDraft(draft({ metadata: [{ key: "a b", value: "x" }] })), "error"),
    ["metadata"],
  )
  assert.deepEqual(
    fields(
      validateSkillDraft(
        draft({
          metadata: [
            { key: "author", value: "one" },
            { key: "author", value: "two" },
          ],
        }),
      ),
      "error",
    ),
    ["metadata"],
  )
  assert.deepEqual(
    fields(validateSkillDraft(draft({ metadata: [{ key: "", value: "" }] })), "error"),
    [],
  )
})

test("the body budget is guidance, so going over it warns and still downloads", () => {
  const issues = validateSkillDraft(
    draft({ body: Array.from({ length: SKILL_BODY_LINE_BUDGET + 1 }, () => "line").join("\n") }),
  )
  assert.deepEqual(fields(issues, "error"), [])
  assert.deepEqual(fields(issues, "warning"), ["body"])
  assert.equal(hasBlockingIssue(issues), false)
})

test("the body line count ignores trailing blank lines", () => {
  assert.equal(countBodyLines("one\ntwo\n\n\n"), 2)
  assert.equal(countBodyLines("   \n"), 0)
})

test("a two space hard line break survives into the file", () => {
  const body = "first line  \nsecond line"
  const file = buildSkillMd(draft({ body }))

  assert.ok(file.endsWith(`${body}\n`), "the hard line break was stripped")
  assert.equal(normalizeSkillBody(body), body)
  // Only the terminal blank run goes.
  assert.equal(normalizeSkillBody("first line  \nsecond line\n  \n\n"), "first line  \nsecond line")
  assert.equal(normalizeSkillBody("first line  \r\nsecond line"), body)
  assert.equal(normalizeSkillBody("   \n  \n"), "")
  assert.equal(normalizeSkillBody("   "), "")
  assert.equal(normalizeSkillBody(""), "")
})

/* -------------------------------------------------------------------------- */
/* The folder                                                                  */
/* -------------------------------------------------------------------------- */

test("the archive writes SKILL.md inside a directory named after the skill", async () => {
  const { buildDeterministicZip } = await import("../lib/deterministic-zip.ts")
  const { unzipSync, strFromU8 } = await import("fflate")

  const source = draft()
  const file = buildSkillMd(source)
  assert.equal(skillArchivePath(source), "reviewing-pull-requests/SKILL.md")
  assert.match(skillDirectoryTree(source), /^reviewing-pull-requests\/\n/)

  const zip = buildDeterministicZip(
    [{ bytes: new TextEncoder().encode(file), relativePath: "SKILL.md" }],
    "reviewing-pull-requests",
  )
  const unpacked = unzipSync(zip)

  assert.deepEqual(Object.keys(unpacked), ["reviewing-pull-requests/SKILL.md"])
  assert.equal(strFromU8(unpacked["reviewing-pull-requests/SKILL.md"]), file)
})
