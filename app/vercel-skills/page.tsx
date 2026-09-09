import { VercelSkillsPage } from "@/components/vercel-skills/vercel-skills-page"
import { pageMetadata } from "@/lib/seo/page-metadata"
import { vercelSkills } from "@/lib/seo/vercel-skills"

export const metadata = pageMetadata("/vercel-skills")

export default function Page() {
  return <VercelSkillsPage entry={vercelSkills} />
}
