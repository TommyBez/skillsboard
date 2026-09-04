import { ResourceShell } from "@/components/resources/resource-chrome"

export default function OpencodeSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell>{children}</ResourceShell>
}
