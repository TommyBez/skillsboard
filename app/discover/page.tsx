import Link from "next/link"
import { ArrowLeftIcon, ExternalLinkIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { AppHeader } from "@/components/app-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { listOrganizationSkills, listUserOrganizations } from "@/lib/db/queries"
import { getCuratedSkills, getLeaderboard, searchCatalog } from "@/lib/skills-sh"
import { requireSession } from "@/lib/session"

interface DiscoverPageProps { searchParams: Promise<{ q?: string; view?: "trending" | "hot" | "all-time" | "curated" }> }

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (!organizations.length) redirect("/onboarding")
  const activeId = session.session.activeOrganizationId ?? organizations[0].id
  const saved = await listOrganizationSkills(activeId)
  const params = await searchParams
  const view = params.view ?? "trending"
  let skills = [] as Awaited<ReturnType<typeof getLeaderboard>>
  let error = ""
  try { skills = params.q && params.q.length >= 2 ? await searchCatalog(params.q) : view === "curated" ? await getCuratedSkills() : await getLeaderboard(view) } catch (cause) { error = cause instanceof Error ? cause.message : "Discovery is unavailable" }
  const savedKeys = new Set(saved.map((item) => `${item.githubUrl}:${item.skillName}`))
  return <div className="min-h-svh bg-muted/20"><AppHeader user={session.user} organizations={organizations} activeId={activeId} /><main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6"><div className="flex flex-col gap-3"><Button variant="ghost" className="w-fit" nativeButton={false} render={<Link href="/library" />}><ArrowLeftIcon data-icon="inline-start" />Back to library</Button><p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">skills.sh catalog</p><h1 className="text-4xl font-semibold tracking-tight">Discover your next capability</h1><p className="max-w-2xl text-muted-foreground">Explore skills used by the agent community, then add the best ones to your team&apos;s trusted library.</p></div><form className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={params.q} minLength={2} placeholder="Search the skills.sh catalog" className="pl-9" /></div><Button type="submit">Search</Button></form><div className="flex flex-wrap gap-2">{(["trending", "hot", "all-time", "curated"] as const).map((item) => <Button key={item} size="sm" variant={!params.q && view === item ? "default" : "outline"} nativeButton={false} render={<Link href={`/discover?view=${item}`} />}>{item.replace("-", " ")}</Button>)}</div>{error ? <div className="rounded-xl border bg-background p-8 text-center"><SparklesIcon className="mx-auto mb-3 size-6 text-primary" /><h2 className="font-semibold">Discovery needs Vercel OIDC</h2><p className="mt-2 text-sm text-muted-foreground">{error}. Enable OIDC Federation on the connected Vercel project.</p></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{skills.map((item) => { const isSaved = savedKeys.has(`${item.installUrl}:${item.slug}`); return <Card key={item.id} className="flex flex-col"><CardHeader className="flex-1"><div className="flex items-center justify-between gap-3"><Badge variant="secondary">{item.installs.toLocaleString()} installs</Badge>{isSaved ? <Badge>Saved</Badge> : null}</div><CardTitle>{item.name}</CardTitle><CardDescription className="line-clamp-3">{item.description}</CardDescription><p className="font-mono text-xs text-muted-foreground">{item.source}</p></CardHeader><CardFooter className="justify-between">{isSaved ? <Button variant="outline" disabled>In library</Button> : <AddSkillDialog defaultUrl={item.installUrl} defaultName={item.slug} triggerLabel="Save" />}<Button variant="ghost" size="sm" nativeButton={false} render={<a href={`https://skills.sh/${item.source}/${item.slug}`} target="_blank" rel="noreferrer" />}>Details<ExternalLinkIcon data-icon="inline-end" /></Button></CardFooter></Card> })}</div>}</main></div>
}
