import type { ReactNode } from "react"

import { ProtectedAppShell } from "@/components/protected-app-shell"

export default function LibraryLayout({ children }: { children: ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
