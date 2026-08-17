import { ResourceShell } from "@/components/resources/resource-chrome"

export default function WhereToFindClaudeSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="where_skills_header">{children}</ResourceShell>
}
