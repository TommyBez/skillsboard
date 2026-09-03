import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { markdownTwinPaths, markdownTwinPath, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const { default: nextConfig, NEGOTIATED_PAGES } = await import(
  "../next.config.ts"
)

const repoRoot = new URL("../", import.meta.url)
const source = (path) => readFileSync(new URL(path, repoRoot), "utf8")

/**
 * The documents an agent fetches are reached by following a link far more
 * often than by guessing the path, so the table on `/developers` that names
 * them has to render them as links in both representations.
 */
test("the developer docs link the machine readable documents rather than printing them", () => {
  const twin = renderMarkdownTwin("/developers") ?? ""

  for (const path of [
    "/openapi.json",
    "/server.json",
    "/.well-known/mcp/server-card.json",
    "/.well-known/oauth-protected-resource",
    "/.well-known/api-catalog",
    "/.well-known/ai-catalog.json",
    "/.well-known/agent-skills/index.json",
  ]) {
    assert.ok(
      twin.includes(`[${path}](https://www.skillsboard.sh${path})`),
      `${path} is not a link in the developers twin`,
    )
  }

  // The index of the site, which was a bare URL in a sentence.
  assert.ok(
    twin.includes("[llms.txt](https://www.skillsboard.sh/llms.txt)"),
    "llms.txt is not a link in the developers twin",
  )

  // The page renders the same rows, so the anchor has to exist in the HTML too.
  assert.match(
    source("app/developers/page.tsx"),
    /row\.href \? <a href=\{row\.href\}>\{row\.label\}<\/a> : row\.label/,
    "the developers table renders a row's href as text rather than as a link",
  )
})

/** Every fenced block in every twin, as `{ path, line, language }`. */
function fences(markdown, path) {
  const found = []
  let open
  markdown.split("\n").forEach((line, index) => {
    const match = line.match(/^(`{3,})(.*)$/)
    if (!match) return
    if (open) {
      open = undefined
      return
    }
    open = true
    found.push({ path, line: index + 1, language: match[2].trim() })
  })
  return found
}

/**
 * When an agent's answer carried code, most of the time it had copied lines
 * out of a page verbatim. A fence with no language tag does not tell it what
 * it is copying.
 */
test("every fenced block in every Markdown twin names its language", () => {
  const untagged = markdownTwinPaths
    .flatMap((path) =>
      fences(renderMarkdownTwin(path) ?? "", markdownTwinPath(path)),
    )
    .filter((fence) => !fence.language)

  assert.deepEqual(
    untagged,
    [],
    `untagged fences: ${untagged.map((f) => `${f.path}:${f.line}`).join(", ")}`,
  )
})

test("the install command and the developer templates carry the right tag", () => {
  const home = renderMarkdownTwin("/") ?? ""
  assert.match(
    home,
    /```bash\n\/plugin marketplace add TommyBez\/skillsboard\n\/plugin install skills-board@skills-board\n```/,
    "the plugin install block is the one an agent pastes, and it is untagged",
  )

  const developers = renderMarkdownTwin("/developers") ?? ""
  assert.ok(
    developers.includes('```json\n{\n  "mcpServers": {'),
    "the MCP client configuration is not tagged json",
  )
  assert.ok(
    developers.includes("```http\nHTTP/1.1 429 Too Many Requests"),
    "the problem document example is not tagged http",
  )
})

/**
 * `Vary: Accept` on the HTML half was measured to be inert on Vercel: the App
 * Router overwrites `Vary` on the rendered response with its own RSC tokens,
 * so the header this config declared never reached a client (see the removal
 * noted on PR #178). Negotiation itself stays safe without it, because the
 * `has` rule on a negotiated source sends the request to a different
 * destination (a static `.md` file or `/api/markdown`) rather than to the
 * same URL with a different body, so the HTML and Markdown responses never
 * share a cache key. What still has to hold is that every rewrite rule that
 * negotiates on Accept is declared from the same `NEGOTIATED_PAGES` list, so
 * there is one place that names the negotiated URLs.
 */
test("every rewrite rule that negotiates on Accept comes from NEGOTIATED_PAGES", async () => {
  const headers = await nextConfig.headers()
  const { beforeFiles } = await nextConfig.rewrites()

  // `/index.md` is the home twin's own rewrite, declared by hand rather than
  // through the shared list, and it does not negotiate on Accept (it always
  // serves Markdown), so it is not among the `has` rules below.
  const negotiatedSources = beforeFiles
    .filter((entry) => entry.has)
    .map((entry) => entry.source)
    .sort()

  assert.deepEqual(
    negotiatedSources,
    NEGOTIATED_PAGES.map((entry) => entry.source).sort(),
    "the beforeFiles rules that negotiate on Accept have drifted from NEGOTIATED_PAGES",
  )

  // The site wide pointer to llms.txt is still the first thing every response
  // carries.
  assert.deepEqual(headers[0], {
    source: "/:path*",
    headers: [
      {
        key: "Link",
        value: '</llms.txt>; rel="describedby"; type="text/markdown"',
      },
    ],
  })
})

/**
 * `/pricing.md` was written, published, and named in llms.txt, and the page it
 * mirrors said nothing about it: an agent that started from the page could not
 * find it and asking the page for Markdown returned HTML.
 */
test("/pricing negotiates and announces its hand written twin", async () => {
  const { beforeFiles } = await nextConfig.rewrites()
  const rule = beforeFiles.find((entry) => entry.source === "/pricing")

  assert.ok(rule, "/pricing has no content negotiation rule")
  assert.equal(rule.has[0].key, "accept")
  assert.equal(
    rule.destination,
    "/pricing.md",
    "the negotiated request has to reach the document in public, not the twin generator",
  )

  assert.match(
    source("app/pricing/page.tsx"),
    /alternates: markdownTwinAlternates\(pricingPath\)/,
    "the pricing page does not advertise its Markdown alternate",
  )

  // Nothing else negotiates towards a document that does not exist.
  for (const entry of beforeFiles.filter((item) => item.has)) {
    const path = new URL(
      entry.destination,
      "https://www.skillsboard.sh",
    ).searchParams.get("path")
    if (!path || path.includes(":")) continue
    assert.ok(
      renderMarkdownTwin(path),
      `${entry.source} negotiates towards a twin that does not render`,
    )
  }
})
