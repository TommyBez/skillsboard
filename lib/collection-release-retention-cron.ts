import { createHash, timingSafeEqual } from "node:crypto"

function authorizationDigest(value: string) {
  return createHash("sha256").update(value, "utf8").digest()
}

export function hasValidCronAuthorization(
  authorization: string | null,
  cronSecret: string | undefined,
) {
  if (!authorization || !cronSecret) return false

  const actual = authorizationDigest(authorization)
  const expected = authorizationDigest(`Bearer ${cronSecret}`)
  return timingSafeEqual(actual, expected)
}

export function collectionReleaseCleanupOutcome(mayHaveMore: boolean) {
  return {
    ok: !mayHaveMore,
    status: mayHaveMore ? 503 : 200,
  }
}
