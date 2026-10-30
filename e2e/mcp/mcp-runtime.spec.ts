import { createHash, randomBytes } from "node:crypto"

import {
  expect,
  test,
  type APIRequestContext,
  type APIResponse,
  type BrowserContext,
  type Page,
} from "@playwright/test"
import { Pool } from "pg"

/**
 * MCP runtime suite: what an MCP client actually meets at `/api/mcp`.
 *
 * Unit tests cover the helpers; this drives the real stack (Next route,
 * Better Auth OAuth provider, mcp-handler 2, Postgres) end to end: the 401
 * challenge, dynamic client registration for a native loopback client, the
 * browser consent screen, a PKCE code exchange, then JSON-RPC over the issued
 * bearer token. It also pins the path guard in `app/api/[transport]/route.ts`:
 * mcp-handler 2 serves any path it is mounted on, so every other
 * `/api/<segment>` must refuse to act as MCP.
 *
 * Must run against a server started with VERCEL_ENV=development (any 6-digit
 * OTP verifies, no email is sent) and a throwaway database. Rows it creates are
 * keyed to one run id and deleted in `afterAll`.
 */

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3100"
const MCP_URL = new URL("/api/mcp", BASE_URL).toString()
const VIDEO_DIR = process.env.MCP_E2E_VIDEO_DIR
// Slows the run down only when recording, so each step stays on screen.
const STEP_PAUSE_MS = VIDEO_DIR ? 1_400 : 0

const RUN_ID = `${Date.now().toString(36)}${randomBytes(3).toString("hex")}`
const TEST_EMAIL = `mcp-runtime-${RUN_ID}@example.com`
const ORG_SLUG = `mcp-runtime-${RUN_ID}`
const SEEDED_SKILL_NAME = `mcp-runtime-skill-${RUN_ID}`
const COLLECTION_TITLE = `MCP runtime ${RUN_ID}`
// A native client's loopback redirect (RFC 8252 §7.3). Nothing listens here:
// the browser navigation to it is intercepted to read the code, as a CLI
// client's local listener would.
const REDIRECT_URI = "http://127.0.0.1:8976/callback"
const SCOPES = "openid profile email offline_access skills:read skills:write"
const PROTOCOL_VERSION = "2025-06-18"

const EXPECTED_TOOLS = [
  "add_skill",
  "add_skill_to_collection",
  "create_collection",
  "discover_repository_skills",
  "discover_skills",
  "get_collection_install_command",
  "get_collection_skills",
  "get_skill_command",
  "list_collections",
  "list_skills",
  "remove_skill_from_collection",
  "search_collections",
  "search_skills",
]

const INITIALIZE = {
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "skills-board-mcp-runtime-test", version: "1.0.0" },
  },
}

const MCP_HEADERS = {
  "content-type": "application/json",
  accept: "application/json, text/event-stream",
}

test.describe.configure({ mode: "serial" })

let browserContext: BrowserContext
let page: Page
/** The MCP client: no cookies, only what the OAuth flow hands it. */
let client: APIRequestContext
let narrator: Narrator

const state: {
  resourceMetadataUrl?: string
  resource?: string
  authorizationServer?: AuthorizationServerMetadata
  clientId?: string
  codeVerifier?: string
  code?: string
  accessToken?: string
  userId?: string
  organizationId?: string
  seededSkillId?: string
  collectionId?: string
} = {}

interface AuthorizationServerMetadata {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  registration_endpoint: string
  code_challenge_methods_supported?: string[]
}

test.beforeAll(async ({ browser, playwright }) => {
  const loopback = new URL(BASE_URL).hostname
  if (!["localhost", "127.0.0.1", "[::1]"].includes(loopback)) {
    throw new Error(`The MCP runtime suite only runs against a loopback server, not ${BASE_URL}`)
  }
  browserContext = await browser.newContext({
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    ...(VIDEO_DIR ? { recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 800 } } } : {}),
  })
  page = await browserContext.newPage()
  client = await playwright.request.newContext({ baseURL: BASE_URL })
  narrator = new Narrator(page)
  await narrator.render()
})

test.afterAll(async () => {
  await client?.dispose()
  await browserContext?.close()
  await cleanUp()
})

test("unauthenticated /api/mcp answers 401 with an RFC 9728 challenge", async () => {
  const response = await client.post(MCP_URL, { headers: MCP_HEADERS, data: INITIALIZE })
  expect(response.status()).toBe(401)

  const challenge = response.headers()["www-authenticate"] ?? ""
  expect(challenge).toMatch(/^Bearer /)
  const resourceMetadata = /resource_metadata="([^"]+)"/.exec(challenge)?.[1]
  expect(resourceMetadata).toBe(new URL("/.well-known/oauth-protected-resource/api/mcp", BASE_URL).toString())
  expect(challenge).toContain('scope="skills:read"')

  const metadata = await client.get(resourceMetadata!)
  expect(metadata.status()).toBe(200)
  const document = await metadata.json()
  expect(document.resource).toBe(MCP_URL)
  expect(document.authorization_servers).toEqual([new URL("/api/auth", BASE_URL).toString()])

  state.resourceMetadataUrl = resourceMetadata
  state.resource = document.resource
  await narrator.step("401 challenge on /api/mcp", [
    `POST /api/mcp initialize (no token) → ${response.status()}`,
    `WWW-Authenticate: ${challenge}`,
    `GET ${new URL(resourceMetadata!).pathname} → resource ${document.resource}`,
  ])
})

test("/api/sse returns 404 and never acts as MCP", async () => {
  const get = await client.get("/api/sse", { headers: { accept: "text/event-stream" } })
  const post = await client.post("/api/sse", { headers: MCP_HEADERS, data: INITIALIZE })
  for (const response of [get, post]) {
    await expectNotMcp(response)
  }
  await narrator.step("/api/sse is gone", [
    `GET /api/sse → ${get.status()}`,
    `POST /api/sse initialize → ${post.status()}, no challenge, no JSON-RPC`,
  ])
})

test("a non-MCP /api/<segment> does not answer an MCP initialize", async () => {
  const unknown = await client.post("/api/not-mcp", { headers: MCP_HEADERS, data: INITIALIZE })
  // `/api/message` was the 1.x SSE message endpoint; `/api/stream` is just a
  // plausible guess an agent might try.
  const legacy = await client.post("/api/message", { headers: MCP_HEADERS, data: INITIALIZE })
  const guess = await client.post("/api/stream", { headers: MCP_HEADERS, data: INITIALIZE })
  for (const response of [unknown, legacy, guess]) {
    await expectNotMcp(response)
  }
  await narrator.step("Other /api/<segment> paths are not MCP", [
    `POST /api/not-mcp initialize → ${unknown.status()}`,
    `POST /api/message initialize → ${legacy.status()}`,
    `POST /api/stream initialize → ${guess.status()}`,
  ])
})

test("OAuth: dynamic client registration for a native loopback client", async () => {
  const metadataResponse = await client.get("/.well-known/oauth-authorization-server/api/auth")
  expect(metadataResponse.status()).toBe(200)
  const metadata = (await metadataResponse.json()) as AuthorizationServerMetadata
  expect(metadata.issuer).toBe(new URL("/api/auth", BASE_URL).toString())
  expect(metadata.code_challenge_methods_supported).toContain("S256")
  state.authorizationServer = metadata

  const registration = await client.post(metadata.registration_endpoint, {
    data: {
      client_name: "MCP runtime test",
      application_type: "native",
      redirect_uris: [REDIRECT_URI],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: SCOPES,
    },
  })
  expect(registration.status(), await registration.text()).toBeLessThan(300)
  const registered = await registration.json()
  expect(typeof registered.client_id).toBe("string")
  expect(registered.client_secret).toBeUndefined()
  expect(registered.redirect_uris).toEqual([REDIRECT_URI])
  state.clientId = registered.client_id

  await narrator.step("Dynamic client registration", [
    `GET /.well-known/oauth-authorization-server/api/auth → issuer ${metadata.issuer}`,
    `POST ${new URL(metadata.registration_endpoint).pathname} (native, ${REDIRECT_URI}) → ${registration.status()}`,
    `client_id ${registered.client_id} · public client, no secret`,
  ])
})

test("OAuth: sign in, authorize and consent in the browser", async () => {
  const metadata = state.authorizationServer!
  await signInTestUser()

  state.codeVerifier = randomBytes(32).toString("base64url")
  const codeChallenge = createHash("sha256").update(state.codeVerifier).digest("base64url")
  const oauthState = randomBytes(16).toString("base64url")
  const authorize = new URL(metadata.authorization_endpoint)
  authorize.search = new URLSearchParams({
    response_type: "code",
    client_id: state.clientId!,
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state: oauthState,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    resource: state.resource!,
  }).toString()

  // Stand in for the client's loopback listener.
  let callback: URL | undefined
  await browserContext.route(
    (url) => url.href.startsWith(REDIRECT_URI),
    async (route) => {
      callback = new URL(route.request().url())
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: callbackPage(callback.searchParams.has("code")),
      })
    },
  )

  await page.goto(authorize.toString())
  await expect(page).toHaveURL(/\/consent\?/)
  await expect(page.getByText("MCP runtime test")).toBeVisible()
  await expect(page.getByText(TEST_EMAIL)).toBeVisible()
  await expect(page.getByText("skills:write", { exact: true })).toBeVisible()
  await page.waitForTimeout(STEP_PAUSE_MS)
  await page.getByRole("button", { name: "Allow access" }).click()

  await expect.poll(() => callback?.href, { timeout: 15_000 }).toBeTruthy()
  expect(callback!.searchParams.get("state")).toBe(oauthState)
  expect(callback!.searchParams.get("error")).toBeNull()
  state.code = callback!.searchParams.get("code") ?? undefined
  expect(state.code).toBeTruthy()
  // The callback is read off the intercepted request; let the browser finish
  // rendering it before the narrator replaces the page, or the navigation
  // still in flight destroys the context `setContent` runs in.
  await page.waitForURL((url) => url.href.startsWith(REDIRECT_URI))
  await page.waitForLoadState("load")
  await page.waitForTimeout(STEP_PAUSE_MS)

  await narrator.step("Authorize + consent", [
    `GET ${authorize.pathname} (S256 PKCE, resource ${state.resource}) → /consent`,
    `Signed in as ${TEST_EMAIL} · clicked “Allow access”`,
    `Redirect to ${REDIRECT_URI} with code, state matches`,
  ])
})

test("OAuth: PKCE code exchange issues an audience-bound bearer token", async () => {
  const metadata = state.authorizationServer!
  const exchange = await client.post(metadata.token_endpoint, {
    form: {
      grant_type: "authorization_code",
      code: state.code!,
      redirect_uri: REDIRECT_URI,
      client_id: state.clientId!,
      code_verifier: state.codeVerifier!,
      resource: state.resource!,
    },
  })
  expect(exchange.status(), await exchange.text()).toBe(200)
  const token = await exchange.json()
  expect(token.token_type).toMatch(/^bearer$/i)
  expect(typeof token.access_token).toBe("string")
  const scopes = String(token.scope).split(" ")
  expect(scopes).toEqual(expect.arrayContaining(["skills:read", "skills:write"]))

  const claims = decodeJwtPayload(token.access_token)
  const audience = [claims.aud].flat()
  expect(audience).toContain(state.resource)
  expect(claims.sub).toBe(state.userId)
  state.accessToken = token.access_token

  // The code is single-use: replaying it must fail.
  const replay = await client.post(metadata.token_endpoint, {
    form: {
      grant_type: "authorization_code",
      code: state.code!,
      redirect_uri: REDIRECT_URI,
      client_id: state.clientId!,
      code_verifier: state.codeVerifier!,
      resource: state.resource!,
    },
  })
  expect(replay.status()).toBeGreaterThanOrEqual(400)

  await narrator.step("PKCE token exchange", [
    `POST ${new URL(metadata.token_endpoint).pathname} (code + code_verifier) → ${exchange.status()}`,
    `token_type ${token.token_type} · scope ${token.scope}`,
    `aud ${audience.join(", ")} · access token ${redact(token.access_token)}`,
    `Replaying the same code → ${replay.status()}`,
  ])
})

test("MCP: initialize and tools/list over the bearer token", async () => {
  const initialize = await mcp(INITIALIZE)
  expect(initialize.status).toBe(200)
  expect(initialize.body.error).toBeUndefined()
  const result = initialize.body.result
  expect(result.serverInfo).toMatchObject({ name: "skills-board", version: "1.0.0" })
  expect(result.capabilities.tools).toBeDefined()
  expect(typeof result.protocolVersion).toBe("string")

  const initialized = await client.post(MCP_URL, {
    headers: authorizedHeaders(),
    data: { jsonrpc: "2.0", method: "notifications/initialized" },
  })
  expect(initialized.status()).toBeLessThan(300)

  const list = await mcp({ jsonrpc: "2.0", id: 2, method: "tools/list" })
  expect(list.status).toBe(200)
  const tools = list.body.result.tools as Array<{ name: string; annotations?: Record<string, boolean> }>
  expect(tools.map((tool) => tool.name).sort()).toEqual(EXPECTED_TOOLS)
  expect(tools.find((tool) => tool.name === "list_skills")?.annotations?.readOnlyHint).toBe(true)
  expect(tools.find((tool) => tool.name === "create_collection")?.annotations?.readOnlyHint).toBe(false)

  await narrator.step("initialize + tools/list", [
    `initialize → ${result.serverInfo.name} ${result.serverInfo.version}, protocol ${result.protocolVersion}`,
    `tools/list → ${tools.length} tools`,
    tools.map((tool) => tool.name).sort().join(", "),
  ])
})

test("MCP: read tool call (list_skills)", async () => {
  const call = await mcp({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "list_skills", arguments: {} },
  })
  expect(call.status).toBe(200)
  const result = call.body.result
  expect(result.isError).toBeFalsy()
  const skills = JSON.parse(result.content[0].text) as Array<{ id: string; skillName: string }>
  expect(skills).toEqual([expect.objectContaining({ id: state.seededSkillId, skillName: SEEDED_SKILL_NAME })])

  await narrator.step("Read tool: list_skills", [
    `tools/call list_skills → ${skills.length} skill`,
    `${skills[0].skillName} (${skills[0].id})`,
  ])
})

test("MCP: write tool call (create_collection)", async () => {
  const call = await mcp({
    jsonrpc: "2.0",
    id: 4,
    method: "tools/call",
    params: {
      name: "create_collection",
      arguments: { title: COLLECTION_TITLE, description: "Created by the MCP runtime suite", tags: ["e2e"] },
    },
  })
  expect(call.status).toBe(200)
  const result = call.body.result
  expect(result.isError, result.content?.[0]?.text).toBeFalsy()
  const created = JSON.parse(result.content[0].text)
  expect(created).toMatchObject({
    created: true,
    collection: { title: COLLECTION_TITLE, organizationId: state.organizationId, tags: ["e2e"] },
  })
  state.collectionId = created.collection.id

  const listed = await mcp({
    jsonrpc: "2.0",
    id: 5,
    method: "tools/call",
    params: { name: "list_collections", arguments: {} },
  })
  const collections = JSON.parse(listed.body.result.content[0].text) as Array<{ id: string; title: string }>
  expect(collections).toEqual([expect.objectContaining({ id: state.collectionId, title: COLLECTION_TITLE })])

  await narrator.step("Write tool: create_collection", [
    `tools/call create_collection "${COLLECTION_TITLE}" → created ${state.collectionId}`,
    `tools/call list_collections → ${collections.map((item) => item.title).join(", ")}`,
  ])
})

test("a valid MCP token still gets 404 outside /api/mcp", async () => {
  const sse = await client.post("/api/sse", { headers: authorizedHeaders(), data: INITIALIZE })
  const other = await client.post("/api/not-mcp", { headers: authorizedHeaders(), data: INITIALIZE })
  for (const response of [sse, other]) {
    await expectNotMcp(response)
  }
  await narrator.step("Path guard holds with a valid token", [
    `POST /api/sse initialize (Bearer) → ${sse.status()}`,
    `POST /api/not-mcp initialize (Bearer) → ${other.status()}`,
  ], { final: true })
})

async function expectNotMcp(response: APIResponse) {
  expect(response.status(), `${response.url()} must not be served by the MCP handler`).toBe(404)
  expect(response.headers()["www-authenticate"]).toBeUndefined()
  expect(response.headers()["content-type"] ?? "").not.toContain("text/event-stream")
  const body = await response.text()
  expect(body).not.toContain('"jsonrpc"')
  expect(body).not.toContain("serverInfo")
}

function authorizedHeaders() {
  return {
    ...MCP_HEADERS,
    authorization: `Bearer ${state.accessToken}`,
    "mcp-protocol-version": PROTOCOL_VERSION,
  }
}

async function mcp(message: Record<string, unknown>) {
  const response = await client.post(MCP_URL, { headers: authorizedHeaders(), data: message })
  return { status: response.status(), body: await readJsonRpc(response) }
}

/** A Streamable HTTP answer is either a JSON body or an SSE stream of them. */
async function readJsonRpc(response: APIResponse) {
  const text = await response.text()
  if (!(response.headers()["content-type"] ?? "").includes("text/event-stream")) return JSON.parse(text)
  const messages = text
    .split(/\r?\n\r?\n/)
    .map((event) =>
      event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n"),
    )
    .filter(Boolean)
  if (!messages.length) throw new Error(`Empty SSE answer from ${response.url()}`)
  return JSON.parse(messages.at(-1)!)
}

/**
 * Signs the run's user in through the Better Auth HTTP API on the browser
 * context (so the consent page sees the session), creates its team, and seeds
 * one skill so the read tool has something to return.
 */
async function signInTestUser() {
  const request = browserContext.request
  const headers = { origin: BASE_URL }
  const sent = await request.post("/api/auth/email-otp/send-verification-otp", {
    headers,
    data: { email: TEST_EMAIL, type: "sign-in" },
  })
  expect(sent.status(), await sent.text()).toBe(200)
  const verified = await request.post("/api/auth/sign-in/email-otp", {
    headers,
    data: { email: TEST_EMAIL, otp: "123456", name: "MCP Runtime Test", skillsboardProductCommunicationsChoice: false },
  })
  expect(verified.status(), "the server must run with VERCEL_ENV=development (dev OTP bypass)").toBe(200)
  const session = await (await request.get("/api/auth/get-session")).json()
  state.userId = session?.user?.id
  expect(state.userId).toBeTruthy()

  const organization = await request.post("/api/auth/organization/create", {
    headers,
    data: { name: `MCP Runtime ${RUN_ID}`, slug: ORG_SLUG },
  })
  expect(organization.status(), await organization.text()).toBe(200)
  state.organizationId = (await organization.json()).id
  expect(state.organizationId).toBeTruthy()

  await withDatabase(async (pool) => {
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO "skill" ("organizationId", "createdBy", "githubUrl", "skillName", "title", "description", "repoOwner", "repoName", "tags")
       VALUES ($1, $2, 'https://github.com/vercel/next.js', $3, 'MCP runtime fixture', 'Seeded by the MCP runtime suite.', 'vercel', 'next.js', ARRAY['e2e'])
       RETURNING "id"`,
      [state.organizationId, state.userId, SEEDED_SKILL_NAME],
    )
    state.seededSkillId = inserted.rows[0]?.id
  })
  expect(state.seededSkillId).toBeTruthy()
}

/** Deletes every row this run created, keyed by the run's email, slug and client id. */
async function cleanUp() {
  if (!process.env.DATABASE_URL) return
  await withDatabase(async (pool) => {
    const users = await pool.query<{ id: string }>(`SELECT "id" FROM "user" WHERE "email" = $1`, [TEST_EMAIL])
    const organizations = await pool.query<{ id: string }>(
      `SELECT "id" FROM "organization" WHERE "slug" = $1`,
      [ORG_SLUG],
    )
    const userIds = users.rows.map((row) => row.id)
    const organizationIds = organizations.rows.map((row) => row.id)
    // collectionSkill, releases and distributions cascade from collection.
    await pool.query(`DELETE FROM "collection" WHERE "organizationId" = ANY($1)`, [organizationIds])
    await pool.query(`DELETE FROM "skill" WHERE "organizationId" = ANY($1)`, [organizationIds])
    await pool.query(`DELETE FROM "invitation" WHERE "organizationId" = ANY($1)`, [organizationIds])
    await pool.query(`DELETE FROM "member" WHERE "organizationId" = ANY($1)`, [organizationIds])
    await pool.query(`DELETE FROM "organization" WHERE "id" = ANY($1)`, [organizationIds])
    // Tokens, consents and resource links cascade from the client.
    if (state.clientId) {
      await pool.query(`DELETE FROM "oauthClient" WHERE "clientId" = $1`, [state.clientId])
      // An authorization code the run never exchanged is a verification row
      // that names the client, not the user.
      await pool.query(`DELETE FROM "verification" WHERE "value" LIKE $1`, [`%${state.clientId}%`])
    }
    // Sessions, accounts and email preferences cascade from the user.
    await pool.query(`DELETE FROM "user" WHERE "id" = ANY($1)`, [userIds])
    await pool.query(`DELETE FROM "verification" WHERE "identifier" LIKE $1`, [`%${TEST_EMAIL}%`])
  })
}

async function withDatabase(work: (pool: Pool) => Promise<void>) {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error("DATABASE_URL must point at the same throwaway database the server uses")
  const pool = new Pool({ connectionString })
  try {
    await work(pool)
  } finally {
    await pool.end()
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split(".")
  if (!payload) throw new Error("Expected a JWT access token")
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
}

function redact(token: string) {
  return `${token.slice(0, 10)}… (${token.length} chars, redacted)`
}

function callbackPage(hasCode: boolean) {
  return `<!doctype html><meta charset="utf-8"><body style="font:16px system-ui;padding:48px;background:#0b0b0c;color:#f4f4f5">
<h1 style="font-size:22px">MCP client loopback callback</h1>
<p>${hasCode ? "Authorization code received. The client now exchanges it with its PKCE verifier." : "No code in the callback."}</p></body>`
}

/**
 * Renders the run as a readable transcript in the browser page, so a recorded
 * video shows each request and its answer. Costs nothing when not recording.
 */
class Narrator {
  private readonly steps: Array<{ title: string; lines: string[] }> = []

  constructor(private readonly page: Page) {}

  async step(title: string, lines: string[], options: { final?: boolean } = {}) {
    this.steps.push({ title, lines })
    await this.render(options.final)
  }

  async render(final = false) {
    const escape = (value: string) =>
      value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const items = this.steps
      .map(
        (step, index) => `<section><h2><span>PASS</span>${index + 1}. ${escape(step.title)}</h2>${step.lines
          .map((line) => `<code>${escape(line)}</code>`)
          .join("")}</section>`,
      )
      .join("")
    await this.page.setContent(`<!doctype html><meta charset="utf-8"><style>
      body{font:14px/1.45 ui-sans-serif,system-ui;background:#0b0b0c;color:#e4e4e7;margin:0;padding:28px 36px}
      h1{font-size:20px;margin:0 0 4px}p{margin:0 0 18px;color:#a1a1aa}
      section{border:1px solid #27272a;border-radius:10px;padding:10px 14px;margin:0 0 10px;background:#111113}
      h2{font-size:14px;margin:0 0 6px;display:flex;gap:10px;align-items:center}
      h2 span{font:600 11px ui-monospace,monospace;background:#14532d;color:#86efac;padding:2px 6px;border-radius:5px}
      code{display:block;font:12px/1.5 ui-monospace,monospace;color:#a1a1aa;white-space:pre-wrap;word-break:break-all}
    </style><h1>Skills Board · MCP runtime check</h1>
    <p>${escape(BASE_URL)} · mcp-handler 2 · run ${RUN_ID}${final ? " · all steps passed" : ""}</p>${items}`)
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await this.page.waitForTimeout(STEP_PAUSE_MS)
  }
}
