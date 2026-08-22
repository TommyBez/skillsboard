import { ResourceShell } from "@/components/resources/resource-chrome"

export default function SkillExamplesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="skill_examples_header">{children}</ResourceShell>
  )
}
