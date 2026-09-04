import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"

export {
  agentsMdVsSkillMdPath,
  type AgentsMdVsSkillMdPath,
} from "@/lib/seo/agents-md-vs-skill-md/types"

export interface AgentsMdSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface AgentsMdFaqEntry {
  question: string
  answer: string
}

export interface AgentsMdRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface AgentsMdInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface AgentsMdTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  /** Optional contextual link out of the section. */
  link?: AgentsMdInlineLink
  sourceIds: readonly string[]
}

export interface AgentsMdVsSkillMdDefinition {
  path: typeof agentsMdVsSkillMdPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof claudeSkillsPath
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
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  comparison: AgentsMdTableSection & { link: AgentsMdInlineLink }
  support: AgentsMdTableSection
  examples: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
      /** Optional directory listing, rendered above the file itself. */
      tree?: string
      template: string
    }[]
    notes: readonly string[]
    sourceIds: readonly string[]
  }
  together: {
    title: string
    intro: string
    body: readonly string[]
    entries: readonly {
      title: string
      body: string
    }[]
    link: AgentsMdInlineLink
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
    link: AgentsMdInlineLink
    sourceIds: readonly string[]
  }
  openQuestions: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  faq: readonly AgentsMdFaqEntry[]
  sources: readonly AgentsMdSource[]
  related: readonly AgentsMdRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const agentsMdVsSkillMd: AgentsMdVsSkillMdDefinition = {
  path: agentsMdVsSkillMdPath,
  contentType: "article",
  topics: [
    "agents.md",
    "SKILL.md",
    "project instructions",
    "agent file formats",
  ],
  relatedGuidePaths: [
    claudeSkillsPath,
    codexSkillsPath,
    cursorSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "AGENTS.md vs SKILL.md",
  title: "AGENTS.md vs SKILL.md: two formats, two different jobs",
  seoTitle:
    "AGENTS.md vs SKILL.md: Two Formats, Two Different Jobs | Skills Board",
  description:
    "AGENTS.md describes your repository to a coding agent. SKILL.md packages one reusable capability. What each format is, which agents read which, minimal examples of both, and how they work together.",
  intro: [
    "Both are Markdown files and both tell a coding agent what to do. That is where the similarity ends. AGENTS.md describes one project and belongs in the repository it describes. A SKILL.md folder packages one capability, and it can sit in that repository or in a personal or machine-wide skills directory the agent scans. Treating them as interchangeable produces the two failure modes teams actually hit: a repository file so long that half of it is truncated or ignored, and a skill nobody can reuse because it assumes your directory layout.",
    "They also came from different places. AGENTS.md is an open format its own site calls a README for agents, reported there as used by over 60k open-source projects and now stewarded by the Agentic AI Foundation under the Linux Foundation. Agent Skills, the standard behind SKILL.md, was originally developed by Anthropic and released as an open standard with a published specification.",
    "This page covers what each file is for, which of Claude Code, Codex, and Cursor reads which, a minimal example of both, how they fit together in one repository, and the questions the documentation does not answer.",
  ],
  answer:
    "AGENTS.md is project context: one Markdown file with no required fields, read before work starts by the agents that support it and applied to everything they do in that part of the tree. Codex and Cursor read it directly, while Claude Code reads CLAUDE.md instead. SKILL.md is a packaged capability: a folder with YAML frontmatter and instructions that loads only when the agent judges it relevant or you invoke it. Most repositories want both, and they do not overlap.",
  answerNotes: [
    "The quickest way to keep them apart is to ask who the file is about. AGENTS.md is about this repository: how to install it, how to run the tests, which conventions apply, what a pull request has to look like. Its FAQ is explicit that there are no required fields and that it is standard Markdown, because the agent simply parses the text you provide.",
    "SKILL.md is about a task, not a place. The Agent Skills specification defines a skill as a directory containing at minimum a SKILL.md file, YAML frontmatter followed by Markdown, with optional scripts, references, and assets beside it. Two frontmatter fields are required: name and description.",
    "The loading model is the difference that matters. Claude Code documents that its project memory files are loaded into context at the start of every session and loaded in full regardless of length, while skill descriptions sit in context and the body loads only when the skill is used. Codex says the same thing from the other side: it reads AGENTS.md before doing any work, and starts from each skill's name and description before loading the one it picks.",
  ],
  answerSourceIds: ["agents-md", "agentskills-spec", "claude-memory", "codex-agents-md"],
  comparison: {
    title: "The two formats, side by side",
    intro:
      "Every row below is a consequence of one design choice: AGENTS.md is always read, and a skill is read when it is needed. Everything else, including the size guidance and the packaging, follows from that.",
    columns: ["Dimension", "AGENTS.md", "SKILL.md"],
    rows: [
      {
        label: "What it describes",
        cells: [
          "This repository. Setup, tests, layout, conventions, review expectations, security gotchas: what you would tell a capable new contributor on day one.",
          "One capability. A procedure the agent can carry out when a request matches it, wherever that request comes from.",
        ],
      },
      {
        label: "Format",
        cells: [
          "Plain Markdown. No frontmatter, no schema, no required sections. It is identified by its filename and its position in the tree.",
          "A directory with a SKILL.md inside it: YAML frontmatter, then Markdown. name and description are required, and name has to match the parent directory.",
        ],
      },
      {
        label: "When it loads",
        cells: [
          "Before work starts, for every task. Codex states that it reads AGENTS.md files before doing any work.",
          "When the agent judges the description relevant to the request, or when you invoke the skill by name.",
        ],
      },
      {
        label: "Scope",
        cells: [
          "The directory subtree it sits in. Nested files are normal, and the closest one to the edited file wins.",
          "Whatever task matches the description. A skill is not tied to one repository unless you write it that way.",
        ],
      },
      {
        label: "Size discipline",
        cells: [
          "Codex stops adding files once the combined chain reaches project_doc_max_bytes, 32 KiB by default. Claude Code publishes a recommendation instead: target under 200 lines per file.",
          "The specification recommends keeping SKILL.md under 500 lines and the loaded instructions under about 5,000 tokens, with the detail in files that load only when asked for.",
        ],
      },
      {
        label: "Bundled files",
        cells: [
          "None. It is one Markdown file, and there is nowhere to put a script.",
          "Optional scripts, references, and assets directories the agent runs or reads when the instructions point at them.",
        ],
      },
      {
        label: "Distribution",
        cells: [
          "Committed to the repository it describes. It arrives with a clone, and there are no product-specific fields to strip out.",
          "Committed, symlinked, bundled in a plugin, or copied from a library, and it still has to land in a directory the agent scans. Fields a product added on top of the specification do not travel.",
        ],
      },
    ],
    notes: [
      "The tempting shortcut is to put everything in AGENTS.md and skip skills. It works until the file gets long. Claude Code recommends moving a section that has grown into a procedure rather than a fact out into a skill, because a skill body loads only when it is used, so long reference material costs almost nothing until you need it. Codex applies a hard limit instead: once the combined instruction chain reaches project_doc_max_bytes it stops adding files, and the documented fix is to raise the setting or split the guidance across nested directories.",
      "The opposite shortcut fails too. A skill whose instructions are really repository trivia, the package manager and the test command, only fires when the agent happens to think it is relevant. Facts that are true for every task belong in the file that is read for every task.",
      "OpenAI's own repository shows the split in practice. The AGENTS.md at the root of openai/codex ran to 322 lines of Rust conventions, review rules, and testing guidance when we checked it, and one of those lines points at a skill for the details of integration testing those configurations. The repository file says what is true here. The skill holds the procedure.",
    ],
    link: {
      lead: "For the format side of skills on its own, including the full frontmatter table and the surfaces a skill runs on, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "agents-md",
      "agentskills-spec",
      "claude-memory",
      "claude-skills-docs",
      "codex-agents-md",
      "codex-repo-agents-md",
    ],
  },
  support: {
    title: "Which agent reads which file",
    intro:
      "Two of the three products in most teams read both formats directly. The third reads only one of them, and that is the detail that catches people out.",
    columns: ["Agent", "AGENTS.md", "SKILL.md"],
    rows: [
      {
        label: "Claude Code",
        cells: [
          "No. The memory documentation states that Claude Code reads CLAUDE.md, not AGENTS.md, and recommends creating a CLAUDE.md that imports it so both tools read the same instructions.",
          "Yes. Personal skills in ~/.claude/skills, project skills in .claude/skills, and plugin skills under the plugin's own skills directory.",
        ],
      },
      {
        label: "Codex",
        cells: [
          "Yes, before doing any work. It builds a chain from the Codex home directory, then walks the project root down to your working directory taking at most one file per directory.",
          "Yes. It scans .agents/skills in every directory from your working directory up to the repository root, plus $HOME/.agents/skills and /etc/codex/skills.",
        ],
      },
      {
        label: "Cursor",
        cells: [
          "Yes, in the project root and in subdirectories. Cursor presents it as a plain Markdown alternative to .cursor/rules for straightforward cases.",
          "Yes. .agents/skills and .cursor/skills in a project, ~/.agents/skills and ~/.cursor/skills for you, plus the Claude and Codex directories for compatibility.",
        ],
      },
    ],
    notes: [
      "Claude Code is the exception, and it is the most common wrong assumption in this cluster. Its documentation gives two ways to close the gap. The recommended one is an import: put @AGENTS.md at the top of CLAUDE.md and the file is expanded into context at launch. The other is a symlink created with ln -s AGENTS.md CLAUDE.md, with the documented caveat that on Windows a symlink needs Administrator privileges or Developer Mode. There is also a one-time copy through /import, and /init reads AGENTS.md when CLAUDE_CODE_NEW_INIT=1 is set, but neither of those keeps the two files in step afterwards.",
      "Cursor reads CLAUDE.md as well, the same way it reads AGENTS.md, and documents that it is always applied to every conversation regardless of any alwaysApply frontmatter setting, explicitly for compatibility with projects that also use Claude Code. So a repository with an AGENTS.md and a CLAUDE.md that imports it is read correctly by all three products, from one copy of the text.",
      "Precedence inside AGENTS.md is consistent wherever it is documented: the closest file wins. The format's FAQ says the closest AGENTS.md to the edited file wins and that explicit user chat prompts override everything. Codex concatenates from the root down so nearer files appear later in the prompt, and Cursor gives more specific nested instructions precedence. What no product documents is how AGENTS.md ranks against Cursor's own .cursor/rules files.",
    ],
    sourceIds: [
      "agents-md",
      "claude-memory",
      "claude-skills-docs",
      "codex-agents-md",
      "codex-skills-docs",
      "cursor-rules",
      "cursor-rules-help",
      "cursor-skills",
    ],
    link: {
      lead: "Those SKILL.md directories are per-product decisions rather than part of the format. For what the standard itself specifies, and what actually travels when a skill moves between these agents, see",
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      trail: ".",
    },
  },
  examples: {
    title: "What each file actually looks like",
    intro:
      "Both examples below are deliberately small. The point is the shape rather than the content: one file that describes a place, one folder that packages a procedure.",
    entries: [
      {
        title: "AGENTS.md at the repository root",
        body: "No frontmatter and no schema. The format's own how-to suggests a project overview, build and test commands, code style guidelines, testing instructions, and security considerations, and its FAQ confirms that an agent will attempt to run the programmatic checks you list and fix failures before finishing. Write it for a capable new contributor, because that is close enough to the real audience.",
        template: `# AGENTS.md

## Project overview
Next.js app, TypeScript strict mode, pnpm workspaces.
Marketing pages live in app/, shared UI in components/.

## Setup commands
- Install deps: \`pnpm install\`
- Start dev server: \`pnpm dev\`
- Run tests: \`pnpm test\`

## Code style
- TypeScript strict mode, no implicit any
- Server components by default; add "use client" only when a hook needs it
- Page copy lives in the content module, not inline in JSX

## Testing instructions
- Run \`pnpm test\` before every commit and fix failures before finishing.
- Add or update a test for the code you change.

## PR instructions
- Title format: [area] short imperative summary
- Run \`pnpm lint\` and \`pnpm test\` before committing.
`,
      },
      {
        title: "SKILL.md for one reusable capability",
        body: "Frontmatter first, then instructions, with the supporting files beside them. The description is the field that decides whether the skill ever fires, because it is the text the agent matches a request against. The specification caps name at 64 characters and requires it to match the parent directory name, and caps description at 1024 characters.",
        tree: `release-notes/
├── SKILL.md
├── references/
│   └── tone.md
└── scripts/
    └── collect-merged-prs.sh
`,
        template: `---
name: release-notes
description: Draft release notes from merged pull requests. Use when preparing a release, writing a changelog entry, or summarizing what shipped since the last tag.
---

# Release notes

## When to use this
The reader is preparing a release, or is asking what changed since the last tag.

## Steps
1. Run \`scripts/collect-merged-prs.sh v1.4.0\` to list merged pull requests.
2. Group them into Added, Changed, Fixed, and Removed. Drop pure chores.
3. Write one line per entry in the past tense, user visible outcome first.
4. Read \`references/tone.md\` and match it before returning the draft.

## Stop and ask
If a pull request has no user visible effect and no linked issue, ask before
including it.
`,
      },
    ],
    notes: [
      "The description carries more weight than anything in the body, because it is what the agent sees before it decides. Claude Code documents that descriptions are loaded into context so the model knows what is available, truncated at 1,536 characters in the listing. Codex publishes a budget for the same list: at most 2% of the model's context window, or 8,000 characters when that is unknown. Write it in the words someone would actually type.",
      "Nothing about the AGENTS.md example is enforced. Those headings are convention, not schema. One convention is worth knowing about: for Codex code review on GitHub, OpenAI documents adding a Code Review Rules section to the AGENTS.md closest to the code those rules govern, with repository-wide checks at the root and service-specific ones in a nested file.",
      "The two files can point at each other, and in a working repository they usually should. AGENTS.md is read first and read every time, which makes it the cheapest place to say that a skill exists and when to reach for it.",
    ],
    sourceIds: [
      "agents-md",
      "agentskills-spec",
      "claude-skills-docs",
      "codex-agents-md",
      "codex-skills-docs",
    ],
  },
  together: {
    title: "How they work together in one repository",
    intro:
      "Neither file replaces the other, and the division of labor is not a matter of taste. It follows from when each one is read.",
    body: [
      "Put facts in AGENTS.md. Anything true about the repository whatever the task is: the package manager, the test command, the layout, the review expectations, the things that will bite an agent on its first edit. That content earns a place in every session because it is relevant in every session.",
      "Put procedures in SKILL.md. Claude Code states the trigger plainly: create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of your memory file has grown into a procedure rather than a fact. If instructions only matter when someone asks for a particular kind of work, they should load only when someone asks.",
      "Keep one copy of the shared text. If your team runs Claude Code alongside Codex or Cursor, write AGENTS.md once and let Claude Code reach it through a CLAUDE.md that imports it. Duplicating the content is the version that goes stale, and neither product will tell you when it has.",
    ],
    entries: [
      {
        title: "The instruction is about this repository",
        body: "AGENTS.md. Build commands, layout, conventions, review rules, security gotchas. If a new contributor would need it on day one, it belongs in the file that is always read.",
      },
      {
        title: "The instruction is a procedure you keep repeating",
        body: "SKILL.md. Multi-step, triggered by a kind of request rather than by a place, and usually useful in more than one repository. Give it a description written in the words people use when they ask for it.",
      },
      {
        title: "The instruction applies to one part of the tree",
        body: "A nested AGENTS.md inside that package. Every product that reads the format resolves the closest file, so no frontmatter is needed to scope it. Claude Code and Cursor also offer path-scoped rule files, which are product-specific rather than part of the open format.",
      },
      {
        title: "The instruction needs code to run",
        body: "SKILL.md. The specification gives a skill a scripts directory for executable code and a references directory for documentation that loads only when the instructions ask for it. AGENTS.md has nowhere to put either.",
      },
      {
        title: "Teammates run different agents",
        body: "Both, written once. AGENTS.md is read directly by Codex and Cursor and reachable by Claude Code through an import or a symlink. A skill folder is read by any client that implements Agent Skills, though only the fields the specification defines travel between them.",
      },
    ],
    link: {
      lead: "The operational version of this, with one canonical source and a tested install path per agent, is in",
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: ["agents-md", "agentskills-spec", "claude-memory", "claude-skills-docs"],
  },
  team: {
    title: "What a team has to decide once more than one person depends on this",
    intro:
      "One repository with both files is easy. The problem starts at the second repository, and again at the second agent.",
    body: [
      "AGENTS.md scales without help. It is committed to the repository it describes, it arrives with a clone, and the closest file wins, so a monorepo can carry one per package with no coordination at all. There is no distribution problem to solve, which is a large part of why the format spread.",
      "Skills do have one. A skill useful in one repository is usually useful in several, and the folder has to land in a directory each teammate's agent scans. The products answer that with packaging: plugins in Claude Code and Cursor, plugins and marketplace files for Codex. If everyone works in the same repository, committing the folder is the whole answer, and no shared library improves on it.",
      "What none of them answer is which skill your team settled on and why. That decision usually lives in a chat thread or one person's memory. Skills Board is a web app for that layer: the smaller set of skills a team settled on, in one searchable place, with the original source visible on every entry and no assumption about which agent a teammate runs.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md before placing it anywhere.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits. It is one option among several, not the only path.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather drop the folder into .claude/skills, .agents/skills, or wherever their agent scans.",
      },
      {
        label: "Connect over MCP",
        body: "An MCP-compatible agent can search the same team library and retrieve install commands, and with the write scope save skills and organize collections.",
      },
    ],
    limits: [
      "A saved skill is a team's own choice, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "It holds skills. AGENTS.md belongs in the repository it describes, and nothing here changes that.",
      "The MCP connection cannot install or run a skill inside an agent, and it cannot edit or delete saved team skills.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "For the ownership and review side of the same problem, one agreed skill per job and a named owner, see",
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["claude-skills-docs", "codex-skills-docs", "cursor-skills"],
  },
  openQuestions: {
    title: "Limits and open questions",
    intro:
      "Some of what people assume is documented is not. These are the gaps we found reading the current first-party documentation, written out rather than guessed at.",
    entries: [
      {
        title: "Claude Code still does not read AGENTS.md",
        body: "The documentation is unambiguous and current: Claude Code reads CLAUDE.md, not AGENTS.md. The import and the symlink are documented workarounds, not a setting that turns support on. If you see a claim that a flag exists, check the memory documentation before believing it.",
      },
      {
        title: "AGENTS.md against Cursor's project rules is not documented",
        body: "Cursor publishes a precedence order for team, project, and user rules, and separately describes AGENTS.md as an alternative to .cursor/rules for straightforward cases. What happens when both exist and disagree is not stated anywhere, so treat that combination as untested rather than resolved.",
      },
      {
        title: "Only one of the size caps is a real cap",
        body: "Codex stops adding instruction files once the chain reaches project_doc_max_bytes, 32 KiB by default, and tells you to raise it or split the guidance. Claude Code publishes a recommendation instead, target under 200 lines, and states that memory files load in full regardless of length. The agents.md format itself publishes no limit at all.",
      },
      {
        title: "Skill frontmatter is not uniform across products",
        body: "The specification defines name and description as required and license, compatibility, metadata, and allowed-tools as optional, the last marked experimental with varying support. Cursor documents paths and disable-model-invocation, which the specification does not define, and Claude Code documents a longer list still while noting that outside Claude Code only six fields are accepted. A skill that leans on a product's extra field loses that behavior elsewhere.",
      },
    ],
    sourceIds: [
      "agents-md",
      "agentskills-spec",
      "claude-memory",
      "claude-skills-docs",
      "codex-agents-md",
      "codex-config",
      "cursor-rules",
      "cursor-skills",
    ],
  },
  faq: [
    {
      question: "What is the difference between AGENTS.md and SKILL.md?",
      answer:
        "AGENTS.md describes a repository to a coding agent: setup, tests, conventions, review expectations. It is plain Markdown with no required fields and it is read before work starts. SKILL.md packages one reusable capability in a folder, requires name and description in its frontmatter, and loads only when the agent judges it relevant or you invoke it.",
    },
    {
      question: "Does Claude Code read AGENTS.md?",
      answer:
        "No. Claude Code's memory documentation states that it reads CLAUDE.md, not AGENTS.md. The documented fix is a CLAUDE.md that imports the other file with an @AGENTS.md line, or a symlink created with ln -s AGENTS.md CLAUDE.md. On Windows a symlink needs Administrator privileges or Developer Mode, so the import is the safer choice.",
    },
    {
      question: "Does Codex read AGENTS.md?",
      answer:
        "Yes. Codex reads AGENTS.md files before doing any work. It starts in the Codex home directory, then walks from the project root down to your working directory taking at most one file per directory, and concatenates them from the root down, so the file closest to your work appears last and has the final word.",
    },
    {
      question: "Does Cursor read AGENTS.md?",
      answer:
        "Yes, in the project root and in subdirectories. Cursor describes it as a plain Markdown alternative to .cursor/rules for straightforward cases, and documents that nested instructions combine with parent directories with the more specific ones taking precedence. Cursor also reads CLAUDE.md the same way, applying it to every conversation.",
    },
    {
      question: "Do I need both AGENTS.md and skills?",
      answer:
        "Usually yes, because they do not overlap. Facts about the repository belong in AGENTS.md, since they matter in every session. Repeated multi-step procedures belong in skills, since they matter only sometimes. Claude Code's own guidance is to move a section that has grown into a procedure rather than a fact out into a skill.",
    },
    {
      question: "Is AGENTS.md a standard?",
      answer:
        "It is an open format rather than a schema. Its FAQ says there are no required fields and that it is standard Markdown with any headings you like, because the agent simply parses the text you provide. It is stewarded by the Agentic AI Foundation under the Linux Foundation, and its site reports use by over 60k open-source projects.",
    },
    {
      question: "Can AGENTS.md replace skills?",
      answer:
        "Not without cost. AGENTS.md is read for every task, so a procedure you rarely need still consumes context, and Codex stops adding instruction files once the combined chain reaches project_doc_max_bytes, 32 KiB by default. A skill body loads only when it is used, which is why long reference material inside a skill costs almost nothing until you need it.",
    },
  ],
  sources: [
    {
      id: "agents-md",
      label: "AGENTS.md: the open format",
      href: "https://agents.md",
      note: "The README for agents framing, the suggested sections, the nested-file rule, the FAQ answers on required fields and conflicting instructions, the reported 60k projects, and the Agentic AI Foundation stewardship.",
    },
    {
      id: "agents-md-repo",
      label: "agentsmd/agents.md on GitHub",
      href: "https://github.com/agentsmd/agents.md",
      note: "The repository behind the format, its description of AGENTS.md as a simple, open format, and the absence of any schema or field list.",
    },
    {
      id: "codex-agents-md",
      label: "OpenAI Codex: AGENTS.md",
      href: "https://learn.chatgpt.com/docs/agent-configuration/agents-md",
      note: "That Codex reads AGENTS.md before doing any work, the global and project discovery order, the merge order from the root down, the project_doc_max_bytes cap, and the Code Review Rules convention.",
    },
    {
      id: "codex-config",
      label: "OpenAI Codex: config reference",
      href: "https://learn.chatgpt.com/docs/config-file/config-reference",
      note: "The project_doc_max_bytes and project_doc_fallback_filenames settings and what each one controls.",
    },
    {
      id: "codex-skills-docs",
      label: "OpenAI: build skills for ChatGPT and Codex",
      href: "https://learn.chatgpt.com/docs/build-skills",
      note: "That Codex skills build on the open agent skills standard, the required name and description, the directories Codex scans, and the published budget for the initial skill list.",
    },
    {
      id: "codex-repo-agents-md",
      label: "openai/codex: AGENTS.md",
      href: "https://github.com/openai/codex/blob/main/AGENTS.md",
      note: "A production AGENTS.md with no frontmatter, 322 lines when checked, that points the agent at a skill for one integration testing procedure.",
    },
    {
      id: "claude-memory",
      label: "Claude Code: memory",
      href: "https://code.claude.com/docs/en/memory",
      note: "That Claude Code reads CLAUDE.md and not AGENTS.md, the import and symlink workarounds, the /init and /import one-time copies, the load-in-full behavior, and the 200 line recommendation.",
    },
    {
      id: "claude-skills-docs",
      label: "Claude Code: skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where Claude Code loads skills from, how a skill is chosen, that descriptions sit in context while bodies load on use, the 1,536 character listing truncation, and when to move memory content into a skill.",
    },
    {
      id: "cursor-rules",
      label: "Cursor: Rules",
      href: "https://cursor.com/docs/rules",
      note: "That Cursor supports AGENTS.md in the project root and subdirectories, how nested files combine, and the published precedence order for team, project, and user rules.",
    },
    {
      id: "cursor-rules-help",
      label: "Cursor: rules help",
      href: "https://cursor.com/help/customization/rules",
      note: "That Cursor reads CLAUDE.md the same way it reads AGENTS.md and always applies it, and the guidance to use project rules when you need conditional application.",
    },
    {
      id: "cursor-skills",
      label: "Cursor: Agent Skills",
      href: "https://cursor.com/docs/skills",
      note: "The skill directories Cursor scans including the Claude and Codex compatibility paths, and the frontmatter fields it documents.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The skill directory layout, the required and optional frontmatter fields with their constraints, and the progressive disclosure and file size recommendations.",
    },
  ],
  related: [
    {
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      description:
        "What a SKILL.md is outside any one product, which agents read it, and what travels between them.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The SKILL.md format from the Claude side: the frontmatter, the surfaces, and how a skill loads.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The directories OpenAI's agent scans, and how skills sit next to the AGENTS.md chain it builds.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "Every directory Cursor scans, including the Claude and Codex ones, and the fields it adds.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical SKILL.md, and a tested install path for each agent your teammates run.",
    },
    {
      label: "AI coding guidelines template for engineering teams",
      href: guidePaths.aiCodingGuidelinesTemplate,
      description:
        "What belongs in the always-on layer, and what belongs in a focused playbook instead.",
    },
  ],
  og: {
    eyebrow: "AGENTS.md vs SKILL.md",
    title: [
      { text: "One file describes the repo." },
      { text: "The other packages a skill.", accent: true },
    ],
    description:
      "What AGENTS.md and SKILL.md each do, which agents read which, and how the two formats work together in one repository.",
    contextLabel: "skillsboard.sh/agents-md-vs-skill-md",
    chips: ["AGENTS.md", "SKILL.md", "Claude Code, Codex, Cursor"],
  },
  ogAlt:
    "Explainer comparing AGENTS.md and SKILL.md: what each format describes, which agents read which, and how they work together.",
  publishedAt: "2026-08-16",
  modifiedAt: "2026-08-16",
}
