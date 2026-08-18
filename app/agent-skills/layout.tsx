import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AgentSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="agent_skills_header">{children}</ResourceShell>
}
