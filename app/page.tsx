import Link from "next/link"
import { ArrowRightIcon, CheckIcon, CopyIcon, GitBranchIcon, SearchIcon, ServerIcon, UsersIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/session"

const features = [
  { icon: UsersIcon, title: "One library, every teammate", description: "Organize skills by team with roles, invitations, and shared access." },
  { icon: GitBranchIcon, title: "GitHub is the source of truth", description: "Save repository locations, not stale copies. Install the latest version every time." },
  { icon: SearchIcon, title: "Discover what works", description: "Browse trending, hot, curated, and all-time skills from the skills.sh catalog." },
  { icon: ServerIcon, title: "Available to your agents", description: "Connect through an authenticated MCP server and retrieve team-approved skills." },
]

export default async function HomePage() {
  const session = await getSession()
  return (
    <main className="min-h-svh overflow-hidden">
      <header className="border-b bg-background"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6"><Brand /><nav className="flex items-center gap-2" aria-label="Main navigation">{session?.user ? <Button nativeButton={false} render={<Link href="/library" />}>Open library <ArrowRightIcon data-icon="inline-end" /></Button> : <><Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>Sign in</Button><Button nativeButton={false} render={<Link href="/sign-up" />}>Get started</Button></>}</nav></div></header>
      <section className="border-b bg-muted/30"><div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 md:grid-cols-[1.15fr_.85fr] md:px-6 md:py-28">
        <div className="flex flex-col items-start gap-6"><div className="rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">The shared skill registry for agent teams</div><h1 className="max-w-3xl text-balance text-5xl font-semibold tracking-[-0.04em] md:text-7xl">Your team&apos;s best skills, always within reach.</h1><p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">Save trusted skills from GitHub, discover what&apos;s trending, and make your curated library available to every teammate and AI agent.</p><div className="flex flex-wrap gap-3"><Button size="lg" nativeButton={false} render={<Link href={session?.user ? "/library" : "/sign-up"} />}>{session?.user ? "Go to library" : "Create your library"}<ArrowRightIcon data-icon="inline-end" /></Button><Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-in" />}>Sign in</Button></div><div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">{["GitHub-native", "Team-scoped", "MCP-ready"].map((item) => <span key={item} className="flex items-center gap-1.5"><CheckIcon className="size-4 text-primary" />{item}</span>)}</div></div>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-xl shadow-foreground/5"><div className="flex items-center justify-between border-b px-4 py-3"><span className="font-mono text-xs text-muted-foreground">team-library.sh</span><span className="flex gap-1.5"><i className="size-2 rounded-full bg-muted-foreground/30"/><i className="size-2 rounded-full bg-muted-foreground/30"/><i className="size-2 rounded-full bg-primary"/></span></div><div className="flex flex-col gap-5 p-5 font-mono text-sm"><p><span className="text-primary">$</span> npx skills add https://github.com/vercel-labs/skills --skill find-skills</p><div className="rounded-lg bg-muted p-4 text-muted-foreground"><p>✓ Resolving <span className="text-foreground">find-skills</span></p><p>✓ Installing latest from GitHub</p><p className="text-primary">✓ Ready for your agent</p></div><div className="flex items-center justify-between rounded-lg border px-3 py-2"><span className="truncate text-xs">npx skills add ... --skill find-skills</span><CopyIcon className="size-4 text-muted-foreground" /></div></div></div>
      </div></section>
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28"><div className="mb-12 flex max-w-2xl flex-col gap-3"><p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">From discovery to deployment</p><h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">A durable home for reusable agent knowledge.</h2></div><div className="grid gap-4 md:grid-cols-2">{features.map(({ icon: Icon, title, description }) => <Card key={title}><CardHeader><span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" /></span><CardTitle>{title}</CardTitle><CardDescription className="leading-relaxed">{description}</CardDescription></CardHeader></Card>)}</div></section>
      <section className="border-y bg-foreground text-background"><div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:px-6 md:py-24"><div className="flex flex-col items-start gap-4"><p className="font-mono text-xs uppercase tracking-widest text-primary">MCP access included</p><h2 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">Give your agents the same trusted library.</h2><p className="max-w-lg text-pretty leading-relaxed text-background/70">OAuth 2.1 keeps access secure while MCP tools let agents list, search, and retrieve install commands for approved skills.</p></div><pre className="overflow-x-auto rounded-xl border border-background/15 bg-background/5 p-5 font-mono text-sm leading-relaxed"><code>{`{
  "mcpServers": {
    "skillbase": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}`}</code></pre></div></section>
      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6"><Brand /><p>GitHub-native skills for teams and agents.</p></footer>
    </main>
  )
}
