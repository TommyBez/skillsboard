import { absoluteUrl } from "@/lib/site"

/**
 * Shared names and copy rules for the activation sequence.
 *
 * New teams are enrolled into a Resend Automation (`team.created` → welcome →
 * wait for `skill.saved` → first-skill reminder). Existing teams are emailed
 * once by the manual backfill script. This module stays free of database and
 * network access so the wording rules can be tested with a fake clock.
 */

export const ACTIVATION_WELCOME = "activation_welcome"
export const ACTIVATION_FIRST_SKILL = "activation_first_skill"

export const ACTIVATION_AUTOMATION_KEYS = [
  ACTIVATION_WELCOME,
  ACTIVATION_FIRST_SKILL,
] as const

export type ActivationAutomationKey = (typeof ACTIVATION_AUTOMATION_KEYS)[number]

export const ACTIVATION_RESEND_TEAM_CREATED = "team.created"
export const ACTIVATION_RESEND_SKILL_SAVED = "skill.saved"
export const ACTIVATION_RESEND_AUTOMATION_NAME = "Account setup"
export const ACTIVATION_WELCOME_TEMPLATE_ALIAS = "activation-welcome"
export const ACTIVATION_FIRST_SKILL_TEMPLATE_ALIAS = "activation-first-skill"
export const ACTIVATION_TEAM_NAME_PROPERTY = "team_name"

/**
 * Which welcome is true for this team right now.
 *
 * `new` is the first days of an empty library, `backfill` is an older team
 * whose library is still empty, and `saved` is a team that already has skills
 * in it: the empty library wording would be a demonstrably false claim there,
 * so that team gets copy about what is left to do instead.
 */
export type ActivationWelcomeVariant = "backfill" | "new" | "saved"

export const ACTIVATION_DAY_ONE_MAXIMUM_DAYS = 2

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

export interface ActivationSendRecord {
  automationKey: string
  sentAt: Date
}

export interface ActivationCandidate {
  emailVerified: boolean
  /** An active `all` suppression (bounce, complaint, provider). Marketing opt-out does not belong here. */
  hasActiveSuppression: boolean
  organizationCreatedAt: Date
  organizationId: string
  sends: readonly ActivationSendRecord[]
  skillCount: number
  userId: string
}

export function activationCtaUrl(automationKey: ActivationAutomationKey): string {
  const path = automationKey === ACTIVATION_WELCOME ? "/connect" : "/library"
  const parameters = new URLSearchParams({
    utm_source: "email",
    utm_medium: "activation",
    utm_campaign: automationKey,
  })
  return `${absoluteUrl(path)}?${parameters.toString()}`
}

export function firstNameFromUserName(name: string | null | undefined): string | null {
  const trimmed = name?.trim().split(/\s+/)[0]
  return trimmed ? trimmed : null
}

/**
 * The library state decides the wording before the team age does. Both empty
 * library variants would be false for a team that already saved a skill, which
 * a backfilled team very well may have done before the sequence existed.
 */
export function resolveActivationWelcomeVariant(input: {
  daysSinceTeamCreated: number
  skillCount: number
}): ActivationWelcomeVariant {
  if (input.skillCount > 0) return "saved"
  return input.daysSinceTeamCreated > ACTIVATION_DAY_ONE_MAXIMUM_DAYS ? "backfill" : "new"
}

export function daysSinceDate(later: Date, earlier: Date): number {
  return Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / MILLISECONDS_PER_DAY))
}

export function parseIsoDate(value: string | undefined): Date | null {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export interface ActivationBackfillSend {
  automationKey: ActivationAutomationKey
  daysSinceTeamCreated: number
  variant: ActivationWelcomeVariant
}

function hasSent(sends: readonly ActivationSendRecord[], automationKey: string): boolean {
  return sends.some((send) => send.automationKey === automationKey)
}

/**
 * Which backfill emails this team should receive right now. Welcome goes to
 * anyone who has not had it. The first-skill reminder goes only to a still
 * empty library that has not had it. A marketing opt-out is not a skip.
 */
export function planActivationBackfillSends(input: {
  candidate: ActivationCandidate
  now: Date
}): ActivationBackfillSend[] {
  const { candidate, now } = input
  if (!candidate.emailVerified || candidate.hasActiveSuppression) return []

  const daysSinceTeamCreated = daysSinceDate(now, candidate.organizationCreatedAt)
  const variant = resolveActivationWelcomeVariant({
    daysSinceTeamCreated,
    skillCount: candidate.skillCount,
  })
  const planned: ActivationBackfillSend[] = []

  if (!hasSent(candidate.sends, ACTIVATION_WELCOME)) {
    planned.push({
      automationKey: ACTIVATION_WELCOME,
      daysSinceTeamCreated,
      variant,
    })
  }

  if (!hasSent(candidate.sends, ACTIVATION_FIRST_SKILL) && candidate.skillCount === 0) {
    planned.push({
      automationKey: ACTIVATION_FIRST_SKILL,
      daysSinceTeamCreated,
      variant,
    })
  }

  return planned
}
