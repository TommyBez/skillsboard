import assert from "node:assert/strict"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { after, before, test } from "node:test"

import { exportJWK, generateKeyPair, SignJWT } from "jose"

import "./helpers/register-app-aliases.mjs"

/**
 * A stand-in agent provider: a real key pair, a real JWKS served over
 * loopback, and real signatures. The verifier is exercised through the same
 * path production uses — trust list, remote JWKS fetch, `jose` verification —
 * with only the single-use `jti` store swapped for an in-memory set, because
 * that is the one piece that needs a database.
 */
let server
let providerIssuer
let signingKey
let otherKey

const KID = "test-key-1"
const OTHER_KID = "test-key-2"

before(async () => {
  const pair = await generateKeyPair("ES256", { extractable: true })
  const other = await generateKeyPair("ES256", { extractable: true })
  signingKey = pair.privateKey
  otherKey = other.privateKey

  const jwks = {
    keys: [
      { ...(await exportJWK(pair.publicKey)), kid: KID, alg: "ES256", use: "sig" },
      { ...(await exportJWK(other.publicKey)), kid: OTHER_KID, alg: "ES256", use: "sig" },
    ],
  }

  server = createServer((request, response) => {
    if (request.url === "/.well-known/jwks.json") {
      response.writeHead(200, { "Content-Type": "application/jwk-set+json" })
      response.end(JSON.stringify(jwks))
      return
    }
    response.writeHead(404).end()
  })

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  providerIssuer = `http://127.0.0.1:${server.address().port}`

  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = JSON.stringify([
    {
      issuer: providerIssuer,
      jwksUri: `${providerIssuer}/.well-known/jwks.json`,
      displayName: "Test Provider",
      allowedAlgorithms: ["ES256"],
    },
  ])
  process.env.BETTER_AUTH_SECRET ??= "test-secret-for-agent-auth-tests"
})

after(() => {
  server?.close()
})

const config = await import("../lib/agent-auth/config.ts")
const { AgentAuthError, agentAuthChallenge } = await import("../lib/agent-auth/errors.ts")
const { verifyIdJag } = await import("../lib/agent-auth/id-jag.ts")
const { consumeIdentityAssertion, mintIdentityAssertion } = await import(
  "../lib/agent-auth/identity-assertion.ts"
)
const { buildAgentAuthBlock } = await import("../lib/agent-auth-metadata.ts")
const { discoveryUrl, getDiscoveryOrigin } = await import("../lib/agent-discovery.ts")
const { safeReturnTo } = await import("../lib/safe-return-to.ts")

const origin = getDiscoveryOrigin()

/** An in-memory stand-in for the `agentConsumedAssertion` table. */
function memoryConsumer() {
  const spent = new Set()
  return async ({ issuer, jti }) => {
    const key = `${issuer} ${jti}`
    if (spent.has(key)) return false
    spent.add(key)
    return true
  }
}

const nowSeconds = () => Math.floor(Date.now() / 1000)

async function signIdJag(claims = {}, { key = () => signingKey, kid = KID, alg = "ES256" } = {}) {
  const now = nowSeconds()
  const payload = {
    email: "linked@example.com",
    email_verified: true,
    auth_time: now - 60,
    client_id: "agent-client",
    ...claims,
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg, kid, typ: "JWT" })
    .setIssuer(payload.iss ?? providerIssuer)
    .setAudience(payload.aud ?? config.getAgentAudience())
    .setSubject(payload.sub ?? "provider-user-abc")
    .setIssuedAt(payload.iat ?? now)
    .setExpirationTime(payload.exp ?? now + 300)
    .setJti(payload.jti ?? `jti-${Math.random().toString(36).slice(2)}`)
    .sign(key())
}

async function rejects(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof AgentAuthError, `expected an AgentAuthError, got ${error}`)
    assert.equal(error.code, code, `expected ${code}, got ${error.code}: ${error.description}`)
    return true
  })
}

// ---------------------------------------------------------------- trust list

test("the trust list is keyed by issuer and takes nothing from the token", () => {
  const providers = config.getTrustedAgentProviders()

  assert.equal(providers.size, 1)
  const provider = providers.get(providerIssuer)
  assert.equal(provider.issuer, providerIssuer)
  assert.equal(provider.jwksUri, `${providerIssuer}/.well-known/jwks.json`)
  assert.deepEqual(provider.allowedAlgorithms, ["ES256"])
})

test("an unparseable or unusable trust list trusts nobody rather than everybody", () => {
  const original = process.env.AGENT_AUTH_TRUSTED_PROVIDERS

  for (const value of [
    "not json",
    "[]",
    // http is loopback-only: a plaintext issuer on a public host would let a
    // network attacker mint assertions for this service.
    JSON.stringify([{ issuer: "http://provider.example", jwksUri: "http://provider.example/jwks" }]),
    // No key source means no way to verify anything it sends.
    JSON.stringify([{ issuer: "https://provider.example" }]),
    // HMAC is not a signature we can check against a public JWKS.
    JSON.stringify([
      {
        issuer: "https://provider.example",
        jwksUri: "https://provider.example/jwks",
        allowedAlgorithms: ["HS256", "none"],
      },
    ]),
  ]) {
    process.env.AGENT_AUTH_TRUSTED_PROVIDERS = value
    assert.equal(config.getTrustedAgentProviders().size, 0, `should reject: ${value}`)
  }

  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = original
})

test("a duplicated issuer cannot repoint an already-configured provider", () => {
  const original = process.env.AGENT_AUTH_TRUSTED_PROVIDERS

  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = JSON.stringify([
    { issuer: "https://provider.example", jwksUri: "https://provider.example/real" },
    { issuer: "https://provider.example", jwksUri: "https://attacker.example/keys" },
  ])

  const providers = config.getTrustedAgentProviders()
  assert.equal(providers.size, 1)
  assert.equal(providers.get("https://provider.example").jwksUri, "https://provider.example/real")

  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = original
})

// ------------------------------------------------------------------ audience

test("the stored audience is the resource tokens are actually bound to", () => {
  assert.equal(config.getAgentAudience(), `${origin}/api/mcp`)

  // All three spellings of this service normalize to the one stored value, so
  // a delegation cannot fork across audience aliases.
  for (const spelling of [`${origin}/api/mcp`, `${origin}/api/auth`, origin]) {
    assert.equal(config.normalizeAgentAudience(spelling), `${origin}/api/mcp`)
  }
  assert.equal(config.normalizeAgentAudience(["other", `${origin}/api/mcp`]), `${origin}/api/mcp`)
})

test("an audience for another service is not this service", () => {
  for (const value of ["https://example.com", "", undefined, [], ["https://example.com"]]) {
    assert.equal(config.normalizeAgentAudience(value), undefined)
  }
})

// -------------------------------------------------------------------- scopes

test("an agent-verified token cannot carry the identity scopes a session does", () => {
  for (const scope of ["openid", "profile", "email", "offline_access"]) {
    assert.equal(
      config.agentVerifiedScopes.includes(scope),
      false,
      `${scope} must not be reachable through auth.md`,
    )
  }
})

test("scopes default to read-only and unknown scopes are dropped", () => {
  assert.deepEqual(config.resolveAgentVerifiedScopes(undefined), ["skills:read"])
  assert.deepEqual(config.resolveAgentVerifiedScopes([]), ["skills:read"])
  assert.deepEqual(config.resolveAgentVerifiedScopes(["openid", "admin:*"]), ["skills:read"])
  assert.deepEqual(config.resolveAgentVerifiedScopes(["skills:write"]), ["skills:write"])
  assert.deepEqual(
    config.resolveAgentVerifiedScopes(["skills:read", "skills:write", "skills:read"]),
    ["skills:read", "skills:write"],
  )
})

test("every agent scope is a scope the OAuth provider is configured for", () => {
  assert.equal(config.agentVerifiedScopesAreRegistered(), true)
})

test("just-in-time account creation is off unless an operator turns it on", () => {
  const original = process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING

  delete process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING
  assert.equal(config.allowsJitProvisioning(), false)
  process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING = "1"
  assert.equal(config.allowsJitProvisioning(), false)
  process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING = "true"
  assert.equal(config.allowsJitProvisioning(), true)

  if (original === undefined) delete process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING
  else process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING = original
})

// ------------------------------------------------------------ ID-JAG: accept

test("a well-formed ID-JAG from a trusted provider verifies", async () => {
  const verified = await verifyIdJag(await signIdJag(), { consume: memoryConsumer() })

  assert.equal(verified.issuer, providerIssuer)
  assert.equal(verified.subject, "provider-user-abc")
  assert.equal(verified.audience, `${origin}/api/mcp`)
  assert.equal(verified.email, "linked@example.com")
  assert.equal(verified.emailVerified, true)
  assert.equal(verified.provider.displayName, "Test Provider")
})

test("the audience may be any spelling of this service, stored as one", async () => {
  for (const aud of [`${origin}/api/mcp`, `${origin}/api/auth`, origin]) {
    const verified = await verifyIdJag(await signIdJag({ aud }), { consume: memoryConsumer() })
    assert.equal(verified.audience, `${origin}/api/mcp`)
  }
})

// ------------------------------------------------------------ ID-JAG: refuse

test("an issuer that is not on the trust list is refused", async () => {
  await rejects(
    verifyIdJag(await signIdJag({ iss: "https://attacker.example" }), {
      consume: memoryConsumer(),
    }),
    "invalid_grant",
  )
})

test("a token signed with a key the provider does not publish is refused", async () => {
  const foreign = await generateKeyPair("ES256", { extractable: true })
  await rejects(
    verifyIdJag(await signIdJag({}, { key: () => foreign.privateKey }), {
      consume: memoryConsumer(),
    }),
    "invalid_grant",
  )
})

test("a token signed with the provider's other key still verifies", async () => {
  // Key rotation: a second `kid` in the published JWKS is legitimate, and the
  // cache has to pick it up rather than pinning the first key it saw.
  const verified = await verifyIdJag(
    await signIdJag({}, { key: () => otherKey, kid: OTHER_KID }),
    { consume: memoryConsumer() },
  )
  assert.equal(verified.subject, "provider-user-abc")
})

test("an algorithm the provider is not trusted for is refused", async () => {
  const rsa = await generateKeyPair("RS256", { extractable: true })
  await rejects(
    verifyIdJag(await signIdJag({}, { key: () => rsa.privateKey, alg: "RS256" }), {
      consume: memoryConsumer(),
    }),
    "invalid_grant",
  )
})

test("a token minted for another service is refused", async () => {
  await rejects(
    verifyIdJag(await signIdJag({ aud: "https://other.example/api" }), {
      consume: memoryConsumer(),
    }),
    "invalid_grant",
  )
})

test("an expired token, and one issued in the future, are refused", async () => {
  const now = nowSeconds()
  await rejects(
    verifyIdJag(await signIdJag({ exp: now - 600 }), { consume: memoryConsumer() }),
    "invalid_grant",
  )
  await rejects(
    verifyIdJag(await signIdJag({ iat: now + 3600 }), { consume: memoryConsumer() }),
    "invalid_grant",
  )
})

test("a stale or absent auth_time asks the provider to re-authenticate, not us", async () => {
  const now = nowSeconds()

  // login_required, never interaction_required: our OTP would prove something
  // about a session at Skills Board, not about the one the provider vouched for.
  await rejects(
    verifyIdJag(await signIdJag({ auth_time: now - 7200 }), { consume: memoryConsumer() }),
    "login_required",
  )
  await rejects(
    verifyIdJag(await signIdJag({ auth_time: undefined }), { consume: memoryConsumer() }),
    "login_required",
  )
})

test("an unverified email is not an identity", async () => {
  await rejects(
    verifyIdJag(await signIdJag({ email_verified: false }), { consume: memoryConsumer() }),
    "invalid_grant",
  )
  await rejects(
    verifyIdJag(await signIdJag({ email_verified: undefined }), { consume: memoryConsumer() }),
    "invalid_grant",
  )
  await rejects(
    verifyIdJag(await signIdJag({ email: undefined, email_verified: true }), {
      consume: memoryConsumer(),
    }),
    "invalid_grant",
  )
})

test("a verified phone number is accepted as a verified identifier", async () => {
  const verified = await verifyIdJag(
    await signIdJag({
      email: undefined,
      email_verified: undefined,
      phone_number: "+15550100",
      phone_number_verified: true,
    }),
    { consume: memoryConsumer() },
  )

  assert.equal(verified.phoneNumberVerified, true)
  assert.equal(verified.email, undefined)
})

test("the same ID-JAG cannot be spent twice", async () => {
  const consume = memoryConsumer()
  const assertion = await signIdJag({ jti: "replay-me" })

  await verifyIdJag(assertion, { consume })
  await rejects(verifyIdJag(assertion, { consume }), "invalid_grant")
})

test("a refused token does not burn the jti of the valid one it copies", async () => {
  const consume = memoryConsumer()

  // Same jti, but this copy fails an earlier check. If the jti were burned
  // before the checks ran, the real assertion below would be locked out.
  await rejects(
    verifyIdJag(await signIdJag({ jti: "shared", email_verified: false }), { consume }),
    "invalid_grant",
  )

  const verified = await verifyIdJag(await signIdJag({ jti: "shared" }), { consume })
  assert.equal(verified.jti, "shared")
})

test("a token with no subject, and a body that is not a JWT, are refused", async () => {
  await rejects(
    verifyIdJag(await signIdJag({ sub: "   " }), { consume: memoryConsumer() }),
    "invalid_grant",
  )
  await rejects(verifyIdJag("not.a.jwt", { consume: memoryConsumer() }), "invalid_grant")
  await rejects(verifyIdJag(undefined, { consume: memoryConsumer() }), "invalid_request")
})

// -------------------------------------------------------- identity assertion

function mintFor(overrides = {}) {
  return mintIdentityAssertion({
    userId: "user_123",
    delegationId: "delegation_1",
    clientId: "agent-client",
    scopes: ["skills:read"],
    providerIssuer,
    providerSubject: "provider-user-abc",
    authTime: nowSeconds() - 30,
    ...overrides,
  })
}

test("an identity assertion round-trips and carries the delegation it was minted for", async () => {
  const consume = memoryConsumer()
  const minted = await mintFor({ scopes: ["skills:read", "skills:write"] })

  assert.ok(minted.expiresAt.getTime() > Date.now())
  assert.ok(minted.expiresAt.getTime() - Date.now() <= config.IDENTITY_ASSERTION_TTL_SECONDS * 1000)

  const verified = await consumeIdentityAssertion(minted.assertion, { consume })
  assert.equal(verified.userId, "user_123")
  assert.equal(verified.delegationId, "delegation_1")
  assert.equal(verified.clientId, "agent-client")
  assert.deepEqual(verified.scopes, ["skills:read", "skills:write"])
  assert.equal(verified.providerSubject, "provider-user-abc")
})

test("an identity assertion is single-use", async () => {
  const consume = memoryConsumer()
  const minted = await mintFor()

  await consumeIdentityAssertion(minted.assertion, { consume })
  await rejects(consumeIdentityAssertion(minted.assertion, { consume }), "invalid_grant")
})

test("an ID-JAG is not an identity assertion, and neither is a tampered one", async () => {
  const consume = memoryConsumer()

  // The two live on different keys on purpose: a provider's token must never
  // be exchangeable at our token endpoint as if we had signed it.
  await rejects(consumeIdentityAssertion(await signIdJag(), { consume }), "invalid_grant")

  const minted = await mintFor()
  const [header, , signature] = minted.assertion.split(".")
  const forgedBody = Buffer.from(
    JSON.stringify({ sub: "user_999", scope: "skills:write" }),
  ).toString("base64url")

  await rejects(
    consumeIdentityAssertion(`${header}.${forgedBody}.${signature}`, { consume }),
    "invalid_grant",
  )
})

// ------------------------------------------------------------- claim ceremony

const { claimTokenMatches } = await import("../lib/agent-auth/registrations.ts")
const { hashClaimToken } = await import("../lib/agent-auth/identity-assertion.ts")

test("a claim token is stored only as a hash and compared whole", () => {
  const token = "a-claim-token"
  const registration = { claimTokenHash: hashClaimToken(token) }

  assert.match(registration.claimTokenHash, /^[0-9a-f]{64}$/)
  assert.doesNotMatch(registration.claimTokenHash, /a-claim-token/)

  assert.equal(claimTokenMatches(registration, token), true)
  assert.equal(claimTokenMatches(registration, "a-claim-toke"), false)
  assert.equal(claimTokenMatches(registration, hashClaimToken(token)), false)
  assert.equal(claimTokenMatches(registration, undefined), false)
  assert.equal(claimTokenMatches({ claimTokenHash: null }, token), false)
})

test("an approved claim is spent by a status transition, not by reading it", async () => {
  const source = await readFile(
    new URL("../lib/agent-auth/claim-flow.ts", import.meta.url),
    "utf8",
  )

  // One approval buys one assertion. The mint has to sit behind the
  // `claimed` -> `linked` transition, so two concurrent polls resolve to one
  // winner instead of both minting a credential.
  const exchange = source.indexOf("exchangeRegistration(")
  const mint = source.indexOf("completeClaim(spent)")
  assert.ok(exchange > 0, "the claim flow no longer spends the registration")
  assert.ok(mint > exchange, "the claim flow mints before spending the registration")
  assert.match(source, /case "linked":/)
})

// -------------------------------------------------------------------- errors

test("every refusal carries the challenge that leads back to discovery", () => {
  const challenge = agentAuthChallenge(
    new AgentAuthError("login_required", 'stale "auth_time"'),
  )

  assert.match(challenge, /^Bearer /)
  assert.ok(challenge.includes(`resource_metadata="${origin}/.well-known/oauth-protected-resource"`))
  assert.ok(challenge.includes(`resource="${origin}/api/mcp"`))
  assert.ok(challenge.includes('error="login_required"'))
  // A quote inside the description must not end the quoted-string early.
  assert.ok(challenge.includes('error_description="stale \\"auth_time\\""'))
})

test("the codes an agent branches on map to the statuses it expects", () => {
  assert.equal(new AgentAuthError("login_required", "x").status, 401)
  assert.equal(new AgentAuthError("interaction_required", "x").status, 401)
  assert.equal(new AgentAuthError("access_denied", "x").status, 403)
  assert.equal(new AgentAuthError("invalid_grant", "x").status, 400)
  assert.equal(new AgentAuthError("invalid_client", "x").status, 401)
})

// ------------------------------------------------------------------ metadata

test("agent_auth advertises the ID-JAG flow only where a provider is trusted", () => {
  const metadata = { registration_endpoint: `${origin}/api/auth/oauth2/register` }
  const original = process.env.AGENT_AUTH_TRUSTED_PROVIDERS

  const block = buildAgentAuthBlock(metadata)
  assert.deepEqual(block.identity_types_supported, ["identity_assertion", "service_auth"])
  assert.equal(block.identity_endpoint, `${origin}/agent/identity`)
  assert.equal(block.claim_endpoint, `${origin}/agent/identity/claim`)
  assert.equal(block.events_endpoint, `${origin}/agent/events`)
  assert.deepEqual(block.assertion_types_supported, ["urn:ietf:params:oauth:token-type:id-jag"])
  assert.deepEqual(block.agent_scopes_supported, ["skills:read", "skills:write"])
  assert.deepEqual(block.trusted_providers, [
    { issuer: providerIssuer, display_name: "Test Provider" },
  ])

  // With no provider configured the flow would answer invalid_grant for every
  // issuer alive, so it is not advertised at all.
  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = ""
  const bare = buildAgentAuthBlock(metadata)
  assert.deepEqual(bare.identity_types_supported, ["service_auth"])
  assert.equal(bare.identity_endpoint, undefined)
  assert.equal(bare.claim_endpoint, undefined)
  assert.equal(bare.events_endpoint, undefined)
  assert.doesNotMatch(JSON.stringify(bare), /id-jag/i)

  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = original
})

test("agent_auth is still omitted entirely when registration is unavailable", () => {
  assert.equal(buildAgentAuthBlock({ issuer: `${origin}/api/auth` }), undefined)
})

test("the claim ceremony pages are the only new sign-in destinations", () => {
  const id = "0f9d5a2e-1c3b-4d5e-8a7b-9c0d1e2f3a4b"

  // The code-entry page and one specific ceremony, addressed by UUID only, so
  // the parameter cannot be bent into another destination.
  assert.equal(safeReturnTo("/agent/claim"), "/agent/claim")
  assert.equal(safeReturnTo(`/agent/claim/${id}`), `/agent/claim/${id}`)
  assert.equal(safeReturnTo(`/agent/claim/${id}/../../library`), "/library")
  assert.equal(safeReturnTo(`/agent/claim/${id}?next=https://example.com`), "/library")
  assert.equal(safeReturnTo("/agent/claim?error=unknown"), "/library")
  assert.equal(safeReturnTo("/agent/identity"), "/library")
})

// ------------------------------------------------------------------- auth.md

test("auth.md documents the Agent Verified flow an agent has to run", async () => {
  const authMd = await readFile(new URL("../public/auth.md", import.meta.url), "utf8")

  for (const marker of [
    "urn:ietf:params:oauth:token-type:id-jag",
    "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "/agent/identity",
    "/agent/identity/claim",
    "/agent/events",
    "login_required",
    "interaction_required",
    "email_verified",
    "auth_time",
  ]) {
    assert.ok(authMd.includes(marker), `auth.md does not mention ${marker}`)
  }

  // The rule the whole flow exists to enforce has to be stated where an agent
  // author reads it, not only in the code.
  assert.match(authMd, /does not entitle\s+a provider to take it over/)
})

test("agent_auth points documentation at the same auth.md the site serves", () => {
  const block = buildAgentAuthBlock({
    registration_endpoint: `${origin}/api/auth/oauth2/register`,
  })

  assert.equal(block.skill, discoveryUrl("/auth.md"))
  assert.equal(
    block.protected_resource_metadata_uri,
    discoveryUrl("/.well-known/oauth-protected-resource"),
  )
})
