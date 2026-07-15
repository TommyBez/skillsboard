import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session
}

export async function requireActiveOrganization() {
  const session = await requireSession()
  const organizationId = session.session.activeOrganizationId
  if (!organizationId) throw new Error("Select an organization first")
  return { organizationId, userId: session.user.id }
}
