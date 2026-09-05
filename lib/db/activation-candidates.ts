import "server-only"

import { and, asc, count, eq, gt, gte, inArray, or } from "drizzle-orm"

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
 * How many organizations one database round trip reads. The selection walks
 * every page, so this is a batch size and not a horizon: it never decides which
 * teams are considered, only how many are read at a time.
 */
export const ACTIVATION_CANDIDATE_PAGE_SIZE = 200

/**
 * A bound on one cron run. At the current rate of team creation this is orders
 * of magnitude above the real number, and it keeps a single invocation finite
 * if the backfill anchor is ever set to a date that opens the whole table.
 *
 * Pages are walked oldest team first, so if this ceiling were ever reached the
 * teams left out would be the newest ones, whose window has just opened and
 * which the rolling 14 day cutoff keeps selecting on later runs. No team is
 * ever excluded by its position in a fixed first page.
 */
export const ACTIVATION_CANDIDATE_LIMIT = 5000

export interface ActivationCandidateRow extends ActivationCandidate {
  email: string
  firstName: string | null
  teamName: string
}

interface OrganizationRow {
  createdAt: Date
  id: string
  name: string
}

function firstName(name: string): string | null {
  const trimmed = name.trim().split(/\s+/)[0]
  return trimmed ? trimmed : null
}

/**
 * One page of organizations, ordered oldest first and read through a keyset
 * cursor on `(createdAt, id)`. A cursor rather than an offset because rows are
 * inserted while the walk runs, and because it lets every page after the first
 * start exactly where the previous one ended.
 */
function selectOrganizationPage(input: {
  cursor: { createdAt: Date; id: string } | null
  cutoff: Date | null
}): Promise<OrganizationRow[]> {
  const { cursor, cutoff } = input
  return db
    .select({
      createdAt: organization.createdAt,
      id: organization.id,
      name: organization.name,
    })
    .from(organization)
    .where(and(
      cutoff ? gte(organization.createdAt, cutoff) : undefined,
      cursor
        ? or(
          gt(organization.createdAt, cursor.createdAt),
          and(eq(organization.createdAt, cursor.createdAt), gt(organization.id, cursor.id)),
        )
        : undefined,
    ))
    .orderBy(asc(organization.createdAt), asc(organization.id))
    .limit(ACTIVATION_CANDIDATE_PAGE_SIZE)
}

/** Everything the decision needs about one page of teams, read in one pass. */
async function hydrateOrganizations(
  organizations: OrganizationRow[],
): Promise<ActivationCandidateRow[]> {
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

/**
 * The teams whose activation window may still be open, each paired with the
 * person who created it: the earliest owner of the team. Every value the
 * decision needs is read here, and the decision itself stays in
 * `lib/activation-emails.ts` so it can be tested without a database.
 *
 * The walk covers the whole eligible set rather than one page of it. A single
 * page would be filled by the same teams on every run, because a team that was
 * already emailed or skipped keeps matching the query, and during the backfill
 * every older team behind that page would never be reached before its window
 * closed.
 */
export async function selectActivationCandidates(input: {
  cutoff: Date | null
}): Promise<ActivationCandidateRow[]> {
  const candidates: ActivationCandidateRow[] = []
  let cursor: { createdAt: Date; id: string } | null = null

  while (candidates.length < ACTIVATION_CANDIDATE_LIMIT) {
    const organizations: OrganizationRow[] = await selectOrganizationPage({
      cursor,
      cutoff: input.cutoff,
    })
    if (organizations.length === 0) break

    candidates.push(...(await hydrateOrganizations(organizations)))

    if (organizations.length < ACTIVATION_CANDIDATE_PAGE_SIZE) break
    const last = organizations.at(-1)
    if (!last) break
    cursor = { createdAt: last.createdAt, id: last.id }
  }

  return candidates.slice(0, ACTIVATION_CANDIDATE_LIMIT)
}

/**
 * The current number of skills in a team's library, read immediately before a
 * send so the copy cannot claim an empty library for a team that filled one
 * between the nightly selection and the message going out.
 */
export async function countOrganizationSkills(organizationId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(skill)
    .where(eq(skill.organizationId, organizationId))
  return Number(row?.total ?? 0)
}
