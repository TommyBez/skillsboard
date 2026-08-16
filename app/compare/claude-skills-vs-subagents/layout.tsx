import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillsVsSubagentsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="compare_skills_subagents_header">
      {children}
    </ResourceShell>
  )
}
