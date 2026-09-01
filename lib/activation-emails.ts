/**
 * Decision rules for the activation sequence, kept free of database and
 * network access so the whole policy can be exercised against a fake clock.
 *
 * The category is account setup service email, defined in
 * `.agents/product-marketing.md` and `docs/email-compliance.md`: two messages,
 * to the person who created the team, inside a 14 day window, under a hard cap
 * of 3 proactive emails per person for good. It does not require the
 * `product_communications` opt-in, and no rule here may relax a suppression.
 */

export const ACTIVATION_WELCOME = "activation_welcome"
export const ACTIVATION_FIRST_SKILL = "activation_first_skill"

export const ACTIVATION_AUTOMATION_KEYS = [
  ACTIVATION_WELCOME,
  ACTIVATION_FIRST_SKILL,
] as const

export type ActivationAutomationKey = (typeof ACTIVATION_AUTOMATION_KEYS)[number]

/** The welcome speaks of a library that was just created. Past this age that would not be true. */
export type ActivationWelcomeVariant = "backfill" | "new"

export const ACTIVATION_WINDOW_DAYS = 14
export const ACTIVATION_MAX_PROACTIVE_EMAILS_PER_PERSON = 3
export const ACTIVATION_MINIMUM_HOURS_BETWEEN_SENDS = 24
export const ACTIVATION_FIRST_SKILL_MINIMUM_DAYS = 1
export const ACTIVATION_FIRST_SKILL_MAXIMUM_DAYS = 2
export const ACTIVATION_DAY_ONE_MAXIMUM_DAYS = 2

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000

export interface ActivationSendRecord {
  automationKey: string
  sentAt: Date
}

export interface ActivationCandidate {
  emailVerified: boolean
  /** Any active row of either scope in `emailSuppression`, for any address of this user. */
  hasActiveSuppression: boolean
  organizationCreatedAt: Date
  organizationId: string
  /** Every automation row already written for this person, across all automations. */
  sends: readonly ActivationSendRecord[]
  skillCount: number
  userId: string
}

export interface ActivationConfig {
  /**
   * The moment the sequence was enabled. Teams created before it anchor their
   * 14 day window here, which is the one time retroactive pass decided on
   * 2026-09-01. Left null, only teams created inside the window qualify.
   */
  backfillStartedAt: Date | null
}

export type ActivationSkipReason =
  | "email_unverified"
  | "first_skill_not_due"
  | "first_skill_window_passed"
  | "per_person_cap_reached"
  | "sent_within_last_day"
  | "sequence_complete"
  | "skill_already_saved"
  | "suppressed"
  | "window_closed"
  | "window_not_open"

export type ActivationDecision =
  | {
    automationKey: ActivationAutomationKey
    daysSinceTeamCreated: number
    send: true
    variant: ActivationWelcomeVariant
  }
  | { reason: ActivationSkipReason; send: false }

function differenceInDays(later: Date, earlier: Date): number {
  return Math.floor((later.getTime() - earlier.getTime()) / MILLISECONDS_PER_DAY)
}

/**
 * The window anchor. A team created after the sequence was enabled anchors to
 * its own creation. A team created before it anchors to the enabling date, so
 * the backfill runs once and then ends on the same 14 day window as everyone
 * else instead of reopening every time the flag is touched.
 */
export function resolveActivationAnchor(input: {
  backfillStartedAt: Date | null
  organizationCreatedAt: Date
}): Date {
  const { backfillStartedAt, organizationCreatedAt } = input
  if (backfillStartedAt && backfillStartedAt.getTime() > organizationCreatedAt.getTime()) {
    return backfillStartedAt
  }
  return organizationCreatedAt
}

export function resolveActivationWelcomeVariant(input: {
  daysSinceTeamCreated: number
}): ActivationWelcomeVariant {
  return input.daysSinceTeamCreated > ACTIVATION_DAY_ONE_MAXIMUM_DAYS ? "backfill" : "new"
}

function mostRecentSentAt(sends: readonly ActivationSendRecord[]): Date | null {
  let latest: Date | null = null
  for (const send of sends) {
    if (!latest || send.sentAt.getTime() > latest.getTime()) latest = send.sentAt
  }
  return latest
}

function hasSent(sends: readonly ActivationSendRecord[], automationKey: string): boolean {
  return sends.some((send) => send.automationKey === automationKey)
}

/**
 * Which activation email, if any, this candidate should receive right now.
 *
 * Every skip condition is evaluated at send time rather than at selection
 * time: the gap between the nightly query and the send is exactly where the
 * embarrassing email is produced.
 */
export function decideActivationEmail(input: {
  candidate: ActivationCandidate
  config: ActivationConfig
  now: Date
}): ActivationDecision {
  const { candidate, config, now } = input

  if (!candidate.emailVerified) return { reason: "email_unverified", send: false }
  if (candidate.hasActiveSuppression) return { reason: "suppressed", send: false }

  const anchor = resolveActivationAnchor({
    backfillStartedAt: config.backfillStartedAt,
    organizationCreatedAt: candidate.organizationCreatedAt,
  })
  const daysSinceAnchor = differenceInDays(now, anchor)
  if (daysSinceAnchor < 0) return { reason: "window_not_open", send: false }
  if (daysSinceAnchor >= ACTIVATION_WINDOW_DAYS) return { reason: "window_closed", send: false }

  if (candidate.sends.length >= ACTIVATION_MAX_PROACTIVE_EMAILS_PER_PERSON) {
    return { reason: "per_person_cap_reached", send: false }
  }

  // One rule covers both frequency caps: at most one email per person per day,
  // and at least 24 hours between two emails of the sequence.
  const lastSentAt = mostRecentSentAt(candidate.sends)
  if (
    lastSentAt
    && now.getTime() - lastSentAt.getTime()
      < ACTIVATION_MINIMUM_HOURS_BETWEEN_SENDS * MILLISECONDS_PER_HOUR
  ) {
    return { reason: "sent_within_last_day", send: false }
  }

  const daysSinceTeamCreated = Math.max(0, differenceInDays(now, candidate.organizationCreatedAt))
  const variant = resolveActivationWelcomeVariant({ daysSinceTeamCreated })

  if (!hasSent(candidate.sends, ACTIVATION_WELCOME)) {
    return {
      automationKey: ACTIVATION_WELCOME,
      daysSinceTeamCreated,
      send: true,
      variant,
    }
  }

  if (hasSent(candidate.sends, ACTIVATION_FIRST_SKILL)) {
    return { reason: "sequence_complete", send: false }
  }
  if (candidate.skillCount > 0) return { reason: "skill_already_saved", send: false }
  if (daysSinceAnchor < ACTIVATION_FIRST_SKILL_MINIMUM_DAYS) {
    return { reason: "first_skill_not_due", send: false }
  }
  if (daysSinceAnchor > ACTIVATION_FIRST_SKILL_MAXIMUM_DAYS) {
    return { reason: "first_skill_window_passed", send: false }
  }

  return {
    automationKey: ACTIVATION_FIRST_SKILL,
    daysSinceTeamCreated,
    send: true,
    variant,
  }
}

/**
 * The oldest team creation the selection query has to read, or null while the
 * backfill window is open and every team is still a candidate. The query stays
 * bounded by the enabling date rather than by team age.
 */
export function activationSelectionCutoff(input: {
  backfillStartedAt: Date | null
  now: Date
}): Date | null {
  const { backfillStartedAt, now } = input
  if (backfillStartedAt) {
    const backfillEndsAt = new Date(
      backfillStartedAt.getTime() + ACTIVATION_WINDOW_DAYS * MILLISECONDS_PER_DAY,
    )
    if (now.getTime() < backfillEndsAt.getTime()) return null
  }
  return new Date(now.getTime() - ACTIVATION_WINDOW_DAYS * MILLISECONDS_PER_DAY)
}

/** An ISO date or datetime from the environment, or null when it is absent or unusable. */
export function parseActivationBackfillStartedAt(value: string | undefined): Date | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function isActivationEmailsEnabled(value: string | undefined): boolean {
  return value?.trim() === "true"
}
