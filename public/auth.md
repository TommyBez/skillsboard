# auth.md

How an AI agent authenticates against Skills Board and gets a token for the
Skills Board MCP server at `https://www.skillsboard.sh/api/mcp`.

Last reviewed: 2026-08-22

## What kind of access this is

Skills Board issues **user-delegated** tokens only. Every token an agent can
use is one that resolves to an ordinary Skills Board account — the same account
its owner signs into with an email code. There is no separate "agent user", and
no anonymous agent identity: an agent with no human behind it cannot read a team
library here.

There are two ways to get there, and they end at the same place.

| | Agent Verified (`identity_assertion`) | Client authorization (`service_auth`) |
| --- | --- | --- |
| Who vouches for the user | The agent's own provider, with an ID-JAG | The user, in a browser on this site |
| First run | One approval on this site | One approval on this site |
| Later runs | No browser, no code | No browser, no code |
| Available to | Agents from a provider on the trust list | Any registered client |

Agent Verified is only available when the agent's provider is on the Skills
Board trust list. Read `agent_auth.identity_types_supported` in the
authorization server metadata: if it does not list `identity_assertion`, this
deployment trusts no provider yet and `service_auth` is the flow to run.

- Audience (RFC 8707 resource): `https://www.skillsboard.sh/api/mcp`
- Authorization server: `https://www.skillsboard.sh/api/auth`
- Protected resource metadata: `https://www.skillsboard.sh/.well-known/oauth-protected-resource`
- Authorization server metadata: `https://www.skillsboard.sh/.well-known/oauth-authorization-server`
- Identity endpoint: `https://www.skillsboard.sh/agent/identity`

## 1. Discover

Fetch the protected resource metadata:

```http
GET https://www.skillsboard.sh/.well-known/oauth-protected-resource
```

It names the `resource` identifier to request tokens for, the
`authorization_servers` that can mint them, and `scopes_supported`. Fetch the
authorization server metadata next; its `agent_auth` block is the
machine-readable source of truth for everything this file describes in prose.
It names `identity_endpoint`, `assertion_types_supported`, `claim_endpoint`,
`events_endpoint`, the registration entry point, and the agent scopes.

A call to `/api/mcp` without a usable token answers `401` with a
`WWW-Authenticate` header carrying `resource_metadata`, so an agent that skipped
discovery can recover from the challenge. `/agent/identity` answers its refusals
with the same challenge.

## 2. Register

Both flows need an OAuth client. Register once with RFC 7591 dynamic client
registration, at the `registration_endpoint` from the authorization server
metadata (currently `https://www.skillsboard.sh/api/auth/oauth2/register`).
Registration is open: no credential is needed to obtain one.

For Agent Verified, declare the JWT bearer grant. A client that did not register
for it is refused at the token endpoint with `unauthorized_client`.

```http
POST https://www.skillsboard.sh/api/auth/oauth2/register
Content-Type: application/json

{
  "client_name": "Your agent",
  "grant_types": ["urn:ietf:params:oauth:grant-type:jwt-bearer"],
  "scope": "skills:read skills:write",
  "token_endpoint_auth_method": "client_secret_basic"
}
```

For `service_auth`, register for `authorization_code` and `refresh_token`
instead, with the `redirect_uris` your agent listens on.

The response carries the `client_id` and, for a confidential client, the
`client_secret`. Store them; registering again on every run creates duplicate
clients the user has to approve separately.

## 3. Claim

### Agent Verified

Ask your own provider for an ID-JAG whose `aud` is
`https://www.skillsboard.sh/api/mcp`, then present it:

```http
POST https://www.skillsboard.sh/agent/identity
Content-Type: application/json

{
  "type": "identity_assertion",
  "assertion_type": "urn:ietf:params:oauth:token-type:id-jag",
  "assertion": "<ID-JAG>",
  "client_id": "<client_id>",
  "scope": "skills:read"
}
```

The ID-JAG has to carry `iss`, `sub`, `aud`, `exp`, `iat`, `jti`, `auth_time`,
and a verified identifier — `email` with `email_verified: true`. An `email`
claim on its own is not enough. Each `jti` is single-use.

On success:

```json
{
  "identity_assertion": "<service-signed JWT>",
  "assertion_expires": "2026-08-22T12:02:00.000Z",
  "scopes": ["skills:read"],
  "token_endpoint": "https://www.skillsboard.sh/api/auth/oauth2/token",
  "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer"
}
```

The assertion is short-lived, single-use, and bound to the `client_id` you sent.
It is not an access token — go to step 4.

Two refusals are not failures, and an agent has to tell them apart:

**`401 login_required`** — the user's `auth_time` at your provider is older than
Skills Board accepts (currently 3600 seconds), or the ID-JAG carried none. Have
your own provider re-authenticate the user and mint a fresh ID-JAG. Do not send
the user to Skills Board; there is nothing for them to do here.

**`401 interaction_required`** — a Skills Board account already uses this email
address, and nobody has yet confirmed that your provider's user is that account
holder. A verified email address finds a candidate account; it does not entitle
a provider to take it over. This happens once per `(provider, user)`.

```json
{
  "error": "interaction_required",
  "registration_id": "…",
  "claim_url": "https://www.skillsboard.sh/agent/identity/claim",
  "claim_token": "…",
  "claim": {
    "user_code": "KRTM-9PXW",
    "verification_uri": "https://www.skillsboard.sh/agent/claim",
    "verification_uri_complete": "https://www.skillsboard.sh/agent/claim/…",
    "interval": 5,
    "expires_in": 600
  }
}
```

Show the user `verification_uri` and `user_code` (or open
`verification_uri_complete`), and poll while they decide:

```http
POST https://www.skillsboard.sh/agent/identity/claim
Content-Type: application/json

{ "registration_id": "…", "claim_token": "…" }
```

Respect `interval`. The reply is `authorization_pending` until the user answers,
`access_denied` if they decline, and otherwise the same identity assertion body
as above. On the account holder's side this is the ordinary Skills Board email
code sign-in followed by one confirmation. **It happens once.** Every later
ID-JAG for the same `(iss, sub)` resolves straight through with no browser, no
code, and no human.

### Client authorization

There is no separate claim ceremony. Send the user to the
`authorization_endpoint` with PKCE (`S256` is the only supported challenge
method) and the `resource` parameter set to the MCP resource identifier:

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

## 4. Exchange

### Agent Verified

Exchange the identity assertion at the token endpoint under the RFC 7523 JWT
bearer grant, authenticating as the same client the assertion names:

```http
POST https://www.skillsboard.sh/api/auth/oauth2/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic <client_id:client_secret>

grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer
&assertion=<identity_assertion>
```

The reply is an ordinary OAuth token response:

```json
{
  "access_token": "…",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "skills:read"
}
```

No refresh token. The ID-JAG is the refresh mechanism: when the access token
expires, go back to your provider for a new ID-JAG and repeat steps 3 and 4.
That round trip is what re-checks that the user is still authenticated at your
provider, which a refresh token would quietly outlive.

### Client authorization

Exchange the authorization code at the `token_endpoint`, passing the same
`resource` value so the access token is audience-bound to the MCP server.
Requesting `offline_access` returns a refresh token.

## 5. Use

Send the access token as a bearer token in the `Authorization` header. That is
the only supported method. This server does not read tokens from the query
string or a form body.

```http
POST https://www.skillsboard.sh/api/mcp
Authorization: Bearer <access token>
Content-Type: application/json
```

A token from either flow is the same kind of token: it names a Skills Board
user, it carries scopes, and the API treats it identically. The only difference
is which scopes it can carry.

Scopes, and what they actually allow:

| Scope | What it grants | Agent Verified |
| --- | --- | --- |
| `openid` | Confirm the Skills Board identity | no |
| `profile` | Read the user's name and basic profile | no |
| `email` | Read the user's email address | no |
| `offline_access` | Receive a refresh token | no |
| `skills:read` | Required by every MCP tool: list and search team skills and collections, get install commands, discover public and repository skills | yes |
| `skills:write` | Save new skills, create collections, add or remove skills from a collection | yes |

An Agent Verified token carries `skills:read` and `skills:write` only, and
`skills:read` alone unless the agent asks for more. The identity scopes are
deliberately unavailable to it: the flow already established who the user is,
so an agent has no reason to read the profile back. Ask for the narrowest set
you need — `agent_auth.agent_scopes_supported` lists what is on offer.

Without `skills:read` the MCP endpoint answers `403`. The write tools return an
error asking the user to reconnect with write access when `skills:write` is
missing.

No token grants the ability to edit or delete a saved skill, to install a skill
into an agent, or to run one. Those are not capabilities this server has.

## 6. Handle revoke

Two things can be revoked, and they are not the same.

**One token.** Post it to the `revocation_endpoint` published in the
authorization server metadata, or let the user disconnect the agent from their
Skills Board account. After revocation the MCP endpoint answers `401` with the
same `WWW-Authenticate` challenge as an unauthenticated call. Treat that as
"start again at step 3": the client registration is still valid. Do not silently
re-register.

**The whole delegation.** A trusted agent provider can transmit a Security Event
Token to `agent_auth.events_endpoint`
(`https://www.skillsboard.sh/agent/events`, `application/secevent+jwt`, RFC
8935). A recognized revocation event ends the link between that
`(issuer, subject)` and the Skills Board account. After that, a fresh ID-JAG
does **not** reinstate it — `/agent/identity` answers `403 access_denied` until
the account holder approves the link again through the ceremony in step 3.

Skills Board does not push revocation events to agents; there is no
notification endpoint to subscribe to.

## Error codes at a glance

| Status | `error` | What to do |
| --- | --- | --- |
| 400 | `invalid_request` | Fix the request shape. |
| 401 | `invalid_client` | Register, or check the `client_id` you sent. |
| 400 | `invalid_grant` | The assertion failed verification, expired, or was already used. Mint a new one. |
| 400 | `invalid_target` | The ID-JAG's `aud` is not this service. |
| 401 | `login_required` | Re-authenticate the user **at your provider**, then retry. |
| 401 | `interaction_required` | Run the claim ceremony. Also returned as `authorization_pending` while polling. |
| 403 | `access_denied` | The user declined, the delegation was revoked, or no account exists for this address. |

## Where to read more

- Skill and tool reference: <https://www.skillsboard.sh/llms.txt>
- MCP server card: <https://www.skillsboard.sh/.well-known/mcp/server-card.json>
- Source: <https://github.com/TommyBez/skillsboard>
