import { discoveryUrl, getDiscoveryOrigin } from "@/lib/agent-discovery"
import { TEAM_SKILL_LIBRARY_SKILL_PATH } from "@/lib/published-agent-skills"
import { siteConfig } from "@/lib/site"

/**
 * ARD (Agentic Resource Discovery) capability manifest.
 *
 * Each entry names one thing an agent can actually fetch and use, with the
 * queries a registry should embed it under. The queries are the ones a user
 * would really type: they are what a semantic index matches on, so a generic
 * restatement of the entry title would make the entry unfindable.
 *
 * Spec section 3.4: exactly one of `url` or `data` per entry. Every entry here
 * uses `url`; nothing this site publishes is small enough to be worth inlining.
 */
export function buildArdCatalog() {
  const origin = new URL(getDiscoveryOrigin())
  // `hostname`, not `host`: a URN segment is colon-delimited, so a port would
  // split the identifier. Production has no port; a preview or a local run
  // does, and would otherwise emit `urn:air:localhost:3000:...`.
  const host = origin.hostname
  // did:web is the opposite case: it identifies a host that must be resolvable,
  // so a non-default port belongs in the identifier. The method encodes the
  // delimiter as %3A, since a bare colon separates DID method segments.
  const didWebHost = origin.port ? `${host}%3A${origin.port}` : host
  const urn = (namespace: string, name: string) => `urn:air:${host}:${namespace}:${name}`

  return {
    specVersion: "1.0",
    host: {
      displayName: siteConfig.name,
      identifier: `did:web:${didWebHost}`,
      description: siteConfig.description,
      url: getDiscoveryOrigin(),
    },
    entries: [
      {
        identifier: urn("server", "skills-board-mcp"),
        displayName: "Skills Board MCP server",
        description:
          "Search a team's saved AI skills and collections, get install commands, discover public or repository skills, and save skills back to the library. User-delegated OAuth; see /auth.md.",
        type: "application/mcp-server-card+json",
        url: discoveryUrl("/.well-known/mcp/server-card.json"),
        representativeQueries: [
          "which AI skills does my team recommend",
          "search my team's skill library for a code review skill",
          "get the install command for a skill my team saved",
          "save this GitHub skill to our team library",
          "what skills are in our onboarding collection",
        ],
      },
      {
        identifier: urn("skill", "team-skill-library"),
        displayName: "Skills Board team library skill",
        description:
          "Agent Skill (SKILL.md) covering how to use a team's Skills Board library from an agent: find a recommendation, hand off an install command, and save a skill back.",
        type: "text/markdown",
        url: discoveryUrl(TEAM_SKILL_LIBRARY_SKILL_PATH),
        representativeQueries: [
          "how do I use Skills Board from Claude Code",
          "skill for working with a shared team skill library",
          "how do I install a Skills Board collection",
        ],
      },
      {
        identifier: urn("index", "agent-skills"),
        displayName: "Agent Skills discovery index",
        description:
          "The Agent Skills Discovery index (RFC v0.2.0) listing the skills Skills Board publishes, each with a sha256 digest of its artifact.",
        type: "application/json",
        url: discoveryUrl("/.well-known/agent-skills/index.json"),
        representativeQueries: [
          "list the agent skills published by skillsboard.sh",
          "agent skills discovery index for this site",
        ],
      },
      {
        identifier: urn("schema", "openapi"),
        displayName: "Skills Board OpenAPI description",
        description:
          "OpenAPI 3.1 description of the public HTTP surface: the MCP endpoint, the liveness endpoint, and the discovery documents.",
        type: "application/openapi+json",
        url: discoveryUrl("/openapi.json"),
        representativeQueries: [
          "what HTTP endpoints does Skills Board expose",
          "OpenAPI spec for the Skills Board API",
        ],
      },
      {
        identifier: urn("doc", "agent-authentication"),
        displayName: "Agent authentication guide (auth.md)",
        description:
          "How an agent registers as an OAuth client with Skills Board, gets a user-delegated access token bound to the MCP resource, which scopes exist, and what happens on revocation.",
        type: "text/markdown",
        url: discoveryUrl("/auth.md"),
        representativeQueries: [
          "how does an agent authenticate with Skills Board",
          "OAuth scopes needed to write to a Skills Board library",
          "what happens when a Skills Board token is revoked",
        ],
      },
      {
        identifier: urn("doc", "site-overview"),
        displayName: "Skills Board overview for agents (llms.txt)",
        description:
          "What Skills Board is, what a saved skill is and is not, and an index of the Markdown twin of every public page.",
        type: "text/markdown",
        url: discoveryUrl("/llms.txt"),
        representativeQueries: [
          "what is Skills Board",
          "is Skills Board free",
          "does a saved skill on Skills Board mean it was security reviewed",
        ],
      },
      {
        identifier: urn("doc", "pricing"),
        displayName: "Skills Board pricing",
        description:
          "Machine-readable pricing: the hosted product is free with no paid tier, and the code is open source for self-hosting.",
        type: "text/markdown",
        url: discoveryUrl("/pricing.md"),
        representativeQueries: [
          "how much does Skills Board cost",
          "does Skills Board have a paid plan or a trial",
        ],
      },
    ],
  }
}
