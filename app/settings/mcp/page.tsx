import Link from "next/link"
import { headers } from "next/headers"
import { ArrowLeftIcon, ServerIcon } from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"

const availableTools = [
  "list_skills",
  "search_skills",
  "get_skill_command",
  "discover_skills",
]

export default async function McpSettingsPage() {
  const requestHeaders = await headers()
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "your-app.vercel.app"
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https"
  const mcpUrl = `${protocol}://${host}/api/mcp`
  const config = JSON.stringify(
    { mcpServers: { "skills-board": { url: mcpUrl } } },
    null,
    2
  )

  return (
      <main className="mx-auto w-full max-w-6xl px-4 pt-8 pb-28 md:px-6 md:py-12">
        <Button
          variant="ghost"
          className="-ml-2 w-fit"
          nativeButton={false}
          render={<Link href="/library" />}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to library
        </Button>

        <header className="mt-8 grid gap-8 border-b pb-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Agent connectivity
            </p>
            <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Connect Skills Board to your agents
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Your MCP client will open Skills Board to complete OAuth 2.1
              authorization. No API key is required.
            </p>
          </div>

          <aside className="rounded-[16px] border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-accent text-accent-foreground">
                <ServerIcon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  MCP endpoint
                </p>
                <code className="mt-1 block truncate font-mono text-sm text-foreground">
                  {mcpUrl}
                </code>
              </div>
            </div>
          </aside>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.75fr)] lg:items-start">
          <section className="overflow-hidden rounded-[16px] border bg-card">
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Client configuration
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                MCP server configuration
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Paste this into your MCP-compatible client.
              </p>
            </div>

            <div className="border-t bg-muted/30 p-3 sm:p-4">
              <pre className="overflow-x-auto rounded-[16px] bg-foreground p-5 font-mono text-sm leading-6 text-background sm:p-6">
                <code>{config}</code>
              </pre>
            </div>

            <div className="flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-sm text-muted-foreground">
                Configuration generated for {host}.
              </p>
              <CopyButton value={config} label="Copy configuration" />
            </div>
          </section>

          <section className="overflow-hidden rounded-[16px] border bg-card">
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Tool manifest
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Available tools
              </h2>
            </div>

            <div className="border-t">
              {availableTools.map((tool) => (
                <div
                  key={tool}
                  className="border-b px-5 py-4 last:border-b-0 sm:px-6"
                >
                  <code className="font-mono text-sm font-medium text-foreground">
                    {tool}
                  </code>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
  )
}
