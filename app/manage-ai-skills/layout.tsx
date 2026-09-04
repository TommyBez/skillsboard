import { ResourceShell } from "@/components/resources/resource-chrome"

export default function ManageAiSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell>{children}</ResourceShell>
}
