import "server-only"

import {
  type ActivationBackfillSend,
  planActivationBackfillSends,
} from "@/lib/activation-emails"
import { selectActivationCandidates } from "@/lib/db/activation-candidates"
import { captureTeamEvent } from "@/lib/posthog-server"

import { sendActivationEmail } from "./send-activation-email"

const MAX_SENDS = 50

export interface ActivationBackfillPlan extends ActivationBackfillSend {
  organizationId: string
  userId: string
}

export interface ActivationBackfillResult {
  before: string
  candidates: number
  dryRun: boolean
  failed: number
  ok: boolean
  planned: ActivationBackfillPlan[]
  sent: number
  skipped: number
}

/**
 * One-shot welcome and first-skill reminder for teams created before `before`.
 * Dry-run unless `send` is true. Does not enroll anyone in the Resend automation.
 */
export async function runActivationBackfill(input: {
  before: Date
  send: boolean
}): Promise<ActivationBackfillResult> {
  const now = new Date()
  const candidates = await selectActivationCandidates({ before: input.before })
  const planned = candidates.flatMap((candidate) =>
    planActivationBackfillSends({ candidate, now }).map((plan) => ({
      candidate,
      plan: {
        ...plan,
        organizationId: candidate.organizationId,
        userId: candidate.userId,
      },
    })),
  )

  if (!input.send) {
    return {
      before: input.before.toISOString(),
      candidates: candidates.length,
      dryRun: true,
      failed: 0,
      ok: true,
      planned: planned.map(({ plan }) => plan),
      sent: 0,
      skipped: 0,
    }
  }

  let sent = 0
  let skipped = 0
  let failed = 0
  for (const { candidate, plan } of planned.slice(0, MAX_SENDS)) {
    try {
      const result = await sendActivationEmail({
        automationKey: plan.automationKey,
        daysSinceTeamCreated: plan.daysSinceTeamCreated,
        email: candidate.email,
        firstName: candidate.firstName,
        organizationId: candidate.organizationId,
        sentAt: now,
        teamName: candidate.teamName,
        userId: candidate.userId,
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
          automation_key: plan.automationKey,
          days_since_team_created: plan.daysSinceTeamCreated,
        },
        teamId: candidate.organizationId,
      })
    } catch {
      failed += 1
    }
  }

  return {
    before: input.before.toISOString(),
    candidates: candidates.length,
    dryRun: false,
    failed,
    ok: failed === 0,
    planned: planned.map(({ plan }) => plan),
    sent,
    skipped,
  }
}
