import type { OgTemplateContent } from "@/lib/og/template"
import { alternativePaths } from "@/lib/seo/alternatives"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import {
  type GuideInlineLink,
  guidePaths,
  type GuidePath,
} from "@/lib/seo/guides/types"

export {
  claudeSkillsPath,
  type ClaudeSkillsCtaPlacement,
  type ClaudeSkillsPath,
} from "@/lib/seo/claude-skills/types"

export interface ClaudeSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface ClaudeSkillsFaqEntry {
  question: string
  answer: string
}

/**
 * One contextual link out of a section, rendered as a sentence. Same contract
 * as a guide's inline link, so an internal path that does not exist fails the
 * build instead of shipping as a dead link.
 */
export type ClaudeSkillsInlineLink = GuideInlineLink

export interface ClaudeSkillsRelatedLink {
  label: string
  href: string
  description: string
}

export interface ClaudeSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  sourceIds: readonly string[]
}

export interface ClaudeSkillsStepSection {
  title: string
  intro: string
  steps: readonly {
    title: string
    body: string
  }[]
  /** Optional contextual link out of the section. */
  link?: ClaudeSkillsInlineLink
  sourceIds: readonly string[]
}

export interface ClaudeSkillsDefinition {
  path: typeof claudeSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof codexSkillsPath
    | typeof cursorSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first definition, sized for extraction. */
  answer: string
  answerSourceIds: readonly string[]
  format: ClaudeSkillsTableSection & { tree: string }
  loading: ClaudeSkillsTableSection
  surfaces: ClaudeSkillsTableSection
  install: ClaudeSkillsStepSection
  authoring: ClaudeSkillsStepSection & { template: string }
  ecosystem: {
    title: string
    intro: string
    entries: readonly {
      name: string
      href: string
      body: string
    }[]
    notes: readonly string[]
    sourceIds: readonly string[]
  }
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    sourceIds: readonly string[]
  }
  faq: readonly ClaudeSkillsFaqEntry[]
  sources: readonly ClaudeSkillsSource[]
  related: readonly ClaudeSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const claudeSkills: ClaudeSkillsDefinition = {
  path: claudeSkillsPath,
  contentType: "article",
  topics: ["claude skills", "skill format", "compatibility", "skill sharing"],
  relatedGuidePaths: [
    codexSkillsPath,
    cursorSkillsPath,
    guidePaths.manageCrossAgentSkills,
    guidePaths.shareTeamSkills,
    guidePaths.sharedMcpSkillLibrary,
  ],
  eyebrow: "Claude Skills",
  title: "Claude Skills: what they are and how to use them",
  seoTitle: "Claude Skills: What They Are and How to Use Them | Skills Board",
  description:
    "A Claude Skill is a folder with a SKILL.md file that gives Claude reusable instructions and resources. The format, where skills run, how to install and write one, and how teams share them.",
  intro: [
    "Claude Skills are reusable folders of instructions that Claude loads when a request matches what the skill is for. Each folder holds a SKILL.md file and, optionally, the scripts, reference documents, and templates the task needs. Anthropic describes them as reusable, filesystem-based resources that turn a general-purpose agent into a specialist.",
    "The format is not Claude-only. Anthropic developed it and released it as an open standard, the specification lives at agentskills.io, and a client showcase there lists the agent products that read the same SKILL.md file.",
    "This page covers the format, how a skill loads, where skills run today, how to install one, how to write one, where to find skills worth using, and what changes the moment more than one person on a team depends on them.",
  ],
  answer:
    "A Claude Skill is a folder containing a SKILL.md file: YAML frontmatter with a name and a description, followed by Markdown instructions. Claude keeps only the name and description in context, then reads the full file when a request matches the description. Bundled scripts, references, and assets load only when they are needed.",
  answerSourceIds: ["anthropic-overview", "agentskills-spec"],
  format: {
    title: "What is inside a Claude Skill?",
    intro:
      "A skill is a directory whose entry point is a SKILL.md file. The file opens with YAML frontmatter, and the Markdown that follows is what Claude reads once the skill is triggered. Two frontmatter fields are required, name and description. The specification defines four more, all optional.",
    columns: ["Field", "Required", "What it does"],
    rows: [
      {
        label: "name",
        cells: [
          "Yes",
          "Up to 64 characters, lowercase letters, numbers, and hyphens only. It must match the parent directory name, cannot start or end with a hyphen, and cannot contain consecutive hyphens.",
        ],
      },
      {
        label: "description",
        cells: [
          "Yes",
          "Up to 1024 characters. This is the field the agent matches a request against, so it has to say both what the skill does and when to use it, in the words someone would actually type.",
        ],
      },
      {
        label: "license",
        cells: [
          "No",
          "The license that applies to the skill, either a license name or the name of a bundled license file.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "No",
          "Up to 500 characters for environment requirements: the intended product, required system packages, or network access. Most skills do not need it.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "No",
          "A map of string keys to string values for properties the spec does not define, such as an author or a version.",
        ],
      },
      {
        label: "allowed-tools",
        cells: [
          "No",
          "A space-separated list of pre-approved tools. The spec marks this field experimental, and support varies between agent implementations.",
        ],
      },
    ],
    tree: `my-skill/
  SKILL.md        # required: frontmatter and instructions
  scripts/        # optional: code the agent can run
  references/     # optional: documentation loaded on demand
  assets/         # optional: templates and other static files`,
    notes: [
      "Everything beyond SKILL.md is optional. The specification suggests scripts for executable code, references for documentation the agent reads only when it needs it, and assets for templates and other static files. There is no restriction on the Markdown body itself.",
      "Claude Code accepts extra frontmatter fields of its own, such as disable-model-invocation and argument declarations. Outside Claude Code, the claude.ai upload path, the Skills API, and Anthropic's packaging script accept only the six fields in the spec, and an unexpected key fails with a hard error rather than being ignored. Frontmatter that stays inside the spec loads everywhere, including Claude Code.",
    ],
    sourceIds: ["agentskills-spec", "claude-code-skills"],
  },
  loading: {
    title: "How does Claude decide to use a skill?",
    intro:
      "Through progressive disclosure. The agent loads a skill in stages, so a large collection of installed skills costs very little until one of them is actually relevant.",
    columns: ["Stage", "When it loads", "Context cost", "What loads"],
    rows: [
      {
        label: "Metadata",
        cells: [
          "At startup, for every installed skill",
          "About 100 tokens per skill",
          "The name and description from the frontmatter",
        ],
      },
      {
        label: "Instructions",
        cells: [
          "When a request matches the description",
          "Under 5,000 tokens recommended",
          "The Markdown body of SKILL.md",
        ],
      },
      {
        label: "Resources",
        cells: [
          "Only when referenced",
          "Nothing until accessed",
          "Bundled files. Reference files enter context when read, and scripts run through bash so only their output costs tokens",
        ],
      },
    ],
    notes: [
      "This is why the description carries more weight than any other line in the file. It is the only part of most skills that Claude sees before deciding whether to read the rest, so a description that says what the skill does without saying when to use it will sit unused.",
      "The same mechanism explains the length guidance. The specification recommends keeping SKILL.md under 500 lines and moving detail into referenced files. In Claude Code the loaded body then stays in the conversation for the rest of the session, so every line you leave in the main file is a recurring cost rather than a one-time one.",
    ],
    sourceIds: ["anthropic-overview", "agentskills-spec", "claude-code-skills"],
  },
  surfaces: {
    title: "Where do Claude Skills work?",
    intro:
      "Skills run in Claude Code, on claude.ai, and through the Claude API, and the same SKILL.md folder is read by a growing list of other agents. What changes between them is how a skill gets installed, who else can use it, and what the runtime allows.",
    columns: ["Surface", "How a skill gets there", "Who can use it", "Runtime"],
    rows: [
      {
        label: "Claude Code",
        cells: [
          "Filesystem directories: ~/.claude/skills/<name>/SKILL.md for personal skills, .claude/skills/<name>/SKILL.md for a project, a skills directory inside a plugin, or enterprise managed settings.",
          "You, one repository, or everyone the plugin or managed settings reach.",
          "The same network access as any other program on your computer.",
        ],
      },
      {
        label: "claude.ai",
        cells: [
          "Upload the skill as a zip file under Settings, then Features. Available on Pro, Max, Team, and Enterprise plans with code execution enabled.",
          "The individual user. Custom skills are not shared organization-wide and cannot be centrally managed by admins.",
          "Network access varies with user and admin settings.",
        ],
      },
      {
        label: "Claude API",
        cells: [
          "Reference a skill_id in the container parameter alongside the code execution tool and the skills-2025-10-02 beta header, or upload your own through the /v1/skills endpoints.",
          "Workspace-wide. All workspace members can access uploaded skills.",
          "A sandboxed container with no network access and no runtime package installation.",
        ],
      },
      {
        label: "Other agents",
        cells: [
          "Each product documents its own install path for the same SKILL.md folder. The client showcase on agentskills.io links to the instructions for each one.",
          "Depends on the product.",
          "Depends on the product.",
        ],
      },
    ],
    notes: [
      "Custom skills do not sync across surfaces. Anthropic documents this plainly: a skill uploaded to claude.ai is not available through the API, a skill uploaded through the API is not available on claude.ai, and Claude Code skills are filesystem-based and separate from both. Each surface is managed on its own.",
      "Anthropic also ships pre-built skills for PowerPoint, Excel, Word, and PDF. Those are available on claude.ai and the Claude API, and they are not available in Claude Code.",
    ],
    sourceIds: ["anthropic-overview", "claude-code-skills", "agentskills-home"],
  },
  install: {
    title: "How do you install and run a Claude Skill?",
    intro:
      "Installing a skill means putting the folder where the agent looks for it. There is no package manager in the format itself, which is why each surface has its own path.",
    steps: [
      {
        title: "In Claude Code, drop the folder in a skills directory",
        body: "Use ~/.claude/skills/<name>/ to make a skill available in all your projects, or .claude/skills/<name>/ to scope it to one repository and commit it with the code. Claude Code watches those directories and picks up an added or edited SKILL.md during the session, without a restart.",
      },
      {
        title: "Invoke it yourself, or let Claude choose",
        body: "A skill is available as a slash command named after its directory, and Claude can also load it on its own when a request matches the description. Add disable-model-invocation: true when only you should be able to trigger it, which is the sensible default for anything that deploys, commits, or sends a message.",
      },
      {
        title: "On claude.ai, upload a zip",
        body: "Custom skills are uploaded under Settings, then Features, on Pro, Max, Team, and Enterprise plans with code execution enabled. Each teammate does this for their own account, since claude.ai custom skills are per user.",
      },
      {
        title: "Through the API, pass a skill_id",
        body: "Skills run inside the code execution tool's container. Reference the skill by id in the container parameter and send the skills-2025-10-02 beta header. Add the files-api-2025-04-14 header when the container needs uploaded input files or produces files you want to download.",
      },
      {
        title: "From a catalog, use that catalog's installer",
        body: "npx skills add owner/repo installs from the skills.sh directory. /plugin marketplace add anthropics/skills registers Anthropic's repository as a plugin marketplace in Claude Code, and the document and example skill plugins install from there.",
      },
    ],
    link: {
      lead: "For the Claude Code half of this in full, including the precedence rules between scopes, the verification commands, and what to do when a skill does not appear, see",
      label: "how to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "anthropic-overview",
      "skills-sh-docs",
      "anthropic-skills-repo",
    ],
  },
  authoring: {
    title: "How do you write your own Claude Skill?",
    intro:
      "Write the skill the same way you would brief a new teammate: say when the procedure applies, then give the steps, then link to the detail rather than pasting it.",
    steps: [
      {
        title: "Pick something you already repeat",
        body: "Anthropic's own trigger for Claude Code is direct: create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact.",
      },
      {
        title: "Create the directory and the file",
        body: "The directory name becomes the command you type in Claude Code, and it has to match the name in the frontmatter. SKILL.md is the entry point and the only required file.",
      },
      {
        title: "Write the description for matching, not for reading",
        body: "State what the skill does and when to use it, and include the words a person would type when they need it. A description that only names the skill gives the agent nothing to match against.",
      },
      {
        title: "Keep the body short",
        body: "The specification recommends staying under 500 lines and roughly 5,000 tokens, and moving longer material into files under references that load only when the task calls for them.",
      },
      {
        title: "Move deterministic work into scripts",
        body: "A script's code never enters the context window. Only its output does, which makes a bundled script cheaper and more reliable than asking the agent to regenerate the same logic each time.",
      },
      {
        title: "Validate before you share it",
        body: "The skills-ref reference library checks that the frontmatter is valid and that the naming rules hold: skills-ref validate ./my-skill. This catches the fields that fail on upload or packaging rather than at authoring time.",
      },
      {
        title: "Decide the distribution scope",
        body: "Commit .claude/skills/ for a project, ship a skills directory inside a plugin for a wider audience, or deploy organization-wide through managed settings. Each scope answers a different question about who should get the skill by default.",
      },
    ],
    template: `---
name: release-notes
description: Draft release notes from merged pull requests. Use when preparing a release, writing a changelog, or summarizing what shipped.
---

# Release notes

## Steps
1. List the pull requests merged since the last tag.
2. Group them into Added, Changed, and Fixed.
3. Write one line per change, in plain language, from the reader's point of view.
4. Link every entry to its pull request.

## Output
A Markdown section ready to paste into the release description.`,
    sourceIds: ["claude-code-skills", "agentskills-spec"],
  },
  ecosystem: {
    title: "Where do you find Claude Skills worth using?",
    intro:
      "Start with sources that publish the files, so you can read a skill before you install it. These four cover most of what the ecosystem currently offers.",
    entries: [
      {
        name: "anthropics/skills",
        href: "https://github.com/anthropics/skills",
        body: "Anthropic's public repository for Agent Skills. It holds example skills across creative, technical, and enterprise tasks, the specification, and a skill template. Many of the skills are Apache 2.0. The document skills that power file creation in Claude are source-available rather than open source, and Anthropic publishes them as a reference for more complex skills. Register the repository as a Claude Code plugin marketplace with /plugin marketplace add anthropics/skills.",
      },
      {
        name: "obra/superpowers",
        href: "https://github.com/obra/superpowers",
        body: "An MIT-licensed community project that packages a full software development methodology as composable skills, with a spec-first, plan-then-build workflow. It documents install paths for Claude Code and several other agents, and it is installable from the official Claude plugin marketplace.",
      },
      {
        name: "skills.sh",
        href: "https://www.skills.sh",
        body: "Vercel's public directory of agent skills. It has a leaderboard ranked from anonymous telemetry collected by its CLI, topics, an official set, routine security audits, and packs that bundle several skills behind one install command. Skills install with npx skills add owner/repo, and the CLI is open source.",
      },
      {
        name: "agentskills.io",
        href: "https://agentskills.io",
        body: "The standard's own site: the specification, a quickstart, and a client showcase that links to the skill instructions for each agent product that supports the format. Useful when you need to check whether a skill will load in something other than Claude.",
      },
    ],
    notes: [
      "Read before you install. Anthropic's guidance is to use skills only from sources you trust, because a skill gives an agent new instructions and executable code, and a malicious one can direct the agent to call tools in ways the stated purpose does not suggest. If a skill comes from somewhere unfamiliar, audit every file in it, including scripts and anything it fetches from an external URL, and treat the decision the way you would treat installing software.",
    ],
    sourceIds: [
      "anthropic-skills-repo",
      "superpowers",
      "skills-sh-docs",
      "agentskills-home",
      "anthropic-overview",
    ],
  },
  team: {
    title: "How does a team share the skills it recommends?",
    intro:
      "Nothing in the format does it for you. The SKILL.md folder is portable, but distribution is per surface, and the recommendation itself usually is not stored anywhere at all.",
    body: [
      "Look at what the surfaces actually offer a team. On claude.ai, custom skills belong to the individual user, are not shared organization-wide, and cannot be centrally managed by admins. Through the API, uploaded skills are workspace-wide. In Claude Code, a skill lives in a personal folder, in one repository, or in a plugin. None of those places holds the part teammates keep asking about: which skill to use for this, and why this one.",
      "That part ends up in a chat thread, a bookmark, or one person's memory. Skills Board is a shared library for exactly that layer: the smaller set of skills your team recommends, in one searchable place, with the original source visible on every entry.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md before using it.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits.",
      },
      {
        label: "Download a ZIP",
        body: "The latest skill files available from the source at download time, for anyone who would rather place the folder themselves.",
      },
      {
        label: "Connect an agent over MCP",
        body: "An authenticated MCP endpoint lets a compatible agent search the same team library, retrieve install commands, and, with the granted scopes, save skills and organize collections. Sign-in happens in the browser, with no API key to copy.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "It does not install or run skills inside your agent, and it does not claim a skill works in every agent your team uses.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    sourceIds: ["anthropic-overview", "claude-code-skills"],
  },
  faq: [
    {
      question: "What is a Claude Skill?",
      answer:
        "A folder containing a SKILL.md file with YAML frontmatter and Markdown instructions. The frontmatter needs a name and a description; the description is what Claude matches a request against. The folder can also bundle scripts, reference documents, and assets that load only when the task needs them.",
    },
    {
      question: "What is the difference between a skill and a prompt?",
      answer:
        "A prompt is a conversation-level instruction for one task. A skill is a reusable folder that loads on demand, so the same guidance does not have to be repeated across conversations. Anthropic draws that distinction directly in the Agent Skills overview.",
    },
    {
      question: "Do Claude Skills work outside Claude?",
      answer:
        "Yes. Agent Skills is an open standard published at agentskills.io, and its client showcase lists agent products that read the same SKILL.md file. Frontmatter fields beyond the six in the spec, and Claude Code-only body features such as dynamic context injection, do not carry over.",
    },
    {
      question:
        "Do custom skills sync between Claude Code, claude.ai, and the API?",
      answer:
        "No. Anthropic documents that custom skills do not sync across surfaces. A skill uploaded to claude.ai is not available through the API, an API skill is not available on claude.ai, and Claude Code skills are filesystem-based and separate from both. You manage each surface yourself.",
    },
    {
      question: "How many skills can you install before context suffers?",
      answer:
        "Only the name and description of each installed skill load at startup, about 100 tokens per skill, so a large collection costs little until something triggers it. In Claude Code the body of a triggered skill stays in the conversation for the rest of the session, so the number that matters is how many you use at once, not how many you have.",
    },
    {
      question: "Are Claude Skills safe to install?",
      answer:
        "Treat a skill like software you are about to run. Anthropic's guidance is to use skills only from sources you trust, and to audit every bundled file before using one from an unknown source, because a skill can direct an agent to execute code and call tools. Skills that fetch content from external URLs deserve extra scrutiny.",
    },
    {
      question: "What is the difference between a skill and an MCP server?",
      answer:
        "A skill is a folder of instructions and resources the agent reads. MCP is a protocol for connecting an agent to external tools and data through a server. They answer different questions and are often used together: Skills Board publishes a team library over an authenticated MCP endpoint, while the skills themselves stay in SKILL.md folders at their original sources.",
    },
    {
      question: "Where should a team keep the skills it recommends?",
      answer:
        "Wherever teammates will actually look. If every skill belongs to one repository the whole team works in, commit them to .claude/skills/ and stop there. If the recommendations come from other people's repositories and teammates run different agents, a shared library that keeps the source visible on every entry is easier to keep current. Skills Board is one option, and it is free and open source.",
    },
  ],
  sources: [
    {
      id: "anthropic-overview",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "Progressive disclosure stages and token costs, required frontmatter fields, the surfaces skills run on, sharing scope, runtime constraints, the pre-built document skills, and the security guidance.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where Claude Code loads skills from, slash-command invocation, disable-model-invocation, live change detection, which frontmatter fields survive outside Claude Code, and the distribution scopes.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their constraints, the optional scripts, references, and assets directories, the progressive disclosure budgets, and skills-ref validation.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: overview and client showcase",
      href: "https://agentskills.io",
      note: "The format as an open standard originally developed by Anthropic, and the list of agent products that support it.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "Anthropic's public skills repository: example skills, the spec, a template, the licensing note for the document skills, and the plugin marketplace command.",
    },
    {
      id: "superpowers",
      label: "obra/superpowers on GitHub",
      href: "https://github.com/obra/superpowers",
      note: "An MIT-licensed skills framework and development methodology, with documented install paths for Claude Code and other agents.",
    },
    {
      id: "skills-sh-docs",
      label: "skills.sh documentation",
      href: "https://www.skills.sh/docs",
      note: "The npx skills add command, the telemetry-based leaderboard, routine security audits, packs, and the open-source CLI behind them.",
    },
  ],
  related: [
    {
      label: "Claude skills vs subagents: when to use each",
      href: comparePaths.skillsVsSubagents,
      description:
        "The other primitive in the same directory tree, and the dimensions that decide which one a job belongs to.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The same standard read by OpenAI's agent, the directories it scans, and what a skill keeps when it moves.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "Every directory Cursor scans, including the Claude ones, and the two frontmatter fields it adds.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical SKILL.md, and a tested install path for each agent your teammates run.",
    },
    {
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      description:
        "Turning a skill that worked once into a recommendation the next teammate can find.",
    },
    {
      label: "A shared MCP skill library for teams",
      href: guidePaths.sharedMcpSkillLibrary,
      description:
        "What a connected agent can and cannot do with a shared library over MCP.",
    },
    {
      label: "Skills Board vs skills.sh",
      href: alternativePaths.skillsSh,
      description:
        "A public directory next to a team library, and which question each one answers.",
    },
  ],
  og: {
    eyebrow: "Claude Skills",
    title: [
      { text: "One SKILL.md file," },
      { text: "loaded when it matters.", accent: true },
    ],
    description:
      "What Claude Skills are, where they run, how to write one, and how a team shares the ones it recommends.",
    contextLabel: "skillsboard.sh/claude-skills",
    chips: ["SKILL.md", "Claude Code", "claude.ai"],
  },
  ogAlt:
    "Explainer on Claude Skills: the SKILL.md format, where skills run, and how teams share them.",
  publishedAt: "2026-08-12",
  modifiedAt: "2026-08-16",
}
