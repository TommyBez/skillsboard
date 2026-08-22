# auth.md Agent Verified (ID-JAG)

How an agent acting for a Skills Board user gets a scoped API token without a
browser, and where that sits relative to Better Auth.

The protocol is the WorkOS **auth.md** profile
([workos/auth.md](https://github.com/workos/auth.md)); the parts of its
`agent-services` reference implementation that define the protocol — discovery,
ID-JAG validation, provider trust, replay protection, the claim ceremony, the
service-signed `identity_assertion`, token-exchange and revocation semantics —
were ported here. The parts that were demo scaffolding — its in-memory user
table, its own key file, its mock login page, its own credential store — were
not: those are Better Auth's job and stayed Better Auth's job.

The agent-facing contract lives in `public/auth.md`. This file is for people
working on the implementation.

## The one thing to hold onto

There is exactly one kind of Skills Board user, and both doors open onto it:

```
Human:  email → OTP → Better Auth session → user
Agent:  Agent Provider ID-JAG → delegation → the same user → scoped OAuth token
```

`/api/mcp` cannot tell the two apart, and does not try. It verifies a Better
Auth JWT, reads `sub` and `scope`, and works with the user it finds. No
`AgentUser`, no parallel identity, no second token infrastructure.

## Where the boundary runs

| Better Auth owns | The auth.md layer owns |
| --- | --- |
| `user`, `session`, email OTP, web sessions | ID-JAG verification and provider trust |
| The OAuth/OIDC provider, `/oauth2/token`, `/oauth2/revoke` | The delegation `(iss, sub, aud) → userId` |
| JWKS and every signature, agent tokens included | Registration and claim-ceremony state |
| Issuing and binding the access token | The service-signed `identity_assertion` |

The join is three small adapters, all in `lib/agent-auth/`:

- `user-resolver.ts` — the only way the protocol reaches a human. Backed by
  Better Auth's internal adapter, the same path email OTP sign-in uses.
- `store.ts` / `store-db.ts` — the protocol's own state, as an interface with a
  Drizzle implementation. The interface exists so the tests can run every
  security branch in memory, and so the protocol code holds no ORM.
- `oauth.ts` — the two grants, registered on Better Auth's existing token
  endpoint through `extendOAuthProvider`. Better Auth mints the token.

## The flow

```
agent ──POST /agent/identity {ID-JAG}──▶ verify issuer against the trust list
                                        verify signature against that issuer's JWKS
                                        validate iss/sub/aud/exp/iat/jti/kid/alg
                                        burn the jti
                                        require a verified email or phone
                                        require fresh auth_time
                                                │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                   delegation exists    email matches an    nobody matches
                              │          account, but no          │
                              │          delegation yet           ▼
                              │                 │         registration policy
                              ▼                 ▼          (JIT off by default)
                   200 identity_assertion   401 interaction_required
                              │                 │
                              │                 ▼
                              │       user opens verification_uri
                              │       → /sign-in → email OTP → session
                              │       → /agent/claim → types user_code
                              │       → delegation persisted
                              │                 │
                              └────────┬────────┘
                                       ▼
                        POST /oauth2/token (RFC 7523 jwt-bearer)
                                       ▼
                        Better Auth issues a scoped JWT access token
                                       ▼
                                   /api/mcp
```

## Two 401s that mean opposite things

This is the distinction most worth preserving, and the one the tests guard
hardest:

- **`login_required`** — `auth_time` is missing or older than
  `idJagMaxAuthAgeSeconds`. The *provider's* authentication is stale. Nothing
  the user does at Skills Board fixes it, so no ceremony is minted and no
  verification URL is returned. The agent must re-authenticate the user
  upstream and mint a fresh ID-JAG.
- **`interaction_required`** — the ID-JAG is perfectly valid, and its verified
  email matches an existing account, but no delegation exists for this
  `(iss, sub, aud)`. *This* is where Better Auth's email OTP is used: the human
  signs in here and confirms the link.

Collapsing the two would either send users to sign in over a problem signing in
cannot solve, or skip the confirmation that stops a trusted provider from
asserting a victim's verified address and inheriting their account.

## Trust is configuration

`AGENT_AUTH_TRUSTED_PROVIDERS` is the whole trust story: a JSON array of
issuers, their display names, and where their keys live. Nothing inside an
incoming assertion can add an issuer or move a key source — no `iss` bootstrap,
no `jku`, no embedded `jwk`. A provider dropped from the list stops verifying
immediately, and its live credentials stop working at the resource server on the
next request.

With the list empty the flow is off, and discovery says so: the `agent_auth`
block omits the identity endpoint entirely rather than advertising a path that
would only ever answer `issuer_not_enabled`.

## Revocation against self-contained tokens

Agent access tokens are JWTs, because that is what `/api/mcp` verifies. A JWT
has no row to flip, so revocation works on two layers:

- **Credential layer** — `/oauth2/revoke` records the credential's `jti` as a
  tombstone that expires when the credential would have. `refuseAgentCredential`
  checks it on every MCP call.
- **Delegation layer** — a provider Security Event Token at
  `/agent/event/notify`, or any revocation of the delegation, marks the
  delegation and its registration revoked. The token endpoint refuses to issue
  against it, and the resource server refuses tokens already issued.

A revoked delegation is treated as *absent* rather than as a permanent error: a
fresh ID-JAG can start a new confirmation ceremony, so a user who revoked by
mistake can re-authorize, and no credential is ever issued in the meantime.

## Registration policy

JIT provisioning is off by default (`AGENT_AUTH_ALLOW_JIT_PROVISIONING`). A
Skills Board user is only useful inside a team library and an agent has no way
to be invited into one, so an account created by an unattended process would be
an orphan. An ID-JAG that matches nobody is refused with
`registration_not_allowed`; the human signs up normally first.

## Flows deliberately not implemented

auth.md also defines anonymous registration and email-only (`service_auth`)
registration. Neither is implemented: `/agent/identity` answers
`anonymous_not_enabled` and `service_auth_not_enabled`, and discovery never
advertises them. The code is shaped so adding one later means a new branch in
`handleIdentityRequest` plus a registration `type`, not a rewrite — the
registration, ceremony and token-exchange machinery is already type-agnostic.

## Tests

- `tests/agent-auth-id-jag.test.mjs` — the protocol against in-memory
  boundaries, with a real signing provider. Every security branch: bad issuer,
  bad signature, `alg: none`, wrong audience, expiry, replay, stale and future
  `auth_time`, unverified identity, `client_id` scoping, silent-link
  prevention, ceremony hijacking, code-guess budget, scope narrowing,
  revocation at all three layers.
- `tests/agent-auth-end-to-end.test.mjs` — the same flow against a live Better
  Auth instance on the in-memory adapter, exercising the real plugin, the real
  JWKS, the real grants and the real `issueTokens`. It verifies the issued
  token the way `/api/mcp` does.
