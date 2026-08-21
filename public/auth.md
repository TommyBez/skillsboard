# auth.md

How an AI agent registers with Skills Board and gets a token for the Skills
Board MCP server at `https://www.skillsboard.sh/api/mcp`.

Last reviewed: 2026-08-21

## What kind of access this is

Skills Board issues **user-delegated** tokens only. An agent gets credentials of
its own by registering as an OAuth client, but every token it can use is one a
signed-in teammate approved for their own team libraries. There is no anonymous
agent identity, no machine-to-machine client credentials grant, and no identity
assertion (ID-JAG) exchange. An agent with no human behind it cannot read a team
library here.

- Audience (RFC 8707 resource): `https://www.skillsboard.sh/api/mcp`
- Authorization server: `https://www.skillsboard.sh/api/auth`
- Protected resource metadata: `https://www.skillsboard.sh/.well-known/oauth-protected-resource/api/mcp`
- Origin-level discovery entry point:
  `https://www.skillsboard.sh/.well-known/oauth-protected-resource`
- Authorization server metadata: `https://www.skillsboard.sh/.well-known/oauth-authorization-server`

## 1. Discover

Fetch the protected resource metadata for the MCP server:

```http
GET https://www.skillsboard.sh/.well-known/oauth-protected-resource/api/mcp
```

It names the `resource` identifier to request tokens for, the
`authorization_servers` that can mint them, and `scopes_supported`. Fetch the
authorization server metadata next; its `agent_auth` block repeats the
registration entry point in machine-readable form and links back to this file.

That path is not decoration. RFC 9728 builds a metadata URL by inserting
`/.well-known/oauth-protected-resource` between the resource identifier's host
and its path, and a client MUST reject a document whose `resource` is not the
identifier it asked about. So `https://www.skillsboard.sh/api/mcp` is described
at `/.well-known/oauth-protected-resource/api/mcp`, and the origin-level
document at `/.well-known/oauth-protected-resource` describes the origin
itself — the entry point for an agent that starts with nothing but a hostname.
Both name the same authorization server and the same scopes. Only the one above
names the audience: send `resource=https://www.skillsboard.sh/api/mcp` on the
token request, because any other value is rejected with `invalid_target`.

A call to `/api/mcp` without a usable token answers `401` with a
`WWW-Authenticate` header carrying `resource_metadata`, pointing at that same
document, so an agent that skipped discovery can recover from the challenge.

## 2. Register

Register as an OAuth client with RFC 7591 dynamic client registration, at the
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

## 3. Claim

There is no separate claim ceremony. The user proves the agent is theirs by
completing the authorization code flow in a browser: they sign in to Skills
Board, see which team libraries and scopes are being requested, and approve.

Send the user to the `authorization_endpoint` with PKCE (`S256` is the only
supported challenge method) and the `resource` parameter set to the MCP
resource identifier:

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

Exchange the authorization code at the `token_endpoint`, passing the same
`resource` value so the access token is audience-bound to the MCP server.
Requesting `offline_access` returns a refresh token, which is what keeps the
agent working after the user closes the client.

## 5. Use

Send the access token as a bearer token in the `Authorization` header. That is
the only supported method. This server does not read tokens from the query
string or a form body.

```http
POST https://www.skillsboard.sh/api/mcp
Authorization: Bearer <access token>
Content-Type: application/json
```

Scopes, and what they actually allow:

| Scope | What it grants |
| --- | --- |
| `openid` | Confirm the Skills Board identity |
| `profile` | Read the user's name and basic profile |
| `email` | Read the user's email address |
| `offline_access` | Receive a refresh token |
| `skills:read` | Required by every MCP tool: list and search team skills and collections, get install commands, discover public and repository skills |
| `skills:write` | Save new skills, create collections, add or remove skills from a collection |

Without `skills:read` the MCP endpoint answers `403`. The write tools return an
error asking the user to reconnect with write access when `skills:write` is
missing.

No token grants the ability to edit or delete a saved skill, to install a skill
into an agent, or to run one. Those are not capabilities this server has.

## 6. Handle revoke

A user can disconnect an agent from their Skills Board account at any time, and
tokens can be revoked at the `revocation_endpoint` published in the
authorization server metadata. After revocation the MCP endpoint answers `401`
with the same `WWW-Authenticate` challenge as an unauthenticated call. Treat
that as "start again at step 3": the client registration is still valid, so a
new authorization code flow is enough. Do not silently re-register.

Skills Board does not push revocation events to agents; there is no
notification endpoint to subscribe to.

## Where to read more

- Skill and tool reference: <https://www.skillsboard.sh/llms.txt>
- MCP server card: <https://www.skillsboard.sh/.well-known/mcp/server-card.json>
- Source: <https://github.com/TommyBez/skillsboard>
