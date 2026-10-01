import { ManageAiSkillsPage } from "@/components/manage-ai-skills/manage-ai-skills-page"
import { manageAiSkills } from "@/lib/seo/manage-ai-skills"
import { pageMetadata } from "@/lib/seo/page-metadata"

export const metadata = pageMetadata("/manage-ai-skills")

export default function Page() {
  return <ManageAiSkillsPage entry={manageAiSkills} />
}
