# SkillsBoard MCP installation guide

SkillsBoard ships a built-in [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server that gives AI agents read-only access to the skills saved in your team libraries, plus discovery of the public [skills.sh](https://skills.sh) catalog. This guide covers how to connect it to the most common MCP clients.

## The short version

1. Sign in to SkillsBoard and open **Settings → MCP** (`/settings/mcp`). The page shows your exact endpoint URL and a ready-to-copy config.
2. Add the endpoint to your MCP client (instructions per client below).
3. On first use, your browser opens a SkillsBoard consent screen. Approve it and the client is connected.

No API key is needed — authentication uses OAuth 2.0 with dynamic client registration, so any spec-compliant client can register itself and complete the browser flow automatically.

## Server details

| | |
| --- | --- |
| Endpoint | `https://<your-skillsboard-domain>/api/mcp` |
| Transport | Streamable HTTP (SSE is not supported) |
| Authentication | OAuth 2.0 (authorization code + PKCE, dynamic client registration) |
| Scopes | `openid`, `profile`, `email`, `offline_access` |
| Access level | Read-only |

The server advertises its authorization server via the standard `/.well-known/oauth-protected-resource/api/mcp` metadata endpoint, so clients discover the OAuth configuration on their own — you only ever need the endpoint URL.

Replace `<your-skillsboard-domain>` in the examples below with the host of your SkillsBoard deployment. The **Settings → MCP** page always shows the URL for the deployment you're signed in to.

## Available tools

| Tool | Description |
| --- | --- |
| `list_skills` | List every skill saved across your team libraries |
| `search_skills` | Search saved skills by name, description, repository, or tag |
| `get_skill_command` | Return the `npx skills add …` install command for a saved skill |
| `discover_skills` | Search the public skills.sh catalog or browse its trending / hot / all-time leaderboards |

All tools operate as the user who approved the connection — agents see the same libraries you see, and nothing more.

## Client setup

### Claude Code

```bash
claude mcp add --transport http skills-board https://<your-skillsboard-domain>/api/mcp
```

Then run `/mcp` inside Claude Code to trigger the sign-in flow. Your browser opens the SkillsBoard consent screen; approve it and the tools become available.

### Claude Desktop and claude.ai

1. Go to **Settings → Connectors → Add custom connector**.
2. Name it `SkillsBoard` and paste `https://<your-skillsboard-domain>/api/mcp` as the URL.
3. Click **Connect** and approve the consent screen in your browser.

### Cursor

Add the server to `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` for all projects):

```json
{
  "mcpServers": {
    "skills-board": {
      "url": "https://<your-skillsboard-domain>/api/mcp"
    }
  }
}
```

Cursor shows a **Needs login** prompt for the server — click it to complete the OAuth flow.

### VS Code (GitHub Copilot)

Add the server to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "skills-board": {
      "type": "http",
      "url": "https://<your-skillsboard-domain>/api/mcp"
    }
  }
}
```

VS Code prompts you to authorize the server the first time Copilot uses it.

### Other clients

Any MCP client that supports streamable HTTP with OAuth works. The generic config — the same one the **Settings → MCP** page generates for copy-paste — is:

```json
{
  "mcpServers": {
    "skills-board": {
      "url": "https://<your-skillsboard-domain>/api/mcp"
    }
  }
}
```

## Local development

When running SkillsBoard locally (`pnpm dev`), the same server is available at `http://localhost:3000/api/mcp`. The OAuth flow works locally too — the consent screen is served by your dev instance, so you need an account on it.

## Troubleshooting

- **401 Unauthorized** — the access token is missing or expired. Re-run your client's sign-in flow (`/mcp` in Claude Code, the login prompt in Cursor/VS Code). Tokens refresh automatically when the client requested the `offline_access` scope.
- **Client can't connect / protocol errors** — make sure the client is using streamable HTTP, not SSE. The server intentionally disables the SSE transport.
- **Consent screen never appears** — check that your client supports OAuth with dynamic client registration; older clients that only support static API keys can't connect.
- **A tool returns no skills** — the connection is scoped to the account that approved it. Verify you approved consent with the account whose team libraries you expect to see.

## Revoking access

Access is tied to your SkillsBoard session's OAuth grant. To disconnect an agent, remove the server from your client's configuration; the client's tokens stop being refreshed and expire on their own.
