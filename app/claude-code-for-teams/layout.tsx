import { ResourceShell } from "@/components/resources/resource-chrome"

export default function ClaudeCodeForTeamsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ResourceShell location="claude_code_for_teams_header">
      {children}
    </ResourceShell>
  )
}
