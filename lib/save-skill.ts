import { db } from "@/lib/db"
import { skill } from "@/lib/db/schema"
import {
  GitHubSkillDiscoveryError,
  resolveGitHubSkill,
} from "@/lib/github-skill-discovery"
import { captureTeamEvent } from "@/lib/posthog-server"

export interface SaveSkillInput {
  organizationId: string
  userId: string
  githubUrl: string
  skillPath: string
  tags: string[]
  note?: string
  examplePrompts: string[]
  surface: "web" | "mcp"
}

export type SavedSkill = typeof skill.$inferSelect

export type SaveSkillResult =
  | { ok: true; skill: SavedSkill }
  | { ok: false; error: string }

export async function saveSkillToLibrary(input: SaveSkillInput): Promise<SaveSkillResult> {
  try {
    const repository = await resolveGitHubSkill(input.githubUrl, input.skillPath)
    const selectedSkill = repository.skill

    const note = input.note || null
    const examplePrompts = [...new Set(input.examplePrompts)]
    const [savedSkill] = await db.insert(skill).values({
      organizationId: input.organizationId,
      createdBy: input.userId,
      githubUrl: repository.githubUrl,
      skillName: selectedSkill.name,
      title: selectedSkill.name.replaceAll("-", " "),
      description: selectedSkill.description,
      repoOwner: repository.repoOwner,
      repoName: repository.repoName,
      repoStars: repository.repoStars,
      repoUpdatedAt: repository.repoUpdatedAt,
      skillPath: selectedSkill.path,
      tags: [...new Set(input.tags.map((tag) => tag.toLowerCase()))],
      note,
      examplePrompts,
    }).onConflictDoNothing({
      target: [skill.organizationId, skill.githubUrl, skill.skillName],
    }).returning()
    if (!savedSkill) return { ok: false, error: "This skill is already in your team library" }

    captureTeamEvent({
      distinctId: input.userId,
      event: "skill_saved",
      properties: {
        skill_name: selectedSkill.name,
        repo_owner: repository.repoOwner,
        repo_name: repository.repoName,
        tag_count: input.tags.length,
        has_note: Boolean(note),
        example_prompt_count: examplePrompts.length,
        surface: input.surface,
      },
      teamId: input.organizationId,
    })

    return { ok: true, skill: savedSkill }
  } catch (error) {
    console.error("Unable to save skill", error)
    return {
      ok: false,
      error: error instanceof GitHubSkillDiscoveryError
        ? error.message
        : "We couldn’t fetch this repository or save the skill. Check the URL and try again.",
    }
  }
}
