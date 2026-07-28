import { db } from "@/lib/db"
import { skill } from "@/lib/db/schema"
import {
  GitHubSkillDiscoveryError,
  resolveGitHubSkills,
} from "@/lib/github-skill-discovery"
import { captureTeamEvent } from "@/lib/posthog-server"

export interface SaveSkillsInput {
  organizationId: string
  userId: string
  githubUrl: string
  skillPaths: string[]
  tags: string[]
  note?: string
  examplePrompts: string[]
  surface: "web" | "mcp"
}

export interface SaveSkillInput extends Omit<SaveSkillsInput, "skillPaths"> {
  skillPath: string
}

export type SavedSkill = typeof skill.$inferSelect

export type SaveSkillsResult =
  | { ok: true; saved: SavedSkill[]; alreadySaved: string[] }
  | { ok: false; error: string }

export type SaveSkillResult =
  | { ok: true; skill: SavedSkill }
  | { ok: false; error: string }

export async function saveSkillsToLibrary(input: SaveSkillsInput): Promise<SaveSkillsResult> {
  try {
    const repository = await resolveGitHubSkills(input.githubUrl, input.skillPaths)

    const note = input.note || null
    const examplePrompts = [...new Set(input.examplePrompts)]
    const tags = [...new Set(input.tags.map((tag) => tag.toLowerCase()))]
    const savedSkills = await db.insert(skill).values(repository.skills.map((selectedSkill) => ({
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
      tags,
      note,
      examplePrompts,
    }))).onConflictDoNothing({
      target: [skill.organizationId, skill.githubUrl, skill.skillName],
    }).returning()

    // Correlate by path, not name: two selected paths can resolve to the same
    // skill name, and only one of them wins the unique-name insert.
    const savedPaths = new Set(savedSkills.map((savedSkill) => savedSkill.skillPath))
    const alreadySaved = repository.skills
      .filter((selectedSkill) => !savedPaths.has(selectedSkill.path))
      .map((selectedSkill) => selectedSkill.name)

    for (const savedSkill of savedSkills) {
      captureTeamEvent({
        distinctId: input.userId,
        event: "skill_saved",
        properties: {
          skill_name: savedSkill.skillName,
          repo_owner: repository.repoOwner,
          repo_name: repository.repoName,
          tag_count: tags.length,
          has_note: Boolean(note),
          example_prompt_count: examplePrompts.length,
          surface: input.surface,
        },
        teamId: input.organizationId,
      })
    }

    return { ok: true, saved: savedSkills, alreadySaved }
  } catch (error) {
    console.error("Unable to save skills", error)
    return {
      ok: false,
      error: error instanceof GitHubSkillDiscoveryError
        ? error.message
        : "We couldn’t fetch this repository or save the skills. Check the URL and try again.",
    }
  }
}

export async function saveSkillToLibrary(input: SaveSkillInput): Promise<SaveSkillResult> {
  const { skillPath, ...rest } = input
  const result = await saveSkillsToLibrary({ ...rest, skillPaths: [skillPath] })

  if (!result.ok) return result
  const [savedSkill] = result.saved
  if (!savedSkill) return { ok: false, error: "This skill is already in your team library" }
  return { ok: true, skill: savedSkill }
}
