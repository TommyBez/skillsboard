import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { claimApiRequest, MCP_RATE_LIMIT, PUBLIC_API_RATE_LIMIT, rateLimitHeaders } =
  await import("../lib/api-rate-limit.ts")
const { API_VERSION, API_VERSION_HEADER, isSupportedApiVersion, SUPPORTED_API_VERSIONS } =
  await import("../lib/api-version.ts")
const { buildProblem, problemCodes } = await import("../lib/problem-json.ts")
const { buildNotFoundMarkdown, recoveryLinks } = await import("../lib/agent-recovery.ts")
const { buildOpenApiDocument } = await import("../lib/openapi.ts")
const { buildArdCatalog } = await import("../lib/ard-catalog.ts")
const { buildApiCatalog } = await import("../lib/api-catalog.ts")
const { buildMcpRegistryManifest, buildMcpServerCard, mcpServerInfo, mcpToolSummaries } =
  await import("../lib/mcp-server-card.ts")
const { developers, developersPath, problemAnchor } = await import("../lib/seo/developers.ts")
const { buildDevelopersSchema } = await import("../lib/seo/developers-schema.ts")
const { renderMarkdownTwin } = await import("../lib/markdown/twins.ts")
const { discoveryUrl, getDiscoveryOrigin } = await import("../lib/agent-discovery.ts")
const { default: nextConfig } = await import("../next.config.ts")
const { default: sitemap } = await import("../app/sitemap.ts")
const { siteConfig } = await import("../lib/site.ts")

const origin = getDiscoveryOrigin()
const spec = buildOpenApiDocument()

async function readRepoFile(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

test("the request budget refuses only past the published limit", () => {
  const store = new Map()
  const now = 1_000_000_000_000
  let last

  for (let request = 0; request < PUBLIC_API_RATE_LIMIT.limit; request += 1) {
    last = claimApiRequest("client", { store, now })
    assert.equal(last.allowed, true, `request ${request + 1} inside the budget was refused`)
  }

  assert.equal(last.remaining, 0, "the last allowed request should leave nothing")

  const refused = claimApiRequest("client", { store, now })
  assert.equal(refused.allowed, false)
  assert.ok(refused.resetSeconds > 0, "a refusal has to say when to come back")

  // A refusal is not charged, so retrying immediately is refused rather than
  // pushing the window further out.
  assert.equal(claimApiRequest("client", { store, now }).allowed, false)

  // Clients are counted separately.
  assert.equal(claimApiRequest("other-client", { store, now }).allowed, true)
})

test("the budget refills as the window slides", () => {
  const store = new Map()
  const windowMs = PUBLIC_API_RATE_LIMIT.windowSeconds * 1000
  const now = 1_000_000_000_000

  for (let request = 0; request < PUBLIC_API_RATE_LIMIT.limit; request += 1) {
    claimApiRequest("client", { store, now })
  }
  assert.equal(claimApiRequest("client", { store, now }).allowed, false)

  // Half a window later the previous window counts for half, so half the
  // budget is available again.
  const later = claimApiRequest("client", { store, now: now + windowMs * 1.5 })
  assert.equal(later.allowed, true)
  assert.ok(
    later.remaining > 0 && later.remaining < PUBLIC_API_RATE_LIMIT.limit,
    `expected a partly refilled budget, got ${later.remaining}`,
  )

  // A client that stops for two full windows starts from a clean budget.
  const rested = new Map()
  for (let request = 0; request < PUBLIC_API_RATE_LIMIT.limit; request += 1) {
    claimApiRequest("client", { store: rested, now })
  }
  const fresh = claimApiRequest("client", { store: rested, now: now + windowMs * 2 })
  assert.equal(fresh.allowed, true)
  assert.equal(fresh.remaining, PUBLIC_API_RATE_LIMIT.limit - 1)
})

test("the rate limit headers carry the same numbers in both spellings", () => {
  const decision = claimApiRequest("client", { store: new Map(), now: 1_000_000_000_000 })
  const headers = rateLimitHeaders(decision)

  assert.equal(
    headers["RateLimit-Policy"],
    `"${PUBLIC_API_RATE_LIMIT.name}";q=${PUBLIC_API_RATE_LIMIT.limit};w=${PUBLIC_API_RATE_LIMIT.windowSeconds}`,
  )
  assert.equal(
    headers.RateLimit,
    `"${PUBLIC_API_RATE_LIMIT.name}";r=${decision.remaining};t=${decision.resetSeconds}`,
  )
  assert.equal(headers["RateLimit-Limit"], String(PUBLIC_API_RATE_LIMIT.limit))
  assert.equal(headers["RateLimit-Remaining"], String(decision.remaining))
  assert.equal(headers["RateLimit-Reset"], String(decision.resetSeconds))
})

test("only a version this deployment serves may be pinned", () => {
  assert.ok(SUPPORTED_API_VERSIONS.includes(API_VERSION))
  // An absent or blank header is not a mismatch: the client did not pin.
  assert.equal(isSupportedApiVersion(null), true)
  assert.equal(isSupportedApiVersion(""), true)
  assert.equal(isSupportedApiVersion(` ${API_VERSION} `), true)
  assert.equal(isSupportedApiVersion("2"), false)
  assert.equal(isSupportedApiVersion("banana"), false)
})

test("every problem document points at the section of the docs that explains it", () => {
  for (const [code, registered] of Object.entries(problemCodes)) {
    const problem = buildProblem(code, { instance: "/api/health" })

    assert.equal(problem.code, code)
    assert.equal(problem.status, registered.status)
    assert.equal(problem.title, registered.title)
    assert.equal(problem.instance, `${origin}/api/health`)
    assert.equal(
      problem.type,
      `${origin}${developersPath}#${problemAnchor(code)}`,
      `${code} points at an anchor the developer docs do not carry`,
    )
  }
})

test("the developer docs document every problem code, with the anchor its type URI names", async () => {
  const page = await readRepoFile("../app/developers/page.tsx")
  const documented = developers.errors.codes.rows.map((row) => row.label)

  assert.deepEqual(documented, Object.keys(problemCodes))
  // The anchors are rendered from the same helper the type URIs are built
  // from, so the page cannot carry an id the documents do not resolve to.
  assert.ok(
    page.includes("id={problemAnchor(problem.label)}"),
    "the error sections no longer carry the anchor a problem type resolves to",
  )
})

test("the developer docs are reachable by every spelling an agent guesses", async () => {
  const redirects = await nextConfig.redirects()
  const rewrites = await nextConfig.rewrites()

  for (const source of ["/docs", "/api", "/developers/"]) {
    const redirect = redirects.find((rule) => rule.source === source)
    assert.ok(redirect, `no redirect from ${source}`)
    assert.equal(redirect.destination, developersPath)
    assert.equal(redirect.permanent, true)
  }

  // A client that guesses the conventional MCP root path is sent to the
  // endpoint tokens are actually bound to, with the method and body intact.
  const mcp = redirects.find((rule) => rule.source === "/mcp")
  assert.ok(mcp, "no redirect from the conventional /mcp path")
  assert.equal(mcp.destination, "/api/mcp")
  assert.equal(mcp.permanent, true, "a 307 would not preserve a POSTed JSON-RPC body")

  const markdown = rewrites.beforeFiles.find((rule) => rule.source === developersPath)
  assert.ok(markdown, "the developer docs do not answer Accept: text/markdown")
  assert.equal(markdown.destination, `/api/markdown?path=${developersPath}`)
})

test("the developer docs are listed everywhere the site indexes itself", async () => {
  const llms = await readRepoFile("../public/llms.txt")
  assert.ok(
    llms.includes(`${siteConfig.url}${developersPath})`),
    "the developer docs are missing from public/llms.txt",
  )
  assert.ok(
    llms.includes(`${siteConfig.url}/server.json)`),
    "the MCP registry manifest is missing from public/llms.txt",
  )

  const urls = sitemap().map((entry) => entry.url)
  assert.ok(urls.includes(`${siteConfig.url}${developersPath}`), "missing from the sitemap")

  const ard = buildArdCatalog()
  assert.ok(
    ard.entries.some((entry) => entry.url === `${origin}${developersPath}.md`),
    "missing from the ARD capability manifest",
  )
  assert.ok(
    ard.entries.some((entry) => entry.url === `${origin}/server.json`),
    "the registry manifest is missing from the ARD capability manifest",
  )

  const [api] = buildApiCatalog().linkset
  assert.ok(
    api["service-doc"].some((link) => link.href === `${origin}${developersPath}`),
    "the API catalog does not name the documentation for its own API",
  )
})

test("the developer docs render the tool list and scopes the server actually has", () => {
  const markdown = renderMarkdownTwin(developersPath)
  assert.ok(markdown, "the developer docs have no Markdown twin")

  for (const row of developers.tools.rows) {
    assert.ok(markdown.includes(row.label), `the twin omits the ${row.label} tool`)
  }

  // Read from the server card rather than restated, so a tool added to the MCP
  // route reaches this page without anyone remembering to update it.
  assert.equal(developers.tools.rows.length > 0, true)
  assert.ok(markdown.includes(API_VERSION_HEADER), "the twin omits the version header")
})

test("the developer docs schema describes the page as technical documentation", () => {
  const graph = buildDevelopersSchema()["@graph"]
  const article = graph.find((node) => node["@type"] === "TechArticle")

  assert.ok(article, "no TechArticle node")
  assert.equal(article.url, `${siteConfig.url}${developersPath}`)
  assert.equal(article.dateModified, developers.modifiedAt)
  assert.equal(article.encoding.contentUrl, `${siteConfig.url}${developersPath}.md`)

  const organization = graph.find((node) => node["@type"] === "Organization")
  assert.equal(organization.address["@type"], "PostalAddress")
})

test("the organization node states both a contact point and an address", async () => {
  const { buildLandingSchema } = await import("../lib/seo/landing-schema.ts")
  const { organizationNode } = await import("../lib/seo/organization.ts")

  // The article pages build the node through the same helper, which is what
  // this asserts on: before it existed, six page types carried six copies and
  // four of them named neither a contact point nor an address.
  for (const graph of [buildLandingSchema()["@graph"], [organizationNode()]]) {
    const organization = graph.find((node) => node["@type"] === "Organization")

    assert.ok(organization.contactPoint?.email, "the organization has no contact point")
    assert.equal(organization.address["@type"], "PostalAddress")
    assert.equal(organization.address.addressCountry, siteConfig.address.addressCountry)
    // The one-line spelling used in the footer and in email has to be the same
    // address as the structured one machines read.
    assert.ok(
      siteConfig.postalAddress.includes(organization.address.postalCode),
      "the two spellings of the mailing address disagree",
    )
    assert.ok(siteConfig.postalAddress.includes(organization.address.addressLocality))
  }
})

test("the served MCP registry manifest matches the committed one", async () => {
  const committed = JSON.parse(await readRepoFile("../server.json"))
  const served = buildMcpRegistryManifest(`${origin}/api/mcp`)

  assert.equal(served.$schema, committed.$schema)
  assert.equal(served.name, mcpServerInfo.name)
  assert.equal(served.name, committed.name)
  assert.equal(served.title, committed.title)
  assert.equal(served.description, committed.description)
  assert.equal(served.version, committed.version)
  assert.deepEqual(served.repository, committed.repository)
  assert.deepEqual(committed.remotes, [
    { type: "streamable-http", url: `${siteConfig.url}/api/mcp` },
  ])

  // The served copy names the deployment serving it, never production, so a
  // preview cannot advertise the production endpoint.
  assert.deepEqual(served.remotes, [{ type: "streamable-http", url: `${origin}/api/mcp` }])
  assert.equal(served.websiteUrl, origin)
})

test("every OpenAPI operation is typed well enough to become a tool definition", () => {
  const operationIds = new Set()

  for (const [path, operations] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      assert.ok(operation.operationId, `${method} ${path} has no operationId`)
      assert.equal(
        operationIds.has(operation.operationId),
        false,
        `duplicate operationId: ${operation.operationId}`,
      )
      operationIds.add(operation.operationId)
      assert.ok(operation.summary, `${operation.operationId} has no summary`)
      assert.ok(operation.description, `${operation.operationId} has no description`)

      const success = operation.responses["200"]
      const [schema] = Object.values(success.content).map((media) => media.schema)

      // A response typed as a bare object tells a model nothing about what it
      // just fetched, which is the whole failure mode this asserts against.
      assert.ok(
        schema.$ref || schema.properties || schema.type === "string",
        `${operation.operationId} returns an untyped object`,
      )
    }
  }

  assert.ok(operationIds.has("getMcpRegistryManifest"), "the registry manifest is undescribed")
})

test("the OpenAPI description carries a typed error model", () => {
  const problem = spec.components.schemas.Problem

  assert.deepEqual(problem.properties.code.enum, Object.keys(problemCodes))
  assert.ok(problem.required.includes("code"))
  assert.ok(problem.required.includes("status"))

  for (const response of ["RateLimited", "UnsupportedApiVersion"]) {
    const described = spec.components.responses[response]
    assert.equal(
      described.content["application/problem+json"].schema.$ref,
      "#/components/schemas/Problem",
      `${response} is not typed as a problem document`,
    )
  }

  // The MCP endpoint reports failures the way JSON-RPC does, and both its
  // refusals are described that way rather than as problem documents.
  for (const status of ["401", "403"]) {
    assert.equal(
      spec.paths["/api/mcp"].post.responses[status].content["application/json"].schema.$ref,
      "#/components/schemas/JsonRpcError",
    )
  }
})

test("the OpenAPI description declares the version header and the request budget", () => {
  const parameter = spec.components.parameters.ApiVersion

  assert.equal(parameter.in, "header")
  assert.equal(parameter.name, API_VERSION_HEADER)
  assert.deepEqual(parameter.schema.enum, [...SUPPORTED_API_VERSIONS])

  const health = spec.paths["/api/health"].get
  assert.deepEqual(health.parameters, [{ $ref: "#/components/parameters/ApiVersion" }])
  assert.equal(health.responses["429"].$ref, "#/components/responses/RateLimited")

  for (const header of ["RateLimit", "RateLimit-Policy", "RateLimit-Limit"]) {
    assert.ok(health.responses["200"].headers[header], `/api/health does not publish ${header}`)
  }

  // The policy in the description is the one the code enforces.
  assert.ok(
    spec.info.description.includes(
      `${PUBLIC_API_RATE_LIMIT.limit} requests per ${PUBLIC_API_RATE_LIMIT.windowSeconds} seconds`,
    ),
    "the described budget is not the enforced one",
  )
  assert.ok(spec.info.description.includes("Deprecation"), "no deprecation policy is stated")
  assert.equal(spec.externalDocs.url, `${origin}${developersPath}`)
})

test("a 404 tells a client where to look next, in the format it asked for", () => {
  const markdown = buildNotFoundMarkdown("/no-such-page")

  assert.match(markdown, /^# 404/)
  assert.ok(markdown.includes("/no-such-page"), "the 404 does not name what was asked for")

  // Absolute, and on the deployment that answered: a client that just guessed
  // a path wrong should not have to resolve a relative link against it.
  for (const link of recoveryLinks) {
    assert.ok(
      markdown.includes(`(${discoveryUrl(link.href)})`),
      `the 404 does not point at ${link.href}`,
    )
  }

  // The recovery routes have to be real: a 404 that links to another 404 is
  // worse than one that links nowhere.
  const paths = recoveryLinks.map((link) => link.href)
  assert.deepEqual(paths, ["/", "/sitemap.xml", "/llms.txt", developersPath])
})

test("the new copy follows the site's dash convention", () => {
  const dashPattern = /[\u2013\u2014]/

  assert.doesNotMatch(JSON.stringify(developers), dashPattern)
  assert.doesNotMatch(renderMarkdownTwin(developersPath), dashPattern)
  assert.doesNotMatch(buildNotFoundMarkdown("/no-such-page"), dashPattern)
})

test("a Markdown request for a path that does not exist reaches the Markdown 404", async () => {
  const { fallback } = await nextConfig.rewrites()

  const rule = fallback?.find((entry) => entry.source === "/:path*")
  assert.ok(rule, "no fallback rule catches an unknown path")
  assert.equal(rule.destination, "/api/markdown?path=/:path*")

  // Only when Markdown was asked for: without the condition this would take
  // every 404 on the site away from the HTML page that answers them.
  const [accept] = rule.has
  assert.equal(accept.type, "header")
  assert.equal(accept.key, "accept")
  assert.match("text/markdown", new RegExp(accept.value))

  // `fallback` runs after pages, public files, and dynamic routes, so a real
  // page and a static document are never reached by it. Both are also matched
  // by earlier rules, which is what this pins.
  const { beforeFiles, afterFiles } = await nextConfig.rewrites()
  assert.ok(beforeFiles.some((entry) => entry.source === "/"), "the home page lost its Markdown rule")
  assert.ok(
    afterFiles.some((entry) => entry.source.includes(".md")),
    "the .md twin rule is gone",
  )
})

test("the MCP endpoint publishes a budget of its own", async () => {
  const route = await readRepoFile("../app/api/[transport]/route.ts")

  assert.ok(MCP_RATE_LIMIT.limit > PUBLIC_API_RATE_LIMIT.limit, "an agent session is not a page view")
  assert.ok(route.includes("MCP_RATE_LIMIT"), "the MCP route does not claim its own policy")
  assert.ok(
    route.includes("withRequestBudget as GET") &&
      route.includes("withRequestBudget as POST") &&
      route.includes("withRequestBudget as DELETE"),
    "a method escapes the budget wrapper",
  )
  // The headers have to ride on the 401 too: that is the first response an
  // unauthenticated client sees, and the one it needs to pace itself from.
  assert.ok(
    route.includes("const headers = new Headers(response.headers)"),
    "the wrapper no longer copies the inner response headers",
  )
  assert.ok(
    route.includes("new Response(response.body"),
    "the wrapper must stream the body rather than buffer an SSE response",
  )
})

test("the deprecation policy is declared in the spec, not only in prose", () => {
  const policy = spec.info["x-deprecation-policy"]

  assert.equal(policy.notice_days, 90)
  assert.deepEqual(policy.signals, ["Deprecation", "Sunset"])
  assert.equal(policy.url, `${origin}${developersPath}#deprecation-policy`)

  for (const header of ["Deprecation", "Sunset"]) {
    assert.ok(spec.components.headers[header], `${header} is undeclared`)
  }

  // Every operation declares both, so a client knows the signal exists before
  // the day it fires.
  for (const [path, operations] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(operations)) {
      const headers = operation.responses["200"].headers ?? {}
      assert.ok(headers.Deprecation, `${method} ${path} does not announce deprecation`)
      assert.ok(headers.Sunset, `${method} ${path} does not announce a sunset`)
    }
  }

  // And the page the policy URL points at carries that anchor.
  assert.equal(developers.deprecationPolicy.title, "Deprecation policy")
  assert.ok(renderMarkdownTwin(developersPath).includes("## Deprecation policy"))
})

test("both MCP card paths answer with the same card", () => {
  const endpoint = `${origin}/api/mcp`
  const card = buildMcpServerCard(endpoint, (path) => `${origin}${path}`)

  assert.equal(card.serverInfo.name, mcpServerInfo.name)
  assert.equal(card.transport.endpoint, endpoint)
  assert.deepEqual(card.transports, [card.transport])
  assert.deepEqual(
    card.tools.map((tool) => tool.name),
    mcpToolSummaries.map((tool) => tool.name),
  )
  assert.equal(card.authentication.resource, endpoint)
  assert.equal(card.authentication.documentation, `${origin}/auth.md`)
})
