import { MCP_RATE_LIMIT, PUBLIC_API_RATE_LIMIT } from "@/lib/api-rate-limit"
import { API_VERSION, API_VERSION_HEADER, SUPPORTED_API_VERSIONS } from "@/lib/api-version"
import { mcpServerInfo, mcpToolSummaries } from "@/lib/mcp-server-card"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"
import { problemCodes } from "@/lib/problem-json"
import { siteConfig } from "@/lib/site"

export const developersPath = "/developers"

/** Every `type` URI in a problem document resolves to one of these anchors. */
export function problemAnchor(code: string): string {
  return `error-${code.replace(/_/g, "-")}`
}

/**
 * The developer documentation, as data.
 *
 * The page renders it and the Markdown twin is generated from it, so the two
 * cannot describe different APIs. The parts that exist elsewhere in the
 * codebase — the tool list, the scopes, the error registry, the request budget
 * — are read from their own modules rather than restated, which is what keeps
 * this page from becoming the stale copy every developer portal eventually
 * becomes.
 */
export const developers = {
  path: developersPath,
  title: "Skills Board developer docs: MCP server, OAuth, and discovery documents",
  description:
    "How to connect an agent to Skills Board: the MCP endpoint and its tools, the OAuth flow, the discovery documents, and the versioning, error, and rate-limit conventions the HTTP surface follows.",
  publishedAt: "2026-08-21",
  modifiedAt: "2026-08-21",
  intro: [
    "Skills Board is a web app for the AI skills a team recommends, and its programmatic surface is a Model Context Protocol server. An agent that authenticates against it can search the team's saved skills and collections, fetch install commands, inspect a GitHub repository for skills, and, with write access, save skills and organize collections.",
    "This page is the whole contract: what is public, how to authenticate, what the tools do, and how the surface behaves when something goes wrong. Everything on it is also machine readable: append `.md` to this URL, or send `Accept: text/markdown`, for the same document as Markdown.",
  ],
  publicSurface: {
    title: "The public surface",
    intro:
      "Everything below is public and needs no credential to fetch, except the MCP endpoint itself. Anything under /api that is not listed here backs the web UI on a session cookie and is not an integration point: it can change without notice.",
    columns: ["Endpoint", "What it is", "Authentication"],
    rows: [
      {
        label: "/api/mcp",
        cells: [
          "The MCP server. JSON-RPC 2.0 over streamable HTTP.",
          "Bearer token, user-delegated",
        ],
      },
      {
        label: "/api/health",
        cells: [
          "Liveness of the deployment. Backing services are not probed.",
          "None",
        ],
      },
      {
        label: "/openapi.json",
        cells: ["OpenAPI 3.1 description of everything in this table.", "None"],
      },
      {
        label: "/server.json",
        cells: ["MCP registry manifest: identity, version, and the remote endpoint.", "None"],
      },
      {
        label: "/.well-known/mcp/server-card.json",
        cells: [
          "MCP Server Card (SEP-1649): transport, capabilities, tools, and scopes. The same card answers at /.well-known/mcp.",
          "None",
        ],
      },
      {
        label: "/.well-known/oauth-protected-resource",
        cells: ["RFC 9728 metadata: the audience a token must be bound to.", "None"],
      },
      {
        label: "/.well-known/api-catalog",
        cells: ["RFC 9727 linkset naming this API and its documents.", "None"],
      },
      {
        label: "/.well-known/ai-catalog.json",
        cells: ["Agentic Resource Discovery manifest for this origin.", "None"],
      },
      {
        label: "/.well-known/agent-skills/index.json",
        cells: ["The Agent Skills this site publishes, each with a sha256 digest.", "None"],
      },
    ],
  },
  connectAnAgent: {
    title: "Connect an agent",
    intro:
      "Any MCP client that speaks streamable HTTP and can run an OAuth authorization code flow connects without a manually issued key: the server registers the client itself (RFC 7591) the first time it asks.",
    steps: [
      `Point the client at ${siteConfig.url}/api/mcp as a streamable HTTP MCP server.`,
      "Let the client discover authentication: an unauthenticated call answers 401 with a WWW-Authenticate header naming the protected resource metadata.",
      "The client registers itself dynamically, then runs authorization code + PKCE. A person approves the scopes in a browser; nothing is issued without that approval.",
      "Call `tools/list` on the live session for the tool schemas, then `tools/call`.",
    ],
    template: `{
  "mcpServers": {
    "skills-board": {
      "type": "http",
      "url": "${siteConfig.url}/api/mcp"
    }
  }
}`,
    note: `The client identifier the registry knows this server by is \`${mcpServerInfo.name}\`. A client that cannot run the flow itself can still read every discovery document above, none of which needs a credential.`,
  },
  tools: {
    title: "Tools",
    intro:
      "The live session is the source of truth for tool schemas; this is the list and what each one needs. A tool marked skills:write is refused by a token that was granted read access only.",
    columns: ["Tool", "What it does", "Scopes"],
    rows: mcpToolSummaries.map((tool) => ({
      label: tool.name,
      cells: [tool.description, tool.requiredScopes.join(", ")],
    })),
  },
  authenticationAndScopes: {
    title: "Authentication and scopes",
    intro:
      "Access is user-delegated: a token acts for the person who approved it and reaches exactly the team libraries they belong to. Tokens are audience-bound to the MCP endpoint, so a token minted for another resource is refused.",
    columns: ["Scope", "What it grants"],
    rows: oauthScopes.map((scope) => ({
      label: scope,
      cells: [oauthScopeDescriptions[scope]],
    })),
    note: "Revoking a client in Skills Board invalidates its tokens immediately; the next call answers 401 and the client is expected to run the flow again rather than retry.",
    link: {
      lead: "The registration, authorization, and revocation flow, written for an agent to follow step by step:",
      label: "auth.md",
      href: "/auth.md",
      trail: ".",
    },
  },
  versioningAndDeprecation: {
    title: "Versioning and deprecation",
    body: [
      `The current version of the HTTP surface is ${API_VERSION}. Every response carries it in \`${API_VERSION_HEADER}\`, and a request may send the same header to pin the version it was written against. Supported today: ${SUPPORTED_API_VERSIONS.join(", ")}. A pinned version this deployment does not serve is refused with 400 and the \`unsupported_api_version\` problem rather than answered with a different one.`,
      "The paths are deliberately unversioned. The MCP endpoint is the audience every issued token is bound to, and the well-known documents live where their specifications put them; moving either into a /v1 prefix would invalidate tokens and break spec-driven discovery. The version travels in the header instead.",
      "Within a version, members are added but never removed or retyped, and a tool never changes what it does under the same name. A breaking change ships as the next version, and both versions answer until the older one is withdrawn.",
      "A withdrawal is announced on the affected responses with `Deprecation` and `Sunset` headers at least 90 days before the sunset date, and the same dates appear on this page. Nothing is removed without that notice.",
    ],
  },
  deprecationPolicy: {
    title: "Deprecation policy",
    body: [
      "Nothing in the table above is withdrawn without notice. When an operation, a member, or a header is going away, every response it still serves carries `Deprecation` (RFC 9745) with the date the withdrawal was announced and `Sunset` (RFC 8594) with the date it stops answering.",
      "The gap between those two dates is never less than 90 days. Until the sunset date the operation answers normally; after it, the path is gone and a request to it gets the ordinary 404.",
      "A client that wants to be warned early should read both headers on every response and treat their appearance as work to schedule, not as an error. The same policy is stated in the OpenAPI description under `info.x-deprecation-policy`, which names this section, the notice period, and the two headers.",
    ],
  },
  errors: {
    title: "Errors",
    intro:
      "Failures are typed, and the type is what a client should branch on. The MCP endpoint reports failures the way JSON-RPC does, including 401 and 403, which carry a JSON-RPC error object with a numeric code. Every other endpoint answers with an RFC 9457 problem document under `application/problem+json`.",
    codes: {
      columns: ["Code", "Status", "Title", "When it is returned"],
      rows: Object.entries(problemCodes).map(([code, problem]) => ({
        label: code,
        cells: [String(problem.status), problem.title, problem.detail],
      })),
    },
    template: `HTTP/1.1 429 Too Many Requests
Content-Type: application/problem+json
Retry-After: 37
RateLimit: "${PUBLIC_API_RATE_LIMIT.name}";r=0;t=37

{
  "type": "${siteConfig.url}/developers#error-rate-limited",
  "title": "Too many requests",
  "status": 429,
  "detail": "This client has spent its request budget for the current window. Wait for the window named in Retry-After, then retry.",
  "instance": "${siteConfig.url}/api/health",
  "code": "rate_limited",
  "retry_after": 37
}`,
    note: "The `type` member is a URL that resolves to the section of this page describing that failure, so a client meeting an unfamiliar code can fetch the explanation instead of parsing the prose. `title` and `detail` are written for people and may be reworded; `code` and `status` are the stable pair.",
    mcpRefusals:
      "The MCP endpoint never answers with a problem document, including for the two refusals it makes before a request reaches the protocol: a pinned version it does not serve (400) and a spent budget (429). Both come back as JSON-RPC error objects, because that is the one body shape an MCP client parses, and both carry the same code from the table above in `error.data.code`, with `retry_after` beside it on a 429.",
  },
  rateLimits: {
    title: "Rate limits",
    body: [
      `The budgeted endpoints publish what a client has left. The policy is ${PUBLIC_API_RATE_LIMIT.limit} requests per ${PUBLIC_API_RATE_LIMIT.windowSeconds} seconds per client per endpoint, and ${MCP_RATE_LIMIT.limit} per ${MCP_RATE_LIMIT.windowSeconds} seconds on the MCP endpoint, counted over a sliding window.`,
      "It is counted per serving instance rather than globally, so the numbers are a floor: a client that stays inside them is never refused, and a client spread across instances may get more. That is the honest reading of the headers, and it is the reading an agent needs to pace itself.",
      "A refused request answers 429 with `Retry-After`. Retrying before the window rolls over is refused again, and the refusal is not charged to the budget.",
      "Clients are counted by the address the platform reports. A request that arrives without one is not counted against anybody, and its response states the policy without a remaining count rather than pooling every such caller into one bucket they could spend for each other.",
      "The discovery documents are served from cache and carry no budget.",
    ],
    columns: ["Header", "What it says"],
    rows: [
      {
        label: "RateLimit",
        cells: ["Remaining requests (r) and seconds until the window rolls over (t)."],
      },
      {
        label: "RateLimit-Policy",
        cells: ["The quota in force: requests (q) per window seconds (w)."],
      },
      {
        label: "RateLimit-Limit / -Remaining / -Reset",
        cells: ["The same three numbers in the older spelling most SDKs already parse."],
      },
      {
        label: "Retry-After",
        cells: ["On a 429 only: seconds to wait before retrying."],
      },
    ],
  },
  markdownRepresentations: {
    title: "Markdown, for reading rather than parsing",
    body: [
      "Every public page on this site has a Markdown twin at the same URL with a `.md` suffix, and the page URL itself returns Markdown when the request sends `Accept: text/markdown`. Those responses carry an `x-markdown-tokens` header estimating the document's size, so a client can budget a read before it makes it.",
      `Start at ${siteConfig.url}/llms.txt, which indexes every page, document, and endpoint this site publishes.`,
    ],
  },
  supportAndSource: {
    title: "Status, support, and source",
    // `entries` rather than `links`, and `note` rather than `description`: the
    // Markdown generator reads the first as an unlabelled list (no heading of
    // its own under this section) and the second as the note beside each link,
    // where a key it treats as metadata would be dropped from the twin.
    entries: [
      {
        label: "Deployment liveness",
        href: "/api/health",
        note: "HTTP liveness of this deployment. Backing services are not probed.",
      },
      {
        label: "Open an issue",
        href: `${siteConfig.githubUrl}/issues`,
        note: "Bugs, integration questions, and requests for the MCP surface.",
      },
      {
        label: "Source",
        href: siteConfig.githubUrl,
        note: "The whole app, MIT licensed, including every endpoint on this page.",
      },
      {
        label: "Contact",
        href: "/contact",
        note: "For anything that does not belong in a public issue.",
      },
    ],
  },
} as const
