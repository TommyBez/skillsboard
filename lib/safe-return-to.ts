const exactDestinations = ["/library", "/settings/email", "/connect", "/start"] as const

/**
 * Destinations a signed-in visitor is owed immediately, the same way the
 * marketing `/sign-in` CTA owes them `/library`. Invitation and email
 * preference hand-offs stay off this list so `AuthEntry` can show Continue.
 */
export const immediateSignedInDestinations = ["/library", "/connect", "/start"] as const

export function isImmediateSignedInDestination(
  path: string,
): path is (typeof immediateSignedInDestinations)[number] {
  return (immediateSignedInDestinations as readonly string[]).includes(path)
}

export function safeReturnTo(value: unknown, fallback = "/library") {
  if (typeof value === "string" && (exactDestinations as readonly string[]).includes(value)) {
    return value
  }
  if (typeof value === "string" && /^\/invite\/[A-Za-z0-9_-]{1,200}$/.test(value)) return value
  return fallback
}
