import type { ReactNode } from "react"

import { ResourceShell } from "@/components/resources/resource-chrome"

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return <ResourceShell>{children}</ResourceShell>
}
