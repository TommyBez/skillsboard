import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { markdownTwinPaths, markdownTwinPath, renderMarkdownTwin } = await import(
  "../lib/markdown/twins.ts"
)
const {
  default: nextConfig,
  MARKDOWN_ACCEPT,
  NEGOTIATED_PAGES,
} = await import("../next.config.ts")

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
 * Router overwrites `Vary` on the rendered response with its own RSC tokens, so
 * the header this config declared never reached a client (see the removal noted
 * on PR #178). The header that a shared cache needs is the one on the Markdown
 * half, and that one is set by `app/api/markdown/route.ts`, which is a route
 * handler rather than a page and keeps the headers it returns. So every rule
 * that negotiates on Accept has to send the request there: a destination that a
 * static file server answers would put a Markdown body under the page URL with
 * no `Vary` on it, which is a body a shared cache can hand to a browser.
 */
test("every negotiated rule is declared once and answers from the route handler", async () => {
  const headers = await nextConfig.headers()
  const { beforeFiles } = await nextConfig.rewrites()

  // `/index.md` is the home twin's own rewrite, declared by hand rather than
  // through the shared list, and it does not negotiate on Accept (it always
  // serves Markdown), so it is not among the `has` rules below.
  const negotiated = beforeFiles.filter((entry) => entry.has)

  assert.deepEqual(
    negotiated.map((entry) => entry.source).sort(),
    NEGOTIATED_PAGES.map((entry) => entry.source).sort(),
    "the beforeFiles rules that negotiate on Accept have drifted from NEGOTIATED_PAGES",
  )

  const notHandled = negotiated
    .filter((entry) => !entry.destination.startsWith("/api/markdown?"))
    .map((entry) => `${entry.source} -> ${entry.destination}`)

  assert.deepEqual(
    notHandled,
    [],
    "a negotiated request has to reach the route handler, which is what sets Vary: Accept and the Markdown metadata",
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
 * The `has` rule is compiled by Next as `new RegExp(`^${value}$`)`, with no
 * flags, so this is exactly what the router evaluates at runtime.
 */
const acceptMatcher = new RegExp(`^${MARKDOWN_ACCEPT.value}$`)

/**
 * A media type and a parameter name are case insensitive (RFC 9110), and the
 * matcher cannot be given the `i` flag, so the case is written into the pattern
 * itself. A client that shouts its Accept header still gets Markdown, and one
 * that refuses Markdown still gets HTML however it spells `q`.
 */
test("the Accept matcher reads the media type and its parameters in any case", () => {
  for (const header of [
    "text/markdown",
    "Text/Markdown",
    "TEXT/MARKDOWN",
    "text/markdown, text/html;q=0.9",
    "text/markdown;q=0.5",
    "Text/Markdown;Q=1",
    "text/html;q=0.9, Text/Markdown;Q=0.8",
  ]) {
    assert.ok(acceptMatcher.test(header), `${header} should negotiate Markdown`)
  }

  for (const header of [
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "text/markdown;q=0",
    "Text/Markdown;Q=0",
    "TEXT/MARKDOWN;Q=0.0",
    "text/markdown ; q = 0",
    "text/html, text/markdown;q=0",
  ]) {
    assert.ok(
      !acceptMatcher.test(header),
      `${header} refuses Markdown and should get HTML`,
    )
  }
})

/**
 * `/pricing` was the one negotiated page whose rewrite pointed at a hand
 * written document in `public`. A static file carries none of what the route
 * handler adds, and `/developers` promises the token estimate on every Markdown
 * response, so the document became a content definition like the home page and
 * the developer docs.
 */
test("/pricing negotiates through the twin generator and announces its twin", async () => {
  const { beforeFiles } = await nextConfig.rewrites()
  const rule = beforeFiles.find((entry) => entry.source === "/pricing")

  assert.ok(rule, "/pricing has no content negotiation rule")
  assert.equal(rule.has[0].key, "accept")
  assert.equal(rule.destination, "/api/markdown?path=/pricing")

  const twin = renderMarkdownTwin("/pricing")
  assert.ok(twin, "/pricing negotiates towards a twin that does not render")
  assert.equal(markdownTwinPath("/pricing"), "/pricing.md")
  // The URL named in llms.txt still answers, and the plans are still in it.
  for (const line of ["# Skills Board pricing", "### Hosted", "### Self-hosted"]) {
    assert.ok(twin.includes(line), `the pricing twin is missing ${line}`)
  }

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
