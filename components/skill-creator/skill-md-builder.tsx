"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  DownloadIcon,
  FolderDownIcon,
  PlusIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { captureAnalyticsEvent } from "@/lib/analytics-client"
import { pickSkillForUrl } from "@/lib/skill-check/pick-skill"
import type { SkillCheckReport, SkillCheckReportEntry } from "@/lib/skill-check/report"
import {
  buildSkillMd,
  countBodyLines,
  emptySkillDraft,
  hasBlockingIssue,
  SKILL_BODY_LINE_BUDGET,
  SKILL_COMPATIBILITY_MAX_LENGTH,
  SKILL_DESCRIPTION_MAX_LENGTH,
  SKILL_FILE_NAME,
  SKILL_NAME_MAX_LENGTH,
  skillDirectoryName,
  skillDirectoryTree,
  validateSkillDraft,
  type SkillDraft,
  type SkillIssue,
} from "@/lib/skill-creator/skill-md"
import { cn } from "@/lib/utils"

interface MetadataRow {
  id: number
  key: string
  value: string
}

function toRows(draft: SkillDraft): MetadataRow[] {
  return draft.metadata.map((entry, index) => ({ id: index, ...entry }))
}

function download(bytes: BlobPart, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([bytes], { type }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = fileName
  anchor.rel = "noopener"
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function CharacterCount({ used, limit }: { used: number; limit: number }) {
  const over = used > limit
  return (
    <span
      className={cn(
        "font-mono text-xs tabular-nums",
        over ? "text-destructive" : "text-muted-foreground",
      )}
    >
      {used} / {limit}
    </span>
  )
}

function IssueList({ issues }: { issues: readonly SkillIssue[] }) {
  if (issues.length === 0) {
    return (
      <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
        <CircleCheckIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden="true"
        />
        <span>
          Every rule the specification states for these fields passes. That is a
          check on the frontmatter, not a verdict on the skill.
        </span>
      </p>
    )
  }

  return (
    <ul className="space-y-3">
      {issues.map((issue) => (
        <li
          key={`${issue.field}-${issue.level}-${issue.message}`}
          className="flex items-start gap-2 text-sm leading-6"
        >
          {issue.level === "error" ? (
            <CircleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-destructive"
              aria-hidden="true"
            />
          ) : (
            <TriangleAlertIcon
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          <span>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {issue.field}
            </span>{" "}
            <span
              className={cn(
                issue.level === "error" ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {issue.message}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* -------------------------------------------------------------------------- */
/* Loading a skill from a GitHub URL                                           */
/* -------------------------------------------------------------------------- */

/** What the check endpoint sends when it refuses: an RFC 9457 document. */
const PROBLEM_MEDIA_TYPE = "application/problem+json"

type ImportState =
  | { status: "loading" }
  | {
      status: "loaded"
      skill: SkillCheckReportEntry
      repository: SkillCheckReport["repository"]
      otherCount: number
      errorCount: number
      warningCount: number
    }
  | { status: "failed"; message: string }

function rateLimitMessage(retryAfter: string | null) {
  const seconds = Number(retryAfter)
  if (Number.isFinite(seconds) && seconds > 0) {
    return `Too many reads from this network. Try again in ${Math.ceil(seconds)} seconds.`
  }
  return "Too many reads from this network. Try again in a minute."
}

/** A report, as opposed to a problem document or anything else that parsed. */
function isSkillCheckReport(payload: unknown): payload is SkillCheckReport {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as { skills?: unknown }).skills)
  )
}

/**
 * The line above the form while a `?from=` URL is read, and after.
 *
 * A row rather than a dialog: the form below it stays usable throughout, so a
 * slow repository or a dead URL costs the reader nothing.
 */
function ImportRow({ url, state }: { url: string; state: ImportState }) {
  if (state.status === "loading") {
    return (
      <p
        className="rounded-[3px] border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
        aria-live="polite"
      >
        Loading <span className="break-all font-mono text-xs">{url}</span>…
      </p>
    )
  }

  if (state.status === "failed") {
    return (
      <p
        className="rounded-[3px] border border-destructive/40 bg-card px-4 py-3 text-sm text-destructive"
        aria-live="polite"
      >
        {state.message} The example below is still loaded.
      </p>
    )
  }

  const { skill, repository, otherCount, errorCount, warningCount } = state
  const shortSha = repository ? repository.commitSha.slice(0, 7) : ""

  return (
    <div
      className="rounded-[3px] border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      aria-live="polite"
    >
      <p>
        Loaded{" "}
        <a
          href={skill.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="break-all font-mono text-xs font-semibold underline decoration-border underline-offset-4 hover:text-foreground"
        >
          {skill.filePath}
        </a>
        {repository ? (
          <>
            {" "}
            from {repository.owner}/{repository.name} at {shortSha}
          </>
        ) : null}
        {otherCount > 0 ? (
          <>
            {" "}
            ({otherCount} other {otherCount === 1 ? "skill" : "skills"} in this repository{" "}
            {otherCount === 1 ? "was" : "were"} not loaded)
          </>
        ) : null}
      </p>
      {errorCount + warningCount > 0 ? (
        <p className="mt-1">
          {errorCount} {errorCount === 1 ? "error" : "errors"} and {warningCount}{" "}
          {warningCount === 1 ? "warning" : "warnings"} from the checker: the fields below
          show them.
        </p>
      ) : null}
    </div>
  )
}

/** The query key that names a GitHub URL to load into the form. */
export const SKILL_CREATOR_IMPORT_PARAM = "from"

/**
 * The `?from=` URL, read in the browser. The page stays fully static this way:
 * reading `searchParams` on the server would turn the route dynamic and stop
 * it from being prerendered, and the client hook for the query string would
 * need a Suspense boundary around the tool. The value is only needed inside the effect that
 * fetches it, so the address bar is read there.
 */
function readImportUrl() {
  if (typeof window === "undefined") return undefined
  const value = new URLSearchParams(window.location.search).get(SKILL_CREATOR_IMPORT_PARAM)
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function SkillMdBuilder({
  exampleDraft,
  privacyNote,
}: {
  exampleDraft: SkillDraft
  privacyNote: string
}) {
  const fieldId = useId()
  const [draft, setDraft] = useState<SkillDraft>(exampleDraft)
  const [metadataRows, setMetadataRows] = useState<MetadataRow[]>(() =>
    toRows(exampleDraft),
  )
  const [nextRowId, setNextRowId] = useState(() => metadataRows.length)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [importUrl, setImportUrl] = useState<string | undefined>(undefined)
  const [importState, setImportState] = useState<ImportState | null>(null)
  /** The URL an import already ran for, so a rerender does not repeat it. */
  const importedRef = useRef<string | null>(null)

  // Read after hydration, so the server and the first client render agree.
  useEffect(() => {
    setImportUrl(readImportUrl())
  }, [])

  /**
   * A `?from=` URL is read once, through the same endpoint `/check` uses, and
   * the skill it names is loaded into the fields. Nothing is cleared before
   * the answer arrives: the example stays in the form, so the page does not
   * blank out while a repository is being read, and a failure leaves the
   * reader with a working tool rather than an empty one.
   */
  useEffect(() => {
    if (!importUrl || importedRef.current === importUrl) return
    importedRef.current = importUrl
    let cancelled = false
    setImportState({ status: "loading" })

    async function run(target: string) {
      try {
        const response = await fetch(`/api/check?url=${encodeURIComponent(target)}`, {
          headers: { Accept: "application/json" },
        })

        const contentType = (response.headers.get("Content-Type") ?? "").toLowerCase()
        const isProblem =
          contentType.includes(PROBLEM_MEDIA_TYPE) || !contentType.includes("json")

        if (response.status === 429 || isProblem) {
          const rateLimited = response.status === 429
          if (cancelled) return
          setImportState({
            status: "failed",
            message: rateLimited
              ? rateLimitMessage(response.headers.get("Retry-After"))
              : "That URL could not be read right now.",
          })
          captureAnalyticsEvent("skill_creator_import_failed", {
            error_code: rateLimited ? "rate_limited" : "unexpected_response",
          })
          return
        }

        const payload: unknown = await response.json()

        if (!isSkillCheckReport(payload)) {
          if (cancelled) return
          setImportState({
            status: "failed",
            message: "That URL could not be read right now.",
          })
          captureAnalyticsEvent("skill_creator_import_failed", {
            error_code: "unexpected_response",
          })
          return
        }

        if (payload.error) {
          if (cancelled) return
          setImportState({ status: "failed", message: payload.error.message })
          captureAnalyticsEvent("skill_creator_import_failed", {
            error_code: payload.error.code,
          })
          return
        }

        const skill = pickSkillForUrl(target, payload.skills)

        if (!skill) {
          if (cancelled) return
          setImportState({
            status: "failed",
            message: "No SKILL.md file was found at that URL, so nothing was loaded.",
          })
          captureAnalyticsEvent("skill_creator_import_failed", {
            error_code: "no_skills_found",
          })
          return
        }

        if (cancelled) return
        setDraft(skill.draft)
        setMetadataRows(toRows(skill.draft))
        setNextRowId(skill.draft.metadata.length)
        setArchiveError(null)
        setImportState({
          status: "loaded",
          skill,
          repository: payload.repository,
          otherCount: payload.skills.length - 1,
          errorCount: skill.errors.length,
          warningCount: skill.warnings.length,
        })
        captureAnalyticsEvent("skill_creator_import_completed", {
          skills_found: payload.skills.length,
          error_count: skill.errors.length,
          warning_count: skill.warnings.length,
        })
      } catch {
        if (cancelled) return
        setImportState({
          status: "failed",
          message:
            "That URL could not be read from this browser. Check your connection and try again.",
        })
        captureAnalyticsEvent("skill_creator_import_failed", { error_code: "network" })
      }
    }

    void run(importUrl)

    return () => {
      cancelled = true
    }
  }, [importUrl])

  const activeDraft = useMemo<SkillDraft>(
    () => ({
      ...draft,
      metadata: metadataRows.map((row) => ({ key: row.key, value: row.value })),
    }),
    [draft, metadataRows],
  )

  const skillMd = useMemo(() => buildSkillMd(activeDraft), [activeDraft])
  const issues = useMemo(() => validateSkillDraft(activeDraft), [activeDraft])
  const blocked = hasBlockingIssue(issues)
  const directory = skillDirectoryName(activeDraft)
  const errorCount = issues.filter((issue) => issue.level === "error").length

  function update<Key extends keyof SkillDraft>(key: Key, value: SkillDraft[Key]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function load(next: SkillDraft) {
    setDraft(next)
    setMetadataRows(toRows(next))
    setNextRowId(next.metadata.length)
    setArchiveError(null)
  }

  function downloadFile() {
    download(skillMd, SKILL_FILE_NAME, "text/markdown;charset=utf-8")
    captureAnalyticsEvent("skill_md_generated", { output: "skill_md" })
  }

  async function downloadFolder() {
    setArchiveError(null)
    try {
      const { buildDeterministicZip } = await import("@/lib/deterministic-zip")
      const zip = buildDeterministicZip(
        [
          {
            bytes: new TextEncoder().encode(skillMd),
            relativePath: SKILL_FILE_NAME,
          },
        ],
        directory,
      )
      download(zip as BlobPart, `${directory}.zip`, "application/zip")
      captureAnalyticsEvent("skill_md_generated", { output: "folder_zip" })
    } catch {
      setArchiveError(
        `The folder ${directory} cannot be written on every filesystem, so the archive was not created. Rename the skill and try again.`,
      )
    }
  }

  return (
    <div className="mt-9 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {importUrl && importState ? (
        <div className="lg:col-span-2">
          <ImportRow url={importUrl} state={importState} />
        </div>
      ) : null}
      <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Your skill
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-[3px]"
              onClick={() => load(exampleDraft)}
            >
              Load the example
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 rounded-[3px]"
              onClick={() => load(emptySkillDraft)}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor={`${fieldId}-name`}>Name</Label>
              <CharacterCount
                used={activeDraft.name.trim().length}
                limit={SKILL_NAME_MAX_LENGTH}
              />
            </div>
            <Input
              id={`${fieldId}-name`}
              className="mt-2 font-mono"
              value={draft.name}
              spellCheck={false}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="reviewing-pull-requests"
              onChange={(event) => update("name", event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Lowercase letters, numbers, and hyphens. The directory the skill
              lives in has to carry the same string, which is why the download
              builds the folder for you. Anthropic&apos;s guidance suggests a
              gerund, such as reviewing-pull-requests over helper.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor={`${fieldId}-description`}>Description</Label>
              <CharacterCount
                used={activeDraft.description.trim().length}
                limit={SKILL_DESCRIPTION_MAX_LENGTH}
              />
            </div>
            <Textarea
              id={`${fieldId}-description`}
              className="mt-2 min-h-24"
              value={draft.description}
              placeholder="States what the skill does, then when to use it."
              onChange={(event) => update("description", event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              This is the trigger. An agent holds the name and the description
              of every installed skill and reads the body only after it has
              decided this one is relevant, so say what the skill does and then
              name the requests that should reach it.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor={`${fieldId}-body`}>Instructions</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {countBodyLines(activeDraft.body)} / {SKILL_BODY_LINE_BUDGET} lines
              </span>
            </div>
            <Textarea
              id={`${fieldId}-body`}
              className="mt-2 min-h-64 font-mono text-[0.8rem] leading-6"
              value={draft.body}
              spellCheck={false}
              placeholder="# Skill title"
              onChange={(event) => update("body", event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Markdown, loaded in full once the skill fires. Write only what the
              agent would get wrong without you, and move anything long into a
              file beside SKILL.md that you tell it when to open.
            </p>
          </div>

          <details className="rounded-[3px] border border-border/70 bg-background/60 p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Optional specification fields
            </summary>
            <div className="mt-5 space-y-5">
              <div>
                <Label htmlFor={`${fieldId}-license`}>License</Label>
                <Input
                  id={`${fieldId}-license`}
                  className="mt-2 font-mono"
                  value={draft.license}
                  spellCheck={false}
                  placeholder="Apache-2.0"
                  onChange={(event) => update("license", event.target.value)}
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  A license name, or the name of a license file bundled with the
                  skill. The specification recommends keeping it short.
                </p>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor={`${fieldId}-compatibility`}>Compatibility</Label>
                  <CharacterCount
                    used={activeDraft.compatibility.trim().length}
                    limit={SKILL_COMPATIBILITY_MAX_LENGTH}
                  />
                </div>
                <Input
                  id={`${fieldId}-compatibility`}
                  className="mt-2"
                  value={draft.compatibility}
                  placeholder="Requires git and access to the internet"
                  onChange={(event) => update("compatibility", event.target.value)}
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Environment requirements. The specification notes that most
                  skills do not need this field.
                </p>
              </div>

              <div>
                <Label htmlFor={`${fieldId}-allowed-tools`}>Allowed tools</Label>
                <Input
                  id={`${fieldId}-allowed-tools`}
                  className="mt-2 font-mono"
                  value={draft.allowedTools}
                  spellCheck={false}
                  placeholder="Read Grep Bash(git:*)"
                  onChange={(event) => update("allowedTools", event.target.value)}
                />
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Space-separated, and the one field the specification marks
                  experimental. Support varies between agents.
                </p>
              </div>

              <div>
                <span className="text-sm leading-none font-medium">Metadata</span>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  A map of string keys to string values for properties the format
                  does not define. Your own tooling reads it; Claude Code accepts
                  it and does not act on it.
                </p>
                <div className="mt-3 space-y-2">
                  {metadataRows.map((row) => (
                    <div key={row.id} className="flex items-center gap-2">
                      <Input
                        className="h-10 font-mono"
                        value={row.key}
                        spellCheck={false}
                        aria-label="Metadata key"
                        placeholder="author"
                        onChange={(event) =>
                          setMetadataRows((current) =>
                            current.map((candidate) =>
                              candidate.id === row.id
                                ? { ...candidate, key: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                      />
                      <Input
                        className="h-10 font-mono"
                        value={row.value}
                        spellCheck={false}
                        aria-label="Metadata value"
                        placeholder="example-org"
                        onChange={(event) =>
                          setMetadataRows((current) =>
                            current.map((candidate) =>
                              candidate.id === row.id
                                ? { ...candidate, value: event.target.value }
                                : candidate,
                            ),
                          )
                        }
                      />
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Remove the metadata row ${row.key || "with no key"}`}
                        onClick={() =>
                          setMetadataRows((current) =>
                            current.filter((candidate) => candidate.id !== row.id),
                          )
                        }
                      >
                        <XIcon />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-[3px]"
                    onClick={() => {
                      setMetadataRows((current) => [
                        ...current,
                        { id: nextRowId, key: "", value: "" },
                      ])
                      setNextRowId((current) => current + 1)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Add a metadata pair
                  </Button>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {SKILL_FILE_NAME}
            </h3>
            <CopyButton
              value={skillMd}
              label="Copy the file"
              ariaLabel="Copy the generated SKILL.md"
              className="rounded-[3px]"
              disabled={blocked}
              analytics={{
                event: "skill_md_generated",
                properties: { output: "clipboard" },
              }}
            />
          </div>
          <pre className="mt-4 max-h-[26rem] overflow-auto rounded-[3px] border border-border/70 bg-background/70 p-4 font-mono text-[0.78rem] leading-6">
            <code>{skillMd}</code>
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="rounded-[3px]"
              disabled={blocked}
              onClick={downloadFile}
            >
              <DownloadIcon data-icon="inline-start" />
              Download {SKILL_FILE_NAME}
            </Button>
            <Button
              size="sm"
              className="rounded-[3px]"
              disabled={blocked}
              onClick={downloadFolder}
            >
              <FolderDownIcon data-icon="inline-start" />
              Download the folder
            </Button>
          </div>
          {blocked ? (
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {errorCount === 1
                ? "One error is blocking the copy and the download."
                : `${errorCount} errors are blocking the copy and the download.`}{" "}
              The preview stays live so you can see what changes as you fix them.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <p className="text-xs leading-5 text-muted-foreground">
                The archive holds the directory the specification requires, with
                the name field and the folder name matching:
              </p>
              <pre className="rounded-[3px] border border-border/70 bg-background/70 p-3 font-mono text-[0.72rem] leading-5">
                <code>{skillDirectoryTree(activeDraft)}</code>
              </pre>
            </div>
          )}
          {archiveError ? (
            <p className="mt-3 text-xs leading-5 text-destructive">{archiveError}</p>
          ) : null}
        </div>

        <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Checks
          </h3>
          <div className="mt-4" aria-live="polite">
            <IssueList issues={issues} />
          </div>
          <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-5 text-muted-foreground">
            {privacyNote}
          </p>
        </div>
      </div>
    </div>
  )
}
