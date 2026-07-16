import type { ReactNode } from "react"

import { ProtectedAppShell } from "@/components/protected-app-shell"

export default function AppLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
