import { discoveryUrl, getDiscoveryOrigin } from "@/lib/agent-discovery"
import { PUBLIC_API_RATE_LIMIT } from "@/lib/api-rate-limit"
import { API_VERSION, API_VERSION_HEADER, SUPPORTED_API_VERSIONS } from "@/lib/api-version"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"
import { problemCodes } from "@/lib/problem-json"

/**
 * The version header, as a parameter every operation accepts.
 *
 * Written once and referenced, so the described surface cannot end up with one
 * endpoint that takes a version and another that does not. See `lib/api-version`
 * for what the header promises.
 */
function apiVersionParameter() {
  return { $ref: "#/components/parameters/ApiVersion" }
}

/** The rate-limit headers the budgeted endpoints send on every response. */
function rateLimitResponseHeaders() {
  return {
    RateLimit: { $ref: "#/components/headers/RateLimit" },
    "RateLimit-Policy": { $ref: "#/components/headers/RateLimitPolicy" },
    "RateLimit-Limit": { $ref: "#/components/headers/RateLimitLimit" },
    "RateLimit-Remaining": { $ref: "#/components/headers/RateLimitRemaining" },
    "RateLimit-Reset": { $ref: "#/components/headers/RateLimitReset" },
    [API_VERSION_HEADER]: { $ref: "#/components/headers/ApiVersion" },
  }
}

/**
 * A read-only discovery document: same operation shape every time, differing
 * only in what it returns and what media type it returns it as.
 */
function discoveryOperation({
  operationId,
  summary,
  description,
  mediaType = "application/json",
  schema,
  versioned = true,
}: {
  operationId: string
  summary: string
  description: string
  mediaType?: string
  schema: object
  /**
   * False for the two OAuth documents. Their shape is fixed by RFC 8414 and
   * RFC 9728 rather than by this API's version, their readers are OAuth
   * clients that have never heard of the header, and Better Auth serves them,
   * so claiming they honour a version this codebase cannot enforce there would
   * be a promise the deployment does not keep.
   */
  versioned?: boolean
}) {
  return {
    get: {
      operationId,
      summary,
      description,
      security: [],
      ...(versioned ? { parameters: [apiVersionParameter()] } : {}),
      responses: {
        "200": {
          description: summary,
          ...(versioned
            ? { headers: { [API_VERSION_HEADER]: { $ref: "#/components/headers/ApiVersion" } } }
            : {}),
          content: { [mediaType]: { schema } },
        },
        ...(versioned ? { "400": { $ref: "#/components/responses/UnsupportedApiVersion" } } : {}),
      },
    },
  }
}

/**
 * OpenAPI 3.1 description of the public HTTP surface.
 *
 * Built per deployment rather than served as a static file. A preview
 * deployment links this document from its own API catalog, and a hard coded
 * production `servers` entry would make every client resolve the operations,
 * and the OAuth URLs below, against production: a preview run would then
 * authenticate against, and write to, the production database rather than the
 * branch Neon isolates for it. The origin comes from the same resolver every
 * other discovery document in this codebase uses.
 *
 * Every response carries a schema with named members rather than a bare
 * object, because this document is what an agent turns into function
 * definitions: a tool whose result is typed `object` tells the model nothing
 * about what it just fetched. Failures are typed the same way — RFC 9457
 * problem documents for the plain HTTP endpoints, JSON-RPC error objects for
 * the MCP one — so a client can branch on a code instead of on a message.
 *
 * Scopes are read from `lib/oauth-scopes`, the error registry from
 * `lib/problem-json`, and the budget from `lib/api-rate-limit`, so the
 * description states what the code does rather than a second opinion about it.
 */
export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Skills Board public HTTP API",
      version: `${API_VERSION}.0.0`,
      summary: "The MCP endpoint and the machine-readable discovery documents Skills Board serves.",
      description: [
        "Skills Board is a web app; the only programmatic surface it offers is the Model Context Protocol server at /api/mcp, plus the discovery documents an agent reads before connecting to it. Everything under /api that is not listed here backs the web UI, is session-authenticated rather than token-authenticated, and is not a supported integration point.",
        "The MCP endpoint speaks JSON-RPC 2.0 over streamable HTTP. Its methods and tool schemas are not enumerated in this document because MCP carries them itself: call `tools/list` on a live session, or read /.well-known/mcp/server-card.json. Authentication is described in /auth.md.",
        `Versioning: the current version is ${API_VERSION}, sent on every response in \`${API_VERSION_HEADER}\` and accepted on any request that wants to pin it. Within a version, members are added but never removed or retyped; a breaking change ships as the next version and both answer until the older one is withdrawn. A withdrawal is announced on the affected responses with \`Deprecation\` and \`Sunset\` at least 90 days ahead. Supported versions today: ${SUPPORTED_API_VERSIONS.join(", ")}.`,
        `Rate limits: budgeted endpoints answer with \`RateLimit\` and \`RateLimit-Policy\`, and refuse with 429 and \`Retry-After\` once the budget is spent. The published budget is ${PUBLIC_API_RATE_LIMIT.limit} requests per ${PUBLIC_API_RATE_LIMIT.windowSeconds} seconds per client per endpoint, counted per serving instance, so it is a floor rather than a ceiling. The discovery documents are served from cache and carry no budget.`,
        `Errors: every non-MCP failure is an RFC 9457 \`application/problem+json\` document with a stable \`code\` member (${Object.keys(problemCodes).join(", ")}) and a \`type\` URL that resolves to the paragraph describing it. ${discoveryUrl("/developers")} is the prose version of all of this.`,
      ].join("\n\n"),
      license: { name: "MIT", identifier: "MIT" },
      contact: { name: "Skills Board", url: discoveryUrl("/contact") },
    },
    servers: [{ url: getDiscoveryOrigin() }],
    externalDocs: {
      description: "Skills Board developer documentation",
      url: discoveryUrl("/developers"),
    },
    paths: {
      "/api/mcp": {
        "post": {
          "operationId": "callMcp",
          "summary": "Model Context Protocol endpoint (JSON-RPC 2.0, streamable HTTP)",
          "description": `Requires a bearer access token audience-bound to ${getMcpResource()} and carrying the \`skills:read\` scope. The write tools additionally require \`skills:write\`. See ${discoveryUrl("/auth.md")} for the registration and authorization flow.`,
          "security": [
            {
              "oauth2": [
                "skills:read"
              ]
            }
          ],
          "parameters": [apiVersionParameter()],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/JsonRpcRequest" }
              }
            }
          },
          "responses": {
            "200": {
              "description": "JSON-RPC response, or an SSE stream when the client accepts text/event-stream.",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/JsonRpcResponse" }
                },
                "text/event-stream": {
                  "schema": {
                    "type": "string",
                    "description": "Server-sent events, each `data:` line carrying one JSON-RPC response object.",
                  }
                }
              }
            },
            "401": {
              "description": "Missing, expired, or revoked token. Carries a WWW-Authenticate header with resource_metadata, and a JSON-RPC error object in the body.",
              "headers": {
                "WWW-Authenticate": {
                  "description": "RFC 9728 challenge naming the protected resource metadata and the required scope.",
                  "schema": { "type": "string" },
                },
              },
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/JsonRpcError" }
                }
              }
            },
            "403": {
              "description": "Token lacks the skills:read scope.",
              "content": {
                "application/json": {
                  "schema": { "$ref": "#/components/schemas/JsonRpcError" }
                }
              }
            }
          }
        }
      },
      "/api/health": {
        "get": {
          "operationId": "getHealth",
          "summary": "Liveness of the deployment",
          "description": "Reports that the deployment is serving HTTP. Backing services are not probed. Budgeted: the response carries the caller's remaining request allowance.",
          "security": [],
          "parameters": [apiVersionParameter()],
          "responses": {
            "200": {
              "description": "The deployment is serving.",
              "headers": rateLimitResponseHeaders(),
              "content": {
                "application/health+json": {
                  "schema": { "$ref": "#/components/schemas/HealthReport" }
                }
              }
            },
            "400": { "$ref": "#/components/responses/UnsupportedApiVersion" },
            "429": { "$ref": "#/components/responses/RateLimited" }
          }
        }
      },
      "/.well-known/mcp/server-card.json": discoveryOperation({
        operationId: "getMcpServerCard",
        summary: "MCP Server Card (SEP-1649)",
        description:
          "Server identity, transport endpoint, capabilities, tool summaries, and how to authenticate.",
        schema: { $ref: "#/components/schemas/McpServerCard" },
      }),
      "/.well-known/oauth-protected-resource": discoveryOperation({
        operationId: "getProtectedResourceMetadata",
        summary: "OAuth Protected Resource Metadata (RFC 9728)",
        description:
          "The resource identifier tokens must be bound to, the authorization servers that can mint them, and the scopes they can carry.",
        schema: { $ref: "#/components/schemas/ProtectedResourceMetadata" },
        versioned: false,
      }),
      "/.well-known/oauth-authorization-server": discoveryOperation({
        operationId: "getAuthorizationServerMetadata",
        summary: "OAuth Authorization Server Metadata (RFC 8414), with the auth.md agent_auth block",
        description:
          "Issuer, endpoints, supported grants, and the agent_auth extension pointing at the agent-facing description of the flow.",
        schema: { $ref: "#/components/schemas/AuthorizationServerMetadata" },
        versioned: false,
      }),
      "/.well-known/agent-skills/index.json": discoveryOperation({
        operationId: "getAgentSkillsIndex",
        summary: "Agent Skills Discovery index (RFC v0.2.0)",
        description:
          "The skills Skills Board itself publishes, each with a sha256 digest of the artifact at its url.",
        schema: { $ref: "#/components/schemas/AgentSkillsIndex" },
      }),
      "/.well-known/ai-catalog.json": discoveryOperation({
        operationId: "getArdCatalog",
        summary: "Agentic Resource Discovery manifest",
        description:
          "Every resource on this origin an agent can fetch, each with the queries it answers.",
        schema: { $ref: "#/components/schemas/ArdCatalog" },
      }),
      "/.well-known/api-catalog": discoveryOperation({
        operationId: "getApiCatalog",
        summary: "API catalog (RFC 9727)",
        description:
          "A linkset naming this API and its description, documentation, and status links.",
        mediaType: "application/linkset+json",
        schema: { $ref: "#/components/schemas/ApiCatalog" },
      }),
      "/server.json": discoveryOperation({
        operationId: "getMcpRegistryManifest",
        summary: "MCP registry manifest (server.json)",
        description:
          "The manifest the MCP registry publishes this server from: identity, version, repository, and the remote streamable-HTTP endpoint.",
        schema: { $ref: "#/components/schemas/McpRegistryManifest" },
      }),
    },
    components: {
      parameters: {
        ApiVersion: {
          name: API_VERSION_HEADER,
          in: "header",
          required: false,
          description: `The API version this client was written against. Omit it to get the current version (${API_VERSION}). A version this deployment does not serve is refused with 400 and the \`unsupported_api_version\` problem.`,
          schema: { type: "string", enum: [...SUPPORTED_API_VERSIONS], default: API_VERSION },
        },
      },
      headers: {
        ApiVersion: {
          description: "The API version that answered this request.",
          schema: { type: "string", examples: [API_VERSION] },
        },
        RateLimit: {
          description: "Remaining allowance and seconds to reset, for the quota policy that applied.",
          schema: {
            type: "string",
            examples: [`"${PUBLIC_API_RATE_LIMIT.name}";r=118;t=42`],
          },
        },
        RateLimitPolicy: {
          description: "The quota policy in force: requests (q) per window seconds (w).",
          schema: {
            type: "string",
            examples: [
              `"${PUBLIC_API_RATE_LIMIT.name}";q=${PUBLIC_API_RATE_LIMIT.limit};w=${PUBLIC_API_RATE_LIMIT.windowSeconds}`,
            ],
          },
        },
        RateLimitLimit: {
          description: "Requests allowed in one window. The older spelling of the policy above.",
          schema: { type: "integer", examples: [PUBLIC_API_RATE_LIMIT.limit] },
        },
        RateLimitRemaining: {
          description: "Requests left in the current window.",
          schema: { type: "integer", minimum: 0 },
        },
        RateLimitReset: {
          description: "Seconds until the current window rolls over.",
          schema: { type: "integer", minimum: 0 },
        },
        RetryAfter: {
          description: "Seconds to wait before retrying.",
          schema: { type: "integer", minimum: 0 },
        },
      },
      responses: {
        RateLimited: {
          description: "The client has spent its request budget for the current window.",
          headers: { ...rateLimitResponseHeaders(), "Retry-After": { $ref: "#/components/headers/RetryAfter" } },
          content: {
            "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } },
          },
        },
        UnsupportedApiVersion: {
          description: `The ${API_VERSION_HEADER} header named a version this deployment does not serve.`,
          headers: { [API_VERSION_HEADER]: { $ref: "#/components/headers/ApiVersion" } },
          content: {
            "application/problem+json": { schema: { $ref: "#/components/schemas/Problem" } },
          },
        },
      },
      schemas: {
        Problem: {
          type: "object",
          title: "Problem document (RFC 9457)",
          description:
            "Every failure outside the MCP endpoint takes this shape. Branch on `code`, which is stable, rather than on `title` or `detail`, which are written for people.",
          required: ["type", "title", "status", "code"],
          properties: {
            type: {
              type: "string",
              format: "uri",
              description: "Resolves to the section of the developer docs describing this failure.",
            },
            title: { type: "string", description: "Short, human-readable summary." },
            status: { type: "integer", description: "The HTTP status code, repeated in the body." },
            detail: { type: "string", description: "What went wrong on this specific request." },
            instance: {
              type: "string",
              format: "uri",
              description: "The endpoint that refused the request.",
            },
            code: {
              type: "string",
              enum: Object.keys(problemCodes),
              description: "Machine-readable failure code.",
            },
            retry_after: {
              type: "integer",
              description: "On a 429, seconds until the budget refills. Mirrors the Retry-After header.",
            },
          },
        },
        JsonRpcRequest: {
          type: "object",
          title: "JSON-RPC 2.0 request",
          description: "A JSON-RPC 2.0 request object, as defined by the Model Context Protocol.",
          required: ["jsonrpc", "method"],
          properties: {
            jsonrpc: { type: "string", const: "2.0" },
            id: { type: ["string", "number"], description: "Absent on a notification." },
            method: { type: "string", examples: ["initialize", "tools/list", "tools/call"] },
            params: { type: "object", description: "Method-specific parameters." },
          },
        },
        JsonRpcResponse: {
          type: "object",
          title: "JSON-RPC 2.0 response",
          required: ["jsonrpc"],
          properties: {
            jsonrpc: { type: "string", const: "2.0" },
            id: { type: ["string", "number", "null"] },
            result: { type: "object", description: "Present when the call succeeded." },
            error: { $ref: "#/components/schemas/JsonRpcErrorObject" },
          },
        },
        JsonRpcError: {
          type: "object",
          title: "JSON-RPC 2.0 error response",
          description: "How the MCP endpoint reports a refusal, including 401 and 403.",
          required: ["jsonrpc", "error"],
          properties: {
            jsonrpc: { type: "string", const: "2.0" },
            id: { type: ["string", "number", "null"] },
            error: { $ref: "#/components/schemas/JsonRpcErrorObject" },
          },
        },
        JsonRpcErrorObject: {
          type: "object",
          required: ["code", "message"],
          properties: {
            code: { type: "integer", description: "JSON-RPC error code.", examples: [-32000] },
            message: { type: "string", examples: ["missing authorization header"] },
            data: { description: "Optional structured detail." },
          },
        },
        HealthReport: {
          type: "object",
          title: "Health report",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              const: "pass",
              description: "`pass` is the only value: an unhealthy deployment does not answer.",
            },
            description: { type: "string", description: "What this check does and does not cover." },
          },
        },
        McpServerCard: {
          type: "object",
          title: "MCP Server Card (SEP-1649)",
          required: ["serverInfo", "transport", "capabilities", "tools", "authentication"],
          properties: {
            serverInfo: {
              type: "object",
              required: ["name", "version"],
              properties: {
                name: { type: "string", description: "Reverse-DNS server identifier." },
                title: { type: "string" },
                version: { type: "string" },
                description: { type: "string" },
                websiteUrl: { type: "string", format: "uri" },
                repository: {
                  type: "object",
                  properties: {
                    url: { type: "string", format: "uri" },
                    source: { type: "string", examples: ["github"] },
                  },
                },
              },
            },
            transport: { $ref: "#/components/schemas/McpTransport" },
            transports: { type: "array", items: { $ref: "#/components/schemas/McpTransport" } },
            capabilities: {
              type: "object",
              properties: {
                tools: {
                  type: "object",
                  properties: { listChanged: { type: "boolean" } },
                },
              },
            },
            tools: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "requiredScopes"],
                properties: {
                  name: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  requiredScopes: {
                    type: "array",
                    items: { type: "string", enum: [...oauthScopes] },
                  },
                },
              },
            },
            authentication: {
              type: "object",
              required: ["type", "resource"],
              properties: {
                type: { type: "string", examples: ["oauth2"] },
                resource: { type: "string", format: "uri" },
                authorization_servers: { type: "array", items: { type: "string", format: "uri" } },
                protected_resource_metadata: { type: "string", format: "uri" },
                scopes_supported: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      scope: { type: "string" },
                      description: { type: "string" },
                    },
                  },
                },
                documentation: { type: "string", format: "uri" },
              },
            },
          },
        },
        McpTransport: {
          type: "object",
          required: ["type", "endpoint"],
          properties: {
            type: { type: "string", examples: ["streamable-http"] },
            endpoint: { type: "string", format: "uri" },
          },
        },
        McpRegistryManifest: {
          type: "object",
          title: "MCP registry manifest",
          required: ["name", "version", "remotes"],
          properties: {
            $schema: { type: "string", format: "uri" },
            name: { type: "string", description: "Reverse-DNS server identifier." },
            title: { type: "string" },
            description: { type: "string" },
            version: { type: "string" },
            websiteUrl: { type: "string", format: "uri" },
            repository: {
              type: "object",
              properties: {
                url: { type: "string", format: "uri" },
                source: { type: "string" },
              },
            },
            remotes: {
              type: "array",
              items: { $ref: "#/components/schemas/McpRemote" },
            },
          },
        },
        McpRemote: {
          type: "object",
          required: ["type", "url"],
          properties: {
            type: { type: "string", examples: ["streamable-http"] },
            url: { type: "string", format: "uri" },
          },
        },
        ProtectedResourceMetadata: {
          type: "object",
          title: "Protected resource metadata (RFC 9728)",
          required: ["resource", "authorization_servers"],
          properties: {
            resource: {
              type: "string",
              format: "uri",
              description: "The audience an access token must be bound to.",
            },
            authorization_servers: { type: "array", items: { type: "string", format: "uri" } },
            scopes_supported: { type: "array", items: { type: "string", enum: [...oauthScopes] } },
            bearer_methods_supported: { type: "array", items: { type: "string", examples: ["header"] } },
            resource_name: { type: "string" },
            resource_documentation: { type: "string", format: "uri" },
          },
        },
        AuthorizationServerMetadata: {
          type: "object",
          title: "Authorization server metadata (RFC 8414)",
          required: ["issuer", "authorization_endpoint", "token_endpoint"],
          properties: {
            issuer: { type: "string", format: "uri" },
            authorization_endpoint: { type: "string", format: "uri" },
            token_endpoint: { type: "string", format: "uri" },
            registration_endpoint: {
              type: "string",
              format: "uri",
              description: "RFC 7591 dynamic client registration; no credential needed to call it.",
            },
            revocation_endpoint: { type: "string", format: "uri" },
            jwks_uri: { type: "string", format: "uri" },
            scopes_supported: { type: "array", items: { type: "string" } },
            grant_types_supported: { type: "array", items: { type: "string" } },
            code_challenge_methods_supported: { type: "array", items: { type: "string" } },
            agent_auth: {
              type: "object",
              description: "Non-standard block pointing an agent at the prose description of this flow.",
              properties: {
                skill: { type: "string", format: "uri" },
                register_uri: { type: "string", format: "uri" },
                authorize_uri: { type: "string", format: "uri" },
                token_uri: { type: "string", format: "uri" },
                revoke_uri: { type: "string", format: "uri" },
              },
            },
          },
        },
        AgentSkillsIndex: {
          type: "object",
          title: "Agent Skills Discovery index",
          required: ["skills"],
          properties: {
            $schema: { type: "string", format: "uri" },
            skills: {
              type: "array",
              items: {
                type: "object",
                required: ["name", "type", "url", "digest"],
                properties: {
                  name: { type: "string" },
                  type: { type: "string", examples: ["skill-md"] },
                  description: { type: "string" },
                  url: { type: "string", format: "uri" },
                  digest: {
                    type: "string",
                    pattern: "^sha256:[a-f0-9]{64}$",
                    description: "Digest of the artifact at `url`, so a client can verify what it fetched.",
                  },
                  license: { type: "string" },
                },
              },
            },
          },
        },
        ArdCatalog: {
          type: "object",
          title: "Agentic Resource Discovery manifest",
          required: ["specVersion", "host", "entries"],
          properties: {
            specVersion: { type: "string" },
            host: {
              type: "object",
              required: ["identifier", "url"],
              properties: {
                displayName: { type: "string" },
                identifier: { type: "string", description: "did:web identifier of this origin." },
                description: { type: "string" },
                url: { type: "string", format: "uri" },
              },
            },
            entries: {
              type: "array",
              items: {
                type: "object",
                required: ["identifier", "type", "url"],
                properties: {
                  identifier: { type: "string", description: "urn:air URN, unique on this origin." },
                  displayName: { type: "string" },
                  description: { type: "string" },
                  type: { type: "string", description: "Media type of the resource at `url`." },
                  url: { type: "string", format: "uri" },
                  representativeQueries: {
                    type: "array",
                    items: { type: "string" },
                    description: "The questions this resource answers, for a semantic index.",
                  },
                },
              },
            },
          },
        },
        ApiCatalog: {
          type: "object",
          title: "API catalog linkset (RFC 9727)",
          required: ["linkset"],
          properties: {
            linkset: {
              type: "array",
              items: {
                type: "object",
                required: ["anchor"],
                properties: {
                  anchor: {
                    type: "string",
                    format: "uri",
                    description: "The API these links describe.",
                  },
                  "service-desc": { $ref: "#/components/schemas/LinkArray" },
                  "service-doc": { $ref: "#/components/schemas/LinkArray" },
                  "service-meta": { $ref: "#/components/schemas/LinkArray" },
                  status: { $ref: "#/components/schemas/LinkArray" },
                  author: { $ref: "#/components/schemas/LinkArray" },
                  license: { $ref: "#/components/schemas/LinkArray" },
                },
              },
            },
          },
        },
        LinkArray: {
          type: "array",
          items: {
            type: "object",
            required: ["href"],
            properties: {
              href: { type: "string", format: "uri" },
              type: { type: "string", description: "Media type of the linked document." },
              title: { type: "string" },
            },
          },
        },
      },
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          description: `User-delegated access. Register with RFC 7591 dynamic client registration, then run authorization code + PKCE. See ${discoveryUrl("/auth.md")}.`,
          flows: {
            authorizationCode: {
              authorizationUrl: discoveryUrl("/api/auth/oauth2/authorize"),
              tokenUrl: discoveryUrl("/api/auth/oauth2/token"),
              refreshUrl: discoveryUrl("/api/auth/oauth2/token"),
              scopes: Object.fromEntries(
                oauthScopes.map((scope) => [scope, oauthScopeDescriptions[scope]]),
              ),
            },
          },
        },
      },
    },
    security: [{ oauth2: ["skills:read"] }],
  }
}
