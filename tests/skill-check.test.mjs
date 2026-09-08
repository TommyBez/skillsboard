import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { checkSkillMarkdown, passesFormatCheck, SKILL_CHECK_MAX_FILE_BYTES } =
  await import("../lib/skill-check/skill-check.ts")
const { countReportIssues, renderSkillCheckMarkdown, SKILL_SPEC_CHECKED_ON } =
  await import("../lib/skill-check/report.ts")
const { skillCheck, skillCheckPath } = await import("../lib/seo/skill-check.ts")
const { default: sitemap } = await import("../app/sitemap.ts")
const { siteConfig } = await import("../lib/site.ts")

/** Em dash and en dash are not allowed anywhere in published copy. */
const dashPattern = /[–—]/

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

function valid(overrides = "") {
  return `---
name: release-notes
description: Writes release notes from a set of merged pull requests. Use when the user asks for release notes or prepares a release.${overrides}
---

# Release notes

Read the merged pull requests, then group them.
`
}

const context = { path: "skills/release-notes/SKILL.md", folderName: "release-notes" }

function codes(issues) {
  return issues.map((issue) => issue.code)
}

/* -------------------------------------------------------------------------- */
/* A file that follows the specification                                       */
/* -------------------------------------------------------------------------- */

test("a well formed SKILL.md passes with no errors and no warnings", () => {
  const result = checkSkillMarkdown(valid(), context)

  assert.deepEqual(result.errors, [])
  assert.deepEqual(result.warnings, [])
  assert.equal(result.name, "release-notes")
  assert.equal(passesFormatCheck(result), true)
  assert.ok(result.draft?.body.includes("Read the merged pull requests"))
})

test("carriage returns and a closing ... marker are read the same way", () => {
  const withDots = valid().replace(/\n---\n/, "\n...\n").replace(/\n/g, "\r\n")
  const result = checkSkillMarkdown(withDots, context)

  assert.deepEqual(codes(result.errors), [])
})

/* -------------------------------------------------------------------------- */
/* Files an agent loads with empty metadata                                    */
/* -------------------------------------------------------------------------- */

test("a file with no frontmatter is reported once and nothing else is claimed", () => {
  const result = checkSkillMarkdown("# Release notes\n\nDo the thing.\n", context)

  assert.deepEqual(codes(result.errors), ["missing_frontmatter"])
  assert.equal(result.errors[0].line, 1)
  assert.equal(result.draft, null)
  assert.equal(result.name, null)
})

test("an empty file is reported as empty rather than as missing frontmatter", () => {
  assert.deepEqual(codes(checkSkillMarkdown("   \n", context).errors), ["empty_file"])
})

test("frontmatter that is never closed is reported", () => {
  const result = checkSkillMarkdown("---\nname: release-notes\n", context)

  assert.deepEqual(codes(result.errors), ["unterminated_frontmatter"])
})

test("YAML that does not parse is reported with the parser's own message", () => {
  const result = checkSkillMarkdown(
    "---\nname: release-notes\n  description: \"unclosed\n---\n\nBody.\n",
    context,
  )

  assert.deepEqual(codes(result.errors), ["invalid_yaml"])
  assert.ok(result.errors[0].message.length > "The frontmatter is not valid YAML".length)
  assert.equal(result.draft, null)
})

test("a key declared twice is reported as a duplicate rather than as bad YAML", () => {
  const result = checkSkillMarkdown(
    `---
name: release-notes
description: First. Use when the user asks.
description: Second. Use when the user asks.
---

Body.
`,
    context,
  )

  assert.deepEqual(codes(result.errors), ["duplicate_frontmatter_key"])
})

test("frontmatter that is a list rather than a map is reported", () => {
  const result = checkSkillMarkdown("---\n- name: release-notes\n---\n\nBody.\n", context)

  assert.deepEqual(codes(result.errors), ["frontmatter_not_a_map"])
})

/* -------------------------------------------------------------------------- */
/* The two required fields                                                     */
/* -------------------------------------------------------------------------- */

test("a missing name and a missing description are each reported once", () => {
  const result = checkSkillMarkdown("---\nlicense: MIT\n---\n\nBody.\n", context)

  assert.deepEqual(codes(result.errors).sort(), ["description_missing", "name_missing"])
  // The shared draft rules must not restate what the dedicated codes said.
  assert.equal(
    result.errors.filter((issue) => issue.code.endsWith("_invalid")).length,
    0,
  )
})

test("an unquoted value that YAML reads as a boolean is reported by type", () => {
  const result = checkSkillMarkdown(
    "---\nname: true\ndescription: Does a thing. Use when asked.\n---\n\nBody.\n",
    context,
  )

  assert.deepEqual(codes(result.errors), ["name_not_a_string"])
  assert.equal(result.errors[0].line, 2)
})

test("the name rules of the specification are reported as errors", () => {
  const result = checkSkillMarkdown(
    "---\nname: Release_Notes\ndescription: Does a thing. Use when asked.\n---\n\nBody.\n",
    { path: "SKILL.md" },
  )

  assert.ok(codes(result.errors).includes("name_invalid"))
})

test("a description over the specification limit is an error", () => {
  const long = `Writes release notes. Use when asked. ${"x".repeat(1024)}`
  const result = checkSkillMarkdown(
    `---\nname: release-notes\ndescription: ${long}\n---\n\nBody.\n`,
    context,
  )

  assert.ok(codes(result.errors).includes("description_invalid"))
})

/* -------------------------------------------------------------------------- */
/* The directory rule                                                          */
/* -------------------------------------------------------------------------- */

test("a name that does not match its directory is an error", () => {
  const result = checkSkillMarkdown(valid(), {
    path: "skills/release/SKILL.md",
    folderName: "release",
  })

  assert.deepEqual(codes(result.errors), ["name_directory_mismatch"])
  assert.ok(result.errors[0].message.includes("release-notes"))
})

test("a SKILL.md at the repository root has no directory to match", () => {
  const result = checkSkillMarkdown(valid(), { path: "SKILL.md" })

  assert.deepEqual(codes(result.errors), [])
})

/* -------------------------------------------------------------------------- */
/* Conventions, which are warnings                                             */
/* -------------------------------------------------------------------------- */

test("a key outside the six the specification defines is a warning", () => {
  const result = checkSkillMarkdown(valid("\nversion: 1.2.0"), context)

  assert.deepEqual(codes(result.errors), [])
  assert.deepEqual(codes(result.warnings), ["unknown_frontmatter_key"])
  assert.equal(result.warnings[0].field, "version")
  assert.equal(result.warnings[0].line, 4)
})

test("a description with no timing in it is a warning, not an error", () => {
  const result = checkSkillMarkdown(
    "---\nname: release-notes\ndescription: Release notes helper.\n---\n\nBody.\n",
    context,
  )

  assert.deepEqual(codes(result.errors), [])
  assert.ok(codes(result.warnings).includes("description_convention"))
})

test("an empty body is a warning: the file is still valid", () => {
  const result = checkSkillMarkdown(
    "---\nname: release-notes\ndescription: Writes notes. Use when asked.\n---\n",
    context,
  )

  assert.deepEqual(codes(result.errors), [])
  assert.ok(codes(result.warnings).includes("body_convention"))
})

test("allowed-tools written as a list is a portability warning", () => {
  const result = checkSkillMarkdown(
    `---
name: release-notes
description: Writes notes. Use when asked.
allowed-tools:
  - Read
  - Grep
---

Body.
`,
    context,
  )

  assert.deepEqual(codes(result.errors), [])
  assert.ok(codes(result.warnings).includes("allowed_tools_not_a_string"))
  assert.equal(result.draft.allowedTools, "Read Grep")
})

test("metadata that is not a map of strings is an error", () => {
  const listed = checkSkillMarkdown(
    "---\nname: release-notes\ndescription: Writes notes. Use when asked.\nmetadata:\n  - author\n---\n\nBody.\n",
    context,
  )
  assert.deepEqual(codes(listed.errors), ["metadata_not_a_map"])

  const nested = checkSkillMarkdown(
    "---\nname: release-notes\ndescription: Writes notes. Use when asked.\nmetadata:\n  author:\n    name: someone\n---\n\nBody.\n",
    context,
  )
  assert.deepEqual(codes(nested.errors), ["metadata_value_not_a_string"])
})

test("license declared as a number is reported by type", () => {
  const result = checkSkillMarkdown(valid("\nlicense: 2.0"), context)

  assert.deepEqual(codes(result.errors), ["license_not_a_string"])
})

/* -------------------------------------------------------------------------- */
/* Safety of the report itself                                                 */
/* -------------------------------------------------------------------------- */

test("a file over the size ceiling is refused before it is parsed", () => {
  const result = checkSkillMarkdown(valid(), {
    ...context,
    sizeBytes: SKILL_CHECK_MAX_FILE_BYTES + 1,
  })

  assert.deepEqual(codes(result.errors), ["file_too_large"])
})

test("terminal escapes in a checked file never reach the report", () => {
  const result = checkSkillMarkdown(
    "---\nname: \"release\\u001b[31mnotes\"\ndescription: Writes notes. Use when asked.\n---\n\nBody.\n",
    context,
  )

  for (const issue of [...result.errors, ...result.warnings]) {
    assert.ok(!issue.message.includes(""), `${issue.code} carried an escape`)
  }
  assert.ok(!result.name.includes(""))
})

/* -------------------------------------------------------------------------- */
/* The report and its Markdown rendering                                       */
/* -------------------------------------------------------------------------- */

function reportWith(skills, overrides = {}) {
  return {
    url: "https://github.com/owner/repo",
    checkedAt: "2026-09-08T00:00:00.000Z",
    specCheckedOn: SKILL_SPEC_CHECKED_ON,
    repository: {
      githubUrl: "https://github.com/owner/repo",
      owner: "owner",
      name: "repo",
      defaultBranch: "main",
      commitSha: "a".repeat(40),
    },
    skills,
    truncated: false,
    error: null,
    ...overrides,
  }
}

test("the Markdown report states the passes line and both issue lists", () => {
  const report = reportWith([
    {
      path: "skills/release-notes",
      filePath: "skills/release-notes/SKILL.md",
      name: "release-notes",
      sizeBytes: 400,
      sourceUrl: "https://github.com/owner/repo/blob/sha/skills/release-notes/SKILL.md",
      errors: [],
      warnings: [{ code: "body_convention", message: "The body is empty.", field: "body" }],
    },
    {
      path: "",
      filePath: "SKILL.md",
      name: null,
      sizeBytes: 10,
      sourceUrl: "https://github.com/owner/repo/blob/sha/SKILL.md",
      errors: [{ code: "missing_frontmatter", message: "No frontmatter.", line: 1 }],
      warnings: [],
    },
  ])

  assert.deepEqual(countReportIssues(report), { errors: 1, warnings: 1 })

  const markdown = renderSkillCheckMarkdown(report)
  assert.ok(markdown.startsWith("# SKILL.md format check"))
  assert.ok(markdown.includes(`Checked against the Agent Skills spec as of ${SKILL_SPEC_CHECKED_ON}`))
  assert.ok(markdown.includes("Passes the format check"))
  assert.ok(markdown.includes("`missing_frontmatter`"))
  assert.ok(markdown.includes("repository root"))
  assert.ok(
    markdown.includes("not a review, a security audit, or a rating"),
    "the report has to say what it is not",
  )
})

test("a failed report renders the reason and stops", () => {
  const markdown = renderSkillCheckMarkdown(
    reportWith([], { error: { code: "not_found", message: "The repository was not found." } }),
  )

  assert.ok(markdown.includes("Could not check this URL"))
  assert.ok(markdown.includes("`not_found`"))
  assert.ok(!markdown.includes("## release-notes"))
})

/* -------------------------------------------------------------------------- */
/* The page around the tool                                                    */
/* -------------------------------------------------------------------------- */

test("the SEO title and description stay inside the limits, with no dash", () => {
  assert.ok(skillCheck.seoTitle.length <= 60, `title is ${skillCheck.seoTitle.length}`)
  assert.ok(
    skillCheck.description.length >= 140 && skillCheck.description.length <= 160,
    `description is ${skillCheck.description.length}`,
  )

  for (const value of copyStrings(skillCheck)) {
    assert.ok(!dashPattern.test(value), `an em or en dash is in: ${value}`)
  }
})

test("the page never calls itself a review, an audit, or a score", () => {
  const forbidden = /\b(audit|score|rating|grade|review)\b/i

  for (const value of copyStrings({
    title: skillCheck.title,
    seoTitle: skillCheck.seoTitle,
    socialTitle: skillCheck.socialTitle,
    description: skillCheck.description,
    intro: skillCheck.intro,
    form: skillCheck.form,
    checks: skillCheck.checks,
    og: skillCheck.og,
  })) {
    assert.ok(!forbidden.test(value), `a verdict word is in: ${value}`)
  }

  // It is named only where the page says what it is not.
  const limits = copyStrings(skillCheck.limits).join(" ")
  assert.ok(limits.includes("not a review"))
  assert.ok(limits.includes("not a security audit"))
  assert.ok(limits.includes("no score") || limits.includes("There is no score"))
})

test("the page is in the sitemap, in the footer, and in llms.txt", async () => {
  assert.ok(
    sitemap().some((entry) => entry.url === `${siteConfig.url}${skillCheckPath}`),
    "missing from the sitemap",
  )

  // The footer is JSX, so it is read as text rather than imported: the
  // assertion is that the page is linked from where /skill-creator is linked.
  const footer = await readFile(
    new URL("../components/footer-nav.tsx", import.meta.url),
    "utf8",
  )
  assert.ok(footer.includes("skillCheckPath"), "missing from the footer")
  assert.ok(footer.includes('label: "Skill checker"'))

  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")
  assert.ok(
    llms.includes(`${siteConfig.url}${skillCheckPath})`),
    "missing from public/llms.txt",
  )
})

test("the related links point at pages that exist in this repository", () => {
  assert.deepEqual(
    skillCheck.related.map((link) => link.href),
    ["/skill-creator", "/guides/how-to-write-a-skill-md", "/agent-skills"],
  )
})
