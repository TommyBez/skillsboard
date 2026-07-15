import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, GitBranchIcon, StarIcon } from "lucide-react"

import { Brand } from "@/components/brand"
import { CopyButton } from "@/components/copy-button"
import { HeroEntrance, HeroItem, Reveal } from "@/components/motion/reveal"
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
  const primaryHref = session?.user ? "/library" : "/sign-up"
  const primaryLabel = session?.user ? "Open library" : "Get started"

  return (
    <main className="min-h-[100dvh]">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
          <Brand />
          <nav className="flex items-center gap-2" aria-label="Main navigation">
            {!session?.user && (
              <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
                Sign in
              </Button>
            )}
            <Button nativeButton={false} render={<Link href={primaryHref} />}>
              {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </nav>
        </div>
      </header>

      {/* Asymmetric split hero: text left, layered visual right */}
      <section className="relative overflow-hidden border-b">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-4 pb-16 pt-14 md:grid-cols-[1fr_1.05fr] md:px-8 md:pb-24 md:pt-20">
          <HeroEntrance className="flex flex-col items-start gap-6">
            <HeroItem>
              <h1 className="max-w-xl text-balance text-4xl font-semibold tracking-tight lg:text-5xl xl:text-6xl xl:leading-[1.05]">
                The skill registry your agents pull from.
              </h1>
            </HeroItem>
            <HeroItem>
              <p className="max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
                Curate trusted GitHub skills once. Every teammate and agent installs the same, current version.
              </p>
            </HeroItem>
            <HeroItem>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" nativeButton={false} render={<Link href={primaryHref} />}>
                  {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/discover" />}>
                  Browse skills
                </Button>
              </div>
            </HeroItem>
          </HeroEntrance>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border">
              <Image
                src="/images/hero-topo.png"
                alt="Topographic contour illustration"
                width={1200}
                height={750}
                priority
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-4 bottom-4 md:inset-x-8 md:bottom-8">
                <Card className="shadow-xl shadow-black/30">
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
                  <CardFooter className="justify-between gap-3 border-t">
                    <code className="truncate font-mono text-xs text-muted-foreground">{exampleCommand}</code>
                    <CopyButton value={exampleCommand} />
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento: 4 items, 4 cells, background diversity */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <Reveal>
          <h2 className="mb-10 max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            A durable home for reusable agent knowledge.
          </h2>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          <Reveal className="md:col-span-2">
            <Card className="h-full transition-transform duration-300 ease-out hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>GitHub is the source of truth</CardTitle>
                <CardDescription className="max-w-md leading-relaxed">
                  A saved skill points to its repository, not a stale copy. Every install pulls the latest version.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2">
                  <code className="truncate font-mono text-xs text-muted-foreground">{exampleCommand}</code>
                  <CopyButton value={exampleCommand} />
                </div>
              </CardContent>
            </Card>
          </Reveal>
          <Reveal delay={0.06}>
            <Card className="relative h-full overflow-hidden border-0 text-white transition-transform duration-300 ease-out hover:-translate-y-0.5">
              <Image
                src="/images/bento-network.png"
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                aria-hidden="true"
              />
              <CardHeader className="relative">
                <CardTitle className="text-white">One library, every teammate</CardTitle>
                <CardDescription className="leading-relaxed text-white/75">
                  Organize skills by team with roles, invitations, and shared access.
                </CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
          <Reveal delay={0.06}>
            <Card className="h-full bg-accent transition-transform duration-300 ease-out hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-accent-foreground">Discover what works</CardTitle>
                <CardDescription className="leading-relaxed text-accent-foreground/75">
                  Browse trending, curated, and all-time skills from the skills.sh catalog.
                </CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-2">
            <Card className="h-full bg-primary text-primary-foreground transition-transform duration-300 ease-out hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle>Available to your agents</CardTitle>
                <CardDescription className="max-w-md leading-relaxed text-primary-foreground/80">
                  Connect through an authenticated MCP server. Agents list, search, and retrieve install commands for
                  approved skills.
                </CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Split text + code */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <Reveal className="flex flex-col items-start gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Give your agents the same trusted library.
            </h2>
            <p className="max-w-lg text-pretty leading-relaxed text-muted-foreground">
              OAuth 2.1 keeps access secure while MCP tools let agents search and install approved skills.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-mono text-sm font-normal text-muted-foreground">mcp.json</CardTitle>
                  <CopyButton value={mcpConfig} />
                </div>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed md:text-sm"><code>{mcpConfig}</code></pre>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      {/* Full-width closing CTA */}
      <section className="border-t">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-4 py-20 text-center md:px-8 md:py-28">
          <Reveal className="flex flex-col items-center gap-6">
            <h2 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
              Stop pasting the same instructions into every agent.
            </h2>
            <Button size="lg" nativeButton={false} render={<Link href={primaryHref} />}>
              {primaryLabel} <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <Brand />
          <p>GitHub-native skills for teams and agents.</p>
        </div>
      </footer>
    </main>
  )
}
