import { Suspense } from "react"
import Link from "next/link"
import { CableIcon, DownloadIcon, LibraryBigIcon, TagsIcon } from "lucide-react"

import { ValueFlash } from "@/components/interior/value-flash"
import { AddSkillDialog } from "@/components/add-skill-dialog"
import { LibraryEmptyStateCtas } from "@/components/library-empty-state-ctas"
import { AddToCollectionMenu } from "@/components/add-to-collection-menu"
import { DeleteSkillDialog } from "@/components/delete-skill-dialog"
import { EditSkillNoteDialog } from "@/components/edit-skill-note-dialog"
import { EditSkillPromptsDialog } from "@/components/edit-skill-prompts-dialog"
import { InviteTeammatePrompt } from "@/components/invite-teammate-prompt"
import { LiveSearchField } from "@/components/live-search-field"
import { FilterPendingProvider, PendingResultsSlot } from "@/components/pending-filters"
import { SkillDossier } from "@/components/skill-dossier"
import { TransitionLink } from "@/components/transition-link"
import { TeammateReusePrompt } from "@/components/teammate-reuse-prompt"
import { TeamLibraryAnalytics } from "@/components/team-library-analytics"
import { TrackedLink } from "@/components/tracked-link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { mcpEntryEventProperties } from "@/lib/analytics-event-properties"
import { getAppContext } from "@/lib/app-context"
import { listCollectionDistributionIds } from "@/lib/db/collection-distributions"
import {
  countOrganizationMembers,
  countPendingOrganizationInvitations,
  listOrganizationCollectionMemberships,
  listOrganizationCollections,
  listOrganizationSkills,
} from "@/lib/db/queries"
import { buildInstallCommand } from "@/lib/install-command"
import {
  findRecentTeammateRecommendation,
  getLibraryFilterState,
  getLibraryNavigationKey,
  isInvitePromptEligible,
} from "@/lib/library-view-state"
import { isOrganizationAdmin } from "@/lib/session"

interface LibraryPageProps {
  searchParams: Promise<{ q?: string; tag?: string }>
}

async function LibraryStats() {
  const { activeId } = await getAppContext()
  const skills = await listOrganizationSkills(activeId)
  const tags = new Set(skills.flatMap((item) => item.tags))

  return (
    <div className="flex flex-wrap items-center gap-5 lg:justify-end">
      <div className="min-w-20">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-display">
          <ValueFlash value={skills.length} label="Team skills" />
        </p>
        <p className="text-sm text-muted-foreground">team {skills.length === 1 ? "skill" : "skills"}</p>
      </div>
      <div className="min-w-20 border-l border-border pl-5">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-display">
          <ValueFlash value={tags.size} label="Tags" />
        </p>
        <p className="text-sm text-muted-foreground">{tags.size === 1 ? "tag" : "tags"}</p>
      </div>
    </div>
  )
}

function LibraryStatsFallback() {
  return (
    <div className="flex gap-5" aria-label="Loading library summary">
      <Skeleton className="h-14 w-20 rounded-xl" />
      <Skeleton className="h-14 w-20 rounded-xl" />
    </div>
  )
}

async function LibraryFilters({ searchParams }: LibraryPageProps) {
  const [{ activeId }, params] = await Promise.all([getAppContext(), searchParams])
  const allSkills = await listOrganizationSkills(activeId)
  const tags = [...new Set(allSkills.flatMap((item) => item.tags))].sort()
  const libraryHref = (tag: string | null) => {
    const search = new URLSearchParams()
    if (params.q) search.set("q", params.q)
    if (tag) search.set("tag", tag)
    const value = search.toString()
    return value ? `/library?${value}` : "/library"
  }

  return (
    <section className="rounded-2xl border border-border bg-card/80 p-4 shadow-[0_14px_40px_hsl(var(--shadow-color)/0.06)] md:p-5">
      <Suspense fallback={<Skeleton className="h-10 rounded-xl" aria-label="Loading library search" />}>
        <LiveSearchField
          id="library-search"
          label="Search team library"
          placeholder="Search by name, prompt, note, or tag"
        />
      </Suspense>

      {tags.length ? (
        <nav aria-label="Filter library by tag" className="mt-4 flex items-start gap-3 border-t border-border pt-4">
          <TagsIcon className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
            <Button size="sm" variant={!params.tag ? "default" : "outline"} nativeButton={false} render={<TransitionLink href={libraryHref(null)} aria-current={!params.tag ? "page" : undefined} />}>All</Button>
            {tags.map((tag) => (
              <Button key={tag} size="sm" variant={params.tag === tag ? "default" : "outline"} nativeButton={false} render={<TransitionLink href={libraryHref(tag)} aria-current={params.tag === tag ? "page" : undefined} />}>
                {tag}
              </Button>
            ))}
          </div>
        </nav>
      ) : null}
    </section>
  )
}

function LibraryFiltersFallback() {
  return <Skeleton className="h-28 rounded-2xl" aria-label="Loading library filters" />
}

async function LibraryResults({ searchParams }: LibraryPageProps) {
  const [{ activeId, session, role }, params] = await Promise.all([getAppContext(), searchParams])
  const userId = session.user.id
  const canManageLibrary = isOrganizationAdmin(role)
  const [allSkills, collections, collectionMemberships, distributionRows] = await Promise.all([
    listOrganizationSkills(activeId),
    listOrganizationCollections(activeId),
    listOrganizationCollectionMemberships(activeId),
    listCollectionDistributionIds(activeId),
  ])
  const collectionIdsBySkill = new Map<string, string[]>()
  for (const membership of collectionMemberships) {
    const existing = collectionIdsBySkill.get(membership.skillId)
    if (existing) existing.push(membership.collectionId)
    else collectionIdsBySkill.set(membership.skillId, [membership.collectionId])
  }
  const distributedCollectionIds = new Set(distributionRows.map((item) => item.collectionId))
  const readOnlyCollectionIds = new Set<string>()
  if (!canManageLibrary) {
    for (const item of collections) {
      if (distributedCollectionIds.has(item.id) && item.createdBy !== userId) {
        readOnlyCollectionIds.add(item.id)
      }
    }
  }
  const collectionOptions = collections.map((item) => ({
    id: item.id,
    readOnly: readOnlyCollectionIds.has(item.id),
    title: item.title,
  }))
  const [memberCount, pendingInvitationCount] = canManageLibrary && allSkills.length > 0
    ? await Promise.all([
        countOrganizationMembers(activeId),
        countPendingOrganizationInvitations(activeId),
      ])
    : [0, 0]
  const query = params.q?.toLowerCase().trim() ?? ""
  const skills = allSkills.filter((item) => (
    (!query || `${item.title} ${item.description ?? ""} ${item.note ?? ""} ${item.examplePrompts.join(" ")} ${item.tags.join(" ")}`.toLowerCase().includes(query))
    && (!params.tag || item.tags.includes(params.tag))
  ))
  const hasFilters = Boolean(query || params.tag)
  const filterState = getLibraryFilterState(query, params.tag)
  const analyticsNavigationKey = getLibraryNavigationKey(query, params.tag)
  const showInvitePrompt = isInvitePromptEligible({
    canManageLibrary,
    memberCount,
    pendingInvitationCount,
    skillCount: allSkills.length,
  })
  const teammateRecommendation = !hasFilters && !showInvitePrompt
    ? findRecentTeammateRecommendation(allSkills, userId)
    : undefined

  return (
    <>
      <TeamLibraryAnalytics
        filterState={filterState}
        navigationKey={analyticsNavigationKey}
        skillCount={allSkills.length}
        teamId={activeId}
      />
      {showInvitePrompt ? (
        <InviteTeammatePrompt teamId={activeId} />
      ) : null}

      {teammateRecommendation ? (
        <TeammateReusePrompt
          addedBy={teammateRecommendation.addedByName}
          command={buildInstallCommand(teammateRecommendation.githubUrl, teammateRecommendation.skillName)}
          href={teammateRecommendation.githubUrl}
          skillId={teammateRecommendation.id}
          skillName={teammateRecommendation.skillName}
          skillTitle={teammateRecommendation.title}
          teamId={activeId}
        />
      ) : null}

      {skills.length ? (
        <section aria-label="Team skill recommendations" className="grid gap-4">
          {hasFilters ? (
            <p className="font-mono text-sm text-muted-foreground" role="status">
              {skills.length} of {allSkills.length} {allSkills.length === 1 ? "skill" : "skills"}
              {query ? <> matching <span className="text-foreground">“{params.q?.trim()}”</span></> : null}
              {params.tag ? <> tagged <span className="text-foreground">{params.tag}</span></> : null}
            </p>
          ) : null}
          <div className="cascade-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((item) => {
            const command = buildInstallCommand(item.githubUrl, item.skillName)
            const canEditNote = item.createdBy === userId
            const belongsToManagedInstallableCollection = (collectionIdsBySkill.get(item.id) ?? [])
              .some((collectionId) => readOnlyCollectionIds.has(collectionId))
            const canDelete = canManageLibrary || (canEditNote && !belongsToManagedInstallableCollection)
            return (
              <SkillDossier
                key={item.id}
                headingLevel="h2"
                name={item.title}
                description={item.description ?? `${item.repoOwner}/${item.repoName}`}
                note={item.note}
                examplePrompts={item.examplePrompts}
                source={`${item.repoOwner}/${item.repoName}`}
                command={command}
                metric={`${item.repoStars.toLocaleString()} ${item.repoStars === 1 ? "star" : "stars"}`}
                tags={item.tags}
                addedBy={item.addedByName ?? "Unknown"}
                href={item.githubUrl}
                hrefLabel="Open source"
                tracking={{
                  actorIsSkillCreator: canEditNote,
                  skillId: item.id,
                  skillName: item.skillName,
                  teamId: activeId,
                }}
                actions={(
                  <>
                    <AddToCollectionMenu
                      skillId={item.id}
                      skillName={item.title}
                      collections={collectionOptions}
                      memberCollectionIds={collectionIdsBySkill.get(item.id) ?? []}
                    />
                    <EditSkillPromptsDialog
                      skillId={item.id}
                      skillName={item.title}
                      prompts={item.examplePrompts}
                    />
                    {canEditNote ? (
                      <EditSkillNoteDialog
                        skillId={item.id}
                        skillName={item.title}
                        note={item.note}
                      />
                    ) : null}
                    {canDelete ? (
                      <DeleteSkillDialog
                        skillId={item.id}
                        skillName={item.title}
                      />
                    ) : null}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="size-8 rounded-lg"
                      nativeButton={false}
                      render={(
                        <a
                          href={`/api/skills/${item.id}/download`}
                          aria-label={`Download the latest version of ${item.title} as a ZIP`}
                          title="Download ZIP"
                        />
                      )}
                    >
                      <DownloadIcon />
                    </Button>
                  </>
                )}
              />
            )
          })}
          </div>
        </section>
      ) : (
        <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <LibraryBigIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-display md:text-4xl">{hasFilters ? "No matching skills" : "Add your first skill"}</h2>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {query && params.tag
                ? "Nothing matches both the search and the tag. Try dropping one of them."
                : hasFilters
                  ? "Try another search or clear the active filters."
                  : "Add a skill your team recommends, or browse the public catalog to find one."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {query && params.tag ? (
              <>
                <Button variant="outline" nativeButton={false} render={<TransitionLink href={`/library?tag=${encodeURIComponent(params.tag)}`} />}>Clear search</Button>
                <Button variant="outline" nativeButton={false} render={<TransitionLink href={`/library?q=${encodeURIComponent(params.q ?? "")}`} />}>Clear tag</Button>
                <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Find skills</Button>
              </>
            ) : hasFilters ? (
              <>
                <Button variant="outline" nativeButton={false} render={<TransitionLink href="/library" />}>Clear filters</Button>
                <Button variant="outline" nativeButton={false} render={<Link href="/discover" />}>Find skills</Button>
              </>
            ) : (
              <LibraryEmptyStateCtas teamId={activeId} />
            )}
          </div>
        </section>
      )}
    </>
  )
}

function LibraryResultsFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Loading saved skills" aria-busy="true">
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
      <Skeleton className="hidden h-72 rounded-2xl xl:block" />
    </div>
  )
}

export default function LibraryPage({ searchParams }: LibraryPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="font-mono text-sm text-primary">Library</p>
          <h1 className="mt-3 max-w-[15ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
            Skills your team recommends.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Find the right one, then open the source, copy the command, or download the latest ZIP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 lg:justify-end">
          <Suspense fallback={<LibraryStatsFallback />}>
            <LibraryStats />
          </Suspense>
          <Button
            variant="outline"
            nativeButton={false}
            render={(
              <TrackedLink
                href="/settings/mcp"
                analytics={{
                  event: "mcp_entry_clicked",
                  properties: mcpEntryEventProperties("library_header", "/settings/mcp"),
                }}
              />
            )}
          >
            <CableIcon data-icon="inline-start" />
            Connect agent
          </Button>
          <AddSkillDialog />
        </div>
      </section>

      <FilterPendingProvider>
        <Suspense fallback={<LibraryFiltersFallback />}>
          <LibraryFilters searchParams={searchParams} />
        </Suspense>

        <PendingResultsSlot className="flex flex-col gap-10">
          <Suspense fallback={<LibraryResultsFallback />}>
            <LibraryResults searchParams={searchParams} />
          </Suspense>
        </PendingResultsSlot>
      </FilterPendingProvider>
    </main>
  )
}
