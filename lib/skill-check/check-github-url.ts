import "server-only"

import {
  collectGitHubSkillSources,
  GitHubSkillDiscoveryError,
} from "@/lib/github-skill-discovery"
import { readGitHubUrl } from "@/lib/github-url"
import {
  SKILL_SPEC_CHECKED_ON,
  type SkillCheckReport,
  type SkillCheckReportEntry,
  type SkillCheckReportErrorCode,
} from "@/lib/skill-check/report"
import { checkSkillMarkdown } from "@/lib/skill-check/skill-check"

/** HTTP status for each way the check can refuse, used by the route. */
export const SKILL_CHECK_ERROR_STATUS: Record<SkillCheckReportErrorCode, number> = {
  invalid_url: 400,
  invalid_path: 400,
  not_found: 404,
  skill_not_found: 404,
  no_skills_found: 404,
  rate_limited: 429,
  repository_too_large: 413,
  unavailable: 502,
  unexpected: 500,
}

function emptyReport(url: string): SkillCheckReport {
  return {
    url,
    checkedAt: new Date().toISOString(),
    specCheckedOn: SKILL_SPEC_CHECKED_ON,
    repository: null,
    skills: [],
    truncated: false,
    error: null,
  }
}

function folderNameOf(path: string) {
  const segments = path.split("/").filter(Boolean)
  return segments.length > 0 ? segments[segments.length - 1] : undefined
}

/**
 * Reads every SKILL.md a GitHub URL offers and checks each one against the
 * Agent Skills specification.
 *
 * Accepts what the save flow accepts: a repository URL, or a direct link to a
 * skill folder or its SKILL.md. Nothing is written anywhere, no account is
 * involved, and the repository stays its authors' own; this reads public files
 * and reports on their format.
 *
 * Failures are returned in the report rather than thrown, because the page and
 * the HTTP route both need to render the reason rather than a stack.
 */
export async function checkGitHubUrl(url: string): Promise<SkillCheckReport> {
  const trimmed = url.trim()
  const report = emptyReport(trimmed)

  if (!readGitHubUrl(trimmed)) {
    return {
      ...report,
      error: {
        code: "invalid_url",
        message:
          "Paste a github.com URL: a repository, a skill folder, or a SKILL.md file.",
      },
    }
  }

  try {
    const sources = await collectGitHubSkillSources(trimmed)
    const repository = {
      githubUrl: sources.githubUrl,
      owner: sources.repoOwner,
      name: sources.repoName,
      defaultBranch: sources.defaultBranch,
      commitSha: sources.commitSha,
    }

    if (sources.sources.length === 0) {
      return {
        ...report,
        repository,
        error: {
          code: "no_skills_found",
          message:
            "No SKILL.md file was found in the directories agents scan. Link a skill folder directly if the file lives somewhere else.",
        },
      }
    }

    const skills: SkillCheckReportEntry[] = sources.sources.map((source) => {
      const sourceUrl = `${sources.githubUrl}/blob/${sources.commitSha}/${source.filePath}`

      if (source.raw === null) {
        return {
          path: source.path,
          filePath: source.filePath,
          name: null,
          sizeBytes: source.sizeBytes,
          sourceUrl,
          errors: [
            {
              code: "not_utf8",
              message:
                "The file is not valid UTF-8 text, so a loader cannot read its frontmatter. Save it as UTF-8.",
            },
          ],
          warnings: [],
        }
      }

      const result = checkSkillMarkdown(source.raw, {
        path: source.filePath,
        folderName: folderNameOf(source.path),
        sizeBytes: source.sizeBytes,
      })

      return {
        path: source.path,
        filePath: source.filePath,
        name: result.name,
        sizeBytes: source.sizeBytes,
        sourceUrl,
        errors: result.errors,
        warnings: result.warnings,
      }
    })

    return {
      ...report,
      repository,
      skills,
      truncated: sources.skippedCount > 0,
    }
  } catch (error) {
    if (error instanceof GitHubSkillDiscoveryError) {
      return { ...report, error: { code: error.code, message: error.message } }
    }

    return {
      ...report,
      error: {
        code: "unexpected",
        message: "This URL could not be checked. Try again.",
      },
    }
  }
}
