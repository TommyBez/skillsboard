import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"

/**
 * The parts of the MCP Server Card (SEP-1649) that describe this server rather
 * than the deployment serving it. Endpoints stay in the route handler, where
 * the running origin is known.
 *
 * These repeat `server.json`, the MCP registry manifest at the repo root. The
 * values are written out rather than imported from it so this module stays a
 * plain TypeScript import in every runtime that loads it; the
 * `mcp-server-card` unit test reads `server.json` and fails when the two
 * disagree.
 */
/** The schema the committed `server.json` declares, repeated for the served copy. */
export const MCP_SERVER_SCHEMA =
  "https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json"

export const mcpServerInfo = {
  name: "io.github.TommyBez/skillsboard",
  title: "Skills Board",
  version: "1.0.0",
  description:
    "Search your team's shared AI-skill library, get install commands, and save skills from your agent.",
  websiteUrl: "https://www.skillsboard.sh",
  repository: {
    url: "https://github.com/TommyBez/skillsboard",
    source: "github",
  },
} as const

/**
 * What the server implements. Prompts and resources are absent because this
 * server registers neither — declaring them would send an agent looking for a
 * list it will never get.
 */
/** Every scope the card advertises, with the sentence the consent screen shows. */
export function mcpScopeSummaries() {
  return oauthScopes.map((scope) => ({
    scope,
    description: oauthScopeDescriptions[scope],
  }))
}

export const mcpServerCapabilities = {
  tools: { listChanged: false },
} as const

export interface McpToolSummary {
  name: string
  title: string
  description: string
  /** Every tool needs `skills:read`; the write tools also need `skills:write`. */
  requiredScopes: readonly string[]
}

const READ = ["skills:read"] as const
const WRITE = ["skills:read", "skills:write"] as const

/**
 * The tools the server registers, in the order it registers them.
 *
 * Kept beside the route rather than derived from it: the handler builds its
 * tools inside a request-scoped closure that needs a database and a verified
 * token, which is not something a static discovery document can call. The
 * `mcp-server-card` unit test parses `app/api/[transport]/route.ts` and fails
 * when the two lists drift.
 */
export const mcpToolSummaries: readonly McpToolSummary[] = [
  {
    name: "list_skills",
    title: "List team skills",
    description: "List every skill saved across the authenticated user's team libraries",
    requiredScopes: READ,
  },
  {
    name: "search_skills",
    title: "Search team skills",
    description:
      "Search saved team skills by name, description, note, example prompt, repository, or tag",
    requiredScopes: READ,
  },
  {
    name: "get_skill_command",
    title: "Get install command",
    description: "Return the skills.sh CLI command for a saved skill",
    requiredScopes: READ,
  },
  {
    name: "discover_skills",
    title: "Discover public skills",
    description: "Search skills.sh or browse a leaderboard",
    requiredScopes: READ,
  },
  {
    name: "discover_repository_skills",
    title: "Inspect a repository for skills",
    description:
      "List the installable skills (SKILL.md definitions) found in a GitHub repository, with the skillPath to use when saving one",
    requiredScopes: READ,
  },
  {
    name: "add_skill",
    title: "Add a skill",
    description:
      "Save a skill from a GitHub repository to a team library. When the repository contains multiple skills, use discover_repository_skills first and pass the chosen skillPath.",
    requiredScopes: WRITE,
  },
  {
    name: "list_collections",
    title: "List team collections",
    description:
      "List every skill collection across the authenticated user's team libraries, with skill counts",
    requiredScopes: READ,
  },
  {
    name: "search_collections",
    title: "Search team collections",
    description: "Search team skill collections by title, description, or tag",
    requiredScopes: READ,
  },
  {
    name: "get_collection_skills",
    title: "Get collection skills",
    description: "List the skills grouped in a collection, with their install commands",
    requiredScopes: READ,
  },
  {
    name: "get_collection_install_command",
    title: "Get collection install command",
    description: "Get the one-command installer for a published installable collection",
    requiredScopes: READ,
  },
  {
    name: "create_collection",
    title: "Create a collection",
    description:
      "Create a team collection that groups saved skills by use case or project. Collections are visible to the whole team.",
    requiredScopes: WRITE,
  },
  {
    name: "add_skill_to_collection",
    title: "Add a skill to a collection",
    description:
      "Add a saved team skill to a collection. Use list_skills and list_collections to find the IDs.",
    requiredScopes: WRITE,
  },
  {
    name: "remove_skill_from_collection",
    title: "Remove a skill from a collection",
    description: "Remove a skill from a collection. The skill stays in the team library.",
    requiredScopes: WRITE,
  },
]

/**
 * The MCP registry manifest for this deployment.
 *
 * Same identity as the card above, in the shape the registry publishes, with
 * the remote endpoint the caller passes rather than the production one baked
 * into `mcpServerInfo`. The `mcp-registry-manifest` unit test compares the
 * result against the committed `server.json` so the two cannot drift.
 */
export function buildMcpRegistryManifest(endpoint: string) {
  return {
    $schema: MCP_SERVER_SCHEMA,
    name: mcpServerInfo.name,
    title: mcpServerInfo.title,
    description: mcpServerInfo.description,
    version: mcpServerInfo.version,
    websiteUrl: new URL(endpoint).origin,
    repository: { ...mcpServerInfo.repository },
    remotes: [{ type: "streamable-http", url: endpoint }],
  }
}

/**
 * The SEP-1649 server card for this deployment.
 *
 * `endpoint` is the MCP resource of the deployment serving the card, and
 * `link` builds the sibling document URLs on the same origin, so a preview
 * describes itself rather than production. Shared by
 * `/.well-known/mcp/server-card.json` and the bare `/.well-known/mcp` path.
 */
export function buildMcpServerCard(endpoint: string, link: (path: string) => string) {
  const transport = { type: "streamable-http", endpoint } as const

  return {
    serverInfo: mcpServerInfo,
    transport,
    // Some readers expect the transport list rather than the single object.
    transports: [transport],
    capabilities: mcpServerCapabilities,
    tools: mcpToolSummaries,
    authentication: {
      type: "oauth2",
      resource: endpoint,
      authorization_servers: [link("/api/auth")],
      protected_resource_metadata: link("/.well-known/oauth-protected-resource"),
      scopes_supported: mcpScopeSummaries(),
      documentation: link("/auth.md"),
    },
  }
}
