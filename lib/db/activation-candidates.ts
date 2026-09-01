import "server-only"

import { and, asc, count, desc, eq, gte, inArray } from "drizzle-orm"

import type { ActivationCandidate } from "@/lib/activation-emails"
import { db } from "@/lib/db"
import {
  emailAutomationSend,
  emailSuppression,
  member,
  organization,
  skill,
  user,
} from "@/lib/db/schema"
import { hashEmailAddressCandidates } from "@/lib/email/email-privacy"

/**
 * A bound on one cron run. At the current rate of team creation this is orders
 * of magnitude above the real number, and it keeps a single invocation finite
 * if the backfill anchor is ever set to a date that opens the whole table.
 */
export const ACTIVATION_CANDIDATE_LIMIT = 200

export interface ActivationCandidateRow extends ActivationCandidate {
  email: string
  firstName: string | null
  teamName: string
}

function firstName(name: string): string | null {
  const trimmed = name.trim().split(/\s+/)[0]
  return trimmed ? trimmed : null
}

/**
 * The teams whose activation window may still be open, each paired with the
 * person who created it: the earliest owner of the team. Every value the
 * decision needs is read here, and the decision itself stays in
 * `lib/activation-emails.ts` so it can be tested without a database.
 */
export async function selectActivationCandidates(input: {
  cutoff: Date | null
}): Promise<ActivationCandidateRow[]> {
  const organizations = await db
    .select({
      createdAt: organization.createdAt,
      id: organization.id,
      name: organization.name,
    })
    .from(organization)
    .where(input.cutoff ? gte(organization.createdAt, input.cutoff) : undefined)
    .orderBy(desc(organization.createdAt))
    .limit(ACTIVATION_CANDIDATE_LIMIT)
  if (organizations.length === 0) return []

  const organizationIds = organizations.map((row) => row.id)
  const owners = await db
    .select({
      createdAt: member.createdAt,
      organizationId: member.organizationId,
      userId: member.userId,
    })
    .from(member)
    .where(and(
      inArray(member.organizationId, organizationIds),
      eq(member.role, "owner"),
    ))
    .orderBy(asc(member.createdAt))

  const creatorByOrganization = new Map<string, string>()
  for (const owner of owners) {
    if (!creatorByOrganization.has(owner.organizationId)) {
      creatorByOrganization.set(owner.organizationId, owner.userId)
    }
  }
  const creatorIds = [...new Set(creatorByOrganization.values())]
  if (creatorIds.length === 0) return []

  const [creators, skillCounts, sends] = await Promise.all([
    db
      .select({
        email: user.email,
        emailVerified: user.emailVerified,
        id: user.id,
        name: user.name,
      })
      .from(user)
      .where(inArray(user.id, creatorIds)),
    db
      .select({ organizationId: skill.organizationId, total: count() })
      .from(skill)
      .where(inArray(skill.organizationId, organizationIds))
      .groupBy(skill.organizationId),
    db
      .select({
        automationKey: emailAutomationSend.automationKey,
        sentAt: emailAutomationSend.sentAt,
        userId: emailAutomationSend.userId,
      })
      .from(emailAutomationSend)
      .where(inArray(emailAutomationSend.userId, creatorIds)),
  ])

  const creatorById = new Map(creators.map((creator) => [creator.id, creator]))
  const skillCountByOrganization = new Map(
    skillCounts.map((row) => [row.organizationId, Number(row.total)]),
  )
  const sendsByUser = new Map<string, { automationKey: string; sentAt: Date }[]>()
  for (const send of sends) {
    const existing = sendsByUser.get(send.userId)
    const record = { automationKey: send.automationKey, sentAt: send.sentAt }
    if (existing) existing.push(record)
    else sendsByUser.set(send.userId, [record])
  }

  // One lookup for every address in play. A suppression of either scope blocks
  // the send, and the addresses never leave the hashed form used elsewhere.
  const hashesByUser = new Map<string, string[]>()
  for (const creator of creators) {
    hashesByUser.set(creator.id, [...hashEmailAddressCandidates(creator.email)])
  }
  const allHashes = [...new Set([...hashesByUser.values()].flat())]
  const suppressed = allHashes.length === 0
    ? []
    : await db
      .select({ emailHash: emailSuppression.emailHash })
      .from(emailSuppression)
      .where(and(
        inArray(emailSuppression.emailHash, allHashes),
        eq(emailSuppression.active, true),
        inArray(emailSuppression.scope, ["all", "marketing"]),
      ))
  const suppressedHashes = new Set(suppressed.map((row) => row.emailHash))

  const candidates: ActivationCandidateRow[] = []
  for (const row of organizations) {
    const creatorId = creatorByOrganization.get(row.id)
    if (!creatorId) continue
    const creator = creatorById.get(creatorId)
    if (!creator) continue

    candidates.push({
      email: creator.email,
      emailVerified: creator.emailVerified,
      firstName: firstName(creator.name),
      hasActiveSuppression: (hashesByUser.get(creator.id) ?? [])
        .some((hash) => suppressedHashes.has(hash)),
      organizationCreatedAt: row.createdAt,
      organizationId: row.id,
      sends: sendsByUser.get(creator.id) ?? [],
      skillCount: skillCountByOrganization.get(row.id) ?? 0,
      teamName: row.name,
      userId: creator.id,
    })
  }

  return candidates
}
