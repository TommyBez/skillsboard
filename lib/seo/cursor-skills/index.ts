import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { opencodeSkillsPath } from "@/lib/seo/opencode-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"

export {
  cursorSkillsPath,
  type CursorSkillsCtaPlacement,
  type CursorSkillsPath,
} from "@/lib/seo/cursor-skills/types"

export interface CursorSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface CursorSkillsFaqEntry {
  question: string
  answer: string
}

export interface CursorSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface CursorSkillsInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface CursorSkillsTableSection {
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

export interface CursorSkillsDefinition {
  path: typeof cursorSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof claudeSkillsPath
    | typeof codexSkillsPath
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
  locations: CursorSkillsTableSection & { link: CursorSkillsInlineLink }
  frontmatter: CursorSkillsTableSection & { link: CursorSkillsInlineLink }
  transfers: CursorSkillsTableSection & { link: CursorSkillsInlineLink }
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
    link: CursorSkillsInlineLink
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
  faq: readonly CursorSkillsFaqEntry[]
  sources: readonly CursorSkillsSource[]
  related: readonly CursorSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const cursorSkills: CursorSkillsDefinition = {
  path: cursorSkillsPath,
  contentType: "article",
  topics: ["cursor skills", "skill format", "compatibility", "skill sharing"],
  relatedGuidePaths: [
    claudeSkillsPath,
    codexSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "Cursor Skills",
  title: "Cursor skills: what they are and how to use them",
  seoTitle: "Cursor Skills: What They Are and How to Use Them | Skills Board",
  description:
    "A Cursor skill is a folder with a SKILL.md file that Cursor discovers at startup and loads when it is relevant. The directories Cursor scans, the frontmatter fields it documents, how to add one, and what teams decide next.",
  intro: [
    "Cursor skills are folders of instructions that Cursor's agent loads when a task matches what the folder is for. Each holds a SKILL.md file and, optionally, the scripts, references, and assets the task needs. Cursor's own documentation opens by calling Agent Skills an open standard for extending AI agents, not a Cursor feature, which is the most useful thing to know before you write one.",
    "That matters because the file you write is the file the other agents read. The format was originally developed by Anthropic and released as an open standard, the specification lives at agentskills.io, and Cursor appears in the client showcase there alongside Claude Code, Codex, and a long list of others.",
    "This page covers what Cursor actually reads, every directory it scans including the Claude and Codex ones, the frontmatter fields it documents and the ones it does not, how to add a skill in a few minutes, what carries over when the same file moves between agents, what a team decides once more than one person depends on a skill, and the parts Cursor has not documented.",
  ],
  answer:
    "A Cursor skill is a directory containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. Cursor discovers skills from its skill directories when it starts, presents them to the agent, and the agent decides when each one is relevant based on context.",
  answerNotes: [
    "Cursor describes skills as portable, version-controlled, actionable, and progressive: any agent that supports the standard reads the same file, a skill is just files you can commit, it can bundle scripts, templates, and references the agent runs or reads with its own tools, and those resources load on demand rather than sitting in context.",
    "There are two ways to reach a skill. The agent picks one implicitly when your request matches its description, which is why the description has to say what the skill does and when to use it, in the words someone would actually type. You can also invoke one explicitly by typing a forward slash in Agent chat and searching its name.",
    "Cursor also ships built-in skills that appear alongside the ones you add, among them /create-skill for authoring a new one, /review and /review-security for code review, and /migrate-to-skills for converting rules and slash commands you already have. The full list is in Cursor's skills documentation.",
  ],
  answerSourceIds: ["cursor-skills", "agentskills-home"],
  locations: {
    title: "Where Cursor looks for skills",
    intro:
      "Cursor loads skills from four of its own directories, two project-level and two user-level, and then, for compatibility, from four more that belong to other agents. That last part is the detail people coming from Claude Code or Codex do not expect, and it is documented rather than folklore.",
    columns: ["Location", "Scope", "What it is for"],
    rows: [
      {
        label: ".agents/skills/",
        cells: [
          "Project",
          "The vendor-neutral project directory. The same path Codex documents, so a repository that uses it serves both agents from one folder.",
        ],
      },
      {
        label: ".cursor/skills/",
        cells: [
          "Project",
          "Cursor's own project directory, next to .cursor/rules and the rest of the Cursor configuration checked into the repository.",
        ],
      },
      {
        label: "~/.agents/skills/",
        cells: [
          "User",
          "Personal skills that apply to every project you open, in the vendor-neutral location.",
        ],
      },
      {
        label: "~/.cursor/skills/",
        cells: [
          "User",
          "Personal skills in Cursor's own home directory, for anything you do not want to place in the shared one.",
        ],
      },
      {
        label: ".claude/skills/ and ~/.claude/skills/",
        cells: [
          "Compatibility",
          "Cursor documents loading skills from the Claude directories as well, so a repository already set up for Claude Code needs no second copy.",
        ],
      },
      {
        label: ".codex/skills/ and ~/.codex/skills/",
        cells: [
          "Compatibility",
          "Cursor lists these as the Codex directories, although OpenAI documents .agents/skills rather than .codex/skills. See the limits section below.",
        ],
      },
    ],
    notes: [
      "Category folders are free. Cursor walks the skills root recursively and picks up any SKILL.md it finds, so you can group skills under shipping/, debugging/, or workflow/ subfolders. The category folder is organizational only: identity comes from the folder that directly contains SKILL.md.",
      "Nested project directories are scoped automatically. A .cursor/skills/ or .agents/skills/ folder anywhere inside the repository is picked up, and Cursor documents that its skills surface only when the agent works with files inside that directory. In a monorepo, a skill in apps/web/.cursor/skills/ applies to apps/web while the repo-wide folder applies everywhere, with no frontmatter needed.",
      "You can see what was actually found. Open Customize in the sidebar and go to Skills, where skills from a plugin or from the project appear alongside rules in the Agent Decides section, filterable by user, workspace, or team scope.",
    ],
    link: {
      lead: "The other client that documents reading its own directory, the Claude one, and the neutral one alike is OpenCode, and its six locations are listed in",
      label: "OpenCode skills: what they are and how to use them",
      href: opencodeSkillsPath,
      trail: ".",
    },
    sourceIds: ["cursor-skills", "cursor-plugins"],
  },
  frontmatter: {
    title: "The SKILL.md fields Cursor documents",
    intro:
      "Two fields are required and the rest are optional. Two of the optional ones are Cursor's own additions to the standard, and they are the reason a Cursor skill can behave differently from the identical file read by another agent.",
    columns: ["Field", "Required", "What it does"],
    rows: [
      {
        label: "name",
        cells: [
          "Yes",
          "The skill identifier. Lowercase letters, numbers, and hyphens only, and it has to match the parent folder name. The Agent Skills specification adds the constraints every client shares: at most 64 characters, no leading or trailing hyphen, no consecutive hyphens.",
        ],
      },
      {
        label: "description",
        cells: [
          "Yes",
          "What the skill does and when to use it. Cursor states plainly that the agent uses this field to determine relevance, so it is the field that decides whether the skill ever fires. The specification caps it at 1024 characters.",
        ],
      },
      {
        label: "paths",
        cells: [
          "No",
          "Glob patterns that scope the skill to matching files, as a comma-separated string or a list. When set, Cursor surfaces the skill only while the agent is reading or editing files that match, which keeps file-specific guidance out of unrelated work.",
        ],
      },
      {
        label: "disable-model-invocation",
        cells: [
          "No",
          "Set it to true and the skill behaves like a traditional slash command: it enters context only when you type its name after a forward slash, and the agent will not apply it on its own.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "No",
          "An arbitrary key-value mapping. This one is in the Agent Skills specification too, which describes it as a map from string keys to string values that clients can use for properties the spec does not define.",
        ],
      },
      {
        label: "globs",
        cells: [
          "No",
          "The legacy spelling of paths. Cursor documents that it is still accepted as a fallback for older skills, and that new skills should use paths instead.",
        ],
      },
    ],
    notes: [
      "The body below the frontmatter is plain Markdown with no format restrictions, and all of it is read once the agent activates the skill. The specification recommends keeping SKILL.md under 500 lines and moving detailed reference material into separate files that load only when the instructions ask for them. Three of the six spec fields, license, compatibility, and allowed-tools, are absent from Cursor's table entirely, which the limits section below covers.",
      "Skills are not rules, and Cursor is explicit about the split. Rule contents are included at the start of the model context; the 2.4 release note frames skills as better for dynamic context discovery and procedural how-to instructions. The built-in /migrate-to-skills converts eligible dynamic rules into skills, and slash commands into skills with disable-model-invocation set to true.",
    ],
    link: {
      lead: "For the same field-by-field walkthrough on the OpenAI side, including the directories Codex scans and its separate agents/openai.yaml metadata file, see",
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      trail: ".",
    },
    sourceIds: ["cursor-skills", "agentskills-spec", "cursor-2-4"],
  },
  transfers: {
    title: "Cursor skills, Claude skills, and Codex skills: what actually transfers",
    intro:
      "The file transfers, and in Cursor's case more of the setup transfers than anywhere else, because Cursor is the only one of the three that documents reading the other two products' directories. What does not transfer is everything each product added on top of the standard.",
    columns: ["Area", "Cursor", "Claude Code", "Codex"],
    rows: [
      {
        label: "Project directory",
        cells: [
          ".cursor/skills/ and .agents/skills/, plus .claude/skills/ and .codex/skills/ for compatibility",
          ".claude/skills/, including nested ones below the working directory",
          ".agents/skills/, scanned from the working directory up to the repository root",
        ],
      },
      {
        label: "Personal directory",
        cells: [
          "~/.cursor/skills/ and ~/.agents/skills/, plus ~/.claude/skills/ and ~/.codex/skills/",
          "~/.claude/skills/",
          "$HOME/.agents/skills",
        ],
      },
      {
        label: "Explicit invocation",
        cells: [
          "Type a forward slash in Agent chat and search the skill name",
          "Type a forward slash and the skill name",
          "/skills, or $ and the skill name",
        ],
      },
      {
        label: "Turning off automatic use",
        cells: [
          "disable-model-invocation: true in the SKILL.md frontmatter",
          "Claude Code frontmatter fields for invocation control",
          "allow_implicit_invocation in a separate agents/openai.yaml file",
        ],
      },
      {
        label: "File scoping",
        cells: [
          "paths globs in the frontmatter, or a nested project skills directory",
          "Nested .claude/skills/ directories below the working directory",
          "Directory position, since Codex scans from the working directory upward",
        ],
      },
      {
        label: "Distribution",
        cells: [
          "Agent Plugins and Cursor Plugins, from the marketplace or a team marketplace",
          "Plugins and plugin marketplaces",
          "Plugins published to the directory shared by ChatGPT and Codex, plus marketplace files",
        ],
      },
    ],
    notes: [
      "Stay inside the specification and the file travels. It defines six frontmatter fields: name and description required, plus optional license, compatibility, metadata, and allowed-tools, the last marked experimental with support that varies. Anything outside that set is a product extension, so a skill that depends on paths or disable-model-invocation loses that behavior in an agent that does not read them.",
      "Cursor reading the other directories removes a chore, not a difference. A repository set up for Claude Code works in Cursor with no second folder, but the reverse is not documented: neither Claude Code nor Codex documents reading .cursor/skills. For one folder that all three read, .agents/skills is the path Cursor and Codex both document, and Claude Code still needs .claude/skills or a symlink to it.",
      "Portability is about the format, not the result. The same instructions can load in three products and still produce different work, because the tools, the sandboxing, the models, and the surrounding instructions differ. Test the skill in each agent your teammates actually run before you tell them it works there.",
    ],
    link: {
      lead: "For the Claude side of the same standard, including the full frontmatter table and the surfaces skills run on, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["cursor-skills", "agentskills-spec", "claude-code-skills", "codex-skills"],
  },
  install: {
    title: "How to add a skill to Cursor, step by step",
    intro:
      "There are three documented ways to end up with a skill Cursor can use: write the folder yourself, install a plugin that bundles skills, or ask a built-in skill to draft one for you. The manual path is worth learning first, because the other two produce the same thing on disk.",
    steps: [
      {
        title: "Decide which directory the skill belongs to",
        body: "A skill everyone in the repository should have goes in .cursor/skills/ or .agents/skills/ at the project root. Pick .agents/skills/ if teammates also run Codex, since both products document it. A skill that is yours alone goes in ~/.cursor/skills/ or ~/.agents/skills/. A skill for one package in a monorepo goes in that package's own skills directory, where Cursor scopes it automatically.",
      },
      {
        title: "Create the folder and the SKILL.md file",
        body: "Make a directory named after the skill and put a SKILL.md file inside it. The frontmatter needs name and description. The name has to match the parent directory name and use lowercase letters, numbers, and hyphens, and the specification caps it at 64 characters with no leading, trailing, or consecutive hyphens.",
      },
      {
        title: "Write the description for the trigger, not for the reader",
        body: "Cursor states that the agent uses the description to determine relevance, so this field decides whether the skill ever fires. Say what it does and when to use it, in the words someone would actually type. A description that reads like a table of contents entry will not trigger.",
      },
      {
        title: "Put the steps in the body and the bulk in separate files",
        body: "The body is plain Markdown with no format restrictions. Keep SKILL.md under 500 lines, and move long reference material into references/, executable code into scripts/, and templates into assets/. Those load only when the instructions ask for them, which is the whole point of the format.",
      },
      {
        title: "Scope it if it only applies to some files",
        body: "Add a paths glob when the skill is about React components, Python style, or one package's conventions, and Cursor surfaces it only while the agent works with matching files. A skill placed in a nested project skills directory gets that scoping with no frontmatter at all.",
      },
      {
        title: "Invoke it explicitly the first time",
        body: "Type a forward slash in Agent chat and search for the skill name. Explicit invocation confirms Cursor found the folder and parsed the frontmatter. After that, leave it to the agent and see whether your description actually triggers on the requests you expected. Customize, then Skills, shows what Cursor discovered.",
      },
      {
        title: "Or skip authoring entirely",
        body: "The built-in /create-skill drafts a skill including its structure and SKILL.md, and /migrate-to-skills converts eligible dynamic rules and slash commands you already have. Installing a plugin from the Cursor Marketplace or a team marketplace brings its bundled skills with it, packaged under a skills/ directory with a SKILL.md per skill.",
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
    sourceIds: ["cursor-skills", "agentskills-spec", "cursor-plugins-reference"],
  },
  team: {
    title: "How teams keep one answer per job across Cursor and other agents",
    intro:
      "Two problems hide behind one word. Distribution is getting the files onto each teammate's machine. Selection is knowing which skill to use for a task and why that one. Cursor has good answers for the first. The second is not a Cursor problem at all.",
    body: [
      "If every skill your team uses lives in a repository everyone works in, the answer is short: commit them to .cursor/skills/ or .agents/skills/ at the project root and Cursor picks them up with no extra tooling. That is the best setup for a single-repository team, and no shared library improves on it. Nothing here should talk you out of it.",
      "It stops being enough when the skills come from other people's repositories, when they are useful in more than one repository, or when teammates run different agents. Cursor's answer to the first two is plugins: it supports the Agent Plugins standard alongside its own Cursor Plugin format and offers team marketplaces on Teams and Enterprise plans with per-plugin install modes. That covers packaging and rollout, but not teammates outside Cursor, because a Cursor Plugin is not what Claude Code or Codex installs.",
      "The selection layer usually has no home at all. Which skill the team settled on, and why, ends up in a chat thread, a bookmark, or one person's memory. Skills Board is a web app for that layer: the smaller set of skills your team settled on, in one searchable place, with the original source visible on every entry, and no assumption about which agent a teammate runs.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md before placing it.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits. It is one option among several, not the only path.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather place the folder themselves, in .cursor/skills or anywhere else Cursor scans.",
      },
      {
        label: "Connect Cursor over MCP",
        body: "Add the Skills Board MCP endpoint to .cursor/mcp.json in a project or ~/.cursor/mcp.json to use it everywhere, then sign in from Cursor's MCP settings. The agent can search the same team library and retrieve install commands, and with the granted scopes save skills and organize collections. Sign-in happens in the browser, with no API key to copy.",
      },
    ],
    limits: [
      "A saved skill is a team's own choice, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "The MCP connection cannot install or run a skill inside Cursor, and it cannot edit or delete saved team skills.",
      "It is not a replacement for a skills directory. The files still have to land somewhere Cursor scans, by whichever route each teammate prefers.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "The operational version of this, with one canonical source and a tested install path per agent, is in",
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: ["cursor-plugins", "cursor-customize"],
  },
  openQuestions: {
    title: "Limits and open questions",
    intro:
      "Some of what people expect to be documented is not. These are the gaps we found while reading Cursor's current documentation, written out rather than guessed at.",
    entries: [
      {
        title: "Precedence between the eight directories is not documented",
        body: "Cursor lists four of its own skill directories and four compatibility ones, but does not say what happens when the same skill name appears in two of them. Claude Code documents a precedence order, and OpenAI documents that Codex does not merge same-named skills and may show both. Cursor documents neither, so treat duplicate names as untested.",
      },
      {
        title: "Three optional specification fields are not documented for Cursor",
        body: "The Agent Skills specification defines license, compatibility, metadata, and allowed-tools as optional, and marks allowed-tools experimental with support that varies between implementations. Cursor's frontmatter table documents metadata but not license, compatibility, or allowed-tools. Their behavior in Cursor is unverified.",
      },
      {
        title: "Cursor lists .codex/skills, and OpenAI does not",
        body: "Cursor names .codex/skills/ and ~/.codex/skills/ as the Codex compatibility directories. OpenAI documents .agents/skills from the working directory up to the repository root, $HOME/.agents/skills, and /etc/codex/skills. The overlap both products document is .agents/skills, so that is the safer choice for one folder serving Cursor and Codex.",
      },
      {
        title: "There is no documented context budget for the skill list",
        body: "Cursor describes progressive loading, but publishes no number for how much context the discovered skill list may take, or what happens when many skills are installed. OpenAI publishes a figure for Codex. Cursor does not, so how many skills you can keep installed is something you observe rather than look up.",
      },
      {
        title: "The GitHub import path is documented through the rules flow",
        body: "Cursor's skills page says you can import skills from GitHub through Customize, Rules, Add Rule, Remote Rule (Github). Its rules page describes that same flow as scanning the repository for .mdc files and importing them into .cursor/rules/imported/. How a SKILL.md folder ends up in a skills directory is not spelled out, so check the result in Customize, then Skills, before relying on it.",
      },
      {
        title: "Only the editor and the CLI are named as surfaces",
        body: "The 2.4 release note says Cursor supports Agent Skills in the editor and the CLI. The current Cloud Agents documentation does not mention skills, and neither does the agent overview page. Whether every Cursor surface loads a skill committed to a repository is not stated, so do not assume it.",
      },
    ],
    sourceIds: [
      "cursor-skills",
      "cursor-rules",
      "agentskills-spec",
      "codex-skills",
      "claude-code-skills",
      "cursor-2-4",
    ],
  },
  faq: [
    {
      question: "What is a Cursor skill?",
      answer:
        "A Cursor skill is a folder containing a SKILL.md file with YAML frontmatter and Markdown instructions. The frontmatter needs a name and a description. Cursor discovers skills from its skill directories at startup and presents them to the agent, which decides when each one is relevant. You can also invoke one by typing a forward slash in Agent chat.",
    },
    {
      question: "Where do you put skills in Cursor?",
      answer:
        "Cursor loads project skills from .cursor/skills/ and .agents/skills/, and user-level skills from ~/.cursor/skills/ and ~/.agents/skills/. For compatibility it also loads from .claude/skills/, .codex/skills/, ~/.claude/skills/, and ~/.codex/skills/. Nested skills directories inside the repository are picked up too, scoped to the files under them.",
    },
    {
      question: "Does Cursor read Claude skills?",
      answer:
        "Yes. Cursor documents loading skills from the Claude and Codex directories for compatibility: .claude/skills/, .codex/skills/, ~/.claude/skills/, and ~/.codex/skills/. The format is the same Agent Skills standard, so a repository already set up for Claude Code needs no second copy. Frontmatter fields specific to one product still do not carry over.",
    },
    {
      question: "What is the difference between Cursor skills and Cursor rules?",
      answer:
        "Rules are declarative and always on: their contents enter the model context at the start. Skills load on demand, when the agent judges the description relevant or you invoke them. Cursor's 2.4 release note frames skills as better for dynamic context discovery and procedural how-to instructions, and ships /migrate-to-skills to convert eligible rules and slash commands.",
    },
    {
      question: "How do you install a skill in Cursor?",
      answer:
        "Three documented paths. Create the folder yourself with a SKILL.md inside a directory Cursor scans. Install a plugin that bundles skills, from the Cursor Marketplace or a team marketplace. Or import from a GitHub repository through Customize, Rules, Add Rule, Remote Rule (Github). Check the result under Customize, then Skills.",
    },
    {
      question: "Can you stop Cursor from using a skill automatically?",
      answer:
        "Yes. Set disable-model-invocation to true in the frontmatter and the skill behaves like a traditional slash command: it enters context only when you type its name after a forward slash. To narrow rather than disable automatic use, set a paths glob so the skill surfaces only on matching files.",
    },
    {
      question: "How does a team share Cursor skills?",
      answer:
        "For one repository, commit them to .cursor/skills/ or .agents/skills/ and Cursor picks them up. Across repositories, Cursor distributes skills through plugins and team marketplaces on Teams and Enterprise plans. What neither covers is which skill the team settled on and why, especially when teammates run different agents, which is the layer a team library like Skills Board holds.",
    },
  ],
  sources: [
    {
      id: "cursor-skills",
      label: "Cursor: Agent Skills",
      href: "https://cursor.com/docs/skills",
      note: "The skill directories including the Claude and Codex compatibility paths, nested and category folders, the frontmatter table, the optional directories, the built-in skills, the Customize view, the GitHub import path, and /migrate-to-skills.",
    },
    {
      id: "cursor-2-4",
      label: "Cursor 2.4: Subagents, Skills, and Image Generation",
      href: "https://cursor.com/changelog/2-4",
      note: "The release that introduced Agent Skills in the Cursor editor and CLI, and the framing of skills against always-on rules.",
    },
    {
      id: "cursor-plugins",
      label: "Cursor: Plugins",
      href: "https://cursor.com/docs/plugins",
      note: "What plugins bundle, the Agent Plugins standard alongside Cursor Plugins, team marketplaces and their install modes, and managing skills from Customize.",
    },
    {
      id: "cursor-plugins-reference",
      label: "Cursor: Plugins reference",
      href: "https://cursor.com/docs/reference/plugins",
      note: "The skills format inside a plugin: one directory per skill under skills/, each with its own SKILL.md.",
    },
    {
      id: "cursor-rules",
      label: "Cursor: Rules",
      href: "https://cursor.com/docs/rules",
      note: "How rule contents enter the model context, and the Remote Rule (Github) import flow that scans a repository for .mdc files.",
    },
    {
      id: "cursor-customize",
      label: "Cursor: Customize Cursor",
      href: "https://cursor.com/docs/customize-cursor",
      note: "The Customize page, where skills, plugins, and MCP servers are managed at user, team, or workspace scope.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their constraints, the optional scripts, references, and assets directories, and the progressive disclosure and file-size recommendations.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: overview and client showcase",
      href: "https://agentskills.io",
      note: "The format as an open standard originally developed by Anthropic, and the showcase entry listing Cursor among the products that read it.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where Claude Code loads skills from, its precedence order, and nested project skills.",
    },
    {
      id: "codex-skills",
      label: "OpenAI: build skills for ChatGPT and Codex",
      href: "https://developers.openai.com/codex/skills",
      note: "The directories Codex scans, its invocation syntax, its agents/openai.yaml file, and the published budget for the initial skill list.",
    },
  ],
  related: [
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "Cursor beside the ten other clients whose own documentation states they read the format.",
    },
    {
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      description:
        "The plain Markdown file Cursor reads beside its rules, and what belongs there rather than in a skill.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same standard from the Claude side: the format, the surfaces, and how a skill loads.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The directories OpenAI's agent scans, and what a skill keeps when it moves between the two.",
    },
    {
      label: "OpenCode skills: what they are and how to use them",
      href: opencodeSkillsPath,
      description:
        "Six directories, a skill tool that loads one, and an allow, ask, or deny rule per skill.",
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
        "Turning a skill that worked once into an entry the next teammate can find.",
    },
    {
      label: "A shared MCP skill library for teams",
      href: guidePaths.sharedMcpSkillLibrary,
      description:
        "What a connected agent can and cannot do with a shared library over MCP.",
    },
  ],
  og: {
    eyebrow: "Cursor Skills",
    title: [
      { text: "One SKILL.md file," },
      { text: "and eight places to put it.", accent: true },
    ],
    description:
      "What Cursor skills are, every directory Cursor scans, the frontmatter fields it documents, and how teams keep one answer per job.",
    contextLabel: "skillsboard.sh/cursor-skills",
    chips: ["SKILL.md", "Cursor Agent", ".cursor/skills"],
  },
  ogAlt:
    "Explainer on Cursor skills: the SKILL.md format, the directories Cursor scans, and what transfers between agents.",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
}
