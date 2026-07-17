"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { auth, getAuthBaseUrl } from "@/lib/auth"
import { sendTeamInvitation } from "@/lib/email/send-team-invitation"
import { resolveUniqueOrganizationSlug } from "@/lib/organization-slug"
import { captureTeamEvent } from "@/lib/posthog-server"
import { getSession, requireSession } from "@/lib/session"

export interface CreateOrganizationState {
  error: string
}

export interface CreateInvitationLinkState {
  emailError: string
  error: string
  expiresAt: string
  invitedEmail: string
  inviteUrl: string
  role: "admin" | "member" | ""
}

export interface AcceptInvitationState {
  error: string
}

const organizationNameSchema = z.object({
  creationSurface: z.enum(["onboarding", "in_app"]),
  name: z.string().trim().min(2, "Team name must be at least 2 characters.").max(80, "Team name must be 80 characters or less."),
})

export async function createOrganization(
  _state: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  await requireSession()
  const parsed = organizationNameSchema.safeParse({
    creationSurface: formData.get("creationSurface"),
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter a valid team name." }
  }

  const slug = await resolveUniqueOrganizationSlug(parsed.data.name)

  try {
    const created = await auth.api.createOrganization({
      headers: await headers(),
      body: { name: parsed.data.name, slug },
    })
    if (!created?.id) return { error: "We couldn’t create your team library. Please try again." }

    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: created.id },
    })
    const session = await getSession()
    if (session?.user) {
      await captureTeamEvent({
        distinctId: session.user.id,
        event: "team_created",
        properties: { creation_surface: parsed.data.creationSurface },
        teamId: created.id,
      })
    }
  } catch (error) {
    console.error("Unable to create team library", error)
    return { error: "We couldn’t create your team library. Please try again." }
  }

  redirect("/library")
}

export async function setActiveOrganization(organizationId: string) {
  await requireSession()
  await auth.api.setActiveOrganization({ headers: await headers(), body: { organizationId } })
}

export async function createInvitationLink(
  _state: CreateInvitationLinkState,
  formData: FormData,
): Promise<CreateInvitationLinkState> {
  await requireSession()
  const parsed = z.object({
    email: z.email(),
    role: z.enum(["admin", "member"]),
  }).safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "member",
  })

  if (!parsed.success) {
    return {
      emailError: "",
      error: "Enter a valid email address and role.",
      expiresAt: "",
      invitedEmail: "",
      inviteUrl: "",
      role: "",
    }
  }

  try {
    const requestHeaders = await headers()
    const invitation = await auth.api.createInvitation({
      headers: requestHeaders,
      body: parsed.data,
    })
    const inviteUrl = new URL(`/invite/${invitation.id}`, getAuthBaseUrl()).toString()
    const session = await getSession()
    const inviterName = session?.user.name ?? "A team admin"
    const inviterEmail = session?.user.email ?? ""
    const organization = await auth.api.getFullOrganization({ headers: requestHeaders })
    const teamName = organization?.name ?? "your team"

    let emailError = ""
    try {
      await sendTeamInvitation({
        invitationId: invitation.id,
        email: invitation.email,
        role: parsed.data.role,
        teamName,
        inviterName,
        inviterEmail,
        expiresAt: invitation.expiresAt,
      })
    } catch (sendError) {
      console.error("Unable to send invitation email", sendError)
      emailError =
        "The invitation was created, but the email could not be sent. Share the invite link below instead."
    }

    const currentSession = await getSession()
    if (currentSession?.user) {
      await captureTeamEvent({
        distinctId: currentSession.user.id,
        event: "team_member_invited",
        properties: {
          role: parsed.data.role,
          email_sent: !emailError,
        },
        teamId: invitation.organizationId,
      })
    }
    return {
      emailError,
      error: "",
      expiresAt: invitation.expiresAt.toISOString(),
      invitedEmail: invitation.email,
      inviteUrl,
      role: parsed.data.role,
    }
  } catch (error) {
    console.error("Unable to create invitation link", error)
    return {
      emailError: "",
      error: "We couldn’t create the invite. Check the email and your team permissions, then try again.",
      expiresAt: "",
      invitedEmail: "",
      inviteUrl: "",
      role: "",
    }
  }
}

export async function acceptInvitation(
  _state: AcceptInvitationState,
  formData: FormData,
): Promise<AcceptInvitationState> {
  const invitationId = z.string().regex(/^[A-Za-z0-9_-]{1,200}$/).safeParse(formData.get("invitationId"))
  if (!invitationId.success) return { error: "This invitation link is invalid." }
  const session = await getSession()
  if (!session?.user) redirect(`/sign-up?returnTo=${encodeURIComponent(`/invite/${invitationId.data}`)}`)

  try {
    const accepted = await auth.api.acceptInvitation({
      headers: await headers(),
      body: { invitationId: invitationId.data },
    })
    if (session?.user) {
      await captureTeamEvent({
        distinctId: session.user.id,
        event: "invitation_accepted",
        teamId: accepted.invitation.organizationId,
      })
    }
  } catch (error) {
    console.error("Unable to accept invitation", error)
    return { error: "This invitation may have expired or can no longer be accepted. Ask a team admin for a new link." }
  }

  redirect("/library")
}
