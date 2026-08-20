import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"

export {
  codexSkillsPath,
  type CodexSkillsCtaPlacement,
  type CodexSkillsPath,
} from "@/lib/seo/codex-skills/types"

export interface CodexSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface CodexSkillsFaqEntry {
  question: string
  answer: string
}

export interface CodexSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface CodexSkillsInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface CodexSkillsTableSection {
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

export interface CodexSkillsDefinition {
  path: typeof codexSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof claudeSkillsPath
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
  locations: CodexSkillsTableSection & { link: CodexSkillsInlineLink }
  transfers: CodexSkillsTableSection & { link: CodexSkillsInlineLink }
  install: {
    title: string
    intro: string
    steps: readonly {
      title: string
      body: string
    }[]
    template: string
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
    link: CodexSkillsInlineLink
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
  faq: readonly CodexSkillsFaqEntry[]
  sources: readonly CodexSkillsSource[]
  related: readonly CodexSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const codexSkills: CodexSkillsDefinition = {
  path: codexSkillsPath,
  contentType: "article",
  topics: ["codex skills", "skill format", "compatibility", "skill sharing"],
  relatedGuidePaths: [
    claudeSkillsPath,
    cursorSkillsPath,
    guidePaths.manageCrossAgentSkills,
    guidePaths.shareTeamSkills,
  ],
  eyebrow: "Codex Skills",
  title: "Codex skills: what they are and how to use them",
  seoTitle: "Codex Skills: What They Are and How to Use Them | Skills Board",
  description:
    "A Codex skill is a folder with a SKILL.md file that OpenAI's coding agent loads on demand. The directories Codex scans, what carries over from a Claude skill, how to add one, and how teams keep a single recommendation.",
  intro: [
    "Codex skills are folders of instructions that OpenAI's coding agent loads when a request matches what the folder is for. Each folder holds a SKILL.md file and, optionally, the scripts, reference documents, and templates the task needs. OpenAI's documentation calls skills the authoring format for reusable workflows, and plugins the way to distribute them.",
    "The format is not specific to Codex. It is the Agent Skills standard, originally developed by Anthropic and released as an open standard, and the client showcase at agentskills.io lists ChatGPT and Codex among the products that read the same SKILL.md file.",
    "This page covers what Codex actually reads, the exact directories it scans, what carries over from a Claude skill and what does not, how to add a skill in a few minutes, what a team has to decide once more than one person depends on the same skill, and the parts OpenAI has not documented.",
  ],
  answer:
    "A Codex skill is a directory containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. Codex lists the name, description, and file path at startup, and reads the full file when it picks the skill.",
  answerNotes: [
    "That loading order is the point of the format. OpenAI calls it progressive disclosure: ChatGPT and Codex start from each skill's name and description, then load the full SKILL.md instructions when they decide to use that skill. Bundled scripts, references, and assets are read only when the instructions call for them, so a folder of installed skills costs very little context until one of them is relevant.",
    "Codex can reach a skill in two ways. You can invoke it explicitly, with /skills or by typing $ and mentioning the skill in Codex CLI and the IDE extension, or in ChatGPT by typing @. Codex can also pick a skill implicitly when your task matches the skill description, which is why the description has to say both what the skill does and when it should trigger, in the words someone would actually type.",
  ],
  answerSourceIds: ["codex-skills", "agentskills-spec"],
  locations: {
    title: "Where Codex looks for skills",
    intro:
      "Codex reads skills from repository, user, admin, and system locations. The repository scope is the one that surprises people coming from another agent: Codex scans a directory named .agents/skills in every directory from your current working directory up to the repository root.",
    columns: ["Scope", "Location", "What it is for"],
    rows: [
      {
        label: "Repo",
        cells: [
          "$CWD/.agents/skills",
          "The directory you launched Codex from. Skills that belong to one module or one service, checked in next to the code they describe.",
        ],
      },
      {
        label: "Repo",
        cells: [
          "$CWD/../.agents/skills",
          "A folder above the working directory when you launch Codex inside a Git repository, for skills shared by a group of nested folders.",
        ],
      },
      {
        label: "Repo",
        cells: [
          "$REPO_ROOT/.agents/skills",
          "The topmost folder of the Git repository. Root skills are available to any subfolder, which is where a team usually puts the ones everyone needs.",
        ],
      },
      {
        label: "User",
        cells: [
          "$HOME/.agents/skills",
          "Personal skills that apply to every repository you work in, whether or not your teammates have them.",
        ],
      },
      {
        label: "Admin",
        cells: [
          "/etc/codex/skills",
          "A shared system location on the machine or container, for SDK scripts, automation, and defaults an administrator wants every user on that machine to have.",
        ],
      },
      {
        label: "System",
        cells: [
          "Bundled with Codex",
          "Skills OpenAI ships with the product, such as the skill creator and the plan skills. Available to everyone when they start Codex.",
        ],
      },
    ],
    notes: [
      "Names are not merged across locations. OpenAI documents that if two skills share the same name, Codex does not merge them and both can appear in skill selectors. That is a real difference from the precedence rules other agents apply, and it means a personal skill and a repository skill with the same name coexist rather than one silently winning.",
      "Symlinked skill folders work. Codex follows the symlink target when it scans these locations, which is how one checked-out copy of a skill can serve several repositories without being duplicated in each of them.",
      "The initial list is budgeted. In Codex the startup list includes each skill's name, description, and file path, and it is capped at 2% of the model's context window, or 8,000 characters when the context window is unknown. If many skills are installed, Codex shortens descriptions first, and for large skill sets it may leave some skills out of the initial list and show a warning. The budget applies only to that list: once Codex selects a skill, it still reads the full SKILL.md.",
      "You can turn a skill off without deleting it. A [[skills.config]] entry in ~/.codex/config.toml takes the path to the skill folder containing SKILL.md and an enabled flag, and the config reference documents both keys. Restart Codex after changing the file.",
      "Codex detects skill changes automatically, and OpenAI's instruction when an update does not show up is to restart Codex. The same applies to skills you have just installed.",
    ],
    link: {
      lead: "Skills are not the only file Codex reads. It also builds an AGENTS.md chain before doing any work, and the two formats answer different questions, which is the subject of",
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      trail: ".",
    },
    sourceIds: ["codex-skills", "codex-config-reference"],
  },
  transfers: {
    title: "Codex skills and Claude skills: what actually transfers",
    intro:
      "The file transfers. The setup around it does not. Both products implement the same Agent Skills standard, so a SKILL.md written for one is usually readable by the other, but the directories, the invocation syntax, and every field beyond the standard are product-specific.",
    columns: ["Area", "Codex", "Claude Code", "What that means"],
    rows: [
      {
        label: "Skill file",
        cells: [
          "SKILL.md with name and description in the frontmatter",
          "SKILL.md with name and description in the frontmatter",
          "The same file. Both products document the Agent Skills standard as the format they read.",
        ],
      },
      {
        label: "Repository location",
        cells: [
          ".agents/skills, scanned from the working directory up to the repository root",
          ".claude/skills, at the project root and in nested directories",
          "A repository that serves both agents carries both directories, or one of them is a symlink to the other. Both products document following symlinks.",
        ],
      },
      {
        label: "Personal location",
        cells: ["$HOME/.agents/skills", "~/.claude/skills", "Two folders per teammate, kept current by hand."],
      },
      {
        label: "Explicit invocation",
        cells: [
          "/skills, or $ and the skill name",
          "/ and the skill name",
          "Instructions that tell a reader to type a slash command are agent-specific. Skill bodies that name their own invocation syntax need editing per agent.",
        ],
      },
      {
        label: "Implicit invocation",
        cells: [
          "On by default, and can be turned off per skill with allow_implicit_invocation in agents/openai.yaml",
          "Controlled by Claude Code frontmatter fields",
          "The switch exists on both sides but lives in a different file, so the setting does not travel with the skill.",
        ],
      },
      {
        label: "Extra fields",
        cells: [
          "agents/openai.yaml for display metadata, invocation policy, and tool dependencies",
          "Claude Code frontmatter such as invocation control, subagent execution, and dynamic context injection",
          "Each product's extras are ignored or unknown outside it. The six fields in the Agent Skills specification are the portable set.",
        ],
      },
      {
        label: "Distribution",
        cells: [
          "Plugins, published to the plugin directory shared by ChatGPT and Codex, plus local and repository marketplaces",
          "Plugins and plugin marketplaces",
          "Two packaging systems with different manifests. A shared skill folder is portable; a packaged plugin is not.",
        ],
      },
    ],
    notes: [
      "Stay inside the specification and the file travels. The Agent Skills specification defines six frontmatter fields: name and description are required, and license, compatibility, metadata, and allowed-tools are optional. Anthropic documents that Claude Code accepts extra fields of its own and that only the six spec fields work outside Claude Code. OpenAI's Codex documentation describes name and description and its own agents/openai.yaml file, and does not document what Codex does with the four optional spec fields.",
      "Portability is about the format, not the result. The same instructions can load in both products and still produce different work, because the tools, the sandboxing, and the surrounding instructions differ. Test the skill in each agent your teammates actually run before you tell them it works there.",
    ],
    link: {
      lead: "For the same walkthrough from the Claude side, including the frontmatter table and the surfaces skills run on, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["codex-skills", "agentskills-spec", "claude-code-skills"],
  },
  install: {
    title: "How to add a skill to Codex, step by step",
    intro:
      "There are three documented ways to end up with a skill Codex can use: write the folder yourself, install a curated one from inside Codex, or install a plugin that bundles skills. The manual path is the one worth learning first, because the other two produce the same thing.",
    steps: [
      {
        title: "Decide which scope the skill belongs to",
        body: "A skill everyone working in the repository should have goes in .agents/skills at the repository root. A skill that only makes sense for one service goes in .agents/skills inside that service directory, because Codex scans every level from your working directory up to the root. A skill that is yours alone goes in $HOME/.agents/skills.",
      },
      {
        title: "Create the folder and the SKILL.md file",
        body: "Make a directory named after the skill and put a SKILL.md file inside it. The frontmatter needs name and description. The specification requires the name to match the parent directory name, to be at most 64 characters, and to use lowercase letters, numbers, and single hyphens.",
      },
      {
        title: "Write the description for the trigger, not for the reader",
        body: "The description is what Codex matches your request against, and it is also the part that gets shortened when many skills are installed. OpenAI's guidance is to write concise descriptions with clear scope and boundaries, and to front-load the key use case and the trigger words so a host can still match the skill if descriptions are shortened.",
      },
      {
        title: "Put the steps in the body, and the bulk in separate files",
        body: "The body is plain Markdown with no format restrictions. The specification recommends keeping SKILL.md under 500 lines and moving detailed reference material into separate files, because the whole body is read once the skill activates while referenced files load only when the instructions ask for them.",
      },
      {
        title: "Invoke it explicitly the first time",
        body: "Run /skills in Codex CLI or the IDE extension and pick the skill, or type $ and mention it by name. Explicit invocation confirms Codex found the folder. After that, leave it to implicit matching and see whether your description actually triggers on the requests you expected.",
      },
      {
        title: "Add optional metadata only if you need it",
        body: "An agents/openai.yaml file inside the skill folder can set the display name, short description, icons, brand color, and default prompt shown in the ChatGPT desktop app, declare tool dependencies such as an MCP server, and set allow_implicit_invocation to false so the skill runs only when you invoke it explicitly.",
      },
      {
        title: "Or skip authoring entirely",
        body: "Inside Codex, $skill-creator drafts a skill by asking what it does, when it should trigger, and whether it needs scripts. Record and Replay captures a workflow you demonstrate and drafts a skill from it. $skill-installer followed by a curated skill name installs one of OpenAI's, and can be prompted to download skills from other repositories.",
      },
    ],
    template: `---
name: release-notes
description: Draft release notes from merged pull requests. Use when the user asks for release notes, a changelog entry, or a summary of what shipped.
---

## Steps

1. List the merged pull requests since the last tag.
2. Group them into features, fixes, and internal changes.
3. Write one line per user-visible change, in plain language.
4. Leave internal refactors out unless they change behavior.

## Output

A Markdown section titled with the version and date.`,
    sourceIds: ["codex-skills", "agentskills-spec", "openai-skills-repo"],
  },
  team: {
    title: "How teams keep one recommendation across Codex and other agents",
    intro:
      "Two problems hide behind one word. Distribution is getting the files onto each teammate's machine. Recommendation is knowing which skill to use for a task and why that one. Codex has answers for the first. The second is not a Codex problem at all.",
    body: [
      "If every skill your team uses lives in a repository everyone works in, the answer is short: commit them to .agents/skills at the repository root, and Codex picks them up with no extra tooling. That is the best available setup for a single-repository team, and no shared library improves on it. Nothing on this page should talk you out of it.",
      "It stops being enough when the skills come from other people's repositories, when they are useful in more than one repository, or when teammates run different agents. Then distribution splits: OpenAI's answer is plugins, published to the plugin directory shared by ChatGPT and Codex, or a marketplace file checked into $REPO_ROOT/.agents/plugins/marketplace.json or kept personally at ~/.agents/plugins/marketplace.json and added with codex plugin marketplace add. Anthropic's answer is its own plugin system. Neither one carries the other's packaging.",
      "The recommendation layer usually has no home at all. Which skill the team settled on, and why, ends up in a chat thread, a bookmark, or one person's memory. Skills Board is a shared library for that layer: the smaller set of skills your team recommends, in one searchable place, with the original source visible on every entry, and no assumption about which agent a teammate runs.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md before putting it anywhere.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits. It is one option among several, not the only path.",
      },
      {
        label: "Download a ZIP",
        body: "The latest skill files available from the source at download time, for anyone who would rather place the folder themselves, including in .agents/skills.",
      },
      {
        label: "Connect an agent over MCP",
        body: "An authenticated MCP endpoint lets a compatible agent search the same team library and retrieve install commands, and, with the granted scopes, save skills and organize collections. Sign-in happens in the browser, with no API key to copy.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "It does not install or run skills inside Codex, and it does not claim a skill behaves the same in every agent your team uses.",
      "It is not a replacement for .agents/skills. The files still have to land in a location Codex scans, by whichever route each teammate prefers.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "The operational version of this, with one canonical source and a tested install path per agent, is in",
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: ["codex-skills", "codex-plugins"],
  },
  openQuestions: {
    title: "Limits and open questions",
    intro:
      "Some of what people expect to be documented is not. These are the gaps we found while checking OpenAI's current documentation, written out rather than guessed at.",
    entries: [
      {
        title: "The optional specification fields are not documented for Codex",
        body: "The Agent Skills specification defines license, compatibility, metadata, and allowed-tools as optional fields, and marks allowed-tools experimental with support that varies between implementations. OpenAI's Codex skills documentation describes name and description and its own agents/openai.yaml file, and says nothing about what Codex does with the other four. Treat their behavior in Codex as unverified.",
      },
      {
        title: "Codex does not document reading .claude/skills",
        body: "The documented locations are .agents/skills from the working directory up to the repository root, $HOME/.agents/skills, /etc/codex/skills, and the skills bundled with Codex. A directory used by another agent is not among them, so a repository that serves both agents needs both paths present, whether by copying the folder or by symlinking it.",
      },
      {
        title: "Standalone skills are listed for three surfaces",
        body: "OpenAI documents standalone skills as available in the ChatGPT desktop app, Codex CLI, and the IDE extension, and skills bundled in plugins as also available in Chat and Work across ChatGPT on the web, desktop, and mobile. Other Codex surfaces are not listed for standalone skills, so do not assume a folder on your laptop is present wherever else Codex runs.",
      },
      {
        title: "Two first-party sources point at different repositories",
        body: "The Codex skills documentation links openai/skills for examples, and the open-source page lists it as the home of reusable skills for ChatGPT and Codex. The repository itself opens with a notice marking it deprecated and pointing to the OpenAI plugins repository for current Codex skill and plugin examples. Both pages were checked on the date above.",
      },
      {
        title: "There is no documented ceiling on how many skills to install",
        body: "The initial skill list is capped at 2% of the model's context window, or 8,000 characters when it is unknown, and Codex shortens descriptions and may omit skills beyond that, with a warning. The number of skills that fits depends on the model and on how long your descriptions are, so the practical limit is something you observe rather than look up.",
      },
    ],
    sourceIds: [
      "codex-skills",
      "agentskills-spec",
      "codex-open-source",
      "openai-skills-repo",
    ],
  },
  faq: [
    {
      question: "What is a Codex skill?",
      answer:
        "A Codex skill is a folder containing a SKILL.md file with YAML frontmatter and Markdown instructions. The frontmatter needs a name and a description. Codex loads the name, description, and file path at startup, then reads the whole file when your request matches the description or when you invoke the skill.",
    },
    {
      question: "Where do you put skills for Codex CLI?",
      answer:
        "Codex scans .agents/skills in every directory from your working directory up to the repository root, so a repository skill goes in .agents/skills at the level that should own it. Personal skills go in $HOME/.agents/skills, and machine-wide ones in /etc/codex/skills. Codex also ships bundled skills of its own.",
    },
    {
      question: "Do Claude skills work in Codex?",
      answer:
        "The file usually does. Both products read the same SKILL.md format from the Agent Skills standard. The locations differ: Claude Code reads .claude/skills and ~/.claude/skills, Codex reads .agents/skills and $HOME/.agents/skills. Frontmatter beyond the six standard fields, and any agent-specific body syntax, does not carry over.",
    },
    {
      question: "How do you install a skill in Codex?",
      answer:
        "Three documented paths. Create the folder yourself with a SKILL.md inside a location Codex scans. Run $skill-installer followed by a curated skill name from inside Codex. Or install a plugin that bundles skills. Codex detects new skills automatically, and OpenAI says to restart it if one does not appear.",
    },
    {
      question: "What is the difference between a Codex skill and AGENTS.md?",
      answer:
        "AGENTS.md is always-on guidance: Codex builds an instruction chain when it starts, from your Codex home directory down to your working directory, and every task carries it. A skill loads on demand, only when the request matches its description or you invoke it, so it costs context only when it is relevant.",
    },
  ],
  sources: [
    {
      id: "codex-skills",
      label: "OpenAI: build skills for ChatGPT and Codex",
      href: "https://developers.openai.com/codex/skills",
      note: "The skill directory layout, progressive disclosure and the initial list budget, explicit and implicit invocation, the four location scopes, symlink support, duplicate names, the skill creator and installer, the [[skills.config]] switch, and agents/openai.yaml.",
    },
    {
      id: "codex-config-reference",
      label: "OpenAI: Codex config reference",
      href: "https://developers.openai.com/codex/config-reference",
      note: "The skills.config array and its path and enabled keys, and the feature flag that lets Codex prompt to install missing MCP dependencies for a skill.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their constraints, the naming rules, the optional scripts, references, and assets directories, and the progressive disclosure and file-size recommendations.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: overview and client showcase",
      href: "https://agentskills.io",
      note: "The format as an open standard originally developed by Anthropic, and the showcase entry listing ChatGPT and Codex among the products that read it.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where Claude Code loads skills from, slash-command invocation, symlinked skill folders, and which frontmatter fields work outside Claude Code.",
    },
    {
      id: "codex-plugins",
      label: "OpenAI: package your plugin",
      href: "https://developers.openai.com/plugins/build/plugins",
      note: "The plugin manifest and skills directory, the plugin directory shared by ChatGPT and Codex, repository and personal marketplace files, and the codex plugin marketplace commands.",
    },
    {
      id: "codex-agents-md",
      label: "OpenAI: custom instructions with AGENTS.md",
      href: "https://developers.openai.com/codex/guides/agents-md",
      note: "How Codex builds its instruction chain at startup, from the Codex home directory down to the working directory, and merges the files it finds.",
    },
    {
      id: "codex-open-source",
      label: "OpenAI: Codex open source components",
      href: "https://developers.openai.com/codex/open-source",
      note: "Which parts of Codex are open source, including the CLI at openai/codex, and the repositories listed for skills and plugins.",
    },
    {
      id: "openai-skills-repo",
      label: "openai/skills on GitHub",
      href: "https://github.com/openai/skills",
      note: "The curated, experimental, and system skill folders, the $skill-installer usage examples, per-skill licensing, and the notice marking the repository deprecated in favor of openai/plugins.",
    },
  ],
  related: [
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "Which clients document reading the format, and which of them scan the same .agents/skills path.",
    },
    {
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      description:
        "The other file Codex reads, what belongs in each, and how the two work together.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same explainer for the other side of the standard: the format, the surfaces, and how a skill loads.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "The one product that documents reading .agents/skills and the Claude directories alike.",
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
  ],
  og: {
    eyebrow: "Codex Skills",
    title: [
      { text: "One SKILL.md file," },
      { text: "read from .agents/skills.", accent: true },
    ],
    description:
      "What Codex skills are, the directories Codex scans, what transfers from a Claude skill, and how teams keep one recommendation.",
    contextLabel: "skillsboard.sh/codex-skills",
    chips: ["SKILL.md", "Codex CLI", ".agents/skills"],
  },
  ogAlt:
    "Explainer on Codex skills: the SKILL.md format, the directories Codex scans, and what transfers from Claude.",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
}
