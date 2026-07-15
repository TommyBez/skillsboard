import { cache } from "react"
import { redirect } from "next/navigation"

import { resolveActiveOrganization } from "@/lib/session"

export const getAppContext = cache(async () => {
  const { session, organizations, activeOrganization } = await resolveActiveOrganization()

  if (!activeOrganization) redirect("/onboarding")

  return {
    session,
    organizations,
    activeId: activeOrganization.id,
  }
})
