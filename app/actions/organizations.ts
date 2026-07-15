"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { requireSession } from "@/lib/session"

export async function createOrganization(formData: FormData) {
  await requireSession()
  const name = z.string().trim().min(2).max(80).parse(formData.get("name"))
  const slug = z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/).parse(formData.get("slug"))
  const created = await auth.api.createOrganization({ headers: await headers(), body: { name, slug } })
  if (created) await auth.api.setActiveOrganization({ headers: await headers(), body: { organizationId: created.id } })
  redirect("/library")
}

export async function setActiveOrganization(organizationId: string) {
  await auth.api.setActiveOrganization({ headers: await headers(), body: { organizationId } })
}

export async function inviteMember(formData: FormData) {
  await requireSession()
  const email = z.string().email().parse(formData.get("email"))
  const role = z.enum(["admin", "member"]).parse(formData.get("role") ?? "member")
  await auth.api.createInvitation({ headers: await headers(), body: { email, role } })
}
