import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const { compareIndexPath, comparePaths } = await loadTsModule(
  new URL("../lib/seo/compare/types.ts", import.meta.url),
)

const paths = Object.values(comparePaths)

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

test("every registered comparison has a route", async () => {
  for (const path of paths) {
    assert.ok(
      await exists(`../app${path}/page.tsx`),
      `${path} is registered but app${path}/page.tsx does not exist`,
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
