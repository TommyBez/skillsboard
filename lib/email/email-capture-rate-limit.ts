import "server-only"

import { and, count, eq, gte, lt } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/lib/db"
import { emailCaptureAttempt } from "@/lib/db/schema"
import {
  captureAttemptRetentionCutoff,
  captureRateLimitWindowStart,
  isOverCaptureRateLimit,
  normalizeCaptureIpAddress,
  shouldPruneCaptureAttempts,
} from "@/lib/email/email-capture"
import { hashCaptureIpAddress } from "@/lib/email/email-privacy"

/**
 * The hashed client address for this request, or `null` when the request does
 * not carry one.
 *
 * On Vercel the client address arrives in `x-forwarded-for`, with `x-real-ip`
 * as the second spelling of the same value. Neither is authenticated, so this
 * is a budget rather than a boundary: it stops an unattended script from
 * filling the table, not a determined attacker with addresses to spend.
 */
async function readCaptureIpHash(): Promise<string | null> {
  const requestHeaders = await headers()
  const ipAddress =
    normalizeCaptureIpAddress(requestHeaders.get("x-forwarded-for"))
    ?? normalizeCaptureIpAddress(requestHeaders.get("x-real-ip"))

  return ipAddress ? hashCaptureIpAddress(ipAddress) : null
}

/**
 * Expired rows leave on a small share of accepted submissions. A failure here
 * costs disk and nothing else, so it never reaches the visitor: the submission
 * it happens to ride along with still gets stored.
 */
async function pruneExpiredCaptureAttempts(now: Date) {
  if (!shouldPruneCaptureAttempts(Math.random())) return

  try {
    await db
      .delete(emailCaptureAttempt)
      .where(lt(emailCaptureAttempt.createdAt, captureAttemptRetentionCutoff(now)))
  } catch (error) {
    console.error("Unable to prune email capture attempts", {
      errorName: error instanceof Error ? error.name : "UnknownError",
    })
  }
}

/**
 * Takes one submission out of this client's budget, and reports whether there
 * was one to take.
 *
 * A request with no readable client address is always allowed: there is
 * nothing to bucket it under, and refusing it would turn a missing header into
 * a way to lock the form. The count and the insert are two statements rather
 * than one transaction, so a burst of simultaneous submissions can overshoot
 * the budget by the width of that gap. That is the intended trade: the budget
 * only has to hold at the scale a script works at.
 */
export async function claimEmailCaptureAttempt(): Promise<boolean> {
  const ipHash = await readCaptureIpHash()
  if (!ipHash) return true

  const now = new Date()
  const [used] = await db
    .select({ attempts: count() })
    .from(emailCaptureAttempt)
    .where(and(
      eq(emailCaptureAttempt.ipHash, ipHash),
      gte(emailCaptureAttempt.createdAt, captureRateLimitWindowStart(now)),
    ))

  if (isOverCaptureRateLimit(used?.attempts ?? 0)) return false

  await db.insert(emailCaptureAttempt).values({ ipHash })
  await pruneExpiredCaptureAttempts(now)

  return true
}
