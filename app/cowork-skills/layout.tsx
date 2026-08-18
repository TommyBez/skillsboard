import { ResourceShell } from "@/components/resources/resource-chrome"

export default function CoworkSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="cowork_skills_header">{children}</ResourceShell>
  )
}
