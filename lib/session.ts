import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { canAccessOrganization } from "@/lib/db/queries"

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  return session
}

export async function requireActiveOrganization(
  session?: Awaited<ReturnType<typeof requireSession>>,
) {
  const activeSession = session ?? await requireSession()
  const organizationId = activeSession.session.activeOrganizationId
  if (!organizationId) throw new Error("Select an organization first")
  if (!await canAccessOrganization(activeSession.user.id, organizationId)) {
    throw new Error("You no longer have access to this organization")
  }
  return { organizationId, userId: activeSession.user.id }
}
