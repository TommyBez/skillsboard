import { cache, Suspense } from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"

import { McpPluginInstall } from "@/components/mcp-plugin-install"
import { McpSetupGuide, McpTroubleshooting } from "@/components/mcp-setup-guide"
import { McpSetupAnalytics } from "@/components/mcp-setup-analytics"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"

export const metadata: Metadata = {
  title: "Connect your agent",
}

const availableTools = [
  { name: "list_skills", description: "List saved skills across your team libraries" },
  { name: "search_skills", description: "Search saved skills by name, source, description, or tag" },
  { name: "get_skill_command", description: "Retrieve the install command for a saved skill" },
  { name: "discover_skills", description: "Search or browse the public skills.sh catalog" },
  { name: "discover_repository_skills", description: "Inspect a GitHub repository for installable skills" },
  { name: "add_skill", description: "Save a skill from a GitHub repository to a team library" },
  { name: "list_collections", description: "List skill collections across your team libraries" },
  { name: "search_collections", description: "Search collections by title, description, or tag" },
  { name: "get_collection_skills", description: "List the skills grouped in a collection" },
  { name: "get_collection_install_command", description: "Retrieve the one-command installer for a published collection" },
  { name: "create_collection", description: "Create a collection that groups skills by use case or project" },
  { name: "add_skill_to_collection", description: "Add a saved skill to a collection" },
  { name: "remove_skill_from_collection", description: "Remove a skill from a collection" },
]

/**
 * The endpoint for the deployment the reader is actually signed into.
 *
 * Derived from the request host rather than a hardcoded production URL: this
 * page is behind the session now, so a preview deployment and production each
 * hand back the address that will actually work for the account that is
 * looking at it, the same as the rest of the authenticated app.
 */
const getMcpDetails = cache(async () => {
  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "your-app.vercel.app"
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https"
  const mcpUrl = `${protocol}://${host}/api/mcp`
  const config = JSON.stringify(
    { mcpServers: { "skills-board": { type: "http", url: mcpUrl } } },
    null,
    2,
  )

  return { config, mcpUrl }
})

async function ConnectAnalytics() {
  const { activeId } = await getAppContext()
  return <McpSetupAnalytics teamId={activeId} />
}

async function ConnectGuide() {
  const [{ config, mcpUrl }, { activeId }] = await Promise.all([
    getMcpDetails(),
    getAppContext(),
  ])

  return <McpSetupGuide config={config} mcpUrl={mcpUrl} teamId={activeId} />
}

function ConnectGuideFallback() {
  return (
    <Skeleton
      className="h-[28rem] rounded-[16px]"
      role="status"
      aria-label="Loading setup guide"
    />
  )
}

/**
 * Connecting an agent, on its own page, behind the session.
 *
 * The founder asked for `/connect` as a private page: MCP setup used to be
 * buried in settings, which is the fix this page keeps, but it was never meant
 * to be a public acquisition surface. It lives in the authenticated `(app)`
 * route group, the same as `/start`, `/library`, and `/settings`, so it reads
 * the session, redirects a signed-out visitor to sign in, and stays out of the
 * sitemap, `llms.txt`, and search indexing the same way those pages do.
 *
 * Reading the session back also restores the personalization the public draft
 * of this page had to give up: the MCP endpoint reflects the deployment the
 * reader is actually on, and `mcp_setup_viewed` / `mcp_config_copied` carry the
 * team. The plugin install commands stay canonical (the same command for every
 * team) since the plugin itself is not team scoped.
 */
export default function ConnectPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <Suspense fallback={null}>
        <ConnectAnalytics />
      </Suspense>

      <header className="border-b pb-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Agent access</p>
        <h1 data-testid="mcp-shell" className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          Connect your agent
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Search your team libraries and retrieve install commands from your agent. There are two ways to set this up:
          install the official plugin, which brings this configuration with it, or add the MCP server to your client by
          hand. Pick one. Either way you sign in through the browser, with no API key to copy.
        </p>
      </header>

      <div className="mt-8">
        <McpPluginInstall />
      </div>

      <div className="mt-8 flex items-center gap-4" data-testid="mcp-setup-or-divider">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          or
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-8">
        <Suspense fallback={<ConnectGuideFallback />}>
          <ConnectGuide />
        </Suspense>
      </div>

      <section className="mt-8 overflow-hidden rounded-[16px] border bg-card">
        <div className="flex items-end justify-between gap-4 px-5 py-5 sm:px-6 sm:py-6">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tools</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Available tools</h2>
          </div>
          <span className="rounded-full bg-accent px-2.5 py-1 font-mono text-xs font-semibold text-accent-foreground">
            {availableTools.length} tools
          </span>
        </div>
        <div className="border-t">
          {availableTools.map((tool) => (
            <div
              key={tool.name}
              className="grid grid-cols-1 gap-0.5 border-b px-5 py-3.5 transition-colors last:border-b-0 hover:bg-accent/40 sm:grid-cols-[17rem_minmax(0,1fr)] sm:items-baseline sm:gap-6 sm:px-6"
            >
              <code className="font-mono text-sm font-medium text-foreground">{tool.name}</code>
              <p className="text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <McpTroubleshooting />
      </div>
    </main>
  )
}
