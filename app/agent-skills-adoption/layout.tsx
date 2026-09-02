import { ResourceShell } from "@/components/resources/resource-chrome"

export default function AgentSkillsAdoptionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="agent_skills_adoption_header">
      {children}
    </ResourceShell>
  )
}
