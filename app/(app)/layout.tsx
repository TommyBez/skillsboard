import type { ReactNode } from "react"
import type { Metadata } from "next"

import { ProtectedAppShell } from "@/components/protected-app-shell"

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
