import {
  activationSelectionCutoff,
  decideActivationEmail,
  isActivationEmailsEnabled,
  parseActivationBackfillStartedAt,
} from "@/lib/activation-emails"
import { hasValidCronAuthorization } from "@/lib/collection-release-retention-cron"
import { selectActivationCandidates } from "@/lib/db/activation-candidates"
import { sendActivationEmail } from "@/lib/email/send-activation-email"
import { captureTeamEvent } from "@/lib/posthog-server"

const RESPONSE_HEADERS = { "Cache-Control": "no-store, max-age=0" } as const

/** A per-run ceiling, well above the current rate of team creation. */
const MAX_SENDS_PER_RUN = 25

export const maxDuration = 60

/**
 * The activation sequence, evaluated once a day.
 *
 * `ACTIVATION_EMAILS_ENABLED` is the kill switch and it is off by default:
 * without it the route reports who would have been emailed and writes nothing,
 * neither to the provider nor to the send register.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!hasValidCronAuthorization(request.headers.get("authorization"), cronSecret)) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: RESPONSE_HEADERS },
    )
  }

  const startedAt = Date.now()
  const now = new Date()
  const enabled = isActivationEmailsEnabled(process.env.ACTIVATION_EMAILS_ENABLED)
  const backfillStartedAt = parseActivationBackfillStartedAt(
    process.env.ACTIVATION_BACKFILL_STARTED_AT,
  )

  try {
    const candidates = await selectActivationCandidates({
      cutoff: activationSelectionCutoff({ backfillStartedAt, now }),
    })
    const planned = candidates.flatMap((candidate) => {
      const decision = decideActivationEmail({
        candidate,
        config: { backfillStartedAt },
        now,
      })
      return decision.send ? [{ candidate, decision }] : []
    })

    if (!enabled) {
      const summary = {
        backfillStartedAt: backfillStartedAt?.toISOString() ?? null,
        candidates: candidates.length,
        durationMs: Date.now() - startedAt,
        dryRun: true,
        enabled,
        event: "activation_emails",
        ok: true,
        planned: planned.map(({ candidate, decision }) => ({
          automationKey: decision.automationKey,
          daysSinceTeamCreated: decision.daysSinceTeamCreated,
          organizationId: candidate.organizationId,
          userId: candidate.userId,
          variant: decision.variant,
        })),
      }
      console.info("Activation emails dry run completed", summary)
      return Response.json(summary, { headers: RESPONSE_HEADERS })
    }

    let sent = 0
    let skipped = 0
    let failed = 0
    for (const { candidate, decision } of planned.slice(0, MAX_SENDS_PER_RUN)) {
      try {
        const result = await sendActivationEmail({
          automationKey: decision.automationKey,
          email: candidate.email,
          firstName: candidate.firstName,
          organizationId: candidate.organizationId,
          sentAt: new Date(),
          teamName: candidate.teamName,
          userId: candidate.userId,
          variant: decision.variant,
        })
        if (!result.sent) {
          skipped += 1
          continue
        }
        sent += 1
        captureTeamEvent({
          distinctId: candidate.userId,
          event: "activation_email_sent",
          properties: {
            automation_key: decision.automationKey,
            days_since_team_created: decision.daysSinceTeamCreated,
          },
          teamId: candidate.organizationId,
        })
      } catch (error) {
        failed += 1
        console.error("Activation email failed", {
          automationKey: decision.automationKey,
          errorName: error instanceof Error ? error.name : "UnknownError",
          organizationId: candidate.organizationId,
        })
      }
    }

    const summary = {
      backfillStartedAt: backfillStartedAt?.toISOString() ?? null,
      candidates: candidates.length,
      durationMs: Date.now() - startedAt,
      dryRun: false,
      enabled,
      event: "activation_emails",
      failed,
      ok: failed === 0,
      planned: planned.length,
      sent,
      skipped,
    }
    console.info("Activation emails run completed", summary)
    return Response.json(summary, {
      status: failed === 0 ? 200 : 503,
      headers: RESPONSE_HEADERS,
    })
  } catch (error) {
    console.error("Activation emails run failed", {
      durationMs: Date.now() - startedAt,
      error,
      event: "activation_emails",
    })
    return Response.json(
      { error: "Activation email run failed", ok: false },
      { status: 500, headers: RESPONSE_HEADERS },
    )
  }
}
