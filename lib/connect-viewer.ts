import { cache } from "react"

import { listUserOrganizations } from "@/lib/db/queries"
import { getSession } from "@/lib/session"

/**
 * The team a visitor of `/connect` would be connecting an agent to, or `null`
 * when nobody is signed in.
 *
 * `/connect` is a public page, so it cannot read `getAppContext`: that helper
 * redirects a visitor without a team to onboarding, and this page has to stay
 * readable before an account exists. The team is still resolved when there is
 * one, because `mcp_setup_viewed` and `mcp_config_copied` are team scoped and
 * only keep their funnel shape with the team on both ends.
 */
export const getConnectViewerTeamId = cache(async (): Promise<string | null> => {
  const session = await getSession()
  if (!session?.user) return null

  const organizations = await listUserOrganizations(session.user.id)
  const active =
    organizations.find(
      (organization) => organization.id === session.session.activeOrganizationId,
    ) ?? organizations[0]

  return active?.id ?? null
})
