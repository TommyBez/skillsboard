import { AgentsMdVsSkillMdPage } from "@/components/agents-md-vs-skill-md/agents-md-vs-skill-md-page"
import { agentsMdVsSkillMd } from "@/lib/seo/agents-md-vs-skill-md"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/agents-md-vs-skill-md")

export default function Page() {
  return <AgentsMdVsSkillMdPage entry={agentsMdVsSkillMd} />
}
