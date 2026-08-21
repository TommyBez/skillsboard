import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AgentSkillsSupportLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="agent_skills_support_header">
      {children}
    </ResourceShell>
  )
}
