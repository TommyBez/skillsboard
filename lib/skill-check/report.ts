/**
 * The shape of a `/check` report, and its Markdown rendering.
 *
 * Pure and shared: the HTTP route builds this, the page renders it, and the
 * `?format=md` twin of the same URL renders it as text so an agent can read
 * the report it just asked for without parsing JSON.
 */

import type { SkillDraft } from "@/lib/skill-creator/skill-md"
import type { SkillCheckIssue } from "@/lib/skill-check/skill-check"

/**
 * The day the rules in this checker were last read against the published
 * specification. Stated on the page and in the report, because a format check
 * is only as current as the document it was written from.
 */
export const SKILL_SPEC_CHECKED_ON = "2026-09-08"

export type SkillCheckReportErrorCode =
  | "invalid_url"
  | "not_found"
  | "rate_limited"
  | "unavailable"
  | "repository_too_large"
  | "invalid_path"
  | "skill_not_found"
  | "no_skills_found"
  | "unexpected"

export interface SkillCheckReportError {
  code: SkillCheckReportErrorCode
  message: string
}

export interface SkillCheckReportRepository {
  githubUrl: string
  owner: string
  name: string
  defaultBranch: string
  /** The commit every file in this report was read at. */
  commitSha: string
}

export interface SkillCheckReportEntry {
  /** Repository-relative folder holding SKILL.md. The repository root is "". */
  path: string
  filePath: string
  name: string | null
  sizeBytes: number
  /** Permalink to the exact file that was read, pinned to the commit. */
  sourceUrl: string
  /**
   * The frontmatter and body as read, sanitized, in the shape the skill
   * creator edits. It is what `/skill-creator?from=` loads into the form, so a
   * reported file can be fixed where the rules are enforced as you type. The
   * Markdown rendering leaves it out: a report is a list of findings, not a
   * copy of the file.
   */
  draft: SkillDraft
  errors: SkillCheckIssue[]
  warnings: SkillCheckIssue[]
}

export interface SkillCheckReport {
  /** The URL that was checked, as submitted. */
  url: string
  checkedAt: string
  specCheckedOn: string
  repository: SkillCheckReportRepository | null
  skills: SkillCheckReportEntry[]
  /** True when the repository holds SKILL.md files this report left out. */
  truncated: boolean
  error: SkillCheckReportError | null
}

export function countReportIssues(report: SkillCheckReport) {
  return report.skills.reduce(
    (totals, skill) => ({
      errors: totals.errors + skill.errors.length,
      warnings: totals.warnings + skill.warnings.length,
    }),
    { errors: 0, warnings: 0 },
  )
}

/** The folder a reader recognises, with the repository root named as such. */
export function skillLocationLabel(entry: SkillCheckReportEntry) {
  return entry.path === "" ? "repository root" : entry.path
}

function renderIssue(issue: SkillCheckIssue) {
  const where = [issue.field, issue.line ? `line ${issue.line}` : null]
    .filter(Boolean)
    .join(", ")
  return `- \`${issue.code}\`${where ? ` (${where})` : ""}: ${issue.message}`
}

/** The report as Markdown, for `?format=md` and for `Accept: text/markdown`. */
export function renderSkillCheckMarkdown(report: SkillCheckReport): string {
  const lines: string[] = ["# SKILL.md format check", ""]

  lines.push(`Checked: ${report.url}`)
  if (report.repository) {
    lines.push(`Commit: ${report.repository.commitSha}`)
    lines.push(`Default branch: ${report.repository.defaultBranch}`)
  }
  lines.push(`Checked against the Agent Skills spec as of ${report.specCheckedOn}.`)
  lines.push(
    "This is a format check against the published specification. It is not a review, a security audit, or a rating.",
  )
  lines.push("")

  if (report.error) {
    lines.push(`## Could not check this URL`, "", `\`${report.error.code}\`: ${report.error.message}`, "")
    return `${lines.join("\n")}\n`
  }

  const totals = countReportIssues(report)
  lines.push(
    `${report.skills.length} SKILL.md ${report.skills.length === 1 ? "file" : "files"} read, ${totals.errors} ${totals.errors === 1 ? "error" : "errors"} and ${totals.warnings} ${totals.warnings === 1 ? "warning" : "warnings"} found.`,
  )
  if (report.truncated) {
    lines.push(
      "This repository holds further SKILL.md files outside the directories agents scan, and they were not read.",
    )
  }
  lines.push("")

  for (const skill of report.skills) {
    lines.push(`## ${skill.name ?? skill.filePath}`, "")
    lines.push(`- Path: \`${skill.filePath}\``)
    lines.push(`- Directory: \`${skillLocationLabel(skill)}\``)
    lines.push(`- Source: ${skill.sourceUrl}`)
    lines.push("")

    if (skill.errors.length === 0) {
      lines.push("Passes the format check: no rule the specification states was broken.", "")
    } else {
      lines.push(`### Errors (${skill.errors.length})`, "")
      lines.push(...skill.errors.map(renderIssue), "")
    }

    if (skill.warnings.length > 0) {
      lines.push(`### Warnings (${skill.warnings.length})`, "")
      lines.push(...skill.warnings.map(renderIssue), "")
    }
  }

  return `${lines.join("\n")}\n`
}
