import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillsVsPluginsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="compare_skills_plugins_header">{children}</ResourceShell>
  )
}
