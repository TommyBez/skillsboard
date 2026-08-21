import { ResourceShell } from "@/components/resources/resource-chrome"

export default function VercelSkillsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="vercel_skills_header">{children}</ResourceShell>
  )
}
