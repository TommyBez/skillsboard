import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon, DownloadIcon, FolderOpenIcon } from "lucide-react"

import { AddToCollectionMenu } from "@/components/add-to-collection-menu"
import { DeleteCollectionDialog } from "@/components/delete-collection-dialog"
import { EditCollectionDialog } from "@/components/edit-collection-dialog"
import { EditSkillNoteDialog } from "@/components/edit-skill-note-dialog"
import { EditSkillPromptsDialog } from "@/components/edit-skill-prompts-dialog"
import { InstallableCollectionPanel } from "@/components/installable-collection-panel"
import { ManageCollectionSkillsDialog } from "@/components/manage-collection-skills-dialog"
import { RemoveFromCollectionButton } from "@/components/remove-from-collection-button"
import { SkillDossier } from "@/components/skill-dossier"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAppContext } from "@/lib/app-context"
import { getAuthBaseUrl } from "@/lib/auth-environment"
import {
  getCollectionDistribution,
  listCollectionDistributionIds,
} from "@/lib/db/collection-distributions"
import {
  getOrganizationCollection,
  listCollectionSkills,
  listOrganizationCollectionMemberships,
  listOrganizationCollections,
  listOrganizationSkills,
} from "@/lib/db/queries"
import { buildInstallCommand } from "@/lib/install-command"
import {
  buildInstallableCollectionCommand,
  buildInstallableCollectionUrl,
} from "@/lib/installable-collection-protocol"
import { isOrganizationAdmin } from "@/lib/session"
import { siteConfig } from "@/lib/site"

interface CollectionDetailPageProps {
  params: Promise<{ collectionId: string }>
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function CollectionDetail({ params }: CollectionDetailPageProps) {
  const [{ activeId, session, role }, { collectionId }] = await Promise.all([getAppContext(), params])
  if (!UUID_PATTERN.test(collectionId)) notFound()

  const collection = await getOrganizationCollection(activeId, collectionId)
  if (!collection) notFound()

  const [collectionSkills, librarySkills, allCollections, collectionMemberships, distributionState, distributionRows] = await Promise.all([
    listCollectionSkills(activeId, collectionId),
    listOrganizationSkills(activeId),
    listOrganizationCollections(activeId),
    listOrganizationCollectionMemberships(activeId),
    getCollectionDistribution(activeId, collectionId),
    listCollectionDistributionIds(activeId),
  ])
  const userId = session.user.id
  const canManageLibrary = isOrganizationAdmin(role)
  const canManageCollection = collection.createdBy === userId || canManageLibrary
  const canManageMembership = !distributionState || canManageCollection
  const sourceVerificationCount = collectionSkills.filter(
    (item) => item.skillPath === null,
  ).length
  const collectionSkillIds = new Set(collectionSkills.map((item) => item.id))
  const distributedCollectionIds = new Set(distributionRows.map((item) => item.collectionId))
  const collectionOptions = allCollections.map((item) => ({
    id: item.id,
    readOnly: distributedCollectionIds.has(item.id)
      && item.createdBy !== userId
      && !canManageLibrary,
    title: item.title,
  }))
  const collectionIdsBySkill = new Map<string, string[]>()
  for (const membership of collectionMemberships) {
    const existing = collectionIdsBySkill.get(membership.skillId)
    if (existing) existing.push(membership.collectionId)
    else collectionIdsBySkill.set(membership.skillId, [membership.collectionId])
  }
  const skillOptions = librarySkills.map((item) => ({
    id: item.id,
    title: item.title,
    source: `${item.repoOwner}/${item.repoName}`,
    inCollection: collectionSkillIds.has(item.id),
  }))
  const distributionBaseUrl = getAuthBaseUrl() ?? siteConfig.url
  const activeDistribution = distributionState
    && !distributionState.revokedAt
    && distributionState.activeReleaseId
    && distributionState.publishedAt
    ? {
        activeRevision: distributionState.activeRevision,
        changesPending: collection.updatedAt.getTime() > distributionState.publishedAt.getTime(),
        installCommand: buildInstallableCollectionCommand(
          distributionBaseUrl,
          distributionState.shareId,
        ),
        publishedAt: distributionState.publishedAt.toISOString(),
        publishedTitle: distributionState.releaseTitle ?? collection.title,
        shareUrl: buildInstallableCollectionUrl(
          distributionBaseUrl,
          distributionState.shareId,
        ),
      }
    : null
  const disabledDistribution = distributionState?.revokedAt
    && distributionState.activeReleaseId
    && distributionState.publishedAt
    ? {
        activeRevision: distributionState.activeRevision,
        publishedAt: distributionState.publishedAt.toISOString(),
        publishedTitle: distributionState.releaseTitle ?? collection.title,
      }
    : null

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-1.5 font-mono text-sm text-primary transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-3.5" aria-hidden="true" />
            All collections
          </Link>
          <h1 className="mt-3 max-w-[20ch] text-balance text-4xl font-semibold leading-[1.02] tracking-display md:text-6xl">
            {collection.title}
          </h1>
          {collection.description ? (
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {collection.description}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {collection.tags.length ? (
              <span className="flex flex-wrap gap-1.5">
                {collection.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
              </span>
            ) : null}
            {collection.createdByName ? (
              <span>
                Created by <span className="font-medium text-foreground">{collection.createdByName}</span>
              </span>
            ) : null}
            <span className="font-mono tabular-nums">
              {collectionSkills.length} {collectionSkills.length === 1 ? "skill" : "skills"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {canManageMembership ? (
            <ManageCollectionSkillsDialog
              collectionId={collection.id}
              collectionTitle={collection.title}
              skills={skillOptions}
            />
          ) : null}
          {canManageCollection ? (
            <>
              <EditCollectionDialog
                collectionId={collection.id}
                title={collection.title}
                description={collection.description}
                tags={collection.tags}
              />
              <DeleteCollectionDialog
                collectionId={collection.id}
                collectionTitle={collection.title}
              />
            </>
          ) : null}
        </div>
      </section>

      <InstallableCollectionPanel
        collectionId={collection.id}
        collectionTitle={collection.title}
        canManage={canManageCollection}
        disabledDistribution={disabledDistribution}
        skillCount={collectionSkills.length}
        sourceVerificationCount={sourceVerificationCount}
        teamId={activeId}
        distribution={activeDistribution}
      />

      {collectionSkills.length ? (
        <section aria-label={`Skills in the ${collection.title} collection`} className="cascade-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collectionSkills.map((item) => {
            const command = buildInstallCommand(item.githubUrl, item.skillName)
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
                  actorIsSkillCreator: item.createdBy === userId,
                  skillId: item.id,
                  skillName: item.skillName,
                  surface: "collection",
                  teamId: activeId,
                }}
                actions={(
                  <>
                    {canManageMembership ? (
                      <RemoveFromCollectionButton
                        collectionId={collection.id}
                        collectionTitle={collection.title}
                        skillId={item.id}
                        skillName={item.title}
                      />
                    ) : null}
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
                    {item.createdBy === userId ? (
                      <EditSkillNoteDialog
                        skillId={item.id}
                        skillName={item.title}
                        note={item.note}
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
        </section>
      ) : (
        <section className="grid min-h-64 items-center gap-7 border-y border-border py-10 md:grid-cols-[auto_minmax(0,1fr)_auto]">
          <FolderOpenIcon className="size-9 text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-3xl font-semibold tracking-display md:text-4xl">No skills in this collection yet</h2>
            <p className="mt-3 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Add skills from your team library, or save new ones from the library page first.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {canManageMembership ? (
              <ManageCollectionSkillsDialog
                collectionId={collection.id}
                collectionTitle={collection.title}
                skills={skillOptions}
              />
            ) : null}
            <Button variant="outline" nativeButton={false} render={<Link href="/library" />}>Browse library</Button>
          </div>
        </section>
      )}
    </>
  )
}

function CollectionDetailFallback() {
  return (
    <div className="grid gap-8" aria-label="Loading collection">
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}

export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-10 pb-28 md:px-6 md:pb-12 lg:px-8 lg:py-14">
      <Suspense fallback={<CollectionDetailFallback />}>
        <CollectionDetail params={params} />
      </Suspense>
    </main>
  )
}
