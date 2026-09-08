import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { guidePaths } from "@/lib/seo/guides/types"
import { skillCreatorPath } from "@/lib/seo/skill-creator/types"
import { SKILL_SPEC_CHECKED_ON } from "@/lib/skill-check/report"

/**
 * Top-level route, for the same reason `/skill-creator` is one: the page
 * answers the head query itself, and the payload is a tool rather than an
 * article. It has no Markdown twin for the same reason either, and the twin an
 * agent wants is the report, served by `/api/check?url=...&format=md`.
 */
export const skillCheckPath = "/check" as const

export type SkillCheckPath = typeof skillCheckPath

export interface SkillCheckNote {
  title: string
  body: string
}

export interface SkillCheckRelatedLink {
  label: string
  href: string
  description: string
}

export interface SkillCheckDefinition {
  path: SkillCheckPath
  eyebrow: string
  title: string
  seoTitle: string
  socialTitle: string
  description: string
  intro: readonly string[]
  form: {
    label: string
    placeholder: string
    submitLabel: string
    hint: string
    privacyNote: string
  }
  checks: {
    title: string
    intro: string
    entries: readonly SkillCheckNote[]
  }
  limits: {
    title: string
    intro: string
    entries: readonly SkillCheckNote[]
  }
  related: readonly SkillCheckRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
  /** The day these rules were last read against the published specification. */
  specCheckedOn: string
}

export const skillCheck: SkillCheckDefinition = {
  path: skillCheckPath,
  eyebrow: "Free tool",
  title: "SKILL.md format checker: read any GitHub repository",
  seoTitle: "SKILL.md Format Checker: Check a GitHub Repo | Skills Board",
  socialTitle: "Check a SKILL.md against the Agent Skills spec",
  description:
    "Paste a GitHub URL and read every SKILL.md in it, checked against the Agent Skills specification: spec errors, convention warnings, no account needed.",
  intro: [
    "A skill is a directory with one Markdown file in it, and the file opens with YAML frontmatter. When that frontmatter is wrong the failure is quiet: the skill loads with empty metadata and never triggers, or it works locally and is refused the first time the folder is uploaded or packaged.",
    "Paste a repository URL, or a direct link to a skill folder, and this page reads every SKILL.md it finds and reports what the specification says about each one. It is a format check and nothing more.",
  ],
  form: {
    label: "GitHub URL",
    placeholder: "https://github.com/owner/repo",
    submitLabel: "Check the format",
    hint: "A repository, a skill folder, or a SKILL.md file. Public repositories only.",
    privacyNote:
      "Nothing is uploaded and nothing is saved. The page reads the public files at the repository's current commit and reports on them; no account is created and no result is stored.",
  },
  checks: {
    title: "What it checks",
    intro:
      "Two levels, kept apart on purpose. An error is a rule the Agent Skills specification states. A warning is a convention Anthropic's authoring guidance recommends and the specification does not require, so a file with warnings and no errors is still a valid file.",
    entries: [
      {
        title: "The file parses at all",
        body: "That the file opens with a --- frontmatter marker, that the block is closed, that the YAML inside it parses, and that no key is declared twice. A file that fails here loads with empty metadata, which is the failure nobody notices.",
      },
      {
        title: "The two required fields",
        body: "That name and description are present and are strings. An unquoted value such as true, no, or 1.0 parses as a boolean or a number rather than as the text that was typed.",
      },
      {
        title: "The limits the specification states",
        body: "The name is 1 to 64 characters of lowercase letters, numbers, and hyphens, with no leading, trailing, or doubled hyphen. The description caps at 1024 characters, compatibility at 500.",
      },
      {
        title: "The name against the directory",
        body: "The specification requires the name field and the folder holding SKILL.md to carry the same string. A mismatch passes where an agent reads the folder from disk and fails on upload or packaging.",
      },
      {
        title: "Fields the format does not define",
        body: "A key outside the six the specification defines is reported as a warning: Claude Code ignores it, and a claude.ai upload or a packaging script refuses the folder with an unexpected-key error.",
      },
      {
        title: "The shape of the rest",
        body: "That metadata is a map of strings, that allowed-tools is the space-separated string the specification defines, and that the body is not empty and stays inside the recommended length.",
      },
    ],
  },
  limits: {
    title: "What it does not check",
    intro:
      "The check reads format. Everything below is outside it, and reading a green report as any of these would be reading it wrong.",
    entries: [
      {
        title: "It is not a review",
        body: "Nothing here judges whether the instructions in the body are correct, useful, or well written. A file can pass every rule and still be a bad skill.",
      },
      {
        title: "It is not a security audit",
        body: "The body is not inspected for what it asks an agent to do, and no script, reference, or asset beside SKILL.md is read or run. Decide for yourself whether to trust a skill before you install it.",
      },
      {
        title: "There is no score",
        body: "The report is a list of specific findings with the rule behind each one. There is no rating, no grade, and no ranking of one repository against another.",
      },
      {
        title: "The repository stays its authors'",
        body: "This page reads public files and quotes what it found. The skills belong to the people who published them, under whatever license they chose.",
      },
    ],
  },
  related: [
    {
      label: "Write a valid SKILL.md in the browser",
      href: skillCreatorPath,
      description:
        "The same rules from the other side: fill in the fields, watch the checks, download the folder.",
    },
    {
      label: "How to write a SKILL.md",
      href: guidePaths.writeSkillMd,
      description:
        "The guide behind these checks: every field, what it does, and the wording that makes a skill trigger.",
    },
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, which agents implement it, and where each one looks on disk.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Free tool",
    title: [{ text: "Paste a repo." }, { text: "Read the format.", accent: true }],
    description:
      "Every SKILL.md in a GitHub repository, checked against the Agent Skills specification.",
    contextLabel: "skillsboard.sh/check",
    titleSize: 74,
    chips: ["errors", "warnings"],
  },
  ogAlt:
    "Skills Board free tool: check every SKILL.md in a GitHub repository against the Agent Skills specification.",
  publishedAt: "2026-09-08",
  modifiedAt: "2026-09-08",
  specCheckedOn: SKILL_SPEC_CHECKED_ON,
}
