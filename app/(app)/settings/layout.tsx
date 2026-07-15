import type { ReactNode } from "react"

import { ProtectedAppShell } from "@/components/protected-app-shell"

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
