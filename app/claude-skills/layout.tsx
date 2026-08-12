import { ResourceShell } from "@/components/resources/resource-chrome"

export default function ClaudeSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="claude_skills_header">{children}</ResourceShell>
}
