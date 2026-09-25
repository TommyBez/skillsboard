import "server-only"

import {
  ACTIVATION_RESEND_SKILL_SAVED,
  ACTIVATION_RESEND_TEAM_CREATED,
  ACTIVATION_TEAM_NAME_PROPERTY,
} from "@/lib/activation-emails"
import { getOrganizationCreator } from "@/lib/db/activation-candidates"
import { captureTeamEvent } from "@/lib/posthog-server"

import { EmailPreferenceBlockedError, assertTransactionalEmailAllowed } from "./email-preferences"
import { getResendClient } from "./resend"

export interface EnrollActivationSequenceInput {
  email: string
  emailVerified: boolean
  firstName: string | null
  organizationId: string
  teamName: string
  userId: string
}

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim())
}

async function upsertActivationContact(input: {
  email: string
  firstName: string | null
  teamName: string
}): Promise<void> {
  const resend = getResendClient()
  const properties = { [ACTIVATION_TEAM_NAME_PROPERTY]: input.teamName }
  const created = await resend.contacts.create({
    email: input.email,
    firstName: input.firstName ?? undefined,
    properties,
  })
  if (!created.error) return

  const updated = await resend.contacts.update({
    email: input.email,
    firstName: input.firstName ?? undefined,
    properties,
  })
  if (updated.error) {
    throw new Error(updated.error.message)
  }
}

/**
 * Put the team creator on the Resend contact graph and fire `team.created`.
 * The Account setup automation, once enabled, sends the welcome and waits for
 * `skill.saved`. A marketing opt-out does not block this. A bounce, complaint,
 * or provider suppression does. Failures never throw to the caller.
 */
export async function enrollActivationSequence(
  input: EnrollActivationSequenceInput,
): Promise<void> {
  if (!input.emailVerified || !isResendConfigured()) return

  try {
    await assertTransactionalEmailAllowed(input.email)
    await upsertActivationContact({
      email: input.email,
      firstName: input.firstName,
      teamName: input.teamName,
    })
    const resend = getResendClient()
    const { error } = await resend.events.send({
      email: input.email,
      event: ACTIVATION_RESEND_TEAM_CREATED,
      payload: {
        organization_id: input.organizationId,
        team_name: input.teamName,
      },
    })
    if (error) {
      console.error("Activation team.created event failed", { name: error.name })
      return
    }
    captureTeamEvent({
      distinctId: input.userId,
      event: "activation_sequence_enrolled",
      properties: { provider: "resend" },
      teamId: input.organizationId,
    })
  } catch (error) {
    if (error instanceof EmailPreferenceBlockedError) return
    console.error("Activation enrollment failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
  }
}

/**
 * Tell the automation the library is no longer empty. Fired for the team
 * creator, not the person who saved, so a teammate's first skill still cancels
 * the reminder.
 */
export async function notifyActivationSkillSaved(organizationId: string): Promise<void> {
  if (!isResendConfigured()) return

  try {
    const creator = await getOrganizationCreator(organizationId)
    if (!creator?.emailVerified) return
    await assertTransactionalEmailAllowed(creator.email)
    const resend = getResendClient()
    const { error } = await resend.events.send({
      email: creator.email,
      event: ACTIVATION_RESEND_SKILL_SAVED,
      payload: { organization_id: organizationId },
    })
    if (error) {
      console.error("Activation skill.saved event failed", { name: error.name })
    }
  } catch (error) {
    if (error instanceof EmailPreferenceBlockedError) return
    console.error("Activation skill.saved notify failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    })
  }
}
