import assert from "node:assert/strict"
import { test } from "node:test"
import { createLocalJWKSet, decodeProtectedHeader, jwtVerify } from "jose"

import "./helpers/register-app-aliases.mjs"
import { createMemoryStore, createProvider } from "./helpers/agent-auth-harness.mjs"

/**
 * The whole flow against a live Better Auth instance.
 *
 * Everything below runs the real plugin: the real `extendOAuthProvider` grant
 * registration, the real `/agent/identity` endpoint, Better Auth's real JWKS and
 * `signJWT`, and the real `issueTokens`. Only two things are substituted — the
 * database (Better Auth's own in-memory adapter instead of Postgres) and the
 * auth.md state store — so this covers the seams the protocol unit tests stub.
 */

const { betterAuth } = await import("better-auth")
const { memoryAdapter } = await import("better-auth/adapters/memory")
const { jwt } = await import("better-auth/plugins")
const { mcp } = await import("@better-auth/mcp")

const { agentAuth } = await import("../lib/agent-auth/plugin.ts")
const { setProviderJwksForTesting, resetTrustedProviderCache } = await import(
  "../lib/agent-auth/trust.ts"
)
const { completeClaim } = await import("../lib/agent-auth/registration.ts")
const { loadClaimView } = await import("../lib/agent-auth/claim-view.ts")
const { getAgentAudience, getServiceIssuer } = await import("../lib/agent-auth/config.ts")

const AUDIENCE = getAgentAudience()
const ISSUER = getServiceIssuer()
const ORIGIN = "http://localhost:3000"

async function boot({ seedUser = true } = {}) {
  const provider = await createProvider({ audience: AUDIENCE })
  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = JSON.stringify([provider.trustEntry])
  resetTrustedProviderCache()
  setProviderJwksForTesting(provider, createLocalJWKSet({ keys: [provider.publicJwk] }))

  const store = createMemoryStore()
  // The memory adapter needs every model it may touch to exist up front.
  const db = {
    session: [],
    account: [],
    verification: [],
    jwks: [],
    oauthClient: [],
    oauthAccessToken: [],
    oauthRefreshToken: [],
    oauthConsent: [],
    oauthResource: [],
    oauthClientResource: [],
    oauthClientAssertion: [],
    user: seedUser
      ? [
          {
            id: "user_known",
            name: "Known User",
            email: "known@example.com",
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
      : [],
  }

  const auth = betterAuth({
    database: memoryAdapter(db),
    secret: "test-secret-not-a-real-one-0123456789",
    baseURL: ORIGIN,
    plugins: [
      jwt(),
      mcp({
        loginPage: "/sign-in",
        consentPage: "/consent",
        allowDynamicClientRegistration: true,
        scopes: ["openid", "profile", "email", "offline_access", "skills:read", "skills:write"],
        resource: AUDIENCE,
        enforcePerClientResources: false,
      }),
      agentAuth({ store }),
    ],
  })

  return { auth, store, provider, db }
}

function postJson(path, body) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function postForm(path, fields) {
  return new Request(`${ORIGIN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields).toString(),
  })
}

function identityRequest(assertion, extra = {}) {
  return postJson("/api/auth/agent/identity", {
    type: "identity_assertion",
    assertion_type: "urn:ietf:params:oauth:token-type:id-jag",
    assertion,
    ...extra,
  })
}

/** Verifies an issued token exactly as `/api/mcp` does: JWKS, issuer, audience. */
async function verifyAccessToken(auth, token) {
  const jwksResponse = await auth.handler(new Request(`${ORIGIN}/api/auth/jwks`))
  const keySet = createLocalJWKSet(await jwksResponse.json())
  return jwtVerify(token, keySet, { issuer: ISSUER, audience: AUDIENCE })
}

test("discovery advertises the grants the token endpoint actually dispatches", async () => {
  const { auth } = await boot()
  const response = await auth.handler(
    new Request(`${ORIGIN}/api/auth/.well-known/oauth-authorization-server`),
  )
  const metadata = await response.json()

  assert.ok(metadata.grant_types_supported.includes("urn:ietf:params:oauth:grant-type:jwt-bearer"))
  assert.ok(metadata.grant_types_supported.includes("urn:workos:agent-auth:grant-type:claim"))
})

test("a known delegation yields a token that resolves the same Better Auth user", async () => {
  const { auth, store, provider } = await boot()
  await store.upsertDelegation({
    userId: "user_known",
    issuer: provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: provider.displayName,
  })

  const registered = await auth.handler(identityRequest(await provider.mint()))
  assert.equal(registered.status, 200)
  assert.equal(registered.headers.get("cache-control"), "no-store")
  const registration = await registered.json()
  assert.ok(registration.identity_assertion)

  // The assertion is a real service-signed JWT with the profile's media type,
  // so an access token can never be presented in its place.
  assert.equal(decodeProtectedHeader(registration.identity_assertion).typ, "oauth-id-jag+jwt")

  const exchanged = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: registration.identity_assertion,
      resource: AUDIENCE,
    }),
  )
  assert.equal(exchanged.status, 200)
  const tokens = await exchanged.json()

  assert.equal(tokens.token_type, "Bearer")
  assert.equal(tokens.scope, "skills:read skills:write")
  // No refresh token: this profile refreshes by re-exchanging the assertion.
  assert.equal(tokens.refresh_token, undefined)

  const { payload } = await verifyAccessToken(auth, tokens.access_token)
  assert.equal(payload.sub, "user_known")
  assert.equal(payload.scope, "skills:read skills:write")
  assert.equal(payload.agent_issuer, provider.issuer)
  assert.ok(payload.agent_delegation_id)
  assert.ok(payload.agent_registration_id)

  // The same assertion refreshes, which is the documented refresh path.
  const again = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: registration.identity_assertion,
    }),
  )
  assert.equal(again.status, 200)
})

test("a first link goes 401 → confirmation → token, with no OTP the second time", async () => {
  const { auth, store, provider } = await boot()

  const stepUp = await auth.handler(identityRequest(await provider.mint()))
  assert.equal(stepUp.status, 401)
  assert.match(stepUp.headers.get("www-authenticate") ?? "", /error="interaction_required"/)
  const challenge = await stepUp.json()
  assert.equal(challenge.error, "interaction_required")
  assert.equal(challenge.identity_assertion, undefined)

  // Polling before the human confirms is refused, not answered with a token.
  const early = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:workos:agent-auth:grant-type:claim",
      claim_token: challenge.claim_token,
    }),
  )
  assert.equal((await early.json()).error, "authorization_pending")

  // The human signs in — a Better Auth session, which this test stands in for —
  // and confirms with the code the agent showed.
  const signedInUser = {
    id: "user_known",
    email: "known@example.com",
    emailVerified: true,
    name: "Known User",
  }
  const view = await loadClaimView({
    store,
    claimAttemptToken: new URL(challenge.claim.verification_uri).searchParams.get(
      "claim_attempt_token",
    ),
    signedInUser,
  })
  assert.equal(view.kind, "confirm")
  const confirmed = await completeClaim({
    store,
    registration: view.registration,
    claim: view.claim,
    userCode: challenge.claim.user_code,
    signedInUser,
    providerName: provider.displayName,
  })
  assert.equal(confirmed.ok, true)

  // The agent's next poll returns a token plus the assertion it refreshes with.
  const polled = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:workos:agent-auth:grant-type:claim",
      claim_token: challenge.claim_token,
    }),
  )
  assert.equal(polled.status, 200)
  const claimed = await polled.json()
  assert.ok(claimed.access_token)
  assert.ok(claimed.identity_assertion)

  const { payload } = await verifyAccessToken(auth, claimed.access_token)
  assert.equal(payload.sub, "user_known")

  // And a fresh ID-JAG for the same provider identity now needs no human at all.
  const silent = await auth.handler(identityRequest(await provider.mint()))
  assert.equal(silent.status, 200)
  const silentBody = await silent.json()
  assert.ok(silentBody.identity_assertion)
  assert.equal(silentBody.claim, undefined)
})

test("a read-only registration produces a read-only token", async () => {
  const { auth, store, provider } = await boot()
  await store.upsertDelegation({
    userId: "user_known",
    issuer: provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: provider.displayName,
  })

  const registered = await auth.handler(
    identityRequest(await provider.mint(), { scope: "skills:read" }),
  )
  const registration = await registered.json()

  const exchanged = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: registration.identity_assertion,
    }),
  )
  const tokens = await exchanged.json()
  assert.equal(tokens.scope, "skills:read")

  const { payload } = await verifyAccessToken(auth, tokens.access_token)
  assert.equal(payload.scope, "skills:read")

  // Widening at the token endpoint is refused rather than quietly granted.
  const widened = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: registration.identity_assertion,
      scope: "skills:write",
    }),
  )
  assert.equal((await widened.json()).error, "invalid_scope")
})

test("stale provider authentication is answered with login_required, not a ceremony", async () => {
  const { auth, provider } = await boot()
  const nowSeconds = Math.floor(Date.now() / 1000)

  const response = await auth.handler(
    identityRequest(await provider.mint({ auth_time: nowSeconds - 7200 })),
  )

  assert.equal(response.status, 401)
  assert.match(response.headers.get("www-authenticate") ?? "", /error="login_required"/)
  const body = await response.json()
  assert.equal(body.error, "login_required")
  assert.equal(body.claim, undefined)
})

test("an untrusted issuer is refused at the live endpoint", async () => {
  const { auth } = await boot()
  const foreign = await createProvider({ issuer: "https://not-trusted.test", audience: AUDIENCE })

  const response = await auth.handler(
    identityRequest(await foreign.mint({ iss: "https://not-trusted.test" })),
  )

  assert.equal(response.status, 400)
  assert.equal((await response.json()).error, "issuer_not_enabled")
})

test("an ID-JAG cannot be presented at the token endpoint in place of an assertion", async () => {
  const { auth, store, provider } = await boot()
  await store.upsertDelegation({
    userId: "user_known",
    issuer: provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: provider.displayName,
  })

  const response = await auth.handler(
    postForm("/api/auth/oauth2/token", {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: await provider.mint(),
    }),
  )

  assert.equal((await response.json()).error, "invalid_grant")
})
