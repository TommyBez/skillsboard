"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { auth, getAuthBaseUrl } from "@/lib/auth"
import { getSession, requireSession } from "@/lib/session"

export interface CreateOrganizationState {
  error: string
}

export interface CreateInvitationLinkState {
  error: string
  expiresAt: string
  invitedEmail: string
  inviteUrl: string
  role: "admin" | "member" | ""
}

export interface AcceptInvitationState {
  error: string
}

const organizationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/),
})

export async function createOrganization(
  _state: CreateOrganizationState,
  formData: FormData,
): Promise<CreateOrganizationState> {
  await requireSession()
  const parsed = organizationSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  })

  if (!parsed.success) {
    return { error: "Check the team name and choose a unique ID using lowercase letters, numbers, or dashes." }
  }

  try {
    const created = await auth.api.createOrganization({ headers: await headers(), body: parsed.data })
    if (!created) return { error: "We couldn’t create your team library. Try a different team ID." }
  } catch (error) {
    console.error("Unable to create team library", error)
    return { error: "We couldn’t create your team library. Try a different team ID or try again." }
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

  if (!parsed.success) return { error: "Enter a valid email address and role.", expiresAt: "", invitedEmail: "", inviteUrl: "", role: "" }

  try {
    const invitation = await auth.api.createInvitation({
      headers: await headers(),
      body: parsed.data,
    })
    return {
      error: "",
      expiresAt: invitation.expiresAt.toISOString(),
      invitedEmail: invitation.email,
      inviteUrl: new URL(`/invite/${invitation.id}`, getAuthBaseUrl()).toString(),
      role: parsed.data.role,
    }
  } catch (error) {
    console.error("Unable to create invitation link", error)
    return {
      error: "We couldn’t create the invite link. Check the email and your team permissions, then try again.",
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
  if (!session?.user) redirect(`/sign-in?returnTo=${encodeURIComponent(`/invite/${invitationId.data}`)}`)

  try {
    await auth.api.acceptInvitation({
      headers: await headers(),
      body: { invitationId: invitationId.data },
    })
  } catch (error) {
    console.error("Unable to accept invitation", error)
    return { error: "This invitation may have expired or can no longer be accepted. Ask a team admin for a new link." }
  }

  redirect("/library")
}
