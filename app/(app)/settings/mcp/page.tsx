import { cache, Suspense } from "react"
import Link from "next/link"
import { headers } from "next/headers"
import { ArrowLeftIcon } from "lucide-react"

import { McpSetupGuide, McpTroubleshooting } from "@/components/mcp-setup-guide"
import { McpSetupAnalytics } from "@/components/mcp-setup-analytics"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

const availableTools = [
  { name: "list_skills", description: "List saved skills across your team libraries" },
  { name: "search_skills", description: "Search saved skills by name, source, description, or tag" },
  { name: "get_skill_command", description: "Retrieve the install command for a saved skill" },
  { name: "discover_skills", description: "Search or browse the public skills.sh catalog" },
]

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

  return { config, host, mcpUrl }
})

async function McpGuide() {
  const { config, mcpUrl } = await getMcpDetails()

  return <McpSetupGuide config={config} mcpUrl={mcpUrl} />
}

export default function McpSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
      <McpSetupAnalytics />
      <Button variant="ghost" className="-ml-2 w-fit" nativeButton={false} render={<Link href="/library" />}>
        <ArrowLeftIcon data-icon="inline-start" />
        Back to library
      </Button>

      <header className="mt-8 border-b pb-10">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Agent access</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
          Connect your agent
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Search your team libraries and retrieve install commands from your agent. Sign in through the browser — no API
          key to copy.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10">
        <Suspense
          fallback={<Skeleton className="h-[28rem] rounded-[16px]" role="status" aria-label="Loading setup guide" />}
        >
          <McpGuide />
        </Suspense>

        <aside className="overflow-hidden rounded-[16px] border bg-card">
          <div className="px-5 py-5 sm:px-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Tools</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Available tools</h2>
          </div>
          <div className="border-t">
            {availableTools.map((tool) => (
              <div key={tool.name} className="border-b px-5 py-4 last:border-b-0 sm:px-6">
                <code className="font-mono text-sm font-medium text-foreground">{tool.name}</code>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">{tool.description}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <McpTroubleshooting />
      </div>
    </main>
  )
}
