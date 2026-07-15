import Link from "next/link"
import { ArrowRightIcon, GitBranchIcon, SearchIcon, ServerIcon, StarIcon, UsersIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getSession } from "@/lib/session"

const exampleCommand = "npx skills add https://github.com/vercel-labs/skills --skill find-skills"

const mcpConfig = `{
  "mcpServers": {
    "skillbase": {
      "url": "https://your-app.vercel.app/api/mcp"
    }
  }
}`

export default async function HomePage() {
  const session = await getSession()
  return (
    <main className="min-h-svh">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Brand />
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {session?.user ? (
              <Button nativeButton={false} render={<Link href="/library" />}>
                Open library <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>Sign in</Button>
                <Button nativeButton={false} render={<Link href="/sign-up" />}>Get started</Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-[1.1fr_.9fr] md:px-6 md:py-24">
          <div className="flex flex-col items-start gap-6">
            <p className="rounded-full border bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
              The shared skill registry for agent teams
            </p>
            <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
              Your team&apos;s best skills, always within reach.
            </h1>
            <p className="max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
              Save trusted skills from GitHub and make your curated library available to every teammate and AI agent.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href={session?.user ? "/library" : "/sign-up"} />}>
                {session?.user ? "Open library" : "Get started"}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
              {!session?.user && (
                <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-in" />}>
                  Sign in
                </Button>
              )}
            </div>
          </div>

          <Card className="shadow-lg shadow-foreground/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <CardTitle className="font-mono">find-skills</CardTitle>
                  <CardDescription className="flex items-center gap-1.5">
                    <GitBranchIcon className="size-3.5" aria-hidden="true" />
                    vercel-labs/skills
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  <StarIcon aria-hidden="true" />
                  1.2k
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Search and discover agent skills from the community registry, directly from your coding agent.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">discovery</Badge>
                <Badge variant="outline">registry</Badge>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3 border-t">
              <code className="truncate font-mono text-xs text-muted-foreground">{exampleCommand}</code>
              <CopyButton value={exampleCommand} />
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <h2 className="mb-10 max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
          A durable home for reusable agent knowledge.
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <GitBranchIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>GitHub is the source of truth</CardTitle>
              <CardDescription className="max-w-md leading-relaxed">
                A saved skill points to its repository, not a stale copy. Every install pulls the latest version, so
                your team never ships outdated instructions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                <code className="truncate font-mono text-xs text-muted-foreground">{exampleCommand}</code>
                <CopyButton value={exampleCommand} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15">
                <UsersIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>One library, every teammate</CardTitle>
              <CardDescription className="leading-relaxed text-primary-foreground/80">
                Organize skills by team with roles, invitations, and shared access.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-secondary">
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SearchIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Discover what works</CardTitle>
              <CardDescription className="leading-relaxed">
                Browse trending, curated, and all-time skills from the skills.sh catalog.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ServerIcon className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Available to your agents</CardTitle>
              <CardDescription className="max-w-md leading-relaxed">
                Connect through an authenticated MCP server. Agents list, search, and retrieve install commands for
                team-approved skills.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-20">
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Give your agents the same trusted library.
            </h2>
            <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
              OAuth 2.1 keeps access secure while MCP tools let agents list, search, and retrieve install commands for
              approved skills.
            </p>
          </div>
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="font-mono text-sm font-normal text-muted-foreground">mcp.json</CardTitle>
                <CopyButton value={mcpConfig} />
              </div>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto font-mono text-sm leading-relaxed"><code>{mcpConfig}</code></pre>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-6">
        <Brand />
        <p>GitHub-native skills for teams and agents.</p>
      </footer>
    </main>
  )
}
