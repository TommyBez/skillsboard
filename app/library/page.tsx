import Link from "next/link"
import { ExternalLinkIcon, GitBranchIcon, SearchIcon, StarIcon } from "lucide-react"
import { redirect } from "next/navigation"

import { AddSkillDialog } from "@/components/add-skill-dialog"
import { AppHeader } from "@/components/app-header"
import { CopyButton } from "@/components/copy-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { listOrganizationSkills, listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

interface LibraryPageProps { searchParams: Promise<{ q?: string; tag?: string }> }

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)
  if (!organizations.length) redirect("/onboarding")
  const activeId = session.session.activeOrganizationId ?? organizations[0].id
  const params = await searchParams
  const allSkills = await listOrganizationSkills(activeId)
  const query = params.q?.toLowerCase().trim() ?? ""
  const skills = allSkills.filter((item) => (!query || `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase().includes(query)) && (!params.tag || item.tags.includes(params.tag)))
  const tags = [...new Set(allSkills.flatMap((item) => item.tags))].sort()
  return <div className="min-h-svh bg-muted/20"><AppHeader user={session.user} organizations={organizations} activeId={activeId} /><main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:px-6"><div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"><div className="flex flex-col gap-2"><p className="font-mono text-xs font-semibold uppercase tracking-widest text-primary">Team library</p><h1 className="text-4xl font-semibold tracking-tight">Skills your team trusts</h1><p className="text-muted-foreground">{allSkills.length} saved skills, sourced directly from GitHub.</p></div><AddSkillDialog /></div><form className="flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input name="q" defaultValue={params.q} placeholder="Search skills, descriptions, and tags" className="pl-9" /></div><Button type="submit" variant="outline">Search</Button></form>{tags.length ? <div className="flex flex-wrap gap-2"><Button size="sm" variant={!params.tag ? "default" : "outline"} nativeButton={false} render={<Link href="/library" />}>All</Button>{tags.map((tag) => <Button key={tag} size="sm" variant={params.tag === tag ? "default" : "outline"} nativeButton={false} render={<Link href={`/library?tag=${encodeURIComponent(tag)}`} />}>{tag}</Button>)}</div> : null}{skills.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{skills.map((item) => { const command = `npx skills add ${item.githubUrl} --skill ${item.skillName}`; return <Card key={item.id} className="flex flex-col"><CardHeader><div className="flex items-start justify-between gap-3"><span className="flex size-10 items-center justify-center rounded-lg bg-muted"><GitBranchIcon className="size-5" /></span><Badge variant="secondary"><StarIcon />{item.repoStars.toLocaleString()}</Badge></div><CardTitle className="capitalize">{item.title}</CardTitle><CardDescription className="line-clamp-2 min-h-10">{item.description ?? `${item.repoOwner}/${item.repoName}`}</CardDescription></CardHeader><CardContent className="flex flex-1 flex-col gap-4"><div className="flex flex-wrap gap-1.5">{item.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}</div><code className="line-clamp-2 rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">{command}</code></CardContent><CardFooter className="justify-between"><CopyButton value={command} label="Copy command" /><Button variant="ghost" size="sm" render={<a href={item.githubUrl} target="_blank" rel="noreferrer" />}>GitHub<ExternalLinkIcon data-icon="inline-end" /></Button></CardFooter></Card> })}</div> : <Empty className="rounded-xl border bg-background py-20"><EmptyHeader><EmptyMedia variant="icon"><GitBranchIcon /></EmptyMedia><EmptyTitle>{query ? "No matching skills" : "Your library is ready"}</EmptyTitle><EmptyDescription>{query ? "Try another search or clear your filters." : "Add your first GitHub skill or discover popular skills from the community."}</EmptyDescription></EmptyHeader><div className="flex gap-2"><AddSkillDialog /><Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Discover skills</Button></div></Empty>}</main></div>
}
