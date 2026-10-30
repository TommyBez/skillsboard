# MCP runtime suite

`mcp-runtime.spec.ts` drives what an MCP client meets at `/api/mcp`: the 401
challenge, dynamic client registration for a native loopback client, browser
consent, a PKCE code exchange, `initialize`, `tools/list`, one read and one
write tool call, and the path guard that keeps every other `/api/<segment>`
(including `/api/sse`) from acting as MCP. CI runs it in the `MCP runtime` job
against a Postgres service container.

Run it locally against a throwaway database, never one shared with real users:

```sh
export DATABASE_URL=postgres://postgres@localhost:5432/skillsboard_mcp_e2e
export DATABASE_URL_UNPOOLED=$DATABASE_URL
export BETTER_AUTH_URL=http://localhost:3100 BETTER_AUTH_SECRET=$(openssl rand -hex 32)
export VERCEL_ENV=development   # dev OTP bypass; no email is sent
pnpm db:migrate && pnpm exec next build && pnpm test:mcp
```

`pnpm test:mcp` starts `next start -p 3100` itself (or reuses one already on
:3100 outside CI). The suite refuses non-loopback `BASE_URL`s, and deletes the
user, team, OAuth client, skill and collection it created when it finishes.
Set `MCP_E2E_VIDEO_DIR=<dir>` to record a paced `.webm` of the run.
