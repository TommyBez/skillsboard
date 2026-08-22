import { SignJWT, exportJWK, generateKeyPair } from "jose"

import "./register-app-aliases.mjs"

const { registrationIdFor, sha256Hex } = await import("../../lib/agent-auth/store.ts")

/**
 * In-memory implementations of the two boundaries the auth.md protocol code
 * talks to — the store and the Better Auth user resolver — plus a fake Agent
 * Provider that mints real, really-signed ID-JAGs.
 *
 * The protocol modules themselves are the production ones: these tests exercise
 * the same `verifyIdJag`, `matchOrProvision`, `findOrCreateIdJagRegistration`,
 * `completeClaim` and grant handlers the running server uses.
 */

export function createMemoryStore() {
  const delegations = new Map()
  const registrations = new Map()
  const claims = new Map()
  const jtis = new Map()
  const revocations = new Map()

  const identityKey = (key) => `${key.issuer}|${key.subject}|${key.audience}`

  const store = {
    // Exposed so a test can assert on state the protocol wrote.
    _delegations: delegations,
    _registrations: registrations,
    _claims: claims,

    async findDelegation(key) {
      return delegations.get(identityKey(key)) ?? null
    },
    async findDelegationById(id) {
      for (const delegation of delegations.values()) if (delegation.id === id) return delegation
      return null
    },
    async upsertDelegation(input) {
      const key = identityKey(input)
      const now = new Date()
      const existing = delegations.get(key)
      if (existing) {
        Object.assign(existing, {
          userId: input.userId,
          providerName: input.providerName,
          updatedAt: now,
          lastSeenAt: now,
          revokedAt: null,
        })
        return existing
      }
      const created = {
        id: `del_${delegations.size + 1}`,
        userId: input.userId,
        issuer: input.issuer,
        subject: input.subject,
        audience: input.audience,
        providerName: input.providerName,
        createdAt: now,
        updatedAt: now,
        lastSeenAt: now,
        revokedAt: null,
      }
      delegations.set(key, created)
      return created
    },
    async touchDelegation(id) {
      const delegation = await store.findDelegationById(id)
      if (delegation) delegation.lastSeenAt = new Date()
    },
    async revokeDelegation(key) {
      const now = new Date()
      let revokedRegistrations = 0
      for (const registration of registrations.values()) {
        if (identityKey(registration) !== identityKey(key) || registration.revokedAt) continue
        registration.status = "revoked"
        registration.revokedAt = now
        registration.claimTokenHash = null
        registration.claimTokenExpiresAt = null
        revokedRegistrations += 1
        for (const claim of claims.values()) {
          if (claim.registrationId === registration.id && claim.status === "pending") {
            claim.status = "superseded"
          }
        }
      }
      const delegation = delegations.get(identityKey(key))
      if (delegation) delegation.revokedAt = now
      return { delegations: delegation ? 1 : 0, registrations: revokedRegistrations }
    },

    async findRegistrationById(id) {
      return registrations.get(id) ?? null
    },
    async findRegistrationByIdentity(key) {
      return registrations.get(registrationIdFor(key)) ?? null
    },
    async findRegistrationByClaimTokenHash(hash) {
      for (const registration of registrations.values()) {
        if (registration.claimTokenHash === hash) return registration
      }
      return null
    },
    async createRegistration(record) {
      const created = { ...record }
      registrations.set(created.id, created)
      return created
    },
    async updateRegistration(id, patch) {
      const registration = registrations.get(id)
      if (!registration) throw new Error(`registration ${id} not found`)
      Object.assign(registration, patch, { updatedAt: new Date() })
      return registration
    },

    async latestClaim(registrationId) {
      const found = [...claims.values()]
        .filter((claim) => claim.registrationId === registrationId)
        .sort((a, b) => b.createdAt - a.createdAt)
      return found[0] ?? null
    },
    async findClaimByViewTokenHash(hash) {
      for (const claim of claims.values()) if (claim.viewTokenHash === hash) return claim
      return null
    },
    async createClaim(record) {
      const created = { ...record }
      claims.set(created.id, created)
      return created
    },
    async updateClaim(id, patch) {
      const claim = claims.get(id)
      if (!claim) throw new Error(`claim ${id} not found`)
      Object.assign(claim, patch)
      return claim
    },
    async supersedeClaims(registrationId) {
      for (const claim of claims.values()) {
        if (claim.registrationId === registrationId && claim.status === "pending") {
          claim.status = "superseded"
        }
      }
    },

    async recordJti(jti, purpose, expiresAt) {
      const key = `${purpose}|${jti}`
      const now = Date.now()
      for (const [seen, expiry] of jtis) if (expiry < now) jtis.delete(seen)
      if (jtis.has(key)) return "replay"
      jtis.set(key, expiresAt.getTime())
      return "ok"
    },

    async revokeCredential(input) {
      revocations.set(input.jti, input)
    },
    async isCredentialRevoked(jti) {
      return revocations.has(jti)
    },
  }

  return store
}

export function createMemoryUsers(seed = []) {
  const users = new Map()
  for (const user of seed) users.set(user.id, { ...user })

  return {
    _users: users,
    async findVerifiedUserByEmail(email) {
      const needle = email.trim().toLowerCase()
      for (const user of users.values()) {
        if (user.emailVerified && user.email.toLowerCase() === needle) return user
      }
      return null
    },
    async findUserById(id) {
      return users.get(id) ?? null
    },
    async createUser(input) {
      const created = {
        id: `user_${users.size + 1}`,
        email: input.email.toLowerCase(),
        emailVerified: true,
        name: input.name ?? null,
      }
      users.set(created.id, created)
      return created
    },
  }
}

const ID_JAG_TYP = "oauth-id-jag+jwt"

/**
 * A fake Agent Provider with a real ES256 key pair. `mint()` produces genuine
 * signed ID-JAGs, so the verifier under test runs its real signature path; the
 * "invalid signature" case uses a second key that is never published.
 */
export async function createProvider(options = {}) {
  const issuer = options.issuer ?? "https://provider.test"
  const displayName = options.displayName ?? "Test Provider"
  const jwksUri = options.jwksUri ?? `${issuer}/.well-known/jwks.json`

  const { privateKey, publicKey } = await generateKeyPair("ES256", { extractable: true })
  const publicJwk = { ...(await exportJWK(publicKey)), alg: "ES256", use: "sig", kid: "test-key-1" }

  const rogue = await generateKeyPair("ES256", { extractable: true })

  let counter = 0

  async function mint(claims = {}, signingKey = privateKey, header = {}) {
    counter += 1
    const nowSeconds = Math.floor(Date.now() / 1000)
    const payload = {
      iss: issuer,
      sub: "provider-subject-1",
      aud: options.audience ?? "http://localhost:3000/api/mcp",
      jti: `jti-${counter}-${Math.random().toString(36).slice(2)}`,
      iat: nowSeconds,
      exp: nowSeconds + 300,
      auth_time: nowSeconds - 30,
      client_id: "agent-app-1",
      email: "known@example.com",
      email_verified: true,
      name: "Known User",
      amr: ["otp"],
      ...claims,
    }
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "ES256", kid: publicJwk.kid, typ: ID_JAG_TYP, ...header })
      .sign(signingKey)
  }

  return {
    issuer,
    displayName,
    jwksUri,
    publicJwk,
    trustEntry: { iss: issuer, name: displayName, jwks_uri: jwksUri },
    mint,
    /** Signs with a key this provider never published. */
    mintWithRogueKey: (claims = {}) => mint(claims, rogue.privateKey),
    /** Signs a Security Event Token instead of an ID-JAG. */
    mintSecurityEvent: (claims = {}) =>
      mint(claims, privateKey, { typ: "secevent+jwt" }),
  }
}

export { registrationIdFor, sha256Hex }
