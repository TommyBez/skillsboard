import { ResourceShell } from "@/components/resources/resource-chrome"

export default function ResourcesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="resources_header">{children}</ResourceShell>
}
