/**
 * The client address a capture submission is bucketed under.
 *
 * Kept apart from `email-capture.ts` because deciding what an address is takes
 * `node:net`, and that module is also read by the card, which runs in the
 * browser. Nothing here is reachable from a client bundle.
 *
 * The bucket key has to be something a client shares with itself across
 * submissions and nothing else can invent: `isIP` answers what an address is,
 * and the canonical spelling below answers which of them are the same one, so a
 * client reaching the app as `2001:0db8::1` and as `2001:db8:0:0:0:0:0:1`
 * spends one budget rather than two.
 */

import { isIP } from "node:net"

/** An IPv6 address in its longest textual form is 45 characters. */
export const CAPTURE_IP_MAX_LENGTH = 45

/**
 * Where a present but unreadable address goes.
 *
 * Not an address in any spelling, so it can never collide with a real client's
 * bucket, and shared by every unreadable value, so a script rotating garbage
 * through the header spends one budget between all of it rather than a fresh
 * one per string.
 */
export const INVALID_CAPTURE_IP_BUCKET = "invalid-client-address"

/** An IPv6 address is eight groups once `::` is written out. */
const IPV6_GROUP_COUNT = 8

const ipv4WithPortPattern = /^(\d{1,3}(?:\.\d{1,3}){3}):\d{1,5}$/
const portSuffixPattern = /^:\d{1,5}$/

/**
 * The groups of one half of a validated IPv6 address, with a trailing dotted
 * quad folded into the two groups it stands for.
 */
function readIpv6Groups(text: string): number[] {
  if (text.length === 0) return []

  const parts = text.split(":")
  const groups: number[] = []

  for (const [index, part] of parts.entries()) {
    if (index === parts.length - 1 && part.includes(".")) {
      const octets = part.split(".").map((octet) => Number.parseInt(octet, 10))
      groups.push(((octets[0] << 8) | octets[1]) >>> 0)
      groups.push(((octets[2] << 8) | octets[3]) >>> 0)
      continue
    }

    groups.push(Number.parseInt(part, 16))
  }

  return groups
}

/** The eight groups of a validated IPv6 address, with `::` written out. */
function expandIpv6(address: string): number[] {
  const gap = address.indexOf("::")
  if (gap === -1) return readIpv6Groups(address)

  const leading = readIpv6Groups(address.slice(0, gap))
  const trailing = readIpv6Groups(address.slice(gap + 2))
  const omitted = Math.max(0, IPV6_GROUP_COUNT - leading.length - trailing.length)

  return [...leading, ...Array.from({ length: omitted }, () => 0), ...trailing]
}

/**
 * One spelling per address, in the form RFC 5952 asks for: lowercase, no
 * leading zeros, and the longest run of zero groups compressed once. A run of
 * one is written out, so `::` never stands for a single group.
 */
function formatIpv6(groups: number[]): string {
  let runStart = -1
  let runLength = 0
  let bestStart = -1
  let bestLength = 0

  for (const [index, group] of groups.entries()) {
    if (group !== 0) {
      runStart = -1
      runLength = 0
      continue
    }

    if (runStart === -1) runStart = index
    runLength += 1

    if (runLength > bestLength) {
      bestStart = runStart
      bestLength = runLength
    }
  }

  const written = groups.map((group) => group.toString(16))
  if (bestLength < 2) return written.join(":")

  const head = written.slice(0, bestStart).join(":")
  const tail = written.slice(bestStart + bestLength).join(":")

  return `${head}::${tail}`
}

/** The dotted quad the last two groups of a mapped address stand for. */
function formatEmbeddedIpv4(groups: number[]): string {
  const high = groups[6]
  const low = groups[7]

  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`
}

/**
 * The one spelling of a validated IPv6 address, as a bucket key.
 *
 * Read from the eight groups the address expands to and never from how those
 * groups were written, so one address is one key however it arrives.
 */
function canonicalizeIpv6(address: string): string {
  const groups = expandIpv6(address)

  // `::ffff:203.0.113.7`: an IPv4 client wearing IPv6, which a dual stack proxy
  // in front of the app can produce. Unwrapped rather than bucketed separately,
  // so one client reaching the app under both spellings still spends one
  // budget. The hex spelling of the same address, `::ffff:cb00:7107`, lands
  // here too, and RFC 5952 section 5 asks for the dotted quad on this prefix.
  //
  // The deprecated `::203.0.113.7` does not: RFC 4291 retired that prefix, and
  // unwrapping it would both split the client that writes `::cb00:7107` off
  // into a second bucket and drop the rest into the bucket of an unrelated
  // IPv4 client.
  const prefixIsZero = groups.slice(0, 5).every((group) => group === 0)
  if (prefixIsZero && groups[5] === 0xffff) return formatEmbeddedIpv4(groups)

  return formatIpv6(groups)
}

/**
 * The canonical client address in a forwarding header, or `null` when the
 * header does not carry one.
 *
 * `x-forwarded-for` is a list and the client sits at its head. What counts as
 * an address is `isIP` rather than a pattern of our own: a hand written one
 * accepts spellings that are not addresses, `:::` among them, and every
 * accepted string becomes a bucket key, so anything it lets through is a budget
 * of its own.
 */
export function normalizeCaptureIpAddress(value: unknown): string | null {
  if (typeof value !== "string") return null

  const [first] = value.split(",")
  let candidate = (first ?? "").trim().toLowerCase()

  // An IPv6 literal can arrive bracketed, with or without a trailing port.
  // Anything else after the bracket is a header a proxy did not write, so
  // `[2001:db8::1]junk` takes the shared bucket rather than the private one
  // belonging to the client it names.
  if (candidate.startsWith("[")) {
    const closing = candidate.indexOf("]")
    if (closing === -1) return null

    const suffix = candidate.slice(closing + 1)
    if (suffix.length > 0 && !portSuffixPattern.test(suffix)) return null

    candidate = candidate.slice(1, closing)
  }

  // A proxy can append a port. The address alone is the bucket.
  const withoutPort = ipv4WithPortPattern.exec(candidate)
  if (withoutPort?.[1]) candidate = withoutPort[1]

  if (candidate.length === 0 || candidate.length > CAPTURE_IP_MAX_LENGTH) return null

  // A zone index names an interface on this host rather than a remote client,
  // and `isIP` takes one. Refused here so it cannot read as the address it is
  // attached to, which would put two hosts in one bucket.
  if (candidate.includes("%")) return null

  const family = isIP(candidate)
  // An IPv4 address `isIP` accepts is already the only spelling of itself: it
  // rejects the zero padded octets that would otherwise read as a second one.
  if (family === 4) return candidate
  if (family === 6) return canonicalizeIpv6(candidate)

  return null
}

/**
 * The bucket key for a request, given its forwarding headers in the order they
 * should be read.
 *
 * A header that is absent or empty is no address at all, and the caller lets
 * the submission through: refusing it would turn a missing header into a way to
 * lock the form. A header that is present and unreadable is a different thing:
 * whatever wrote it is not the proxy in front of the app, and it goes to the
 * shared bucket instead of a private one, so garbage rate limits itself.
 */
export function resolveCaptureIpAddress(...values: unknown[]): string | null {
  let sawUnreadable = false

  for (const value of values) {
    const address = normalizeCaptureIpAddress(value)
    if (address) return address
    if (typeof value === "string" && value.trim().length > 0) sawUnreadable = true
  }

  return sawUnreadable ? INVALID_CAPTURE_IP_BUCKET : null
}
