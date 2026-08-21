import { discoveryUrl, getDiscoveryOrigin } from "@/lib/agent-discovery"
import { getMcpResource } from "@/lib/auth-environment"
import { oauthScopeDescriptions, oauthScopes } from "@/lib/oauth-scopes"

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
 * Scopes are read from `lib/oauth-scopes` so the list is described once.
 */
export function buildOpenApiDocument() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Skills Board public HTTP API",
      version: "1.0.0",
      summary: "The MCP endpoint and the machine-readable discovery documents Skills Board serves.",
      description: "Skills Board is a web app; the only programmatic surface it offers is the Model Context Protocol server at /api/mcp, plus the discovery documents an agent reads before connecting to it. Everything under /api that is not listed here backs the web UI, is session-authenticated rather than token-authenticated, and is not a supported integration point.\n\nThe MCP endpoint speaks JSON-RPC 2.0 over streamable HTTP. Its methods and tool schemas are not enumerated in this document because MCP carries them itself: call `tools/list` on a live session, or read /.well-known/mcp/server-card.json. Authentication is described in /auth.md.",
      license: { name: "MIT", identifier: "MIT" },
      contact: { name: "Skills Board", url: discoveryUrl("/contact") },
    },
    servers: [{ url: getDiscoveryOrigin() }],
    externalDocs: {
      description: "Agent-facing overview of the site",
      url: discoveryUrl("/llms.txt"),
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
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "description": "A JSON-RPC 2.0 request object, as defined by the Model Context Protocol.",
                  "required": [
                    "jsonrpc",
                    "method"
                  ],
                  "properties": {
                    "jsonrpc": {
                      "type": "string",
                      "const": "2.0"
                    },
                    "id": {
                      "type": [
                        "string",
                        "number"
                      ]
                    },
                    "method": {
                      "type": "string",
                      "examples": [
                        "tools/list",
                        "tools/call"
                      ]
                    },
                    "params": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "JSON-RPC response, or an SSE stream when the client accepts text/event-stream.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                },
                "text/event-stream": {
                  "schema": {
                    "type": "string"
                  }
                }
              }
            },
            "401": {
              "description": "Missing, expired, or revoked token. Carries a WWW-Authenticate header with resource_metadata."
            },
            "403": {
              "description": "Token lacks the skills:read scope."
            }
          }
        }
      },
      "/api/health": {
        "get": {
          "operationId": "getHealth",
          "summary": "Liveness of the deployment",
          "description": "Reports that the deployment is serving HTTP. Backing services are not probed.",
          "security": [],
          "responses": {
            "200": {
              "description": "The deployment is serving.",
              "content": {
                "application/health+json": {
                  "schema": {
                    "type": "object",
                    "required": [
                      "status"
                    ],
                    "properties": {
                      "status": {
                        "type": "string",
                        "const": "pass"
                      },
                      "description": {
                        "type": "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/mcp/server-card.json": {
        "get": {
          "operationId": "getMcpServerCard",
          "summary": "MCP Server Card (SEP-1649)",
          "description": "Server identity, transport endpoint, capabilities, tool summaries, and how to authenticate.",
          "security": [],
          "responses": {
            "200": {
              "description": "The server card.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/oauth-protected-resource": {
        "get": {
          "operationId": "getProtectedResourceMetadata",
          "summary": "OAuth Protected Resource Metadata (RFC 9728)",
          "security": [],
          "responses": {
            "200": {
              "description": "Resource identifier, authorization servers, and supported scopes.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/oauth-authorization-server": {
        "get": {
          "operationId": "getAuthorizationServerMetadata",
          "summary": "OAuth Authorization Server Metadata (RFC 8414), with the auth.md agent_auth block",
          "security": [],
          "responses": {
            "200": {
              "description": "Issuer, endpoints, supported grants, and the agent_auth extension.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/agent-skills/index.json": {
        "get": {
          "operationId": "getAgentSkillsIndex",
          "summary": "Agent Skills Discovery index (RFC v0.2.0)",
          "description": "The skills Skills Board itself publishes, each with a sha256 digest of the artifact at its url.",
          "security": [],
          "responses": {
            "200": {
              "description": "The skills index.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/ai-catalog.json": {
        "get": {
          "operationId": "getArdCatalog",
          "summary": "Agentic Resource Discovery manifest",
          "security": [],
          "responses": {
            "200": {
              "description": "The capability manifest for this origin.",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      },
      "/.well-known/api-catalog": {
        "get": {
          "operationId": "getApiCatalog",
          "summary": "API catalog (RFC 9727)",
          "security": [],
          "responses": {
            "200": {
              "description": "A linkset naming this API and its description, documentation, and status links.",
              "content": {
                "application/linkset+json": {
                  "schema": {
                    "type": "object"
                  }
                }
              }
            }
          }
        }
      }
    },
    components: {
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
