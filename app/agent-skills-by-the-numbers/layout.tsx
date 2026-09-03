import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AgentSkillsByTheNumbersLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="agent_skills_by_the_numbers_header">
      {children}
    </ResourceShell>
  )
}
