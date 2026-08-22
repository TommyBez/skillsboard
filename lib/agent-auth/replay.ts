import { lt } from "drizzle-orm"

import { db } from "@/lib/db"
import { agentConsumedAssertion } from "@/lib/db/schema"

/**
 * Burns an assertion's `jti`, returning false if it was already spent.
 *
 * The insert *is* the check. Reading first and then writing would leave a
 * window where two concurrent requests both see the row missing and both
 * proceed — precisely the replay this exists to stop — so the unique primary
 * key `(issuer, jti)` does the deciding and `onConflictDoNothing` reports the
 * loser through an empty returning set.
 *
 * `expiresAt` is the assertion's own `exp`. Past it the signature check
 * refuses the token on its own, so the tombstone has nothing left to protect
 * and `pruneConsumedAssertions` can drop it.
 */
export async function consumeAssertionId({
  issuer,
  jti,
  expiresAt,
}: {
  issuer: string
  jti: string
  expiresAt: Date
}): Promise<boolean> {
  const inserted = await db
    .insert(agentConsumedAssertion)
    .values({ issuer, jti, expiresAt })
    .onConflictDoNothing()
    .returning({ jti: agentConsumedAssertion.jti })

  return inserted.length > 0
}

/**
 * Deletes tombstones whose assertions have expired.
 *
 * Called opportunistically from the identity flow rather than on a schedule:
 * the table only grows when assertions are being consumed, so the code path
 * that grows it is also the one that can afford to trim it.
 */
export async function pruneConsumedAssertions(now = new Date()): Promise<void> {
  await db.delete(agentConsumedAssertion).where(lt(agentConsumedAssertion.expiresAt, now))
}
