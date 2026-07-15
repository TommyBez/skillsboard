import { cache } from "react"
import { redirect } from "next/navigation"

import { listUserOrganizations } from "@/lib/db/queries"
import { requireSession } from "@/lib/session"

export const getAppContext = cache(async () => {
  const session = await requireSession()
  const organizations = await listUserOrganizations(session.user.id)

  if (!organizations.length) redirect("/onboarding")

  const activeOrganization = organizations.find(
    (organization) => organization.id === session.session.activeOrganizationId,
  ) ?? organizations[0]

  return {
    session,
    organizations,
    activeId: activeOrganization.id,
  }
})
