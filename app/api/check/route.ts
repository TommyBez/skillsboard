import { ipAddress } from "@vercel/functions"
import { headers } from "next/headers"
import { connection } from "next/server"

import { claimApiRequest, rateLimitHeaders } from "@/lib/api-rate-limit"
import { problemResponse } from "@/lib/problem-json"
import {
  checkGitHubUrl,
  SKILL_CHECK_ERROR_STATUS,
} from "@/lib/skill-check/check-github-url"
import {
  renderSkillCheckMarkdown,
  SKILL_SPEC_CHECKED_ON,
  type SkillCheckReport,
} from "@/lib/skill-check/report"

/**
 * The format check at `/check`, as an endpoint.
 *
 * A GET with the URL in the query so the check is a link: the page's permalink
 * and this endpoint carry the same parameter, and an agent that is handed
 * either one can fetch the other. `?format=md`, or `Accept: text/markdown`,
 * returns the same report as text, because the caller most likely to ask for a
 * SKILL.md report is itself an agent.
 *
 * No account, no body, nothing written. The budget is the public one, shared
 * with the rest of the HTTP surface, and a refusal is the same RFC 9457
 * problem document those endpoints send.
 */

const INSTANCE = "/api/check"

function wantsMarkdown(url: URL, accept: string | null) {
  if (url.searchParams.get("format") === "md") return true
  return (accept ?? "").toLowerCase().includes("text/markdown")
}

function respond(
  report: SkillCheckReport,
  { markdown, status, extraHeaders }: {
    markdown: boolean
    status: number
    extraHeaders: Record<string, string>
  },
) {
  const body = markdown
    ? renderSkillCheckMarkdown(report)
    : `${JSON.stringify(report, null, 2)}\n`

  return new Response(body, {
    status,
    headers: {
      ...extraHeaders,
      "Content-Type": markdown
        ? "text/markdown; charset=utf-8"
        : "application/json; charset=utf-8",
      // The report is about a moving repository, so it is cached briefly at
      // the edge and never in the browser: long enough that a shared link does
      // not spend a GitHub request per reader, short enough that a fix pushed
      // to the repository shows up while the author is still looking.
      "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
      Vary: "Accept",
    },
  })
}

export async function GET(request: Request) {
  await connection()

  const requestHeaders = await headers()
  const url = new URL(request.url)
  const markdown = wantsMarkdown(url, requestHeaders.get("accept"))

  const client = ipAddress(requestHeaders)
  const budget = claimApiRequest(client ? `check:${client}` : null)
  const budgetHeaders = rateLimitHeaders(budget)

  if (budget && !budget.allowed) {
    return problemResponse("rate_limited", {
      instance: INSTANCE,
      retry_after: budget.resetSeconds,
      headers: { ...budgetHeaders, "Retry-After": String(budget.resetSeconds) },
    })
  }

  const target = url.searchParams.get("url")?.trim() ?? ""

  if (!target) {
    return respond(
      {
        url: "",
        checkedAt: new Date().toISOString(),
        specCheckedOn: SKILL_SPEC_CHECKED_ON,
        repository: null,
        skills: [],
        truncated: false,
        error: {
          code: "invalid_url",
          message: "Pass the repository or skill URL to check as ?url=.",
        },
      },
      { markdown, status: 400, extraHeaders: budgetHeaders },
    )
  }

  const report = await checkGitHubUrl(target)

  return respond(report, {
    markdown,
    status: report.error ? SKILL_CHECK_ERROR_STATUS[report.error.code] : 200,
    extraHeaders: budgetHeaders,
  })
}
