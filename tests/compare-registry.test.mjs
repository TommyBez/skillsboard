import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"
import { loadTsModule } from "./helpers/load-ts-module.mjs"

const { compareIndexPath, comparePaths, comparisons } = await loadTsModule(
  new URL("../lib/seo/compare/index.ts", import.meta.url),
)

/**
 * Read the paths off the registry rather than off the path map: registration
 * is what puts a comparison on the hub, in the ItemList schema, and in the
 * sitemap, so that is what the route and llms.txt checks have to follow.
 */
const paths = comparisons.map((entry) => entry.path)

async function exists(relative) {
  try {
    await access(new URL(relative, import.meta.url))
    return true
  } catch {
    return false
  }
}

test("every comparison lives under the hub that lists it", () => {
  assert.ok(paths.length > 0)

  for (const path of paths) {
    assert.ok(
      path.startsWith(`${compareIndexPath}/`),
      `${path} is not under ${compareIndexPath}, so the hub breadcrumb, the ItemList schema, and the trailing-slash redirect do not cover it`,
    )
  }
})

test("comparison paths are unique", () => {
  assert.equal(new Set(paths).size, paths.length)
})

test("the path map lists exactly the registered comparisons", () => {
  assert.deepEqual(
    [...paths].sort(),
    Object.values(comparePaths).sort(),
    "comparePaths and the comparisons array disagree, so one of them points at a page the other does not know about",
  )
})

test("every registered comparison has a route", async () => {
  for (const path of paths) {
    assert.ok(
      await exists(`../app${path}/page.tsx`),
      `${path} is registered but app${path}/page.tsx does not exist`,
    )
  }
})

test("every comparison mounts the shell that carries the header CTA", async () => {
  for (const entry of comparisons) {
    const layout = await readFile(
      new URL(`../app${entry.path}/layout.tsx`, import.meta.url),
      "utf8",
    )

    assert.ok(
      layout.includes("ResourceShell"),
      `app${entry.path}/layout.tsx does not mount the shell, so the page has no header CTA`,
    )
  }
})

test("every comparison publishes a Markdown twin", async () => {
  // The alias hook rather than `loadTsModule`: the twin registry reaches every
  // content collection, and inlining that graph as data URLs would load a
  // second copy of each one.
  const { hasMarkdownTwin, renderMarkdownTwin } = await import(
    "../lib/markdown/twins.ts"
  )

  for (const entry of comparisons) {
    assert.ok(
      hasMarkdownTwin(entry.path),
      `${entry.path} has no Markdown twin, so ${entry.path}.md answers 404 while every other content page answers`,
    )

    const markdown = renderMarkdownTwin(entry.path) ?? ""
    assert.ok(markdown.startsWith(`# ${entry.title}\n`))
    assert.ok(
      markdown.includes(`## ${entry.sideBySide.title}`),
      `${entry.path} twin is missing the side-by-side section`,
    )
  }
})

test("every comparison is listed in llms.txt", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")

  for (const path of [compareIndexPath, ...paths]) {
    assert.ok(
      llms.includes(`https://www.skillsboard.sh${path})`),
      `${path} is missing from public/llms.txt`,
    )
  }
})
