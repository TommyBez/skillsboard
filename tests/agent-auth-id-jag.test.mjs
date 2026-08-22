import assert from "node:assert/strict"
import { test } from "node:test"
import { SignJWT, createLocalJWKSet, exportJWK, generateKeyPair } from "jose"

import "./helpers/register-app-aliases.mjs"
import {
  createMemoryStore,
  createMemoryUsers,
  createProvider,
  sha256Hex,
} from "./helpers/agent-auth-harness.mjs"

const { handleClaimInitiation, handleIdentityRequest } = await import("../lib/agent-auth/identity.ts")
const { completeClaim } = await import("../lib/agent-auth/registration.ts")
const { loadClaimView } = await import("../lib/agent-auth/claim-view.ts")
const { handleSecurityEvent } = await import("../lib/agent-auth/events.ts")
const { refuseAgentCredential } = await import("../lib/agent-auth/resource.ts")
const { revokeAgentCredential } = await import("../lib/agent-auth/revocation.ts")
const { handleJwtBearerGrant, narrowScopes } = await import("../lib/agent-auth/oauth.ts")
const { setProviderJwksForTesting, resetTrustedProviderCache } = await import(
  "../lib/agent-auth/trust.ts"
)
const { getAgentAudience, getServiceIssuer, IDENTITY_ASSERTION_REVOKED_SCHEMA } = await import(
  "../lib/agent-auth/config.ts"
)
const { tokenHasScope } = await import("../lib/oauth-scopes.ts")

const AUDIENCE = getAgentAudience()
const SERVICE_ISSUER = getServiceIssuer()

/* ------------------------------------------------------------------ *
 * Fixture wiring
 * ------------------------------------------------------------------ */

/**
 * The service's own signing key, so a test can follow an `identity_assertion`
 * all the way through the RFC 7523 exchange with real signatures on both legs.
 */
const serviceKeys = await generateKeyPair("ES256", { extractable: true })
const servicePublicJwk = {
  ...(await exportJWK(serviceKeys.publicKey)),
  alg: "ES256",
  use: "sig",
  kid: "service-key-1",
}
/**
 * The row Better Auth's `jwt` plugin would have written for this key. Both the
 * grant handler and the revocation path read the key set through this, so the
 * tests exercise the same lookup production uses rather than a bypass.
 */
const serviceJwksRow = {
  id: servicePublicJwk.kid,
  alg: "ES256",
  crv: servicePublicJwk.crv,
  publicKey: JSON.stringify(servicePublicJwk),
  expiresAt: null,
}
const serviceJwks = async () => ({ keys: [servicePublicJwk] })

let assertionCounter = 0

/** Stands in for `signServiceAssertion`, which needs a Better Auth context. */
async function signAssertion(input) {
  assertionCounter += 1
  const issuedAt = Math.floor(Date.now() / 1000)
  const jti = `svc-jti-${assertionCounter}`
  const payload = {
    iss: SERVICE_ISSUER,
    sub: input.registrationId,
    aud: SERVICE_ISSUER,
    jti,
    iat: issuedAt,
    exp: issuedAt + 3600,
    scope: [...input.scopes].join(" "),
  }
  if (input.email) payload.email = input.email
  if (input.emailVerified != null) payload.email_verified = input.emailVerified
  if (input.amr?.length) payload.amr = input.amr
  if (input.delegationId) payload.agent_delegation_id = input.delegationId

  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "ES256", kid: servicePublicJwk.kid, typ: "oauth-id-jag+jwt" })
    .sign(serviceKeys.privateKey)
  return { jwt, jti, expiresAt: new Date((issuedAt + 3600) * 1000) }
}

/**
 * Boots a world: a trusted provider with a live JWKS, a store, a user table,
 * and the deps object every protocol entry point takes.
 */
async function setup({ users: seedUsers = [], providerOptions = {} } = {}) {
  const provider = await createProvider({ audience: AUDIENCE, ...providerOptions })
  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = JSON.stringify([provider.trustEntry])
  resetTrustedProviderCache()
  setProviderJwksForTesting(provider, createLocalJWKSet({ keys: [provider.publicJwk] }))

  const store = createMemoryStore()
  const users = createMemoryUsers(seedUsers)

  return {
    provider,
    store,
    users,
    deps: { store, users, sign: signAssertion, audience: AUDIENCE },
  }
}

const knownUser = () => ({
  id: "user_known",
  email: "known@example.com",
  emailVerified: true,
  name: "Known User",
})

function identityBody(assertion, extra = {}) {
  return {
    type: "identity_assertion",
    assertion_type: "urn:ietf:params:oauth:token-type:id-jag",
    assertion,
    ...extra,
  }
}

/**
 * Runs a first link the whole way: the agent is told to step up, the human
 * signs in and confirms with the code, and the delegation lands.
 */
async function completeFirstLink({ store, users, deps, provider }, signedInUser) {
  const stepUp = await handleIdentityRequest(identityBody(await provider.mint()), deps)
  assert.equal(stepUp.status, 401)
  assert.equal(stepUp.body.error, "interaction_required")

  const viewToken = new URL(stepUp.body.claim.verification_uri).searchParams.get(
    "claim_attempt_token",
  )
  const view = await loadClaimView({
    store,
    claimAttemptToken: viewToken,
    signedInUser,
  })
  assert.equal(view.kind, "confirm")

  const completed = await completeClaim({
    store,
    registration: view.registration,
    claim: view.claim,
    userCode: stepUp.body.claim.user_code,
    signedInUser,
    providerName: provider.displayName,
  })
  assert.equal(completed.ok, true)
  return { stepUp, viewToken, users, completed }
}

/* ------------------------------------------------------------------ *
 * Happy paths
 * ------------------------------------------------------------------ */

test("a known delegation resolves the Better Auth user with no user interaction", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )

  assert.equal(result.status, 200)
  assert.equal(result.body.registration_type, "identity_assertion")
  assert.ok(result.body.identity_assertion)
  assert.deepEqual(result.body.scopes, ["skills:read", "skills:write"])
  // Nothing that would put a human in the loop was minted.
  assert.equal(world.store._claims.size, 0)

  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  // The registration resolves to the same Better Auth user a browser login
  // would have produced — one user, not an agent-shaped copy of one.
  assert.equal(registration.userId, "user_known")
})

test("a first link asks for confirmation, then the same identity needs no code again", async () => {
  const world = await setup({ users: [knownUser()] })

  await completeFirstLink(world, knownUser())

  const delegation = await world.store.findDelegation({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  assert.equal(delegation.userId, "user_known")
  assert.equal(delegation.revokedAt, null)

  // A fresh ID-JAG for the same provider identity now takes the silent path:
  // no browser, no OTP, no ceremony.
  const claimsBefore = world.store._claims.size
  const again = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  assert.equal(again.status, 200)
  assert.ok(again.body.identity_assertion)
  assert.equal(world.store._claims.size, claimsBefore)
})

test("the confirmation step never trusts the email the agent asserted, only the session", async () => {
  const world = await setup({ users: [knownUser()] })
  const { completed } = await completeFirstLink(world, knownUser())
  // The delegation is keyed on (iss, sub, aud) and points at the signed-in
  // user's id, not at the email that matched.
  assert.equal(completed.delegation.issuer, world.provider.issuer)
  assert.equal(completed.delegation.subject, "provider-subject-1")
  assert.equal(completed.delegation.audience, AUDIENCE)
  assert.equal(completed.delegation.userId, "user_known")
})

/* ------------------------------------------------------------------ *
 * Assertion verification
 * ------------------------------------------------------------------ */

test("an untrusted issuer is refused before any key is fetched", async () => {
  const world = await setup({ users: [knownUser()] })
  const foreign = await createProvider({ issuer: "https://not-trusted.test", audience: AUDIENCE })

  const result = await handleIdentityRequest(
    identityBody(await foreign.mint({ iss: "https://not-trusted.test" })),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "issuer_not_enabled")
  assert.equal(world.store._registrations.size, 0)
})

test("an assertion signed with an unpublished key is refused", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mintWithRogueKey()),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "invalid_signature")
  assert.equal(world.store._registrations.size, 0)
})

test("an `alg: none` assertion is refused without consulting any key", async () => {
  const world = await setup({ users: [knownUser()] })
  const nowSeconds = Math.floor(Date.now() / 1000)
  const header = Buffer.from(
    JSON.stringify({ alg: "none", typ: "oauth-id-jag+jwt", kid: "test-key-1" }),
  ).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({
      iss: world.provider.issuer,
      sub: "provider-subject-1",
      aud: AUDIENCE,
      jti: "unsigned-1",
      iat: nowSeconds,
      exp: nowSeconds + 300,
      auth_time: nowSeconds,
      email: "known@example.com",
      email_verified: true,
    }),
  ).toString("base64url")

  const result = await handleIdentityRequest(
    identityBody(`${header}.${payload}.`),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "invalid_signature")
})

test("an assertion minted for another audience is refused", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint({ aud: "https://someone-else.example/api" })),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "invalid_audience")
  assert.equal(world.store._registrations.size, 0)
})

test("an expired assertion is refused", async () => {
  const world = await setup({ users: [knownUser()] })
  const nowSeconds = Math.floor(Date.now() / 1000)

  const result = await handleIdentityRequest(
    identityBody(
      // Well outside the 60s clock-skew tolerance.
      await world.provider.mint({ iat: nowSeconds - 900, exp: nowSeconds - 600 }),
    ),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "expired")
})

test("replaying an assertion fails the second time", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })

  const assertion = await world.provider.mint()

  const first = await handleIdentityRequest(identityBody(assertion), world.deps)
  assert.equal(first.status, 200)

  const second = await handleIdentityRequest(identityBody(assertion), world.deps)
  assert.equal(second.status, 400)
  assert.equal(second.body.error, "replay_detected")
})

test("the jti is burned before the identity gates, so a refusal cannot be retried", async () => {
  const world = await setup({ users: [knownUser()] })
  // This assertion fails the verified-identity gate, which comes *after* the
  // replay tombstone is written. Presenting it again must not get a second run
  // at the remaining checks.
  const assertion = await world.provider.mint({ email_verified: false })

  const first = await handleIdentityRequest(identityBody(assertion), world.deps)
  assert.equal(first.body.error, "missing_verified_email")

  const second = await handleIdentityRequest(identityBody(assertion), world.deps)
  assert.equal(second.body.error, "replay_detected")
})

test("stale provider authentication answers login_required and starts no ceremony", async () => {
  const world = await setup({ users: [knownUser()] })
  const nowSeconds = Math.floor(Date.now() / 1000)

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint({ auth_time: nowSeconds - 7200 })),
    world.deps,
  )

  assert.equal(result.status, 401)
  assert.equal(result.body.error, "login_required")
  assert.equal(result.body.max_age, 3600)
  assert.match(result.headers["WWW-Authenticate"], /error="login_required"/)

  // The distinction that matters: this is the provider's problem, not ours.
  // Signing in to Skills Board cannot fix a stale upstream login, so no claim
  // ceremony, no verification URL, no user code.
  assert.equal(world.store._claims.size, 0)
  assert.equal(world.store._registrations.size, 0)
  assert.doesNotMatch(JSON.stringify(result.body), /verification_uri|user_code|claim_token/)
})

test("a missing auth_time is treated the same as a stale one", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint({ auth_time: undefined })),
    world.deps,
  )

  assert.equal(result.status, 401)
  assert.equal(result.body.error, "login_required")
  assert.equal(world.store._claims.size, 0)
})

test("an auth_time far in the future cannot buy unlimited freshness", async () => {
  const world = await setup({ users: [knownUser()] })
  const nowSeconds = Math.floor(Date.now() / 1000)

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint({ auth_time: nowSeconds + 86_400 })),
    world.deps,
  )

  assert.equal(result.status, 401)
  assert.equal(result.body.error, "login_required")
})

test("an assertion with no verified email or phone is refused", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(
      await world.provider.mint({ email_verified: false, phone_number_verified: undefined }),
    ),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "missing_verified_email")
  assert.equal(world.store._registrations.size, 0)
})

test("a client_id outside the provider's allowlist is refused", async () => {
  const world = await setup({
    users: [knownUser()],
    providerOptions: {},
  })
  process.env.AGENT_AUTH_TRUSTED_PROVIDERS = JSON.stringify([
    { ...world.provider.trustEntry, client_ids: ["agent-app-1"] },
  ])
  resetTrustedProviderCache()
  setProviderJwksForTesting(
    world.provider,
    createLocalJWKSet({ keys: [world.provider.publicJwk] }),
  )

  const allowed = await handleIdentityRequest(
    identityBody(await world.provider.mint({ client_id: "agent-app-1" })),
    world.deps,
  )
  assert.notEqual(allowed.body.error, "invalid_client_id")

  const refused = await handleIdentityRequest(
    identityBody(await world.provider.mint({ client_id: "some-other-app" })),
    world.deps,
  )
  assert.equal(refused.status, 400)
  assert.equal(refused.body.error, "invalid_client_id")
})

/* ------------------------------------------------------------------ *
 * Silent linking and hijacking
 * ------------------------------------------------------------------ */

test("a verified email that matches an account never yields a credential on its own", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )

  assert.equal(result.status, 401)
  assert.equal(result.body.error, "interaction_required")
  // Nothing exchangeable came back, and nothing was linked.
  assert.equal(result.body.identity_assertion, undefined)
  assert.equal(
    await world.store.findDelegation({
      issuer: world.provider.issuer,
      subject: "provider-subject-1",
      audience: AUDIENCE,
    }),
    null,
  )

  // The registration exists but is unusable: exchanging against it is refused
  // until a human confirms.
  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  assert.equal(registration.status, "pending_claim")
  assert.equal(registration.userId, null)
})

test("a different signed-in user cannot complete someone else's ceremony", async () => {
  const world = await setup({
    users: [
      knownUser(),
      { id: "user_attacker", email: "attacker@example.com", emailVerified: true, name: "Mallory" },
    ],
  })

  const stepUp = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  const viewToken = new URL(stepUp.body.claim.verification_uri).searchParams.get(
    "claim_attempt_token",
  )
  const attacker = {
    id: "user_attacker",
    email: "attacker@example.com",
    emailVerified: true,
    name: "Mallory",
  }

  // The page refuses to render the form for the wrong account…
  const view = await loadClaimView({ store: world.store, claimAttemptToken: viewToken, signedInUser: attacker })
  assert.equal(view.kind, "wrong_account")
  assert.equal(view.expectedEmail, "known@example.com")

  // …and even holding the code, the completion path refuses too, so a leaked
  // verification URL plus a leaked code still cannot bind the agent elsewhere.
  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const claim = await world.store.latestClaim(registration.id)
  const hijack = await completeClaim({
    store: world.store,
    registration,
    claim,
    userCode: stepUp.body.claim.user_code,
    signedInUser: attacker,
    providerName: world.provider.displayName,
  })

  assert.equal(hijack.ok, false)
  assert.equal(hijack.error, "wrong_account")
  assert.equal(
    await world.store.findDelegation({
      issuer: world.provider.issuer,
      subject: "provider-subject-1",
      audience: AUDIENCE,
    }),
    null,
  )
})

test("a wrong code is rejected and the attempt budget is finite", async () => {
  const world = await setup({ users: [knownUser()] })
  const stepUp = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const wrongCode = stepUp.body.claim.user_code === "000000" ? "111111" : "000000"

  let last
  for (let attempt = 0; attempt < 6; attempt += 1) {
    last = await completeClaim({
      store: world.store,
      registration,
      claim: await world.store.latestClaim(registration.id),
      userCode: wrongCode,
      signedInUser: knownUser(),
      providerName: world.provider.displayName,
    })
    assert.equal(last.ok, false)
  }
  assert.equal(last.error, "too_many_attempts")

  // The correct code no longer works either: guessing costs a whole new
  // ceremony rather than another try.
  const afterBurn = await completeClaim({
    store: world.store,
    registration,
    claim: await world.store.latestClaim(registration.id),
    userCode: stepUp.body.claim.user_code,
    signedInUser: knownUser(),
    providerName: world.provider.displayName,
  })
  assert.equal(afterBurn.ok, false)
})

test("re-initiating a ceremony cannot re-point it at another account", async () => {
  const world = await setup({ users: [knownUser()] })
  const stepUp = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )

  const redirected = await handleClaimInitiation(
    { claim_token: stepUp.body.claim_token, email: "attacker@example.com" },
    { store: world.store },
  )
  assert.equal(redirected.status, 403)

  // The original binding is intact and can still be re-minted for the right
  // address.
  const reissued = await handleClaimInitiation(
    { claim_token: stepUp.body.claim_token, email: "known@example.com" },
    { store: world.store },
  )
  assert.equal(reissued.status, 200)
  assert.equal(reissued.body.status, "initiated")

  // The superseded verification URL stops working the moment a new one exists.
  const staleView = await loadClaimView({
    store: world.store,
    claimAttemptToken: new URL(stepUp.body.claim.verification_uri).searchParams.get(
      "claim_attempt_token",
    ),
    signedInUser: knownUser(),
  })
  assert.equal(staleView.kind, "expired")
})

/* ------------------------------------------------------------------ *
 * Registration policy
 * ------------------------------------------------------------------ */

test("an unknown identity is refused when the deployment does not provision accounts", async () => {
  const world = await setup({ users: [] })
  delete process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint({ email: "stranger@example.com" })),
    world.deps,
  )

  assert.equal(result.status, 403)
  assert.equal(result.body.error, "registration_not_allowed")
  assert.equal(world.store._registrations.size, 0)
  assert.equal(world.users._users.size, 0)
})

test("JIT provisioning, when enabled, creates one Better Auth user and its delegation", async () => {
  const world = await setup({ users: [] })
  process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING = "true"

  try {
    const result = await handleIdentityRequest(
      identityBody(await world.provider.mint({ email: "stranger@example.com" })),
      world.deps,
    )

    assert.equal(result.status, 200)
    assert.equal(world.users._users.size, 1)
    const [created] = [...world.users._users.values()]
    assert.equal(created.email, "stranger@example.com")

    const delegation = await world.store.findDelegation({
      issuer: world.provider.issuer,
      subject: "provider-subject-1",
      audience: AUDIENCE,
    })
    assert.equal(delegation.userId, created.id)
  } finally {
    delete process.env.AGENT_AUTH_ALLOW_JIT_PROVISIONING
  }
})

/* ------------------------------------------------------------------ *
 * Unsupported registration types
 * ------------------------------------------------------------------ */

test("the registration types this service does not implement say so", async () => {
  const world = await setup({ users: [knownUser()] })

  const anonymous = await handleIdentityRequest({ type: "anonymous" }, world.deps)
  assert.equal(anonymous.body.error, "anonymous_not_enabled")

  const serviceAuth = await handleIdentityRequest(
    { type: "service_auth", login_hint: "known@example.com" },
    world.deps,
  )
  assert.equal(serviceAuth.body.error, "service_auth_not_enabled")

  // Neither path touched any state.
  assert.equal(world.store._registrations.size, 0)
  assert.equal(world.store._delegations.size, 0)
})

/* ------------------------------------------------------------------ *
 * Token exchange, scopes and revocation
 * ------------------------------------------------------------------ */

/** A Better Auth endpoint context, reduced to what the grant handlers touch. */
function fakeCtx({ body, users }) {
  const clients = new Map()
  return {
    body,
    _clients: clients,
    context: {
      adapter: {
        async findOne({ model, where }) {
          const value = where[0].value
          if (model === "oauthClient") return clients.get(value) ?? null
          if (model === "user") return users._users.get(value) ?? null
          return null
        },
        async findMany({ model }) {
          if (model === "jwks") return [serviceJwksRow]
          return []
        },
        async create({ model, data }) {
          if (model !== "oauthClient") throw new Error(`unexpected create on ${model}`)
          const created = { id: `oc_${clients.size + 1}`, ...data }
          clients.set(created.clientId, created)
          return created
        },
      },
      internalAdapter: {},
    },
  }
}

function fakeProviderApi() {
  const issued = []
  return {
    issued,
    api: {
      async getClient(clientId) {
        return { clientId }
      },
      async issueTokens(params) {
        issued.push(params)
        return {
          access_token: "at.test",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "Bearer",
          refresh_token: undefined,
          scope: params.scopes.join(" "),
          id_token: undefined,
          ...(params.tokenResponse ?? {}),
        }
      },
    },
  }
}

async function exchange(world, assertion, { scope } = {}) {
  const ctx = fakeCtx({ body: { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion, ...(scope ? { scope } : {}) }, users: world.users })
  const provider = fakeProviderApi()
  const response = await handleJwtBearerGrant({ ctx, api: provider.api, store: world.store })
  return { response, issued: provider.issued }
}

test("the identity assertion exchanges for a scoped Better Auth access token", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })

  const registered = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  const { response, issued } = await exchange(world, registered.body.identity_assertion)

  assert.equal(response.access_token, "at.test")
  assert.equal(issued.length, 1)
  // The token is minted for the same Better Auth user the human login resolves
  // to, bound to the MCP resource, and stamped with its delegation so the
  // resource server can check revocation.
  assert.equal(issued[0].user.id, "user_known")
  assert.deepEqual(issued[0].resources, [AUDIENCE])
  assert.deepEqual(issued[0].scopes, ["skills:read", "skills:write"])
  assert.equal(issued[0].accessTokenClaims.agent_issuer, world.provider.issuer)
  assert.ok(issued[0].accessTokenClaims.agent_delegation_id)
  // The OAuth client is a public one, so the agent can revoke with nothing but
  // its client_id and never needs a secret it has no way to hold.
  assert.equal(issued[0].client.clientId.startsWith("agent-auth-"), true)
})

test("an agent that asked for read-only cannot call a write tool", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })

  const registered = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
    )
  assert.equal(registered.status, 200)

  const readOnly = await handleIdentityRequest(
    identityBody(await world.provider.mint(), { scope: "skills:read" }),
    world.deps,
  )
  assert.deepEqual(readOnly.body.scopes, ["skills:read"])

  const { issued } = await exchange(world, readOnly.body.identity_assertion)
  assert.deepEqual(issued[0].scopes, ["skills:read"])

  // What `/api/mcp` actually asks of the issued token.
  const tokenClaims = { scope: issued[0].scopes.join(" ") }
  assert.equal(tokenHasScope(tokenClaims, "skills:read"), true)
  assert.equal(tokenHasScope(tokenClaims, "skills:write"), false)
})

test("the token endpoint cannot be used to widen scope after the fact", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })

  const readOnly = await handleIdentityRequest(
    identityBody(await world.provider.mint(), { scope: "skills:read" }),
    world.deps,
  )

  await assert.rejects(
    () => exchange(world, readOnly.body.identity_assertion, { scope: "skills:write" }),
    (error) => error.body?.error === "invalid_scope",
  )

  assert.deepEqual(narrowScopes(["skills:read"], "skills:write"), {
    ok: false,
    invalid: ["skills:write"],
  })
})

test("a scope the profile does not define is refused at registration", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleIdentityRequest(
    identityBody(await world.provider.mint(), { scope: "skills:read admin:everything" }),
    world.deps,
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.error, "invalid_scope")
})

test("a revoked delegation issues no credential, even for a fresh valid ID-JAG", async () => {
  const world = await setup({ users: [knownUser()] })
  await completeFirstLink(world, knownUser())

  const registered = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  assert.equal(registered.status, 200)
  const liveAssertion = registered.body.identity_assertion

  // The provider pushes a Security Event Token revoking the delegation.
  const event = await world.provider.mintSecurityEvent({
    events: { [IDENTITY_ASSERTION_REVOKED_SCHEMA]: {} },
  })
  const received = await handleSecurityEvent(event, { store: world.store, audience: AUDIENCE })
  assert.equal(received.status, 202)

  // 1. The assertion the agent already holds stops exchanging.
  await assert.rejects(
    () => exchange(world, liveAssertion),
    (error) => error.body?.error === "invalid_grant",
  )

  // 2. A brand-new, valid, non-replayed ID-JAG issues nothing either: it falls
  //    back to requiring a human, which is the only way to re-authorize.
  const afterRevocation = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  assert.equal(afterRevocation.status, 401)
  assert.equal(afterRevocation.body.error, "interaction_required")
  assert.equal(afterRevocation.body.identity_assertion, undefined)
})

test("a revoked delegation is refused at the resource server too", async () => {
  const world = await setup({ users: [knownUser()] })
  await completeFirstLink(world, knownUser())

  const delegation = await world.store.findDelegation({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const tokenClaims = {
    sub: "user_known",
    jti: "access-token-jti",
    scope: "skills:read",
    agent_delegation_id: delegation.id,
    agent_registration_id: registration.id,
    agent_issuer: world.provider.issuer,
  }

  assert.equal(await refuseAgentCredential(tokenClaims, world.store), null)

  await world.store.revokeDelegation({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })

  const refusal = await refuseAgentCredential(tokenClaims, world.store)
  assert.equal(refusal.code, "delegation_revoked")
})

test("a human's token carries no agent claims and is never gated by delegation state", async () => {
  const world = await setup({ users: [knownUser()] })
  assert.equal(
    await refuseAgentCredential({ sub: "user_known", jti: "human", scope: "skills:read" }, world.store),
    null,
  )
})

test("RFC 7009 revocation kills one access token without killing the assertion", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })
  const registered = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  const assertion = registered.body.identity_assertion

  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const nowSeconds = Math.floor(Date.now() / 1000)
  const accessToken = await new SignJWT({
    sub: "user_known",
    jti: "at-jti-1",
    scope: "skills:read",
    agent_delegation_id: registration.delegationId,
    agent_registration_id: registration.id,
    iss: SERVICE_ISSUER,
    aud: AUDIENCE,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  })
    .setProtectedHeader({ alg: "ES256", kid: servicePublicJwk.kid, typ: "at+jwt" })
    .sign(serviceKeys.privateKey)

  const outcome = await revokeAgentCredential(accessToken, world.store, { jwks: serviceJwks })
  assert.deepEqual(outcome, { handled: true, kind: "access_token" })

  // The resource server now refuses that one token…
  const refusal = await refuseAgentCredential(
    {
      sub: "user_known",
      jti: "at-jti-1",
      agent_delegation_id: registration.delegationId,
      agent_registration_id: registration.id,
    },
    world.store,
  )
  assert.equal(refusal.code, "token_revoked")

  // …while the identity assertion still mints a fresh one, which is exactly the
  // credential-layer behavior AUTH.md describes.
  const { response } = await exchange(world, assertion)
  assert.equal(response.access_token, "at.test")
})

test("revoking the identity assertion closes the refresh path", async () => {
  const world = await setup({ users: [knownUser()] })
  await world.store.upsertDelegation({
    userId: "user_known",
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
    providerName: world.provider.displayName,
  })
  const registered = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  const assertion = registered.body.identity_assertion

  const outcome = await revokeAgentCredential(assertion, world.store, { jwks: serviceJwks })
  assert.deepEqual(outcome, { handled: true, kind: "identity_assertion" })

  await assert.rejects(
    () => exchange(world, assertion),
    (error) => error.body?.error === "invalid_grant",
  )
})

test("revocation passes a token it did not issue back to the authorization server", async () => {
  const world = await setup({ users: [knownUser()] })
  assert.deepEqual(await revokeAgentCredential("not-a-jwt", world.store, { jwks: serviceJwks }), {
    handled: false,
  })
  assert.deepEqual(
    await revokeAgentCredential(await world.provider.mint(), world.store, { jwks: serviceJwks }),
    { handled: false },
  )
})

test("an unconfirmed registration cannot be exchanged", async () => {
  const world = await setup({ users: [knownUser()] })
  const stepUp = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )
  assert.equal(stepUp.status, 401)

  // Forge an assertion naming the pending registration: the signature is real,
  // and it still must not exchange, because the state behind it is not confirmed.
  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const assertion = await signAssertion({
    registrationId: registration.id,
    delegationId: null,
    scopes: ["skills:read"],
  })

  await assert.rejects(
    () => exchange(world, assertion.jwt),
    (error) => error.body?.error === "invalid_grant",
  )
})

test("an access token cannot be presented as an identity assertion", async () => {
  const world = await setup({ users: [knownUser()] })
  const nowSeconds = Math.floor(Date.now() / 1000)
  const accessToken = await new SignJWT({
    sub: "user_known",
    jti: "at-jti-2",
    iss: SERVICE_ISSUER,
    aud: SERVICE_ISSUER,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  })
    .setProtectedHeader({ alg: "ES256", kid: servicePublicJwk.kid, typ: "at+jwt" })
    .sign(serviceKeys.privateKey)

  await assert.rejects(
    () => exchange(world, accessToken),
    (error) => error.body?.error === "invalid_grant",
  )
})

/* ------------------------------------------------------------------ *
 * Provider security events
 * ------------------------------------------------------------------ */

test("a security event from an untrusted issuer is refused", async () => {
  const world = await setup({ users: [knownUser()] })
  const foreign = await createProvider({ issuer: "https://not-trusted.test", audience: AUDIENCE })

  const result = await handleSecurityEvent(
    await foreign.mintSecurityEvent({
      iss: "https://not-trusted.test",
      events: { [IDENTITY_ASSERTION_REVOKED_SCHEMA]: {} },
    }),
    { store: world.store, audience: AUDIENCE },
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.err, "invalid_issuer")
})

test("a security event with no events claim is refused", async () => {
  const world = await setup({ users: [knownUser()] })

  const result = await handleSecurityEvent(
    await world.provider.mintSecurityEvent({ events: {} }),
    { store: world.store, audience: AUDIENCE },
  )

  assert.equal(result.status, 400)
  assert.equal(result.body.err, "invalid_request")
})

test("a security event carrying only unknown schemas is acknowledged, not acted on", async () => {
  const world = await setup({ users: [knownUser()] })
  await completeFirstLink(world, knownUser())

  const result = await handleSecurityEvent(
    await world.provider.mintSecurityEvent({
      events: { "https://schemas.example.com/events/something-else": {} },
    }),
    { store: world.store, audience: AUDIENCE },
  )

  assert.equal(result.status, 202)
  const delegation = await world.store.findDelegation({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  assert.equal(delegation.revokedAt, null)
})

test("a replayed security event is refused", async () => {
  const world = await setup({ users: [knownUser()] })
  const event = await world.provider.mintSecurityEvent({
    events: { [IDENTITY_ASSERTION_REVOKED_SCHEMA]: {} },
  })

  assert.equal((await handleSecurityEvent(event, { store: world.store, audience: AUDIENCE })).status, 202)
  const replay = await handleSecurityEvent(event, { store: world.store, audience: AUDIENCE })
  assert.equal(replay.status, 400)
  assert.equal(replay.body.err, "authentication_failed")
})

/* ------------------------------------------------------------------ *
 * Trust configuration
 * ------------------------------------------------------------------ */

test("a claim token is only ever stored as a hash", async () => {
  const world = await setup({ users: [knownUser()] })
  const stepUp = await handleIdentityRequest(
    identityBody(await world.provider.mint()),
    world.deps,
  )

  const registration = await world.store.findRegistrationByIdentity({
    issuer: world.provider.issuer,
    subject: "provider-subject-1",
    audience: AUDIENCE,
  })
  const claim = await world.store.latestClaim(registration.id)
  const viewToken = new URL(stepUp.body.claim.verification_uri).searchParams.get(
    "claim_attempt_token",
  )

  assert.equal(registration.claimTokenHash, sha256Hex(stepUp.body.claim_token))
  assert.equal(claim.viewTokenHash, sha256Hex(viewToken))
  assert.equal(claim.userCodeHash, sha256Hex(stepUp.body.claim.user_code))

  const serialized = JSON.stringify({ registration, claim })
  assert.doesNotMatch(serialized, new RegExp(stepUp.body.claim_token.slice(4)))
  assert.doesNotMatch(serialized, new RegExp(viewToken.slice(4)))
})

const { parseTrustedProviders } = await import("../lib/agent-auth/trust.ts")

test("the trust list drops anything it cannot safely fetch keys from", () => {
  const parsed = parseTrustedProviders(
    JSON.stringify([
      { iss: "https://good.example", name: "Good" },
      // No issuer at all.
      { name: "Nameless" },
      // Plain http on a public host: a key substitution away from forged
      // identities, so it never makes the list.
      { iss: "http://insecure.example", name: "Insecure" },
      // An https issuer pointing its keys at plain http is the same problem.
      { iss: "https://mixed.example", jwks_uri: "http://mixed.example/keys" },
      // A second entry for an issuer already on the list would make client_id
      // scoping depend on array order.
      { iss: "https://good.example", name: "Impostor", client_ids: ["anything"] },
      // Loopback stays allowed so the reference provider can run beside `next dev`.
      { iss: "http://localhost:4000", name: "Local" },
    ]),
  )

  assert.deepEqual(
    parsed.map((provider) => provider.issuer),
    ["https://good.example", "http://localhost:4000"],
  )
  // A missing jwks_uri defaults to the conventional path on the issuer, never
  // to anything an assertion could name.
  assert.equal(parsed[0].jwksUri, "https://good.example/.well-known/jwks.json")
  assert.equal(parsed[0].clientIds, undefined)
})

test("a malformed trust list trusts nobody rather than throwing at import time", () => {
  assert.deepEqual(parseTrustedProviders(undefined), [])
  assert.deepEqual(parseTrustedProviders(""), [])
  assert.deepEqual(parseTrustedProviders("{not json"), [])
  assert.deepEqual(parseTrustedProviders(JSON.stringify({ iss: "https://good.example" })), [])
})
