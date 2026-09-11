import assert from "node:assert/strict"
import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

import "./helpers/register-app-aliases.mjs"

const {
  contentPaths,
  markdownPagePaths,
  publicPages,
  publicPagePaths,
  sitemapPages,
  surfacesFor,
  webMcpContentPages,
} = await import("../lib/site/pages.ts")
const { markdownTwinPaths, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const { webMcpPages } = await import("../lib/web-mcp-pages.ts")
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig, NEGOTIATED_PAGES } = await import(
  "../next.config.ts"
)
const {
  markdownTwinPaths: indexTwinPaths,
  pageIndex,
  publicPagePaths: indexPagePaths,
} = await import("../lib/site/page-index.ts")
const { siteConfig } = await import("../lib/site.ts")

const repoRoot = fileURLToPath(new URL("../", import.meta.url))

/**
 * Routes that are reachable without signing in but are not public pages: a
 * form, a one-off flow, or a page whose whole content belongs to one reader.
 * Listed by hand on purpose, so that adding a route under `app/` is a choice
 * between the registry and this list rather than an omission nobody notices.
 */
const privateRoutes = new Set([
  "consent",
  "email/unsubscribe",
  "invite/[invitationId]",
  "onboarding",
  "p/[shareId]",
  "sign-in",
])

/** Every route folder under `app/` that renders a page, as a URL path. */
function routePaths() {
  const found = []
  const walk = (dir, segments) => {
    for (const name of readdirSync(dir)) {
      if (name.startsWith(".") || name === "api" || name === "node_modules") {
        continue
      }
      const full = path.join(dir, name)
      if (!statSync(full).isDirectory()) continue
      // A route group, `(app)`, adds no URL segment and is private here.
      if (name.startsWith("(") && name.endsWith(")")) {
        if (segments.length === 0 && name !== "(landing)") continue
        walk(full, segments)
        continue
      }
      walk(full, [...segments, name])
    }
    if (readdirSync(dir).includes("page.tsx")) {
      found.push(segments.join("/"))
    }
  }
  walk(path.join(repoRoot, "app"), [])
  return found
}

test("every public route folder is either registered or explicitly private", () => {
  const registered = new Set(
    publicPagePaths.map((p) => (p === "/" ? "" : p.slice(1))),
  )
  // The guides are one dynamic route rendering ten registered pages.
  registered.add("guides/[slug]")

  const unaccounted = routePaths().filter(
    (route) => !registered.has(route) && !privateRoutes.has(route),
  )

  assert.deepEqual(
    unaccounted,
    [],
    `route folders with no entry in lib/site/pages and no line in privateRoutes: ${unaccounted.join(", ")}`,
  )
})

test("a registered page has a route folder behind it", () => {
  const routes = new Set(routePaths())
  const missing = publicPagePaths.filter((p) => {
    const route = p === "/" ? "" : p.slice(1)
    if (route.startsWith("guides/")) return !routes.has("guides/[slug]")
    return !routes.has(route)
  })

  assert.deepEqual(missing, [], `registered pages with no route: ${missing}`)
})

test("the registry declares each page once, with a leading slash", () => {
  assert.equal(new Set(publicPagePaths).size, publicPagePaths.length)
  for (const page of publicPages) {
    assert.ok(page.path.startsWith("/"), `${page.path} has no leading slash`)
    assert.match(page.publishedAt, /^\d{4}-\d{2}-\d{2}$/, page.path)
    assert.match(page.modifiedAt, /^\d{4}-\d{2}-\d{2}$/, page.path)
    assert.ok(page.title.length > 0, `${page.path} has no title`)
    assert.ok(page.description.length > 0, `${page.path} has no description`)
  }
})

test("a page that answers in Markdown has the content to answer with", () => {
  for (const page of publicPages) {
    if (!surfacesFor(page).markdown) continue
    assert.ok(page.content, `${page.path} claims a twin with no content`)
    assert.ok(renderMarkdownTwin(page.path), `${page.path} renders no twin`)
  }
})

test("the twins are exactly the pages that declare one", () => {
  assert.deepEqual([...markdownTwinPaths], [...markdownPagePaths])
  assert.equal(markdownTwinPaths.length, 41)

  // Both were pages an agent could not read as Markdown before this registry
  // existed, and both stay that way until the twin is written for them.
  assert.ok(!markdownTwinPaths.includes("/about"))
  assert.ok(!markdownTwinPaths.includes("/connect"))
  assert.ok(!markdownTwinPaths.includes("/check"))
})

test("the index is the registry, in the same order", () => {
  // The registry is the index joined with the content definitions, so the two
  // agree by construction. What this pins is the order, which the sitemap, the
  // WebMCP catalogue and the twins all inherit, and the count, so that a page
  // is never dropped by an edit that looks local.
  assert.deepEqual([...indexPagePaths()], [...publicPagePaths])
  assert.deepEqual([...indexTwinPaths()], [...markdownPagePaths])
  assert.equal(publicPagePaths.length, 48)
  assert.equal(markdownPagePaths.length, 41)
})

test("the index and the content definitions cover the same pages", () => {
  // `lib/site/pages` throws on the first half of this, at import, so the test
  // states it rather than discovers it. The second half is the one nothing
  // else catches: a content definition whose path is in no index entry is a
  // page that is written, reachable by its route, and on no surface at all.
  const indexed = new Set(pageIndex.map((entry) => entry.path))

  const undefinedPages = pageIndex
    .filter((entry) => !entry.head && !contentPaths.includes(entry.path))
    .map((entry) => entry.path)
  assert.deepEqual(
    undefinedPages,
    [],
    `index entries with neither a content definition nor a head: ${undefinedPages}`,
  )

  const unlisted = contentPaths.filter((path) => !indexed.has(path))
  assert.deepEqual(
    unlisted,
    [],
    `content definitions with no entry in lib/site/page-index: ${unlisted}`,
  )

  // A head belongs to a page with nothing to join, and to no other.
  for (const entry of pageIndex) {
    if (!entry.head) continue
    assert.ok(
      !contentPaths.includes(entry.path),
      `${entry.path} has both a head in the index and a content definition`,
    )
  }
})

test("the page index imports nothing", () => {
  // `next.config.ts` requires this file. A config is resolved as CommonJS and
  // is not parsed by a bundler, so an `@/` specifier below it is resolved
  // against the project root and fails on the build machine, and a relative
  // one would pull the content graph into the config. An import here is a
  // broken deployment, not a style problem, so it is checked as source.
  const source = readFileSync(
    path.join(repoRoot, "lib/site/page-index.ts"),
    "utf8",
  )

  assert.equal(
    source.match(/^\s*import\b.*$/gm),
    null,
    "lib/site/page-index.ts must stay free of imports: next.config.ts requires it",
  )
  assert.equal(
    source.match(/\brequire\s*\(/),
    null,
    "lib/site/page-index.ts must stay free of require(): next.config.ts requires it",
  )
})

test("every twin has a beforeFiles rule that negotiates on Accept", async () => {
  const { beforeFiles } = await nextConfig.rewrites()
  const negotiated = new Map(
    beforeFiles.filter((rule) => rule.has).map((rule) => [rule.source, rule]),
  )

  for (const twinPath of markdownPagePaths) {
    const rule = negotiated.get(twinPath)
    assert.ok(rule, `no Accept rule for ${twinPath}`)
    assert.equal(rule.destination, `/api/markdown?path=${twinPath}`)
    assert.equal(rule.has[0].key, "accept")
  }

  assert.equal(negotiated.size, markdownPagePaths.length)
  // The config derives these from the index directly, so this is the check
  // that the index the config reads is the index the registry is built from.
  assert.deepEqual(
    NEGOTIATED_PAGES.map((entry) => entry.source),
    [...indexTwinPaths()],
  )
  assert.deepEqual(
    NEGOTIATED_PAGES.map((entry) => entry.source),
    [...markdownPagePaths],
  )
})

test("every public page has one canonical spelling of its URL", async () => {
  const redirects = await nextConfig.redirects()
  const bySource = new Map(redirects.map((rule) => [rule.source, rule]))

  for (const pagePath of publicPagePaths) {
    if (pagePath === "/") continue
    const rule = bySource.get(`${pagePath}/`)
    assert.ok(rule, `no trailing slash redirect for ${pagePath}`)
    assert.equal(rule.destination, pagePath)
    assert.equal(rule.permanent, true)
  }
})

test("the WebMCP catalogue is the twin set, and nothing else", () => {
  assert.deepEqual(
    webMcpPages.map((page) => page.path),
    [...markdownPagePaths],
  )
  assert.deepEqual(
    webMcpContentPages.map((entry) => entry.path),
    [...markdownPagePaths],
  )
})

test("the sitemap is the registry, with nothing added and nothing invented", () => {
  const entries = sitemap()

  assert.deepEqual(
    entries.map((entry) => entry.url),
    sitemapPages.map(({ page }) =>
      page.path === "/" ? siteConfig.url : `${siteConfig.url}${page.path}`,
    ),
  )

  for (const [index, entry] of entries.entries()) {
    const { page, sitemap: surface } = sitemapPages[index]
    assert.equal(entry.priority, surface.priority, page.path)
    assert.equal(entry.changeFrequency, surface.changeFrequency, page.path)
    assert.equal(
      entry.lastModified.toISOString().slice(0, 10),
      page.modifiedAt,
      page.path,
    )
  }

  // Every page reachable as Markdown is also a page a crawler is told about.
  const listed = new Set(entries.map((entry) => entry.url))
  for (const twinPath of markdownPagePaths) {
    const url = twinPath === "/" ? siteConfig.url : `${siteConfig.url}${twinPath}`
    assert.ok(listed.has(url), `${twinPath} has a twin and is not in the sitemap`)
  }
})

test("the about entry repeats the sentence the page publishes", () => {
  // Read as source rather than imported: `lib/seo/about-schema` reaches the OG
  // template, which is JSX, and the point of this file is that the registry
  // does not.
  const source = readFileSync(
    path.join(repoRoot, "lib/seo/about-schema.ts"),
    "utf8",
  )
  const declared = source.match(
    /export const aboutDescription =\s*\n?\s*"([^"]+)"/,
  )
  const about = publicPages.find((page) => page.path === "/about")

  assert.ok(declared, "aboutDescription is not a string literal any more")
  assert.equal(about?.description, declared[1])
})

/**
 * The registry is reached from the root layout, through the WebMCP catalogue,
 * and from every route that builds its head: a client directive or a package
 * import below it lands in the module graph of the whole site. This walks the
 * value imports and refuses JSX, a directive, and a package. The half of the
 * registry a config can read is `lib/site/page-index`, which imports nothing
 * at all; the test above keeps it that way.
 */
test("the registry and everything it imports stay plain data", () => {
  const impure = []
  const seen = new Set()

  const resolve = (specifier, from) => {
    let base
    if (specifier.startsWith("@/")) base = path.join(repoRoot, specifier.slice(2))
    else if (specifier.startsWith(".")) base = path.resolve(path.dirname(from), specifier)
    else return { packageName: specifier }
    for (const candidate of [
      base,
      `${base}.ts`,
      `${base}.tsx`,
      path.join(base, "index.ts"),
    ]) {
      try {
        if (statSync(candidate).isFile()) return { file: candidate }
      } catch {
        // Try the next candidate.
      }
    }
    return { missing: specifier }
  }

  const walk = (file) => {
    if (seen.has(file)) return
    seen.add(file)
    const source = readFileSync(file, "utf8")
    const relative = file.slice(repoRoot.length)

    if (file.endsWith(".tsx")) impure.push(`JSX: ${relative}`)
    if (/^\s*"use (client|server)"/m.test(source)) impure.push(`directive: ${relative}`)

    for (const match of source.matchAll(
      /import\s+(type\s+)?([\s\S]*?)\s*from\s*["']([^"']+)["']/g,
    )) {
      const clause = match[2].trim()
      const names = clause.startsWith("{")
        ? clause.slice(1, -1).split(",").map((name) => name.trim()).filter(Boolean)
        : []
      const typeOnly =
        Boolean(match[1]) ||
        (names.length > 0 && names.every((name) => name.startsWith("type ")))
      if (typeOnly) continue

      const specifier = match[3]
      const resolved = resolve(specifier, file)
      if (resolved.packageName) {
        impure.push(`package ${resolved.packageName}: ${relative}`)
        continue
      }
      if (resolved.missing) {
        impure.push(`unresolved ${resolved.missing}: ${relative}`)
        continue
      }
      if (resolved.file.endsWith(".json")) continue
      walk(resolved.file)
    }
  }

  walk(path.join(repoRoot, "lib/site/pages.ts"))

  assert.deepEqual(impure, [], impure.join("\n"))
  assert.ok(seen.size > 50, "the walk found suspiciously few files")
})
