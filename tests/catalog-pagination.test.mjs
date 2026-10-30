import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import { loadTsModule } from "./helpers/load-ts-module.mjs"

const {
  CATALOG_MAX_PAGE_SIZE,
  CATALOG_PAGE_SIZE,
  clampCatalogPageRequest,
  dedupeCatalogSkills,
  paginateCatalogSkills,
} = await loadTsModule(new URL("../lib/catalog.ts", import.meta.url))

const skillsSh = await readText("../lib/skills-sh.ts")
const catalogRoute = await readText("../app/api/catalog/route.ts")
const results = await readText("../components/catalog-results.tsx")

async function readText(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

function skill(id, installs = 0) {
  return {
    id,
    name: id,
    slug: id.split("/").at(-1),
    description: "A reusable agent skill.",
    source: id.split("/").slice(0, -1).join("/"),
    owner: "owner",
    repo: "repo",
    installUrl: "https://github.com/owner/repo",
    installs,
  }
}

function catalog(count) {
  // Installs deliberately out of rank so any re-sorting would show up.
  return Array.from({ length: count }, (_, index) => (
    skill(`owner/repo/skill-${String(index).padStart(3, "0")}`, (index * 37) % 11)
  ))
}

function collectPages(skills, perPage) {
  const pages = []
  for (let page = 0; ; page += 1) {
    const window = paginateCatalogSkills(skills, page, perPage)
    pages.push(window)
    if (!window.hasMore) return pages
  }
}

test("a page holds at most the requested number of skills", () => {
  const window = paginateCatalogSkills(catalog(150), 0, 24)

  assert.equal(window.skills.length, 24)
  assert.equal(window.page, 0)
  assert.equal(window.perPage, 24)
})

test("the default page is one catalog block", () => {
  assert.equal(paginateCatalogSkills(catalog(150)).skills.length, CATALOG_PAGE_SIZE)
})

test("hasMore holds while rows remain and clears on the last page", () => {
  const skills = catalog(50)

  assert.equal(paginateCatalogSkills(skills, 0, 24).hasMore, true)
  assert.equal(paginateCatalogSkills(skills, 1, 24).hasMore, true)

  const last = paginateCatalogSkills(skills, 2, 24)
  assert.equal(last.skills.length, 2)
  assert.equal(last.hasMore, false)
})

test("a listing that fills its last page exactly reports no further page", () => {
  const skills = catalog(48)

  assert.equal(paginateCatalogSkills(skills, 0, 24).hasMore, true)
  assert.equal(paginateCatalogSkills(skills, 1, 24).hasMore, false)
  assert.deepEqual(paginateCatalogSkills(skills, 2, 24), { skills: [], page: 2, perPage: 24, hasMore: false })
})

test("walking every page returns each skill exactly once, in order", () => {
  const skills = catalog(101)
  const walked = collectPages(skills, 24).flatMap((window) => window.skills.map((item) => item.id))

  assert.equal(new Set(walked).size, walked.length)
  assert.deepEqual(walked, skills.map((item) => item.id))
})

test("the page size is clamped to the catalog bounds", () => {
  const skills = catalog(300)

  assert.equal(paginateCatalogSkills(skills, 0, 10_000).skills.length, CATALOG_MAX_PAGE_SIZE)
  assert.equal(paginateCatalogSkills(skills, 0, 10_000).perPage, CATALOG_MAX_PAGE_SIZE)
  assert.equal(paginateCatalogSkills(skills, 0, 0).skills.length, 1)
  assert.equal(paginateCatalogSkills(skills, 0, -5).perPage, 1)
  assert.equal(paginateCatalogSkills(skills, 0, Number.NaN).perPage, CATALOG_PAGE_SIZE)
  assert.equal(paginateCatalogSkills(skills, 0, 12.9).perPage, 12)
})

test("the page number is clamped to a whole, non-negative page", () => {
  assert.deepEqual(clampCatalogPageRequest(-3, 24), { page: 0, perPage: 24 })
  assert.deepEqual(clampCatalogPageRequest(2.7, 24), { page: 2, perPage: 24 })
  assert.deepEqual(clampCatalogPageRequest(Number.POSITIVE_INFINITY, 24), { page: 0, perPage: 24 })
})

test("pages keep the order the listing arrived in", () => {
  const upstream = [
    skill("z/repo/first", 1),
    skill("a/repo/second", 500),
    skill("m/repo/third", 500),
    skill("b/repo/fourth", 0),
  ]

  assert.deepEqual(
    collectPages(upstream, 2).flatMap((window) => window.skills.map((item) => item.id)),
    ["z/repo/first", "a/repo/second", "m/repo/third", "b/repo/fourth"],
  )
})

test("dedupe keeps the first occurrence of each id and the order otherwise", () => {
  const deduped = dedupeCatalogSkills([
    skill("b/repo/one", 1),
    skill("a/repo/two", 2),
    skill("b/repo/one", 99),
    skill("c/repo/three", 3),
    skill("a/repo/two", 0),
  ])

  assert.deepEqual(deduped.map((item) => item.id), ["b/repo/one", "a/repo/two", "c/repo/three"])
  assert.equal(deduped[0].installs, 1)
})

test("a listing with repeated ids pages without duplicates or gaps once deduped", () => {
  const upstream = catalog(60)
  const withRepeats = [...upstream.slice(0, 30), ...upstream.slice(10, 20), ...upstream.slice(30)]
  const walked = collectPages(dedupeCatalogSkills(withRepeats), 24).flatMap((window) => window.skills.map((item) => item.id))

  assert.deepEqual(walked, upstream.map((item) => item.id))
})

test("the curated view is served in pages, never as one unbounded list", () => {
  assert.match(skillsSh, /export async function getCuratedSkills\(\n\s+page = 0,\n\s+perPage = CATALOG_PAGE_SIZE,\n\): Promise<CatalogPage>/)
  assert.match(skillsSh, /\.\.\.paginateCatalogSkills\(await loadCuratedSkills\(\), page, perPage\)/)
  assert.match(skillsSh, /return dedupeCatalogSkills\(skills\)/)
  assert.doesNotMatch(skillsSh, /hasMore: false,\n\s+source: "curated"/)
})

test("the catalog route and the results list page through the curated view", () => {
  assert.match(catalogRoute, /view: z\.enum\(\["trending", "hot", "all-time", "curated"\]\)/)
  assert.match(catalogRoute, /max\(CATALOG_MAX_PAGE_SIZE\)/)
  assert.match(catalogRoute, /getCuratedSkills\(parsed\.data\.page, parsed\.data\.perPage\)/)
  assert.doesNotMatch(results, /page\.source === "curated"\) return false/)
})
