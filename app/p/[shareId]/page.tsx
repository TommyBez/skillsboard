import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import {
  ArrowUpRightIcon,
  PackageOpenIcon,
  ShieldAlertIcon,
} from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuthBaseUrl } from "@/lib/auth-environment"
import { getPublishedCollectionByShareId } from "@/lib/db/collection-distributions"
import {
  buildInstallableCollectionCommand,
  isValidInstallableCollectionShareId,
} from "@/lib/installable-collection-protocol"
import { siteConfig } from "@/lib/site"

export const metadata: Metadata = {
  title: "Installable collection",
  description: "An unlisted collection of agent skills shared through Skills Board.",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
}

const publishedAtFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
})
const artifactSizeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
})

interface SharedCollectionProps {
  params: Promise<{ shareId: string }>
}

function pinnedSourceUrl(skill: {
  commitSha: string
  repoName: string
  repoOwner: string
  skillPath: string
}) {
  const repository = `https://github.com/${encodeURIComponent(skill.repoOwner)}/${encodeURIComponent(skill.repoName)}`
  const ref = encodeURIComponent(skill.commitSha)
  if (!skill.skillPath) return `${repository}/tree/${ref}`
  const path = skill.skillPath.split("/").map(encodeURIComponent).join("/")
  return `${repository}/tree/${ref}/${path}`
}

async function SharedCollection({ params }: SharedCollectionProps) {
  const { shareId } = await params
  if (!isValidInstallableCollectionShareId(shareId)) notFound()

  const published = await getPublishedCollectionByShareId(shareId)
  if (!published) notFound()

  const installCommand = buildInstallableCollectionCommand(
    getAuthBaseUrl() ?? siteConfig.url,
    shareId,
  )

  return (
    <main data-testid="share-content" className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-8 md:px-8 md:py-12">
      <header className="flex items-center justify-between border-b border-border pb-5">
        <Link href="/" className="font-semibold tracking-tight">{siteConfig.name}</Link>
        <Badge variant="outline">Unlisted release</Badge>
      </header>

      <section className="grid flex-1 content-start gap-10 py-12 md:py-16">
        <div className="grid gap-5">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary" aria-hidden="true">
            <PackageOpenIcon className="size-6" />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Installable collection · Revision {published.revision}
            </p>
            <h1 className="mt-3 max-w-[20ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
              {published.title}
            </h1>
            {published.description ? (
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {published.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted-foreground">
              Published <time dateTime={published.publishedAt.toISOString()}>{publishedAtFormatter.format(published.publishedAt)}</time>
              {` · ${published.skills.length} ${published.skills.length === 1 ? "skill" : "skills"}`}
            </p>
          </div>
        </div>

        <section aria-labelledby="install-heading" className="rounded-2xl border border-border bg-card p-5 md:p-6">
          <h2 id="install-heading" className="text-xl font-semibold">Install this release</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Run the command from the project where you want the skills. The installer lets you choose the target agent and writes its own lockfile. The Vercel skills CLI may include source identifiers in anonymous telemetry; set <code className="font-mono text-xs">DISABLE_TELEMETRY</code> in your environment before running if you want to opt out.
          </p>
          <div className="ph-no-capture mt-5 flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-2 pl-4">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs">
              {installCommand}
            </code>
            <CopyButton
              ariaLabel={`Copy install command for ${published.title}`}
              copiedAriaLabel={`Copied install command for ${published.title}`}
              label="Copy command"
              value={installCommand}
            />
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            For later revisions, rerun the install command to add newly published skills, then use <code className="font-mono">npx skills update</code> to refresh skills already installed. Skills removed from the collection are not deleted automatically.
          </p>
        </section>

        <Alert className="border-amber-500/25 bg-amber-500/[0.045] text-amber-950 dark:text-amber-100">
          <ShieldAlertIcon aria-hidden="true" />
          <AlertTitle>Review skills before using them</AlertTitle>
          <AlertDescription>
            Skills run with your agent’s permissions. This release preserves its source commit, but Skills Board does not certify its safety or compatibility with every agent.
          </AlertDescription>
        </Alert>

        <section aria-labelledby="skills-heading">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">Contents</p>
              <h2 id="skills-heading" className="mt-2 text-3xl font-semibold tracking-display">Published skills</h2>
            </div>
          </div>
          <ol className="divide-y divide-border">
            {published.skills.map((skill) => (
              <li key={skill.artifactId} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <h3 className="font-semibold">{skill.skillName}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{skill.description}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    {skill.repoOwner}/{skill.repoName} · {skill.commitSha.slice(0, 7)} · {artifactSizeFormatter.format(skill.artifactBytes / 1024)} KB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<a href={pinnedSourceUrl(skill)} target="_blank" rel="noreferrer" />}
                >
                  Review source
                  <ArrowUpRightIcon data-icon="inline-end" />
                </Button>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <footer className="border-t border-border pt-5 text-sm text-muted-foreground">
        Shared through <Link href="/" className="font-medium text-foreground underline decoration-primary/40 underline-offset-4">Skills Board</Link>.
      </footer>
    </main>
  )
}

function SharedCollectionFallback() {
  return (
    <main data-testid="share-shell" className="mx-auto grid min-h-dvh w-full max-w-5xl content-start gap-8 px-4 py-12 md:px-8">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-52 rounded-2xl" />
      <Skeleton className="h-36 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
    </main>
  )
}

export default function SharedCollectionPage({ params }: SharedCollectionProps) {
  return (
    <Suspense fallback={<SharedCollectionFallback />}>
      <SharedCollection params={params} />
    </Suspense>
  )
}
