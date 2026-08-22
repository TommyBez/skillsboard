import { ResourceShell } from "@/components/resources/resource-chrome"

export default function CopilotSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="copilot_skills_header">{children}</ResourceShell>
  )
}
