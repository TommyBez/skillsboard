import { ResourceShell } from "@/components/resources/resource-chrome"

export default function CompareHubLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="compare_header">{children}</ResourceShell>
}
