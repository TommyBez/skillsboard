import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillsVsMcpLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell>{children}</ResourceShell>
}
