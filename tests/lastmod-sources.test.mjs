import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import "./helpers/register-app-aliases.mjs"

import {
  commitsAfter,
  FIELD,
  parseGitLog,
  sourcesFor,
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
