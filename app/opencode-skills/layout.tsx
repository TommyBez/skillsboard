import { ResourceShell } from "@/components/resources/resource-chrome"

export default function OpencodeSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="opencode_skills_header">{children}</ResourceShell>
  )
}
