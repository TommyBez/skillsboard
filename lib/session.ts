import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { listUserOrganizations } from "@/lib/db/queries"

export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() })
})

export async function requireSession() {
  const session = await getSession()
  if (!session?.user) redirect("/sign-in")
  return session
}

export async function resolveActiveOrganization(
  session?: Awaited<ReturnType<typeof requireSession>>,
) {
  const currentSession = session ?? await requireSession()
  const organizations = await listUserOrganizations(currentSession.user.id)
  const activeOrganization = organizations.find(
    (organization) => organization.id === currentSession.session.activeOrganizationId,
  ) ?? organizations[0] ?? null

  if (!activeOrganization) {
    return { session: currentSession, organizations, activeOrganization }
  }

  if (activeOrganization.id === currentSession.session.activeOrganizationId) {
    return { session: currentSession, organizations, activeOrganization }
  }

  await auth.api.setActiveOrganization({
    headers: await headers(),
    body: { organizationId: activeOrganization.id },
  })

  // getSession is request-cached, so mirror the persisted ID for this request.
  return {
    session: {
      ...currentSession,
      session: {
        ...currentSession.session,
        activeOrganizationId: activeOrganization.id,
      },
    },
    organizations,
    activeOrganization,
  }
}

export function isOrganizationAdmin(role: string) {
  return role === "owner" || role === "admin"
}

export async function requireActiveOrganization(
  session?: Awaited<ReturnType<typeof requireSession>>,
) {
  const resolved = await resolveActiveOrganization(session)
  if (!resolved.activeOrganization) throw new Error("Select a team library first")
  return {
    organizationId: resolved.activeOrganization.id,
    userId: resolved.session.user.id,
    role: resolved.activeOrganization.role,
  }
}
