import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AlternativesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="alternatives_header">{children}</ResourceShell>
}
