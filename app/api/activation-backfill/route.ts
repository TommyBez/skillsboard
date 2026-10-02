import { parseIsoDate } from "@/lib/activation-emails"
import { hasValidCronAuthorization } from "@/lib/collection-release-retention-cron"
import { runActivationBackfill } from "@/lib/email/run-activation-backfill"

const RESPONSE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const

export const maxDuration = 60

/**
 * Manual backfill of the activation welcome and first-skill reminder. Not on a
 * schedule. Dry-run unless `send=true`. `before` defaults to now so teams
 * created after the automation was enabled are left to Resend.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!hasValidCronAuthorization(request.headers.get("authorization"), cronSecret)) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: RESPONSE_HEADERS },
    )
  }

  const url = new URL(request.url)
  const send = url.searchParams.get("send") === "true"
  const before = parseIsoDate(url.searchParams.get("before") ?? undefined) ?? new Date()

  try {
    const summary = await runActivationBackfill({ before, send })
    return Response.json(summary, {
      status: summary.ok ? 200 : 503,
      headers: RESPONSE_HEADERS,
    })
  } catch {
    return Response.json(
      { error: "Activation backfill failed", ok: false },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
