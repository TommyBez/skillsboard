import "server-only"

import { and, count, eq, gte, lt, sql } from "drizzle-orm"
import { headers } from "next/headers"

import { db } from "@/lib/db"
import { emailCaptureAttempt } from "@/lib/db/schema"
import {
  captureAttemptRetentionCutoff,
  captureRateLimitWindowStart,
  isOverCaptureRateLimit,
  shouldPruneCaptureAttempts,
} from "@/lib/email/email-capture"
import { resolveCaptureIpAddress } from "@/lib/email/email-capture-ip"
import { hashCaptureIpAddress } from "@/lib/email/email-privacy"

/**
 * The hashed client address for this request, or `null` when the request does
 * not carry one.
 *
 * On Vercel the client address arrives in `x-forwarded-for`, with `x-real-ip`
 * as the second spelling of the same value. Neither is authenticated, so this
 * is a budget rather than a boundary: it stops an unattended script from
 * filling the table, not a determined attacker with addresses to spend.
 *
 * A header that is there but carries no address is bucketed too, in the one
 * bucket every unreadable value shares, so it cannot buy a fresh budget per
 * spelling.
 */
async function readCaptureIpHash(): Promise<string | null> {
  const requestHeaders = await headers()
  const ipAddress = resolveCaptureIpAddress(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  )

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
 * a way to lock the form.
 *
 * The count and the insert are one claim, so they run in one transaction
 * behind an advisory lock on the bucket. Read committed would otherwise let a
 * burst of simultaneous submissions from one client each count the same rows,
 * each find room, and each insert: the budget would hold against a script
 * posting in sequence and not against the same script posting in parallel,
 * which is the easier of the two to write. The lock is keyed on the hashed
 * address rather than taken on the table, so two clients never wait on each
 * other, and `pg_advisory_xact_lock` is released by the commit rather than by
 * a call this function has to remember to make on every path out.
 */
export async function claimEmailCaptureAttempt(): Promise<boolean> {
  const ipHash = await readCaptureIpHash()
  if (!ipHash) return true

  const now = new Date()
  const claimed = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${ipHash}, 0))`)

    const [used] = await tx
      .select({ attempts: count() })
      .from(emailCaptureAttempt)
      .where(and(
        eq(emailCaptureAttempt.ipHash, ipHash),
        gte(emailCaptureAttempt.createdAt, captureRateLimitWindowStart(now)),
      ))

    if (isOverCaptureRateLimit(used?.attempts ?? 0)) return false

    await tx.insert(emailCaptureAttempt).values({ ipHash })

    return true
  })

  if (!claimed) return false

  // Outside the claim: pruning is housekeeping for every bucket, and holding
  // this one's lock across it would make unrelated clients queue behind a
  // delete. A failure there must not roll back a claim that already succeeded.
  await pruneExpiredCaptureAttempts(now)

  return true
}
