import Link from "next/link"
import { ArrowLeftIcon, ServerIcon } from "lucide-react"
import { headers } from "next/headers"

import { CopyButton } from "@/components/copy-button"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireSession } from "@/lib/session"

export default async function McpSettingsPage() {
  await requireSession()
  const requestHeaders = await headers()
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "your-app.vercel.app"
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https"
  const mcpUrl = `${protocol}://${host}/api/mcp`
  const config = JSON.stringify({ mcpServers: { "skills-board": { url: mcpUrl } } }, null, 2)
  return <div className="min-h-svh bg-muted/20"><header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-4xl items-center px-4 md:px-6"><Brand /></div></header><main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10 md:px-6"><Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/library" />}><ArrowLeftIcon data-icon="inline-start" />Back to library</Button><div><p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">Authenticated MCP</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Connect Skills Board to your agents</h1><p className="mt-2 max-w-2xl text-muted-foreground">Your MCP client will open Skills Board to complete OAuth 2.1 authorization. No API key is required.</p></div><Card><CardHeader><span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><ServerIcon /></span><CardTitle>MCP server configuration</CardTitle><CardDescription>Paste this into your MCP-compatible client.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><pre className="overflow-x-auto rounded-lg bg-foreground p-4 font-mono text-sm text-background"><code>{config}</code></pre><CopyButton value={config} label="Copy configuration" /></CardContent></Card><Card><CardHeader><CardTitle>Available tools</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-2">{["list_skills", "search_skills", "get_skill_command", "discover_skills"].map((tool) => <code key={tool} className="rounded-lg border p-3 font-mono text-sm">{tool}</code>)}</CardContent></Card></main></div>
}
