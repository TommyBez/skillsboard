import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillCreatorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ResourceShell location="skill_creator_header">{children}</ResourceShell>
}
