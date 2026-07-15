import type { ReactNode } from "react"

import { ProtectedAppShell } from "@/components/protected-app-shell"

export default function DiscoverLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
