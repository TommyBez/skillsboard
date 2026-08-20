import { ResourceShell } from "@/components/resources/resource-chrome"

export default function BestClaudeSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="best_claude_skills_header">
      {children}
    </ResourceShell>
  )
}
