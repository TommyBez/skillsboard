import { ResourceShell } from "@/components/resources/resource-chrome"

export default function CodexSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="codex_skills_header">{children}</ResourceShell>
}
