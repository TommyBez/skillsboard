import { ClaudeCodeForTeamsPage } from "@/components/claude-code-for-teams/claude-code-for-teams-page"
import { claudeCodeForTeams } from "@/lib/seo/claude-code-for-teams"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/claude-code-for-teams")

export default function Page() {
  return <ClaudeCodeForTeamsPage entry={claudeCodeForTeams} />
}
