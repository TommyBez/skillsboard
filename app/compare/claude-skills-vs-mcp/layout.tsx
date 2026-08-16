import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillsVsMcpLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="compare_skills_mcp_header">{children}</ResourceShell>
  )
}
