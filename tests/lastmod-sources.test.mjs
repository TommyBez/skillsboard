import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import "./helpers/register-app-aliases.mjs"

import {
  commitsAfter,
  FIELD,
  parseGitLog,
  REGISTRY,
  registryEntryLines,
  registryLogArgs,
  sourcesFor,
  summarize,
} from "../scripts/lastmod-sources.mjs"

const { publicPages } = await import("../lib/site/pages.ts")

const repoRoot = fileURLToPath(new URL("../", import.meta.url))
const onDisk = (relative) => existsSync(path.join(repoRoot, relative))

test("every registry page resolves to a route folder and a content source", () => {
  for (const page of publicPages) {
    const { route, content } = sourcesFor(page.path, onDisk)
    assert.ok(route, `${page.path} has no route folder`)
    // The pages written as markup keep their copy in the route itself.
    if (page.content) {
      assert.ok(content.length > 0, `${page.path} has no content source`)
    }
  }
})

test("sourcesFor follows the conventions and the overrides", () => {
  const all = () => true
  assert.deepEqual(sourcesFor("/codex-skills", all), {
    route: "app/codex-skills",
    content: [
      "lib/seo/codex-skills",
      "lib/seo/codex-skills.ts",
      "lib/seo/codex-skills-schema.ts",
      "components/codex-skills",
    ],
  })
  assert.equal(sourcesFor("/", all).route, "app/(landing)")
  assert.equal(sourcesFor("/compare", all).route, "app/compare/(hub)")
  assert.deepEqual(sourcesFor("/guides/how-to-write-a-skill-md", all), {
    route: "app/guides/[slug]",
    content: ["lib/seo/guides/content/write-skill-md.ts"],
  })
  assert.deepEqual(sourcesFor("/alternatives/smithery", all).content, [
    "lib/seo/alternatives.ts",
  ])
  const none = () => false
  assert.deepEqual(sourcesFor("/codex-skills", none), {
    route: undefined,
    content: [],
  })
})

test("parseGitLog reads commits and their files", () => {
  const text = [
    `@@${FIELD}aaa111${FIELD}2026-09-07${FIELD}SEO: new titles`,
    "",
    "lib/seo/cursor-skills/index.ts",
    "lib/seo/opencode-skills/index.ts",
    `@@${FIELD}bbb222${FIELD}2026-08-15${FIELD}Add the page`,
    "",
    "app/cursor-skills/page.tsx",
    "",
  ].join("\n")
  assert.deepEqual(parseGitLog(text), [
    {
      sha: "aaa111",
      date: "2026-09-07",
      subject: "SEO: new titles",
      files: ["lib/seo/cursor-skills/index.ts", "lib/seo/opencode-skills/index.ts"],
    },
    {
      sha: "bbb222",
      date: "2026-08-15",
      subject: "Add the page",
      files: ["app/cursor-skills/page.tsx"],
    },
  ])
  assert.deepEqual(parseGitLog(""), [])
})

test("commitsAfter keeps only later days, not the same day", () => {
  const commits = [
    { sha: "a", date: "2026-09-07", subject: "", files: [] },
    { sha: "b", date: "2026-08-15", subject: "", files: [] },
    { sha: "c", date: "2026-08-14", subject: "", files: [] },
  ]
  assert.deepEqual(
    commitsAfter(commits, "2026-08-15").map((commit) => commit.sha),
    ["a"],
  )
})

test("registryEntryLines finds one-line and multi-line entries only", () => {
  const source = [
    "/** Not an entry: path: \"/about\", */",
    "export const pageIndex = [",
    '  { path: "/", kind: "landing" },',
    "  {",
    "    /** A comment above the path. */",
    '    path: "/about",',
    "    head: {",
    '      modifiedAt: "2026-08-22",',
    "    },",
    "    surfaces: { sitemap: { priority: 0.6 } },",
    "  },",
    '  { path: "/check", kind: "tool" },',
    "]",
  ].join("\n")
  assert.deepEqual(registryEntryLines(source, "/"), { start: 3, end: 3 })
  assert.deepEqual(registryEntryLines(source, "/about"), { start: 4, end: 11 })
  assert.deepEqual(registryEntryLines(source, "/check"), { start: 12, end: 12 })
  assert.equal(registryEntryLines(source, "/pricing"), undefined)
  assert.equal(registryEntryLines("const other = []", "/"), undefined)
})

test("every registry page has its own entry range in the page index", () => {
  const lines = readFileSync(path.join(repoRoot, REGISTRY), "utf8")
  for (const page of publicPages) {
    const range = registryEntryLines(lines, page.path)
    assert.ok(range, `${page.path} has no entry in ${REGISTRY}`)
    const entry = lines
      .split("\n")
      .slice(range.start - 1, range.end)
      .join("\n")
    assert.ok(entry.includes(`path: ${JSON.stringify(page.path)},`))
    assert.equal(
      entry.match(/path: "/g).length,
      1,
      `${page.path} range spans another entry`,
    )
    // The markup pages keep their dates in the entry, so the range must hold them.
    if (entry.includes("head: {")) {
      assert.ok(
        entry.includes(`modifiedAt: "${page.modifiedAt}"`),
        `${page.path} range misses its modifiedAt`,
      )
    }
  }
})

test("registryLogArgs follows one line range and lists no files", () => {
  const args = registryLogArgs({ start: 228, end: 254 })
  assert.ok(args.includes(`-L228,254:${REGISTRY}`))
  assert.ok(args.includes("-s"))
  assert.ok(!args.includes("--name-only"))
  assert.ok(args.includes("--no-merges"))
  const log = `@@${FIELD}ccc333${FIELD}2026-09-29${FIELD}Retitle the about page\n`
  assert.deepEqual(parseGitLog(log), [
    { sha: "ccc333", date: "2026-09-29", subject: "Retitle the about page", files: [] },
  ])
})

test("summarize fails instead of reporting a count after git log errors", () => {
  const clean = summarize({ stale: 2, total: 48, failures: [] })
  assert.equal(clean.exitCode, 0)
  assert.match(clean.lines.join("\n"), /2 of 48 pages have commits/)

  const failed = summarize({
    stale: 0,
    total: 48,
    failures: [{ path: "/about", error: "fatal: unable to read tree abc" }],
  })
  assert.equal(failed.exitCode, 1)
  const text = failed.lines.join("\n")
  assert.match(text, /1 of 48 pages/)
  assert.match(text, /\/about: fatal: unable to read tree abc/)
  assert.doesNotMatch(text, /pages have commits after/)
})
