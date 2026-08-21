import { ResourceShell } from "@/components/resources/resource-chrome"

export default function DevelopersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="developers_header">{children}</ResourceShell>
}
