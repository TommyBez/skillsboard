"use client"

import { useEffect } from "react"

import {
  mcpEndpointFor,
  sameOriginDestination,
  type WebMcpPage,
} from "@/lib/web-mcp-tools"

/**
 * WebMCP: the tools an agent driving this page in a browser can call.
 *
 * Everything here is read-only and unauthenticated on purpose. A team library
 * sits behind a session, and an in-page tool that acted on it would be acting
 * with whatever cookie the visitor happens to hold, in a page an agent may have
 * been pointed at from anywhere. The authenticated surface is the MCP server at
 * /api/mcp, which requires a token a user explicitly granted, and
 * `get_connection_details` is how an agent finds it.
 */

interface WebMcpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  execute: (args: Record<string, unknown>) => Promise<{ content: { type: "text"; text: string }[] }>
}

interface ModelContext {
  provideContext?: (context: { tools: WebMcpTool[] }) => void | Promise<void>
  registerTool?: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void>
}

function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] }
}

function json(value: unknown) {
  return text(JSON.stringify(value, null, 2))
}

function buildTools(pages: readonly WebMcpPage[]): WebMcpTool[] {
  return [
    {
      name: "list_pages",
      description:
        "List the Skills Board pages that can be read as Markdown, with the path and title of each. Call this first to find the page that answers a question about Skills Board, Agent Skills, or the SKILL.md format.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      async execute() {
        return json(
          pages.map((page) => ({
            path: page.path,
            title: page.title,
            description: page.description,
          })),
        )
      },
    },
    {
      name: "read_page",
      description:
        "Read a Skills Board page as Markdown. Takes a path from list_pages, for example /agent-skills or /guides/install-claude-skills.",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Page path, starting with a slash, as returned by list_pages.",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      async execute(args) {
        const requested = typeof args.path === "string" ? args.path : ""
        const normalized = requested.replace(/\/+$/, "") || "/"
        const page = pages.find((candidate) => candidate.path === normalized)

        if (!page) {
          return text(
            `No Markdown version of ${requested || "that path"}. Call list_pages for the paths that can be read.`,
          )
        }

        const response = await fetch(page.markdownPath, {
          headers: { Accept: "text/markdown" },
        })
        if (!response.ok) {
          return text(`Could not read ${page.path}: the server answered ${response.status}.`)
        }
        return text(await response.text())
      },
    },
    {
      name: "get_connection_details",
      description:
        "Get the details needed to connect an agent to a Skills Board team library over MCP: the endpoint, the OAuth scopes, what the tools can and cannot do, and the Claude Code plugin commands. Use this when the user wants their agent to reach their own saved skills; the tools on this page cannot read a private library.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      async execute() {
        return json({
          endpoint: mcpEndpointFor(window.location.origin),
          transport: "streamable-http",
          authentication:
            "OAuth 2.1. The client registers dynamically, then a signed-in user approves the scopes. Full flow: /auth.md",
          serverCard: "/.well-known/mcp/server-card.json",
          scopes: {
            "skills:read":
              "Required by every tool. List and search team skills and collections, get install commands, discover public and repository skills.",
            "skills:write":
              "Save new skills, create collections, add or remove skills from a collection.",
          },
          cannotDo: [
            "Edit or delete a skill already saved to a team library",
            "Install a skill into an agent",
            "Run a skill",
          ],
          claudeCodePlugin: [
            "/plugin marketplace add TommyBez/skillsboard",
            "/plugin install skills-board@skills-board",
          ],
        })
      },
    },
    {
      name: "navigate",
      description:
        "Open a Skills Board page in this browser tab. Takes a path from list_pages, or one of /pricing, /resources, /about, /sign-up.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path on skillsboard.sh, starting with a slash." },
        },
        required: ["path"],
        additionalProperties: false,
      },
      async execute(args) {
        const requested = typeof args.path === "string" ? args.path : ""
        const destination = sameOriginDestination(requested, window.location.origin)

        if (!destination) {
          return text("Path must start with a single slash and stay on this site.")
        }

        window.location.assign(destination)
        return text(`Navigating to ${requested}.`)
      },
    },
  ]
}

/**
 * `pages` is the catalogue, passed in from the server rather than imported.
 * The list is three strings per page; the registries it is derived from carry
 * the full body of every page in them, and importing them here would ship all
 * of that prose to the browser on every route. The root layout reads
 * `lib/web-mcp-pages` and hands over the result.
 */
export function WebMcpTools({ pages }: { pages: readonly WebMcpPage[] }) {
  useEffect(() => {
    const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext
    if (!modelContext) return

    const controller = new AbortController()
    const tools = buildTools(pages)

    // Two shapes are in the wild: `provideContext` replaces the page's whole
    // tool set in one call and is what the WebMCP explainer specifies;
    // `registerTool` adds one at a time and is what the Chrome origin trial
    // shipped. Prefer the declarative one, fall back to the incremental one.
    const provide = async () => {
      try {
        if (typeof modelContext.provideContext === "function") {
          await modelContext.provideContext({ tools })
          return
        }
        if (typeof modelContext.registerTool === "function") {
          for (const tool of tools) {
            if (controller.signal.aborted) return
            await modelContext.registerTool(tool, { signal: controller.signal })
          }
        }
      } catch (error) {
        // A page that cannot offer tools is still a page. Nothing here is
        // load-bearing for a human visitor.
        console.warn("WebMCP tools unavailable", error)
      }
    }

    void provide()

    return () => {
      controller.abort()
      // `provideContext` has no unregister call of its own; handing back an
      // empty tool set is how a page withdraws what it offered.
      if (typeof modelContext.provideContext === "function") {
        try {
          // `provideContext` may reject rather than throw, and an unhandled
          // rejection on unmount would surface as a page error.
          void Promise.resolve(modelContext.provideContext({ tools: [] })).catch(() => {})
        } catch {
          // The page is going away regardless.
        }
      }
    }
  }, [pages])

  return null
}
