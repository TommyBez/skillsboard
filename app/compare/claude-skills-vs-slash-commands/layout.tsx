import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillsVsSlashCommandsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="compare_skills_slash_commands_header">
      {children}
    </ResourceShell>
  )
}
