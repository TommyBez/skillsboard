import type { ReactNode } from "react"
import type { Metadata } from "next"

import { PostHogScopeBoundary } from "@/components/posthog-analytics"
import { ProtectedAppShell } from "@/components/protected-app-shell"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <PostHogScopeBoundary scope="team">
      <ProtectedAppShell>{children}</ProtectedAppShell>
    </PostHogScopeBoundary>
  )
}
