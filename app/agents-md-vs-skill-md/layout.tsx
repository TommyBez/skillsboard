import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AgentsMdVsSkillMdLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="agents_md_header">{children}</ResourceShell>
}
