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
    assert.ok(!issue.message.includes("\u001b"), `${issue.code} carried an escape`)
  }
  assert.ok(!result.name.includes("\u001b"))
})

test("an unknown key holding regex syntax is a warning rather than a crash", () => {
  const result = checkSkillMarkdown(valid('\n"[": value'), context)

  assert.deepEqual(codes(result.errors), [])
  assert.deepEqual(codes(result.warnings), ["unknown_frontmatter_key"])
  assert.equal(result.warnings[0].field, "[")
})

test("an optional field declared with no value is reported by type", () => {
  const license = checkSkillMarkdown(valid("\nlicense:"), context)
  assert.deepEqual(codes(license.errors), ["license_not_a_string"])
  assert.ok(license.errors[0].message.includes("empty"))

  const compatibility = checkSkillMarkdown(valid("\ncompatibility:"), context)
  assert.deepEqual(codes(compatibility.errors), ["compatibility_not_a_string"])

  const allowedTools = checkSkillMarkdown(valid("\nallowed-tools:"), context)
  assert.deepEqual(codes(allowedTools.errors), ["allowed_tools_not_a_string"])

  const metadata = checkSkillMarkdown(valid("\nmetadata:"), context)
  assert.deepEqual(codes(metadata.errors), ["metadata_not_a_map"])
})

test("a control character in the name breaks the name rule before it is stripped", () => {
  const result = checkSkillMarkdown(
    '---\nname: "release\\u001b[31mnotes"\ndescription: Writes notes. Use when asked.\n---\n\nBody.\n',
    { path: "SKILL.md" },
  )

  assert.ok(codes(result.errors).includes("name_invalid"))
  assert.ok(!result.name.includes("\u001b"))
  assert.ok(!result.draft.name.includes("\u001b"))
})

test("a message from the shared rules is sanitized before it is exposed", () => {
  const result = checkSkillMarkdown(
    '---\nname: release-notes\ndescription: Writes notes. Use when asked.\nmetadata:\n  "au\\u001b[31mthor": someone\n---\n\nBody.\n',
    context,
  )

  const issues = [...result.errors, ...result.warnings]
  assert.ok(issues.some((issue) => issue.code === "metadata_invalid"))
  for (const issue of issues) {
    assert.ok(!issue.message.includes("\u001b"), `${issue.code} carried an escape`)
    assert.ok(!/[\u0000-\u0008\u000b-\u001f]/.test(issue.message))
  }
})

test("the form reads a problem document as a refusal rather than as a report", async () => {
  // The component is JSX, so it is read as text: the assertion is that the
  // response is checked before it is treated as a report.
  const form = await readFile(
    new URL("../components/skill-check/skill-check-form.tsx", import.meta.url),
    "utf8",
  )

  assert.ok(form.includes("application/problem+json"), "the media type is not checked")
  assert.ok(form.includes("response.status === 429"), "the refusal status is not checked")
  assert.ok(form.includes("Retry-After"))
  assert.ok(form.includes('error_code: rateLimited ? "rate_limited"'))
  assert.ok(
    form.includes("Too many checks from this network"),
    "the rate limit has no reader facing copy",
  )
  assert.ok(!dashPattern.test(form), "an em or en dash is in the form copy")
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

test("a bare or trailing ESC does not survive the sanitizer", async () => {
  const { sanitizeAgentSkillText } = await import("../lib/agent-skill-text.ts")
  // The escape patterns need bytes after ESC; these leave ESC with none.
  assert.equal(sanitizeAgentSkillText("notes\u001b"), "notes")
  assert.equal(sanitizeAgentSkillText("\u001b\u001b"), "")
  assert.equal(sanitizeAgentSkillText("a\u001b\u007fb"), "ab")
  assert.equal(sanitizeAgentSkillText("a\u001b\u001b"), "a")
})

/* -------------------------------------------------------------------------- */
/* Loading a checked skill into the skill creator                              */
/* -------------------------------------------------------------------------- */

test("the check recovers the draft the creator edits, and the report carries it", async () => {
  const result = checkSkillMarkdown(valid(), context)

  assert.equal(result.draft.name, "release-notes")
  assert.ok(result.draft.description.startsWith("Writes release notes"))
  assert.ok(result.draft.body.includes("Read the merged pull requests"))
  assert.ok(!result.draft.body.startsWith("---"), "the frontmatter leaked into the body")

  // The report builder is server-only, so the wiring is read as text: every
  // entry carries a draft, and a file no fields could be recovered from
  // carries the empty one rather than nothing.
  const builder = await readFile(
    new URL("../lib/skill-check/check-github-url.ts", import.meta.url),
    "utf8",
  )
  assert.ok(builder.includes("draft: result.draft ?? emptySkillDraft"))
  assert.ok(builder.includes("draft: emptySkillDraft"), "the unreadable file has no draft")
})

test("the Markdown report states the findings and not the file", () => {
  const markdown = renderSkillCheckMarkdown(
    reportWith([
      {
        path: "skills/release-notes",
        filePath: "skills/release-notes/SKILL.md",
        name: "release-notes",
        sizeBytes: 400,
        sourceUrl: "https://github.com/owner/repo/blob/sha/skills/release-notes/SKILL.md",
        draft: {
          name: "release-notes",
          description: "Writes release notes.",
          license: "",
          compatibility: "",
          allowedTools: "",
          metadata: [],
          body: "# Release notes\n\nGROUP THE MERGED PULL REQUESTS.",
        },
        errors: [],
        warnings: [],
      },
    ]),
  )

  assert.ok(markdown.includes("skills/release-notes/SKILL.md"))
  assert.ok(
    !markdown.includes("GROUP THE MERGED PULL REQUESTS"),
    "the report printed the body of the file",
  )
})

const pickable = [
  {
    path: "skills/release-notes",
    filePath: "skills/release-notes/SKILL.md",
    sourceUrl: "https://github.com/owner/repo/blob/aaa/skills/release-notes/SKILL.md",
  },
  {
    path: "skills/triage",
    filePath: "skills/triage/SKILL.md",
    sourceUrl: "https://github.com/owner/repo/blob/aaa/skills/triage/SKILL.md",
  },
]

test("a URL to a file, a folder, or a repository picks the skill it named", async () => {
  const { pickSkillForUrl } = await import("../lib/skill-check/pick-skill.ts")

  assert.equal(
    pickSkillForUrl(
      "https://github.com/owner/repo/blob/main/skills/triage/SKILL.md",
      pickable,
    ),
    pickable[1],
    "a file URL did not pick its own file",
  )
  assert.equal(
    pickSkillForUrl("https://github.com/owner/repo/tree/main/skills/triage", pickable),
    pickable[1],
    "a folder URL did not pick the skill in it",
  )
  assert.equal(
    pickSkillForUrl("https://github.com/owner/repo", pickable),
    pickable[0],
    "a repository URL did not pick the first skill",
  )
  assert.equal(
    pickSkillForUrl("https://github.com/owner/repo/tree/main/docs", pickable),
    pickable[0],
    "an unmatched path did not fall back to the first skill",
  )
  assert.equal(pickSkillForUrl("https://github.com/owner/repo", []), null)
})

test("a permalink to the checked commit picks that exact file", async () => {
  const { pickSkillForUrl } = await import("../lib/skill-check/pick-skill.ts")

  assert.equal(pickSkillForUrl(pickable[1].sourceUrl, pickable), pickable[1])
  // A branch name holding a slash is still resolved against what was read.
  assert.equal(
    pickSkillForUrl(
      "https://github.com/owner/repo/tree/feature/two/skills/triage",
      pickable,
    ),
    pickable[1],
  )
})

test("the report links a checked skill into the creator", async () => {
  const form = await readFile(
    new URL("../components/skill-check/skill-check-form.tsx", import.meta.url),
    "utf8",
  )

  assert.ok(form.includes("/skill-creator?from=${encodeURIComponent(url)}"))
  assert.ok(
    form.includes("skillCreatorImportHref(report.url)"),
    "the header button does not carry the checked URL",
  )
  assert.ok(
    form.includes("skillCreatorImportHref(skill.sourceUrl)"),
    "a skill card does not link its own permalink",
  )
  assert.ok(form.includes("report.skills.length === 1"), "the header button is not scoped")
  assert.ok(form.includes('captureAnalyticsEvent("skill_check_open_in_creator"'))
})

test("the creator reads the from URL through the same endpoint, with no dash", async () => {
  const builder = await readFile(
    new URL("../components/skill-creator/skill-md-builder.tsx", import.meta.url),
    "utf8",
  )
  const page = await readFile(
    new URL("../app/skill-creator/page.tsx", import.meta.url),
    "utf8",
  )

  assert.ok(builder.includes("/api/check?url=${encodeURIComponent(target)}"))
  assert.ok(builder.includes("application/problem+json"), "the media type is not checked")
  assert.ok(builder.includes("response.status === 429"), "the refusal status is not checked")
  assert.ok(builder.includes("pickSkillForUrl"), "the skill is not chosen")
  assert.ok(builder.includes('captureAnalyticsEvent("skill_creator_import_completed"'))
  assert.ok(builder.includes('captureAnalyticsEvent("skill_creator_import_failed"'))
  assert.ok(!dashPattern.test(builder), "an em or en dash is in the builder copy")

  // The page stays static: the searchParams promise is passed down and read
  // with use() inside the tool's Suspense boundary, never awaited in the page.
  const tool = await readFile(
    new URL("../components/skill-creator/skill-creator-tool.tsx", import.meta.url),
    "utf8",
  )
  const pageComponent = await readFile(
    new URL("../components/skill-creator/skill-creator-page.tsx", import.meta.url),
    "utf8",
  )
  assert.ok(!page.includes("await searchParams"), "the page must not resolve the promise")
  assert.ok(page.includes("searchParams={searchParams}"))
  assert.ok(!builder.includes("useSearchParams"))
  assert.ok(!builder.includes("window.location"))
  assert.ok(tool.includes("use(searchParams)"))
  assert.ok(pageComponent.includes("<Suspense"))
})
