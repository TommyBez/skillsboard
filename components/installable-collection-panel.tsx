"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ExternalLinkIcon,
  Link2Icon,
  PackageOpenIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  UnlinkIcon,
  UploadCloudIcon,
} from "lucide-react"
import { toast } from "sonner"

import {
  disableCollectionDistribution,
  publishCollectionDistribution,
  rotateCollectionDistributionLink,
} from "@/app/actions/collection-distribution"
import { ButtonPendingContent } from "@/components/button-pending-content"
import { CopyButton } from "@/components/copy-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MAX_INSTALLABLE_COLLECTION_SKILLS } from "@/lib/installable-collection-protocol"

interface CollectionDistribution {
  shareUrl: string
  installCommand: string
  activeRevision: number
  publishedAt: string
  publishedTitle: string
  changesPending: boolean
}

type DisabledCollectionDistribution = Pick<
  CollectionDistribution,
  "activeRevision" | "publishedAt" | "publishedTitle"
>

interface InstallableCollectionPanelProps {
  collectionId: string
  collectionTitle: string
  canManage: boolean
  disabledDistribution: DisabledCollectionDistribution | null
  skillCount: number
  sourceVerificationCount: number
  teamId: string
  distribution: CollectionDistribution | null
}

type PendingAction = "publish" | "rotate" | "disable" | null

const publishedAtFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
})

export function InstallableCollectionPanel({
  collectionId,
  collectionTitle,
  canManage,
  disabledDistribution,
  skillCount,
  sourceVerificationCount,
  teamId,
  distribution,
}: InstallableCollectionPanelProps) {
  const router = useRouter()
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [rotateDialogOpen, setRotateDialogOpen] = useState(false)
  const [disableDialogOpen, setDisableDialogOpen] = useState(false)
  const isPending = pendingAction !== null
  const exceedsSkillLimit = skillCount > MAX_INSTALLABLE_COLLECTION_SKILLS
  const needsSourceVerification = sourceVerificationCount > 0
  const sourceVerificationSubject = sourceVerificationCount === 1
    ? "the GitHub source for 1 existing skill"
    : `the GitHub sources for ${sourceVerificationCount} existing skills`
  const sourceVerificationDescription = needsSourceVerification
    ? `Skills Board will verify ${sourceVerificationSubject} during publishing.`
    : ""
  const publishPendingLabel = needsSourceVerification
    ? "Verifying and publishing…"
    : "Publishing…"
  let unpublishedPublishLabel = disabledDistribution
    ? "Publish new install link"
    : "Publish install link"
  let livePublishLabel = distribution?.changesPending
    ? "Publish update"
    : "Refresh release"
  if (needsSourceVerification) {
    unpublishedPublishLabel = disabledDistribution
      ? "Verify & publish new link"
      : "Verify & publish"
    livePublishLabel = distribution?.changesPending
      ? "Verify & publish update"
      : "Verify & refresh release"
  }
  const disabledPublishRequirement = skillCount === 0
    ? " Add at least one skill before publishing."
    : exceedsSkillLimit
      ? ` Remove ${skillCount - MAX_INSTALLABLE_COLLECTION_SKILLS} ${skillCount - MAX_INSTALLABLE_COLLECTION_SKILLS === 1 ? "skill" : "skills"} before publishing.`
      : ""
  let unpublishedDescription: string
  if (disabledDistribution) {
    unpublishedDescription = `Revision ${disabledDistribution.activeRevision}, published as “${disabledDistribution.publishedTitle}” on ${publishedAtFormatter.format(new Date(disabledDistribution.publishedAt))}, is offline. Publishing again creates a new revision and a new unlisted URL.${disabledPublishRequirement}`
  } else if (skillCount === 0) {
    unpublishedDescription = "Add at least one skill before publishing an install link."
  } else if (exceedsSkillLimit) {
    unpublishedDescription = `Installable collections currently support up to ${MAX_INSTALLABLE_COLLECTION_SKILLS} skills. Remove ${skillCount - MAX_INSTALLABLE_COLLECTION_SKILLS} before publishing.`
  } else {
    unpublishedDescription = `Publish an unlisted link so teammates can install all ${skillCount} ${skillCount === 1 ? "skill" : "skills"} in this collection with one command. Anyone with the link can open the shared page.`
  }
  if (sourceVerificationDescription) {
    unpublishedDescription += ` ${sourceVerificationDescription}`
  }

  async function publish() {
    setPendingAction("publish")
    try {
      const result = await publishCollectionDistribution({ collectionId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(distribution ? "Collection update published" : "Install link published")
      router.refresh()
    } catch (error) {
      console.error("Unable to publish collection distribution", error)
      toast.error("We couldn’t publish this collection. Try again.")
    } finally {
      setPendingAction(null)
    }
  }

  async function rotateLink() {
    setPendingAction("rotate")
    try {
      const result = await rotateCollectionDistributionLink({ collectionId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success("Install link regenerated")
      setRotateDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to regenerate collection distribution link", error)
      toast.error("We couldn’t regenerate this link. Try again.")
    } finally {
      setPendingAction(null)
    }
  }

  async function disable() {
    setPendingAction("disable")
    try {
      const result = await disableCollectionDistribution({ collectionId })
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success("Install link disabled")
      setDisableDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Unable to disable collection distribution", error)
      toast.error("We couldn’t disable this install link. Try again.")
    } finally {
      setPendingAction(null)
    }
  }

  if (!distribution) {
    return (
      <Card>
        <CardHeader className="gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:grid-rows-[auto_auto]">
          <span className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
            <PackageOpenIcon className="size-5" />
          </span>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <CardTitle className="text-xl">Installable collection</CardTitle>
            {disabledDistribution ? <Badge variant="outline">Disabled</Badge> : null}
          </div>
          <CardDescription className="max-w-2xl leading-relaxed">
            {unpublishedDescription}
          </CardDescription>
        </CardHeader>
        {canManage ? (
          <CardFooter className="justify-end">
            <Button
              disabled={isPending || skillCount === 0 || exceedsSkillLimit}
              aria-busy={pendingAction === "publish" || undefined}
              onClick={publish}
            >
              <ButtonPendingContent pending={pendingAction === "publish"} pendingLabel={publishPendingLabel}>
                <UploadCloudIcon data-icon="inline-start" />
                {unpublishedPublishLabel}
              </ButtonPendingContent>
            </Button>
          </CardFooter>
        ) : null}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-rows-[auto_auto]">
        <span className="row-span-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
          <PackageOpenIcon className="size-5" />
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <CardTitle className="text-xl">Installable collection</CardTitle>
          <Badge>Live</Badge>
          {distribution.changesPending ? <Badge variant="outline">Update ready</Badge> : null}
        </div>
        <p className="font-mono text-xs tabular-nums text-muted-foreground sm:col-start-3 sm:row-span-2 sm:row-start-1 sm:text-right">
          Revision {distribution.activeRevision}
          <span className="mt-1 block font-sans">Published {publishedAtFormatter.format(new Date(distribution.publishedAt))}</span>
        </p>
        <CardDescription className="max-w-2xl leading-relaxed">
          Share one command for revision {distribution.activeRevision}, published as “{distribution.publishedTitle}”. Publish another revision when the collection changes.{sourceVerificationDescription ? ` ${sourceVerificationDescription}` : null}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        {exceedsSkillLimit ? (
          <Alert variant="destructive">
            <ShieldAlertIcon aria-hidden="true" />
            <AlertTitle>Too many skills for a new release</AlertTitle>
            <AlertDescription>
              Keep the live revision as-is, or remove {skillCount - MAX_INSTALLABLE_COLLECTION_SKILLS} {skillCount - MAX_INSTALLABLE_COLLECTION_SKILLS === 1 ? "skill" : "skills"} before publishing an update.
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="ph-no-capture overflow-hidden rounded-xl border border-border bg-background">
          <div className="flex min-w-0 items-center gap-3 px-4 py-3">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-foreground">
              {distribution.installCommand}
            </code>
            <CopyButton
              analytics={{
                event: "collection_install_command_copied",
                properties: { collection_id: collectionId, team_id: teamId },
              }}
              ariaLabel={`Copy install command for ${collectionTitle}`}
              copiedAriaLabel={`Copied install command for ${collectionTitle}`}
              label="Copy command"
              value={distribution.installCommand}
            />
          </div>
          <div className="flex justify-end border-t border-border bg-muted/35 px-3 py-2">
            <Button
              variant="link"
              size="sm"
              nativeButton={false}
              render={<a href={distribution.shareUrl} target="_blank" rel="noreferrer" />}
            >
              Open shared page
              <ExternalLinkIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>

        <Alert className="border-amber-500/25 bg-amber-500/[0.045] text-amber-950 dark:text-amber-100">
          <ShieldAlertIcon aria-hidden="true" />
          <AlertTitle>Anyone with the link can access this release</AlertTitle>
          <AlertDescription>
            The page is unlisted, not private. Regenerate the link to revoke the current URL, or disable distribution to take it offline. The Vercel skills CLI may include the source URL in anonymous telemetry unless the recipient opts out.
          </AlertDescription>
        </Alert>
      </CardContent>

      {canManage ? (
        <CardFooter className="flex-wrap justify-end gap-2">
          <Button
            size="sm"
            disabled={isPending || exceedsSkillLimit}
            aria-busy={pendingAction === "publish" || undefined}
            onClick={publish}
          >
            <ButtonPendingContent pending={pendingAction === "publish"} pendingLabel={publishPendingLabel}>
              <UploadCloudIcon data-icon="inline-start" />
              {livePublishLabel}
            </ButtonPendingContent>
          </Button>

          <Dialog open={rotateDialogOpen} onOpenChange={(open) => {
            if (pendingAction !== "rotate") setRotateDialogOpen(open)
          }}>
            <DialogTrigger render={<Button variant="outline" size="sm" disabled={isPending} />}>
              <RefreshCwIcon data-icon="inline-start" />
              Regenerate link
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Regenerate the install link?</DialogTitle>
                <DialogDescription>
                  The current shared URL for {collectionTitle} will stop working immediately. Existing installations keep their files, but updates from the old locked source will fail until recipients reinstall from the new link.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" disabled={pendingAction === "rotate"} />}>
                  Cancel
                </DialogClose>
                <Button
                  disabled={pendingAction === "rotate"}
                  aria-busy={pendingAction === "rotate" || undefined}
                  onClick={rotateLink}
                >
                  <ButtonPendingContent pending={pendingAction === "rotate"} pendingLabel="Regenerating…">
                    <Link2Icon data-icon="inline-start" />
                    Regenerate link
                  </ButtonPendingContent>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={disableDialogOpen} onOpenChange={(open) => {
            if (pendingAction !== "disable") setDisableDialogOpen(open)
          }}>
            <DialogTrigger render={<Button variant="destructive" size="sm" disabled={isPending} />}>
              <UnlinkIcon data-icon="inline-start" />
              Disable
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Disable this install link?</DialogTitle>
                <DialogDescription>
                  The shared page and its install command will stop working. Existing installations keep their files, but updates from this source will fail. The collection stays in your team library and can be republished with a new link later.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" disabled={pendingAction === "disable"} />}>
                  Cancel
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={pendingAction === "disable"}
                  aria-busy={pendingAction === "disable" || undefined}
                  onClick={disable}
                >
                  <ButtonPendingContent pending={pendingAction === "disable"} pendingLabel="Disabling…">
                    <UnlinkIcon data-icon="inline-start" />
                    Disable install link
                  </ButtonPendingContent>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      ) : null}
    </Card>
  )
}
