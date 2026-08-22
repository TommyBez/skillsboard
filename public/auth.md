# auth.md

How an AI agent gets a token for the Skills Board MCP server at
`https://www.skillsboard.sh/api/mcp`.

Last reviewed: 2026-08-22

## What kind of access this is

Every token Skills Board issues acts for **one human being** — a Skills Board
account with access to real team libraries. There is no anonymous agent
identity, no machine-to-machine client credentials grant, and no email-only
registration. An agent with no human behind it cannot read a team library here.

There are two ways to reach that token, and which one applies depends on you:

- **Agent Verified (ID-JAG)** — if your Agent Provider is on this service's
  trust list, you assert the user's identity with an ID-JAG and exchange it for
  an access token. No browser is involved after the first link. Start at
  [Agent Verified](#agent-verified-id-jag).
- **OAuth client registration** — if it is not, register as an OAuth client and
  have the user approve the scopes in a browser. Start at
  [OAuth client registration](#oauth-client-registration).

Common facts for both:

- Audience (RFC 8707 resource): `https://www.skillsboard.sh/api/mcp`
- Authorization server: `https://www.skillsboard.sh/api/auth`
- Protected resource metadata: `https://www.skillsboard.sh/.well-known/oauth-protected-resource`
- Authorization server metadata: `https://www.skillsboard.sh/.well-known/oauth-authorization-server`

## 1. Discover

Fetch the protected resource metadata:

```http
GET https://www.skillsboard.sh/.well-known/oauth-protected-resource
```

It names the `resource` identifier to request tokens for, the
`authorization_servers` that can mint them, and `scopes_supported`. Fetch the
authorization server metadata next. Its `agent_auth` block is the machine
readable version of this file: it names the identity, claim and event endpoints,
the assertion types accepted, and — under
`agent_auth.identity_assertion.trusted_issuers` — the Agent Providers this
deployment trusts.

If `agent_auth.identity_endpoint` is absent, Agent Verified is switched off on
this deployment and OAuth client registration is the only path. Metadata here
never advertises a flow that would be refused.

A call to `/api/mcp` without a usable token answers `401` with a
`WWW-Authenticate` header carrying `resource_metadata`, so an agent that skipped
discovery can recover from the challenge.

## Agent Verified (ID-JAG)

Use this when you hold a session tied to a user identity at an Agent Provider
and can exchange it for an ID-JAG audience-bound to this service. Check that
your provider's `iss` appears in
`agent_auth.identity_assertion.trusted_issuers` first; if it does not, fall
back to [OAuth client registration](#oauth-client-registration) rather than
minting an assertion that will be refused.

### 2a. Mint the ID-JAG

Mint it with:

- `aud` = `https://www.skillsboard.sh/api/mcp` (the `resource` from the
  protected resource metadata, also published as
  `agent_auth.identity_assertion.audience`)
- `iss` = your provider's issuer URL, as it appears in the trust list
- `typ` = `oauth-id-jag+jwt`
- `email_verified: true` **or** `phone_number_verified: true`
- a fresh `jti`, a near-term `exp` (about 5 minutes), and `iat`
- `auth_time` — epoch seconds of the user's last authentication at your
  provider. **Required.** Assertions older than
  `agent_auth.identity_assertion.max_auth_age` (currently 3600 seconds) are
  refused.

Signatures must be `RS256`, `PS256`, `ES256` or `EdDSA`, with a `kid` resolvable
from the JWKS this service holds for your issuer.

### 3a. Register the identity

```http
POST https://www.skillsboard.sh/agent/identity
Content-Type: application/json

{
  "type": "identity_assertion",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<your ID-JAG JWT>",
  "scope": "skills:read"
}
```

`scope` is optional. Omitted, the registration is authorized for every scope the
profile supports; supplied, it must be a subset of
`agent_auth.identity_assertion.scopes_supported`, and the resulting token can
never carry more than what you asked for here. Ask for the least you need.

There are three answers.

**200 — nothing else needed.** The `(iss, sub, aud)` triple already maps to a
Skills Board account, or the deployment provisioned one.

```json
{
  "registration_id": "reg_...",
  "registration_type": "identity_assertion",
  "identity_assertion": "<service-signed JWT>",
  "assertion_expires": "2026-08-22T13:00:00.000Z",
  "scopes": ["skills:read"]
}
```

Keep `identity_assertion` and go to [4a](#4a-exchange-the-assertion).

**401 `interaction_required` — the user has to confirm once.** The assertion's
verified email matches an existing Skills Board account, but no delegation
exists yet for your `(iss, sub, aud)`. This service will not link the two
silently.

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: AgentAuth error="interaction_required", error_description="..."

{
  "error": "interaction_required",
  "registration_id": "reg_...",
  "registration_type": "identity_assertion",
  "claim_url": "https://www.skillsboard.sh/agent/identity/claim",
  "claim_token": "clm_...",
  "claim_token_expires": "...",
  "post_claim_scopes": ["skills:read"],
  "claim": {
    "user_code": "123456",
    "expires_in": 600,
    "verification_uri": "https://www.skillsboard.sh/agent/claim?claim_attempt_token=cvt_...",
    "interval": 5
  }
}
```

Go to [3b](#3b-hand-off-to-the-user).

**401 `login_required` — go back to your provider.** `auth_time` is missing or
older than `max_age`. Nothing the user does at Skills Board fixes this: the
freshness has to be re-established upstream, so re-authenticate the user at your
provider (`prompt=login` or equivalent) and mint a new ID-JAG. Do not send the
user to Skills Board for this.

```json
{
  "error": "login_required",
  "error_description": "auth_time is ...s old; max allowed is 3600s. ...",
  "max_age": 3600
}
```

### 3b. Hand off to the user

Show `verification_uri` and `user_code` to the user in one message. Suggested
copy:

> Open this link, sign in to Skills Board, and enter this code: **123456**
> https://www.skillsboard.sh/agent/claim?claim_attempt_token=...

Be explicit that the code goes into the page they land on, not back to you. The
user opens the link, signs in with the ordinary Skills Board email one-time
code, lands on a page naming your provider and the scopes you asked for, types
the `user_code`, and confirms.

The ceremony is bound to the account the assertion matched. Someone signed in as
anyone else is refused, so a leaked link plus a leaked code still cannot attach
your agent to a different account.

While you wait, poll the token endpoint with the claim grant, honouring
`interval`:

```http
POST https://www.skillsboard.sh/api/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:workos:agent-auth:grant-type:claim
&claim_token=clm_...
```

- `{ "error": "authorization_pending" }` — not yet; wait `interval` seconds.
- `{ "error": "expired_token" }` — the code window closed. `POST` to
  `claim_url` with the same `claim_token` and the same email to mint a fresh
  `user_code` and `verification_uri`, then resume polling. A `410
  claim_expired` there means start over at [3a](#3a-register-the-identity).
- Success — a normal token response plus an `identity_assertion` you can refresh
  with:

```json
{
  "access_token": "<token>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "skills:read",
  "identity_assertion": "<service-signed JWT>",
  "assertion_expires": "..."
}
```

After the user confirms once, every later ID-JAG for the same
`(iss, sub, aud)` takes the 200 path. No browser, no code, no email.

### 4a. Exchange the assertion

```http
POST https://www.skillsboard.sh/api/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer
&assertion=<identity_assertion>
&resource=https%3A%2F%2Fwww.skillsboard.sh%2Fapi%2Fmcp
```

The same assertion mints as many access tokens as you need until it expires.
There is no refresh token in this flow — re-exchanging the assertion is the
refresh. When the assertion expires, or the exchange answers `invalid_grant`,
start again at [3a](#3a-register-the-identity) with a fresh ID-JAG.

Errors here use OAuth vocabulary: `invalid_grant` (expired, revoked, or
unconfirmed), `invalid_scope` (asked for more than the registration was
authorized for), `invalid_target` (a `resource` other than the MCP server).

Go to [Use the token](#use-the-token).

## OAuth client registration

Use this when your provider is not on the trust list, or when there is no
provider at all — a desktop MCP client, for example.

### 2b. Register

Register with RFC 7591 dynamic client registration at the
`registration_endpoint` from the authorization server metadata (currently
`https://www.skillsboard.sh/api/auth/oauth2/register`). Registration is open: no
credential is needed to obtain one.

```http
POST https://www.skillsboard.sh/api/auth/oauth2/register
Content-Type: application/json

{
  "client_name": "Your agent",
  "redirect_uris": ["https://your-agent.example/callback"],
  "grant_types": ["authorization_code", "refresh_token"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "client_secret_basic"
}
```

The response carries the `client_id` and, for a confidential client, the
`client_secret`. Store them; registering again on every run creates duplicate
clients the user has to approve separately.

### 3c. Authorize

The user proves the agent is theirs by completing the authorization code flow in
a browser: they sign in to Skills Board, see which team libraries and scopes are
being requested, and approve.

Send the user to the `authorization_endpoint` with PKCE (`S256` is the only
supported challenge method) and the `resource` parameter set to the MCP resource
identifier:

```http
GET https://www.skillsboard.sh/api/auth/oauth2/authorize
  ?response_type=code
  &client_id=<client_id>
  &redirect_uri=<your redirect uri>
  &scope=openid%20profile%20email%20offline_access%20skills%3Aread
  &resource=https%3A%2F%2Fwww.skillsboard.sh%2Fapi%2Fmcp
  &code_challenge=<S256 challenge>
  &code_challenge_method=S256
  &state=<state>
```

### 4b. Exchange

Exchange the authorization code at the `token_endpoint`, passing the same
`resource` value so the access token is audience-bound to the MCP server.
Requesting `offline_access` returns a refresh token, which is what keeps the
agent working after the user closes the client.

## Use the token

Send the access token as a bearer token in the `Authorization` header. That is
the only supported method. This server does not read tokens from the query
string or a form body.

```http
POST https://www.skillsboard.sh/api/mcp
Authorization: Bearer <access token>
Content-Type: application/json
```

The endpoint resolves the same Skills Board user either way. A tool cannot tell
whether the token came from an ID-JAG or a browser consent screen, and does not
try: it sees an authenticated user and a set of scopes.

Scopes, and what they actually allow:

| Scope | What it grants |
| --- | --- |
| `openid` | Confirm the Skills Board identity |
| `profile` | Read the user's name and basic profile |
| `email` | Read the user's email address |
| `offline_access` | Receive a refresh token |
| `skills:read` | Required by every MCP tool: list and search team skills and collections, get install commands, discover public and repository skills |
| `skills:write` | Save new skills, create collections, add or remove skills from a collection |

Agent Verified credentials are limited to `skills:read` and `skills:write`. The
identity scopes and `offline_access` belong to the browser flow: an ID-JAG
already carries the user's identity, and re-exchanging the assertion replaces
the refresh token.

Without `skills:read` the MCP endpoint answers `403`. The write tools return an
error asking for write access when `skills:write` is missing.

No token grants the ability to edit or delete a saved skill, to install a skill
into an agent, or to run one. Those are not capabilities this server has.

## Handle revoke

Two independent layers can take away what you are holding.

**Credential layer (RFC 7009).** You can revoke a single credential yourself:

```http
POST https://www.skillsboard.sh/oauth2/revoke
Content-Type: application/x-www-form-urlencoded

token=<access token or identity assertion>&token_type_hint=access_token
```

Always answers `200`, including for a token that was never valid. Revoking an
access token leaves your `identity_assertion` intact — exchange it again for a
new one. Revoking the `identity_assertion` closes the refresh path, so start
again at [3a](#3a-register-the-identity).

**Delegation layer.** A user can disconnect an agent at any time, and a trusted
Agent Provider can push an RFC 8417 Security Event Token to
`agent_auth.events_endpoint` (`https://www.skillsboard.sh/agent/event/notify`)
to revoke the delegation upstream. You do not call this; you discover it when
`/api/mcp` answers `401` and the exchange then answers `invalid_grant`.

On a `401` for a previously working access token: try the exchange once with
your current assertion. If it succeeds, the credential was revoked and your new
token works. If it answers `invalid_grant`, the delegation is gone — go back to
[3a](#3a-register-the-identity) with a fresh ID-JAG, and expect the user to
confirm again.

## Where to read more

- Skill and tool reference: <https://www.skillsboard.sh/llms.txt>
- MCP server card: <https://www.skillsboard.sh/.well-known/mcp/server-card.json>
- The auth.md profile this implements: <https://github.com/workos/auth.md>
- Source: <https://github.com/TommyBez/skillsboard>
