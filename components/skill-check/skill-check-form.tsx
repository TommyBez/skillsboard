"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { CopyButton } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { captureAnalyticsEvent } from "@/lib/analytics-client"
import { readGitHubUrl } from "@/lib/github-url"
import {
  countReportIssues,
  skillLocationLabel,
  type SkillCheckReport,
  type SkillCheckReportEntry,
} from "@/lib/skill-check/report"
import type { SkillCheckIssue } from "@/lib/skill-check/skill-check"
import type { SkillCheckDefinition } from "@/lib/seo/skill-check"
import { cn } from "@/lib/utils"

type Status = "idle" | "loading" | "done"

/** What the endpoint sends when it refuses the request: an RFC 9457 document. */
const PROBLEM_MEDIA_TYPE = "application/problem+json"

const REFUSED_MESSAGE =
  "The check could not be run right now. Try again in a moment."

/**
 * The refusal the public budget produces, worded for a reader.
 *
 * `Retry-After` is seconds, and the endpoint always sends it with a 429, so
 * the wait is stated when it is there and left vague when it is not.
 */
function rateLimitMessage(retryAfter: string | null) {
  const seconds = Number(retryAfter)
  if (Number.isFinite(seconds) && seconds > 0) {
    return `Too many checks from this network. Try again in ${Math.ceil(seconds)} seconds.`
  }
  return "Too many checks from this network. Try again in a minute."
}

/** A report, as opposed to a problem document or anything else that parsed. */
function isSkillCheckReport(payload: unknown): payload is SkillCheckReport {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Array.isArray((payload as { skills?: unknown }).skills)
  )
}

function issueLocation(issue: SkillCheckIssue) {
  return [issue.field, issue.line ? `line ${issue.line}` : null]
    .filter(Boolean)
    .join(", ")
}

function IssueRow({ issue, level }: { issue: SkillCheckIssue; level: "error" | "warning" }) {
  const location = issueLocation(issue)

  return (
    <li className="flex items-start gap-2 text-sm leading-6">
      {level === "error" ? (
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
          {location || issue.code}
        </span>{" "}
        <span className={cn(level === "error" ? "text-foreground" : "text-muted-foreground")}>
          {issue.message}
        </span>
      </span>
    </li>
  )
}

function SkillReportCard({ skill }: { skill: SkillCheckReportEntry }) {
  const passes = skill.errors.length === 0

  return (
    <article className="rounded-[3px] border border-border bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-mono text-sm font-semibold break-words">
            {skill.name ?? skill.filePath}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground break-words">
            {skillLocationLabel(skill)}
          </p>
        </div>
        <a
          href={skill.sourceUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
        >
          Open the file
          <ExternalLinkIcon className="size-3" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-1 font-semibold",
            passes
              ? "border-border text-muted-foreground"
              : "border-destructive/40 text-destructive",
          )}
        >
          {passes ? (
            <CircleCheckIcon className="size-3.5" aria-hidden="true" />
          ) : (
            <CircleAlertIcon className="size-3.5" aria-hidden="true" />
          )}
          {passes
            ? "Passes the format check"
            : `${skill.errors.length} ${skill.errors.length === 1 ? "error" : "errors"}`}
        </span>
        {skill.warnings.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-border px-2 py-1 font-semibold text-muted-foreground">
            <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
            {skill.warnings.length}{" "}
            {skill.warnings.length === 1 ? "warning" : "warnings"}
          </span>
        ) : null}
      </div>

      {skill.errors.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {skill.errors.map((issue) => (
            <IssueRow key={`${issue.code}-${issue.message}`} issue={issue} level="error" />
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Every rule the Agent Skills specification states for this file passes. That is a
          check on the format, not a verdict on the skill.
        </p>
      )}

      {skill.warnings.length > 0 ? (
        <ul className="mt-4 space-y-3 border-t border-border/70 pt-4">
          {skill.warnings.map((issue) => (
            <IssueRow key={`${issue.code}-${issue.message}`} issue={issue} level="warning" />
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export function SkillCheckForm({ entry }: { entry: SkillCheckDefinition }) {
  const fieldId = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const permalinkUrl = searchParams.get("url") ?? ""

  const [value, setValue] = useState(permalinkUrl)
  const [status, setStatus] = useState<Status>("idle")
  const [report, setReport] = useState<SkillCheckReport | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  /** The URL a check is already running or finished for, so a rerender does not repeat it. */
  const checkedRef = useRef<string | null>(null)

  const run = useCallback(async (target: string, source: "form" | "permalink") => {
    checkedRef.current = target
    setStatus("loading")
    setReport(null)
    setFailure(null)
    captureAnalyticsEvent("skill_check_started", { entry: source })

    try {
      const response = await fetch(`/api/check?url=${encodeURIComponent(target)}`, {
        headers: { Accept: "application/json" },
      })

      // A refusal is a problem document, not a report: it has no skills list,
      // so casting it would blow up the render two lines later. The status and
      // the media type are read before anything is parsed as a report.
      const contentType = (response.headers.get("Content-Type") ?? "").toLowerCase()
      const isProblem =
        contentType.includes(PROBLEM_MEDIA_TYPE) || !contentType.includes("json")

      if (response.status === 429 || isProblem) {
        const rateLimited = response.status === 429
        setStatus("done")
        setFailure(
          rateLimited
            ? rateLimitMessage(response.headers.get("Retry-After"))
            : REFUSED_MESSAGE,
        )
        captureAnalyticsEvent("skill_check_failed", {
          error_code: rateLimited ? "rate_limited" : "unexpected_response",
        })
        return
      }

      const payload: unknown = await response.json()

      if (!isSkillCheckReport(payload)) {
        setStatus("done")
        setFailure(REFUSED_MESSAGE)
        captureAnalyticsEvent("skill_check_failed", {
          error_code: "unexpected_response",
        })
        return
      }

      setReport(payload)
      setStatus("done")

      if (payload.error) {
        captureAnalyticsEvent("skill_check_failed", { error_code: payload.error.code })
        return
      }

      const totals = countReportIssues(payload)
      captureAnalyticsEvent("skill_check_completed", {
        skills_found: payload.skills.length,
        error_count: totals.errors,
        warning_count: totals.warnings,
      })
    } catch {
      setStatus("done")
      setFailure(
        "The check could not be run from this browser. Check your connection and try again.",
      )
      captureAnalyticsEvent("skill_check_failed", { error_code: "network" })
    }
  }, [])

  // A permalink checks itself: the URL is the whole input, so arriving with one
  // and being asked to press a button again would be asking twice.
  useEffect(() => {
    if (!permalinkUrl || checkedRef.current === permalinkUrl) return
    setValue(permalinkUrl)
    void run(permalinkUrl, "permalink")
  }, [permalinkUrl, run])

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const target = value.trim()
    if (!target || status === "loading") return

    // The address bar carries the check, so the result is a link before it is
    // a render and reloading the page does not lose it.
    router.replace(`${pathname}?url=${encodeURIComponent(target)}`, { scroll: false })
    void run(target, "form")
  }

  const recognised = readGitHubUrl(value) !== null
  const totals = report && !report.error ? countReportIssues(report) : null
  const permalink =
    report && typeof window !== "undefined"
      ? `${window.location.origin}${pathname}?url=${encodeURIComponent(report.url)}`
      : ""

  return (
    <div className="mt-9 space-y-6">
      <form
        onSubmit={submit}
        className="rounded-[3px] border border-border bg-card p-5 md:p-6"
      >
        <Label htmlFor={`${fieldId}-url`}>{entry.form.label}</Label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <Input
            id={`${fieldId}-url`}
            className="font-mono"
            type="url"
            inputMode="url"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            value={value}
            placeholder={entry.form.placeholder}
            onChange={(event) => setValue(event.target.value)}
          />
          <Button
            type="submit"
            className="rounded-[3px] sm:w-auto"
            disabled={status === "loading" || value.trim().length === 0}
          >
            {status === "loading" ? "Checking" : entry.form.submitLabel}
          </Button>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{entry.form.hint}</p>
        {value.trim().length > 0 && !recognised ? (
          <p className="mt-2 text-xs leading-5 text-destructive">
            That is not a github.com URL yet. Paste the address of a repository, a skill
            folder, or a SKILL.md file.
          </p>
        ) : null}
      </form>

      <div aria-live="polite" aria-busy={status === "loading"} className="space-y-6">
        {status === "loading" ? (
          <p className="rounded-[3px] border border-border bg-card p-5 text-sm text-muted-foreground md:p-6">
            Reading the repository at its current commit. Large repositories take a few
            seconds.
          </p>
        ) : null}

        {failure ? (
          <p className="rounded-[3px] border border-destructive/40 bg-card p-5 text-sm text-destructive md:p-6">
            {failure}
          </p>
        ) : null}

        {report?.error ? (
          <div className="rounded-[3px] border border-destructive/40 bg-card p-5 md:p-6">
            <p className="text-sm leading-6 text-foreground">{report.error.message}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {report.error.code}
            </p>
          </div>
        ) : null}

        {report && !report.error ? (
          <>
            <div className="rounded-[3px] border border-border bg-card p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">
                    {report.repository
                      ? `${report.repository.owner}/${report.repository.name}`
                      : report.url}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.skills.length}{" "}
                    {report.skills.length === 1 ? "SKILL.md file" : "SKILL.md files"} read,{" "}
                    {totals?.errors ?? 0}{" "}
                    {totals?.errors === 1 ? "error" : "errors"} and {totals?.warnings ?? 0}{" "}
                    {totals?.warnings === 1 ? "warning" : "warnings"} found.
                  </p>
                </div>
                {permalink ? (
                  <CopyButton
                    value={permalink}
                    label="Copy link"
                    ariaLabel="Copy a link to this report"
                    className="rounded-[3px]"
                    analytics={{ event: "skill_check_permalink_copied" }}
                  />
                ) : null}
              </div>

              {report.repository ? (
                <p className="mt-4 break-all font-mono text-xs text-muted-foreground">
                  {report.repository.defaultBranch} at {report.repository.commitSha}
                </p>
              ) : null}

              {report.truncated ? (
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  This repository holds further SKILL.md files outside the directories
                  agents scan, and they were not read. Link a folder directly to check one
                  of those.
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/70 pt-4">
                <Button
                  size="sm"
                  className="rounded-[3px]"
                  nativeButton={false}
                  render={
                    <Link
                      href="/sign-up?source=skill_check"
                      onClick={() => captureAnalyticsEvent("skill_check_save_clicked")}
                    />
                  }
                >
                  Save to your team&apos;s board
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-[3px]"
                  nativeButton={false}
                  render={<Link href={entry.related[0].href} />}
                >
                  Fix it in the skill creator
                </Button>
              </div>
            </div>

            {report.skills.map((skill) => (
              <SkillReportCard key={skill.filePath} skill={skill} />
            ))}
          </>
        ) : null}
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{entry.form.privacyNote}</p>
    </div>
  )
}
