import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { test } from "node:test"

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

test("every comparison reports its own CTA locations", async () => {
  const locations = comparisons.map((entry) => entry.ctaLocation)

  assert.equal(
    new Set(locations).size,
    locations.length,
    "two comparisons share a ctaLocation, so landing_cta_clicked cannot tell their CTAs apart",
  )

  for (const entry of comparisons) {
    const layout = await readFile(
      new URL(`../app${entry.path}/layout.tsx`, import.meta.url),
      "utf8",
    )

    assert.ok(
      layout.includes(`${entry.ctaLocation}_header`),
      `app${entry.path}/layout.tsx does not mount the shell with ${entry.ctaLocation}_header, so the sticky CTA reports another page's location`,
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
