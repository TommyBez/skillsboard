import type { ReactNode } from "react"
import { headers } from "next/headers"
import { getSessionCookie } from "better-auth/cookies"

import { ProtectedAppShell } from "@/components/protected-app-shell"
import { ResourceShell } from "@/components/resources/resource-chrome"

/**
 * One URL, two frames.
 *
 * Connecting an agent is the first thing a new account does and the first
 * thing a reader wants to check before opening one, so the page is public and
 * indexable. A signed-in reader still gets the product chrome, because this is
 * a nav destination for them, not a marketing page.
 *
 * The choice is made from cookie presence alone, the same optimistic read the
 * proxy makes: a session lookup here would put a database round trip in front
 * of the first byte of a public page.
 */
export default async function ConnectLayout({ children }: { children: ReactNode }) {
  const hasSessionCookie = Boolean(getSessionCookie(await headers()))

  if (hasSessionCookie) return <ProtectedAppShell>{children}</ProtectedAppShell>

  return <ResourceShell location="connect_header">{children}</ResourceShell>
}
