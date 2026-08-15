import { ResourceShell } from "@/components/resources/resource-chrome"

export default function CursorSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="cursor_skills_header">{children}</ResourceShell>
}
