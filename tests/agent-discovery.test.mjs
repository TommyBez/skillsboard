import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { test } from "node:test"

import "./helpers/register-app-aliases.mjs"

const { buildProtectedResourceMetadata, discoveryUrl, getDiscoveryOrigin } =
  await import("../lib/agent-discovery.ts")
const { buildAgentAuthBlock } = await import("../lib/agent-auth-metadata.ts")
const { buildAgentSkillsIndex, TEAM_SKILL_LIBRARY_DESCRIPTION, TEAM_SKILL_LIBRARY_DIGEST, TEAM_SKILL_LIBRARY_SKILL_PATH } =
  await import("../lib/published-agent-skills.ts")
const { mcpServerInfo, mcpToolSummaries } = await import("../lib/mcp-server-card.ts")
const { buildRobotsTxt, contentSignals, disallowedPaths } = await import("../lib/seo/robots.ts")
const { oauthScopes } = await import("../lib/oauth-scopes.ts")
const { siteConfig } = await import("../lib/site.ts")

async function readRepoFile(relative) {
  return readFile(new URL(relative, import.meta.url), "utf8")
}

const origin = getDiscoveryOrigin()

test("the discovery origin is a bare origin, and every document hangs off it", () => {
  assert.equal(new URL(origin).origin, origin)
  assert.equal(discoveryUrl("/auth.md"), `${origin}/auth.md`)
  // A path with no leading slash still lands on the origin, not beside it.
  assert.equal(discoveryUrl("auth.md"), `${origin}/auth.md`)
})

test("protected resource metadata names the audience Better Auth binds tokens to", () => {
  const metadata = buildProtectedResourceMetadata()

  assert.equal(metadata.resource, `${origin}/api/mcp`)
  assert.deepEqual(metadata.authorization_servers, [`${origin}/api/auth`])
  assert.deepEqual(metadata.scopes_supported, [...oauthScopes])
  assert.deepEqual(metadata.bearer_methods_supported, ["header"])
})

test("agent_auth points at the endpoints the auth server actually published", () => {
  const block = buildAgentAuthBlock({
    issuer: `${origin}/api/auth`,
    registration_endpoint: `${origin}/api/auth/oauth2/register`,
    authorization_endpoint: `${origin}/api/auth/oauth2/authorize`,
    token_endpoint: `${origin}/api/auth/oauth2/token`,
    revocation_endpoint: `${origin}/api/auth/oauth2/revoke`,
  })

  assert.equal(block.skill, `${origin}/auth.md`)
  assert.equal(block.register_uri, `${origin}/api/auth/oauth2/register`)
  assert.equal(block.revocation_uri, `${origin}/api/auth/oauth2/revoke`)

  const [method] = block.registration_methods_supported
  assert.equal(method.type, "dynamic_client_registration")
  assert.equal(method.register_uri, block.register_uri)
  assert.equal(method.authorization_uri, `${origin}/api/auth/oauth2/authorize`)
  assert.equal(method.token_uri, `${origin}/api/auth/oauth2/token`)
  assert.equal(method.resource, `${origin}/api/mcp`)
  assert.deepEqual(method.code_challenge_methods_supported, ["S256"])
})

test("agent_auth is omitted rather than invented when registration is unavailable", () => {
  assert.equal(buildAgentAuthBlock({ issuer: `${origin}/api/auth` }), undefined)
  // An empty string is not an endpoint either.
  assert.equal(buildAgentAuthBlock({ registration_endpoint: "" }), undefined)
})

test("agent_auth declares no flow this server cannot run", () => {
  // No agent provider is on the trust list in this environment, so the ID-JAG
  // flow would answer invalid_grant for every issuer alive. `agent_auth` says
  // so by omitting it rather than advertising a flow that always fails; the
  // configured case is asserted in tests/agent-auth.test.mjs.
  const block = buildAgentAuthBlock({
    registration_endpoint: `${origin}/api/auth/oauth2/register`,
  })
  const serialized = JSON.stringify(block)

  assert.deepEqual(block.identity_types_supported, ["service_auth"])
  assert.doesNotMatch(serialized, /id-jag/i)
  assert.doesNotMatch(serialized, /anonymous/i)
  assert.doesNotMatch(serialized, /claim_uri|claim_endpoint/)
  assert.doesNotMatch(serialized, /client_credentials/)
})

test("the published skill copy matches the plugin skill it was taken from", async () => {
  const published = await readRepoFile(`../public${TEAM_SKILL_LIBRARY_SKILL_PATH}`)
  const source = await readRepoFile("../plugin/skills/team-skill-library/SKILL.md")

  assert.equal(published, source, "publish the plugin skill again: the copies differ")
})

test("the agent skills index digest is the digest of the file it points at", async () => {
  const published = await readRepoFile(`../public${TEAM_SKILL_LIBRARY_SKILL_PATH}`)
  const digest = `sha256:${createHash("sha256").update(published).digest("hex")}`

  assert.equal(TEAM_SKILL_LIBRARY_DIGEST, digest)

  const index = buildAgentSkillsIndex()
  assert.equal(index.$schema, "https://schemas.agentskills.io/discovery/0.2.0/schema.json")
  assert.equal(index.skills.length, 1)

  const [skill] = index.skills
  assert.equal(skill.name, "team-skill-library")
  assert.equal(skill.type, "skill-md")
  assert.equal(skill.url, `${origin}${TEAM_SKILL_LIBRARY_SKILL_PATH}`)
  assert.equal(skill.digest, digest)
  assert.match(skill.digest, /^sha256:[a-f0-9]{64}$/)
})

test("the index description is the skill's own frontmatter description", async () => {
  const published = await readRepoFile(`../public${TEAM_SKILL_LIBRARY_SKILL_PATH}`)
  const frontmatter = published.match(/^---\n([\s\S]*?)\n---/)
  assert.ok(frontmatter, "the published skill lost its frontmatter")

  const described = frontmatter[1].match(/^description:\s([\s\S]*?)\n(?=[a-zA-Z_]+:)/m)
  assert.ok(described, "the published skill lost its description")

  assert.equal(described[1].replace(/\s+/g, " ").trim(), TEAM_SKILL_LIBRARY_DESCRIPTION)
})

test("the server card describes the same server as server.json", async () => {
  const manifest = JSON.parse(await readRepoFile("../server.json"))

  assert.equal(mcpServerInfo.name, manifest.name)
  assert.equal(mcpServerInfo.title, manifest.title)
  assert.equal(mcpServerInfo.version, manifest.version)
  assert.equal(mcpServerInfo.description, manifest.description)
  assert.equal(mcpServerInfo.websiteUrl, manifest.websiteUrl)
  assert.deepEqual({ ...mcpServerInfo.repository }, manifest.repository)
})

test("the server card lists exactly the tools the MCP route registers", async () => {
  const route = await readRepoFile("../app/api/[transport]/route.ts")
  const registered = [...route.matchAll(/server\.registerTool\("([a-z_]+)"/g)].map(
    (match) => match[1],
  )

  assert.ok(registered.length > 0, "no registered tools found in the MCP route")
  assert.deepEqual(
    mcpToolSummaries.map((tool) => tool.name),
    registered,
    "the server card and the MCP route disagree about the tool list",
  )
})

test("the server card marks a tool as write-scoped when the route checks for it", async () => {
  const route = await readRepoFile("../app/api/[transport]/route.ts")

  for (const tool of mcpToolSummaries) {
    const start = route.indexOf(`server.registerTool("${tool.name}"`)
    const next = route.indexOf("server.registerTool(", start + 1)
    const body = route.slice(start, next === -1 ? undefined : next)
    const guardsWrites = body.includes('tokenHasScope(jwt, "skills:write")')

    assert.equal(
      tool.requiredScopes.includes("skills:write"),
      guardsWrites,
      `${tool.name}: the card and the route disagree about skills:write`,
    )
    assert.ok(tool.requiredScopes.includes("skills:read"), `${tool.name} must need skills:read`)
  }
})

test("robots.txt declares all three content signals under the user agent block", () => {
  const robots = buildRobotsTxt()

  assert.deepEqual(Object.keys(contentSignals), ["ai-train", "search", "ai-input"])

  const directive = "Content-Signal: ai-train=no, search=yes, ai-input=yes"
  assert.ok(robots.includes(directive), "the Content-Signal directive is missing or reshaped")

  const lines = robots.split("\n")
  const userAgent = lines.indexOf("User-agent: *")
  assert.ok(userAgent >= 0, "robots.txt lost its user agent block")
  assert.equal(
    lines[userAgent + 1],
    directive,
    "the signal has to sit inside the user agent block it applies to",
  )
})

test("robots.txt keeps the crawl rules it had before the signals were added", () => {
  const robots = buildRobotsTxt()

  assert.ok(robots.includes("Allow: /"))
  for (const path of disallowedPaths) {
    assert.ok(robots.includes(`Disallow: ${path}`), `lost the disallow for ${path}`)
  }
  assert.ok(robots.includes(`Sitemap: ${siteConfig.url}/sitemap.xml`))
  assert.ok(robots.includes(`Host: ${new URL(siteConfig.url).host}`))
  assert.ok(robots.endsWith("\n"))
})

test("auth.md opens with an h1 naming itself and covers the whole flow", async () => {
  const authMd = await readRepoFile("../public/auth.md")

  assert.match(authMd, /^# auth\.md\n/)

  for (const heading of ["Discover", "Register", "Claim", "Exchange", "Use", "Handle revoke"]) {
    assert.ok(
      new RegExp(`^## \\d\\. ${heading}$`, "m").test(authMd),
      `auth.md is missing the "${heading}" step`,
    )
  }

  for (const scope of oauthScopes) {
    assert.ok(authMd.includes(`\`${scope}\``), `auth.md does not explain the ${scope} scope`)
  }

  assert.ok(authMd.includes(`${siteConfig.url}/api/mcp`), "auth.md must name the resource")
  assert.ok(
    authMd.includes(`${siteConfig.url}/.well-known/oauth-protected-resource`),
    "auth.md must point at the protected resource metadata",
  )
})

test("the OpenAPI description covers the endpoints the API catalog advertises", async () => {
  const { buildOpenApiDocument } = await import("../lib/openapi.ts")
  const spec = buildOpenApiDocument()

  assert.equal(spec.openapi, "3.1.0")

  for (const path of [
    "/api/mcp",
    "/api/health",
    "/.well-known/mcp/server-card.json",
    "/.well-known/oauth-protected-resource",
    "/.well-known/agent-skills/index.json",
    "/.well-known/ai-catalog.json",
    "/.well-known/api-catalog",
  ]) {
    assert.ok(spec.paths[path], `the OpenAPI description is missing ${path}`)
  }

  const scopes = Object.keys(spec.components.securitySchemes.oauth2.flows.authorizationCode.scopes)
  assert.deepEqual(scopes, [...oauthScopes])
})

test("the OpenAPI description names the deployment serving it, never production", async () => {
  const { buildOpenApiDocument } = await import("../lib/openapi.ts")
  const spec = buildOpenApiDocument()

  // A preview links this document from its own catalog. A hard coded
  // production origin here would point every operation, and the OAuth URLs,
  // at production and its database rather than the preview's Neon branch.
  assert.deepEqual(spec.servers, [{ url: origin }])

  const flow = spec.components.securitySchemes.oauth2.flows.authorizationCode
  for (const url of [flow.authorizationUrl, flow.tokenUrl, flow.refreshUrl]) {
    assert.equal(new URL(url).origin, origin)
  }

  assert.equal(new URL(spec.externalDocs.url).origin, origin)
  assert.equal(new URL(spec.info.contact.url).origin, origin)
  assert.ok(spec.paths["/api/mcp"].post.description.includes(`${origin}/api/mcp`))

  // Nothing anywhere in the document may hard code the production host unless
  // this deployment is production.
  if (origin !== siteConfig.url) {
    assert.doesNotMatch(JSON.stringify(spec), new RegExp(siteConfig.url.replace(/[.]/g, "\\.")))
  }
})

const { buildArdCatalog } = await import("../lib/ard-catalog.ts")
const { API_CATALOG_MEDIA_TYPE, buildApiCatalog } = await import("../lib/api-catalog.ts")
const { estimateMarkdownTokens } = await import("../lib/markdown/tokens.ts")
const { mcpEndpointFor, webMcpPages } = await import("../lib/web-mcp-tools.ts")
const { markdownTwinPaths } = await import("../lib/markdown/twins.ts")

test("every ARD entry carries an identifier, a type, and one location", () => {
  const catalog = buildArdCatalog()
  const host = new URL(origin).hostname

  assert.equal(catalog.specVersion, "1.0")
  // did:web encodes a non-default port as %3A, so an origin carrying one stays
  // resolvable; a bare colon would read as a DID method separator.
  const originUrl = new URL(origin)
  const didWebHost = originUrl.port ? `${host}%3A${originUrl.port}` : host
  assert.equal(catalog.host.identifier, `did:web:${didWebHost}`)
  assert.doesNotMatch(
    catalog.host.identifier.slice("did:web:".length),
    /:/,
    "a raw colon in a did:web host splits the identifier",
  )
  assert.ok(catalog.host.displayName.length > 0)
  assert.ok(catalog.entries.length > 0)

  const seen = new Set()
  for (const entry of catalog.entries) {
    assert.match(
      entry.identifier,
      new RegExp(`^urn:air:${host.replace(/\./g, "\\.")}:[a-z]+:[a-z0-9-]+$`),
      `bad ARD identifier: ${entry.identifier}`,
    )
    assert.equal(seen.has(entry.identifier), false, `duplicate identifier: ${entry.identifier}`)
    seen.add(entry.identifier)

    assert.ok(entry.displayName?.length > 0, `${entry.identifier} has no displayName`)
    assert.match(entry.type, /^[a-z]+\/[a-z0-9.+-]+$/, `${entry.identifier} has no media type`)

    // Spec section 3.4: exactly one of url or data.
    assert.equal(
      Number("url" in entry) + Number("data" in entry),
      1,
      `${entry.identifier} must carry exactly one of url and data`,
    )
    // Only a url entry has an origin to check; constructing a URL from a
    // data-only entry would throw before the assertion could report anything.
    if ("url" in entry) {
      assert.equal(new URL(entry.url).origin, origin, `${entry.identifier} points off-origin`)
    }

    const queries = entry.representativeQueries
    assert.ok(
      queries.length >= 2 && queries.length <= 5,
      `${entry.identifier} needs 2-5 representative queries, has ${queries.length}`,
    )
    assert.equal(new Set(queries).size, queries.length, `${entry.identifier} repeats a query`)
  }
})

test("the API catalog is a linkset anchored on the MCP endpoint", () => {
  assert.match(API_CATALOG_MEDIA_TYPE, /^application\/linkset\+json; profile="[^"]+"$/)

  const { linkset } = buildApiCatalog()
  assert.equal(linkset.length, 1)

  const [entry] = linkset
  assert.equal(entry.anchor, `${origin}/api/mcp`)

  for (const relation of ["service-desc", "service-doc", "status"]) {
    assert.ok(entry[relation]?.length > 0, `the catalog has no ${relation} link`)
    for (const link of entry[relation]) {
      assert.equal(new URL(link.href).origin, origin, `${relation} points off-origin`)
      assert.ok(link.type?.length > 0, `${relation} link has no media type`)
    }
  }

  assert.equal(
    entry["service-desc"][0].href,
    `${origin}/openapi.json`,
    "service-desc has to lead with the OpenAPI description",
  )
  assert.equal(entry.status[0].href, `${origin}/api/health`)
})

test("the token estimate scales with the document and is never zero for text", () => {
  assert.equal(estimateMarkdownTokens(""), 0)

  const short = estimateMarkdownTokens("# Title\n\nOne short paragraph.\n")
  const long = estimateMarkdownTokens("# Title\n\nOne short paragraph.\n".repeat(50))

  assert.ok(short > 0)
  assert.ok(long > short * 40, "the estimate should track document length")
  assert.equal(Number.isInteger(short), true)
})

test("WebMCP can reach every page that has a Markdown twin", () => {
  assert.deepEqual(
    webMcpPages.map((page) => page.path),
    [...markdownTwinPaths],
  )

  // The endpoint an in-page agent is handed has to be the deployment it is
  // reading, not production: a preview must not send an agent, or whatever it
  // writes, to the production database.
  assert.equal(mcpEndpointFor(origin), `${origin}/api/mcp`)
  assert.equal(
    mcpEndpointFor("https://preview.example"),
    "https://preview.example/api/mcp",
  )
  assert.equal(mcpEndpointFor("https://preview.example/"), "https://preview.example/api/mcp")

  for (const page of webMcpPages) {
    assert.ok(page.markdownPath.startsWith("/"), `${page.path} has a non-relative twin path`)
    assert.ok(page.markdownPath.endsWith(".md"), `${page.path} has a twin that is not Markdown`)
    assert.ok(page.title.length > 0)
    assert.ok(page.description.length > 0)
  }

  // The home page is the one whose twin path is not its own path plus `.md`.
  assert.equal(webMcpPages.find((page) => page.path === "/")?.markdownPath, "/index.md")
})

const { withAgentAuthMetadata } = await import("../lib/agent-auth-metadata.ts")

test("the agent_auth wrapper merges into the metadata without reshaping it", async () => {
  const upstream = {
    issuer: `${origin}/api/auth`,
    registration_endpoint: `${origin}/api/auth/oauth2/register`,
    token_endpoint: `${origin}/api/auth/oauth2/token`,
    grant_types_supported: ["authorization_code", "refresh_token"],
  }
  const merged = await withAgentAuthMetadata(Response.json(upstream))
  const body = await merged.json()

  assert.equal(merged.status, 200)
  assert.equal(merged.headers.get("content-type"), "application/json")
  assert.equal(merged.headers.get("access-control-allow-origin"), "*")

  for (const [key, value] of Object.entries(upstream)) {
    assert.deepEqual(body[key], value, `the wrapper altered ${key}`)
  }
  assert.equal(body.agent_auth.register_uri, upstream.registration_endpoint)
})

test("the agent_auth wrapper leaves an error from the auth server alone", async () => {
  const failure = Response.json({ error: "server_error" }, { status: 500 })
  assert.equal(await withAgentAuthMetadata(failure), failure)

  const notJson = new Response("nope", { headers: { "Content-Type": "text/plain" } })
  assert.equal(await withAgentAuthMetadata(notJson), notJson)
})

test("markdown requests resolve from the URL when the rewrite query is dropped", async () => {
  const { contentPathForMarkdownRequest } = await import("../lib/markdown/twins.ts")

  assert.equal(contentPathForMarkdownRequest("/codex-skills.md"), "/codex-skills")
  assert.equal(contentPathForMarkdownRequest("/codex-skills"), "/codex-skills")
  assert.equal(contentPathForMarkdownRequest("/guides/x.md"), "/guides/x")
  // The home twin is the one URL that is not its page path plus `.md`.
  assert.equal(contentPathForMarkdownRequest("/index.md"), "/")
  assert.equal(contentPathForMarkdownRequest("/"), "/")
  // A direct call to the route with nothing to resolve stays unresolvable.
  assert.equal(contentPathForMarkdownRequest("/api/markdown"), "/api/markdown")
})

const { sameOriginDestination } = await import("../lib/web-mcp-tools.ts")

test("the WebMCP navigate guard rejects anything that resolves off-origin", () => {
  const site = "https://www.skillsboard.sh"

  assert.equal(sameOriginDestination("/library", site), `${site}/library`)
  assert.equal(sameOriginDestination("/guides/x?a=1#b", site), `${site}/guides/x?a=1#b`)

  for (const hostile of [
    // The URL parser reads a backslash as a slash for http(s), so each of
    // these resolves to another host despite starting with a single slash.
    String.raw`/\attacker.example/x`,
    String.raw`/\/attacker.example/x`,
    String.raw`/\\attacker.example/x`,
    // Protocol-relative, and absolute URLs off this origin.
    "//attacker.example/x",
    "https://attacker.example/x",
    "http://www.skillsboard.sh/x",
    "javascript:alert(1)",
    // Not a path at all.
    "library",
    "",
  ]) {
    assert.equal(
      sameOriginDestination(hostile, site),
      undefined,
      `navigate accepted an off-origin destination: ${JSON.stringify(hostile)}`,
    )
  }
})
