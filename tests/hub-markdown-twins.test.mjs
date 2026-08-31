import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { GET } = await import("../app/api/markdown/route.ts")
const {
  hasMarkdownTwin,
  markdownTwinAlternates,
  markdownTwinPath,
  renderMarkdownTwin,
} = await import("../lib/markdown/twins.ts")
const { alternatives } = await import("../lib/seo/alternatives.ts")
const { comparisons } = await import("../lib/seo/compare/index.ts")
const { alternativesHub, compareHub, resourcesHub } = await import(
  "../lib/seo/hubs.ts"
)
const { resourceClusters } = await import("../lib/seo/resources.ts")
const { webMcpPages } = await import("../lib/web-mcp-pages.ts")
const { siteConfig } = await import("../lib/site.ts")
const { default: sitemap } = await import("../app/sitemap.ts")
const { default: nextConfig } = await import("../next.config.ts")

/**
 * The three hubs, each with the pages it indexes.
 *
 * A hub twin exists to be the node above those pages: an agent that reached a
 * child through its `.md` URL has somewhere to climb to, and finds the sibling
 * pages there. A hub that listed none of its children would answer 200 and
 * still leave the graph broken, so the list is what these tests check.
 */
const hubs = [
  {
    hub: resourcesHub,
    children: resourceClusters.flatMap((cluster) => cluster.entries),
  },
  { hub: alternativesHub, children: alternatives },
  { hub: compareHub, children: comparisons },
]

async function markdownResponse(url) {
  const response = await GET(
    new Request(url, { headers: { Accept: "text/markdown" } }),
  )
  return { response, body: await response.text() }
}

test("each hub publishes a twin at its own path plus .md", () => {
  for (const { hub } of hubs) {
    assert.ok(hasMarkdownTwin(hub.path), `${hub.path} has no Markdown twin`)
    assert.equal(markdownTwinPath(hub.path), `${hub.path}.md`)

    const markdown = renderMarkdownTwin(hub.path) ?? ""
    assert.ok(
      markdown.startsWith(`# ${hub.title}\n`),
      `${hub.path} twin does not open with its own title`,
    )
    assert.ok(markdown.includes(`> ${hub.description}`))
    assert.ok(
      markdown.includes(`Canonical URL: ${siteConfig.url}${hub.path}`),
      `${hub.path} twin does not name the HTML page as canonical`,
    )
    assert.ok(
      markdown.includes(`Markdown URL: ${siteConfig.url}${hub.path}.md`),
      `${hub.path} twin does not name its own URL`,
    )
  }
})

test("a hub twin links to every page it indexes", () => {
  for (const { hub, children } of hubs) {
    const markdown = renderMarkdownTwin(hub.path) ?? ""
    assert.ok(children.length > 0)

    for (const child of children) {
      assert.ok(
        markdown.includes(`](${siteConfig.url}${child.path})`),
        `the ${hub.path} twin does not link to ${child.path}`,
      )
      assert.ok(
        markdown.includes(`[${child.title}]`),
        `the ${hub.path} twin links to ${child.path} without naming it`,
      )
    }
  }
})

test("a hub twin says what each page it lists is about", () => {
  for (const { hub, children } of hubs) {
    const markdown = renderMarkdownTwin(hub.path) ?? ""

    for (const child of children) {
      const note = child.cardSummary ?? child.description
      assert.ok(
        markdown.includes(`](${siteConfig.url}${child.path}): ${note}`),
        `the ${hub.path} twin lists ${child.path} with no summary beside it`,
      )
    }
  }
})

test("the hub twins point at each other, so the three are one graph", () => {
  for (const { hub } of hubs) {
    const markdown = renderMarkdownTwin(hub.path) ?? ""
    const others = hubs
      .map(({ hub: other }) => other.path)
      .filter((path) => path !== hub.path)

    for (const path of others) {
      assert.ok(
        markdown.includes(`](${siteConfig.url}${path})`),
        `the ${hub.path} twin does not reach the ${path} hub`,
      )
    }
  }
})

test("the .md URL and the negotiated page URL answer with the same document", async () => {
  for (const { hub } of hubs) {
    const expected = renderMarkdownTwin(hub.path)

    for (const url of [
      // The rewrite destination, with and without the extension.
      `${siteConfig.url}/api/markdown?path=${hub.path}`,
      `${siteConfig.url}/api/markdown?path=${hub.path}.md`,
      // The same request where the destination query was dropped, which is
      // what `next start` does and Vercel does not.
      `${siteConfig.url}${hub.path}.md`,
      `${siteConfig.url}${hub.path}`,
    ]) {
      const { response, body } = await markdownResponse(url)

      assert.equal(response.status, 200, `${url} did not answer with the twin`)
      assert.equal(body, expected, `${url} answered with another document`)
      assert.equal(
        response.headers.get("content-type"),
        "text/markdown; charset=utf-8",
      )
      assert.equal(response.headers.get("vary"), "Accept")
    }
  }
})

test("each hub path negotiates Markdown the way its children do", async () => {
  const { beforeFiles } = await nextConfig.rewrites()

  for (const { hub } of hubs) {
    const rule = beforeFiles.find((candidate) => candidate.source === hub.path)

    assert.ok(rule, `${hub.path} has no content negotiation rule`)
    assert.equal(rule.destination, `/api/markdown?path=${hub.path}`)
    assert.equal(rule.has?.[0]?.key, "accept")
  }
})

test("each hub advertises its twin as an alternate of the HTML page", () => {
  for (const { hub } of hubs) {
    assert.deepEqual(markdownTwinAlternates(hub.path), {
      canonical: hub.path,
      types: { "text/markdown": `${hub.path}.md` },
    })
  }
})

test("WebMCP reaches the hubs, and each one sits above its own collection", () => {
  const paths = webMcpPages.map((page) => page.path)

  for (const { hub, children } of hubs) {
    const hubIndex = paths.indexOf(hub.path)
    assert.notEqual(hubIndex, -1, `${hub.path} is missing from the catalogue`)

    for (const child of children) {
      assert.ok(
        paths.indexOf(child.path) > hubIndex,
        `${child.path} is listed before the hub that indexes it`,
      )
    }
  }
})

test("the hubs are listed in llms.txt by their page URL", async () => {
  const llms = await readFile(new URL("../public/llms.txt", import.meta.url), "utf8")

  for (const { hub } of hubs) {
    assert.ok(
      llms.includes(`${siteConfig.url}${hub.path})`),
      `${hub.path} is missing from public/llms.txt`,
    )
  }
})

test("a twin stays out of the sitemap, and the page it belongs to stays in", () => {
  const urls = sitemap().map((entry) => entry.url)

  // The HTML page is the canonical document, and the twin is a representation
  // of it rather than a second page. Listing both would offer a crawler two
  // URLs for one document.
  assert.equal(
    urls.filter((url) => url.endsWith(".md")).length,
    0,
    "a Markdown twin is in the sitemap",
  )

  for (const { hub } of hubs) {
    assert.ok(
      urls.includes(`${siteConfig.url}${hub.path}`),
      `${hub.path} left the sitemap`,
    )
  }
})
