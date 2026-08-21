import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { coworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"

export {
  agentSkillsSupportPath,
  type AgentSkillsSupportCtaPlacement,
  type AgentSkillsSupportPath,
} from "@/lib/seo/agent-skills-support/types"

export interface AgentSkillsSupportSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface AgentSkillsSupportFaqEntry {
  question: string
  answer: string
}

export interface AgentSkillsSupportRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * is the set of internal destinations this page is allowed to point at, so a
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface AgentSkillsSupportInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentsMdVsSkillMdPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof codexSkillsPath
    | typeof coworkSkillsPath
    | typeof cursorSkillsPath
  trail: string
}

/** One matrix: a table with the sources that back every row in it. */
export interface AgentSkillsSupportTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: AgentSkillsSupportInlineLink
  sourceIds: readonly string[]
}

export interface AgentSkillsSupportDefinition {
  path: typeof agentSkillsSupportPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentsMdVsSkillMdPath
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
  /** Answer-first summary of the matrix, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  criteria: {
    title: string
    intro: string
    rules: readonly {
      label: string
      body: string
    }[]
    notes: readonly string[]
    link: AgentSkillsSupportInlineLink
    sourceIds: readonly string[]
  }
  documented: AgentSkillsSupportTableSection
  showcase: AgentSkillsSupportTableSection
  paths: AgentSkillsSupportTableSection
  notDocumented: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  team: {
    title: string
    intro: string
    body: readonly string[]
    options: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: AgentSkillsSupportInlineLink
    sourceIds: readonly string[]
  }
  faq: readonly AgentSkillsSupportFaqEntry[]
  sources: readonly AgentSkillsSupportSource[]
  related: readonly AgentSkillsSupportRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const agentSkillsSupport: AgentSkillsSupportDefinition = {
  path: agentSkillsSupportPath,
  contentType: "article",
  topics: [
    "agent skills support",
    "skill compatibility",
    "skill format",
    "cross-agent sharing",
  ],
  relatedGuidePaths: [
    agentSkillsPath,
    cursorSkillsPath,
    codexSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "Agent Skills Support",
  title: "Agent Skills support: which AI clients read SKILL.md",
  seoTitle:
    "Agent Skills Support: Which AI Clients Read SKILL.md | Skills Board",
  description:
    "A compatibility matrix for the Agent Skills format, checked on August 20, 2026. Eleven clients whose own documentation states they read SKILL.md, with the exact directories each one names, thirty-six more listed on the agentskills.io showcase, and the behavior nobody has documented.",
  intro: [
    "Every answer to this question is either a logo wall or a shrug. A logo wall tells you a product is on a list. It does not tell you what the product actually reads, where it looks for it, or who said so. This page separates those two things and keeps them separated all the way down.",
    "Two levels of evidence appear here, labelled on every row. The first is vendor documented: the client's own documentation says it reads SKILL.md, and we fetched and read that documentation on August 20, 2026. Eleven clients cleared that. The second is showcase listed: the client appears on the Agent Skills client showcase, which had forty-six entries on the same date, and we did not open its documentation. Thirty-six entries sit in that second group.",
    "The criteria come first, before any table, because a compatibility matrix without a stated bar is a list of opinions. After the matrices there is a section on what is not documented anywhere, which on this topic is larger than most pages admit.",
  ],
  answer:
    "Eleven clients document reading SKILL.md in their own published documentation: Claude Code, the Claude apps and Claude API, Claude Cowork, Codex, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenCode, goose, and Amp. The Agent Skills client showcase listed forty-six products on August 20, 2026, so being on the showcase and having vendor documentation you can read are different claims, and this page marks which is which on every row.",
  answerNotes: [
    "Support is not one thing. Every one of the eleven documented clients loads the same two required frontmatter fields, name and description, and defers the body until the skill is used. Beyond that they diverge on which directories they scan, which extra frontmatter fields they honor, whether they ask for consent before activation, and what they do with a field they do not recognize.",
    "The one directory nearly all of them name is the vendor-neutral one. Eight of the eleven documented clients scan .agents/skills in a project and ~/.agents/skills in a home directory. Claude Code is the notable absence: its documentation lists .claude/skills and ~/.claude/skills and never mentions the neutral path.",
    "Nobody publishes a conformance test. There is no certification, no version number a client claims to implement, and no published result showing that a given skill behaves the same in two products. Support here means documented reading of the file, which is the strongest claim the public record actually supports.",
  ],
  answerSourceIds: ["agentskills-home", "agentskills-clients", "agentskills-spec"],
  criteria: {
    title: "What counts as support on this page",
    intro:
      "Five rules, applied in order. A client that fails the first rule does not appear in the documented matrix no matter how widely it is described as compatible, and a behavior that fails the third is written down as undocumented rather than quietly asserted.",
    rules: [
      {
        label: "1. The vendor said it, in its own documentation",
        body: "The evidence has to be a page the vendor publishes about its own product: a docs site, a manual, a reference. A conference talk, a changelog entry in someone else's repository, a third-party blog post, or a GitHub issue does not qualify. This is the rule that separates the eleven from the rest, and it is deliberately strict, because the interesting failure mode on this topic is a claim that circulates without a source.",
      },
      {
        label: "2. The documentation states that the client reads SKILL.md",
        body: "Naming the Agent Skills standard is not enough on its own, and neither is having a feature called skills. The page has to describe reading a SKILL.md file, or reading the Agent Skills format, as something the product does. One client in the documented group, GitHub Copilot, never writes the string SKILL.md on its concept page, and that is recorded on its row rather than smoothed over.",
      },
      {
        label: "3. We fetched the page on August 20, 2026",
        body: "Every source in the list below was requested on that date and read. Where a URL redirected, the destination is what we read and what we cite. Where a URL returned a 404, that is reported instead of being replaced with a guess. Two links published on the client showcase itself did not resolve to what they claimed, and both are named in the notes rather than silently corrected.",
      },
      {
        label: "4. Only directories the vendor names are listed",
        body: "The directory column repeats the paths the documentation prints. It does not include a path because a user reported it works, because the product is built on something that reads that path, or because it would be reasonable. If a client is widely believed to read a directory and its documentation does not say so, that gap goes in the section on what is not documented.",
      },
      {
        label: "5. Silence is recorded as silence",
        body: "Undocumented is not the same as unsupported. When a vendor page says nothing about a behavior, this page says the page says nothing. It does not infer the answer from the source code, from another product by the same vendor, or from the specification. The specification describes a format, not an obligation, and no client is bound to implement all of it.",
      },
    ],
    notes: [
      "Popularity is not a criterion. Neither is install count, star count, or how often a product is mentioned in a discussion. None of those are evidence that a file gets read, and all of them are easier to find than the thing that matters.",
      "The showcase matrix further down uses a weaker bar on purpose, and says so in its own heading. Those thirty-six rows record that a product self-nominated to a public list and whether that listing carries a setup link. They are a starting point for your own check, not a substitute for one.",
    ],
    link: {
      lead: "For what the format itself defines, rather than who reads it, see",
      label: "our page on the Agent Skills standard",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: ["agentskills-spec", "agentskills-clients"],
  },
  documented: {
    title: "Clients whose own documentation states they read SKILL.md",
    intro:
      "Eleven entries, each backed by a first-party page fetched on August 20, 2026 and listed in the sources at the foot of this page. The directory column prints only the paths that documentation names.",
    columns: ["Client", "What the vendor documents", "Documented skill locations"],
    rows: [
      {
        label: "Claude Code",
        cells: [
          "The skills page opens by stating that Claude Code skills follow the Agent Skills open standard, which works across multiple AI tools, and that Claude Code extends the standard with additional features. It documents a precedence order across enterprise, personal, and project levels, plugin skills under a plugin-name namespace, and live detection when a SKILL.md file changes on disk.",
          "~/.claude/skills/, .claude/skills/ in the start directory and every parent up to the repository root, plugin skills/, and an enterprise managed-settings path",
        ],
      },
      {
        label: "Claude apps and the Claude API",
        cells: [
          "Anthropic's overview names three surfaces where skills work: the Claude API, Claude Code, and claude.ai. API skills are referenced by a skill identifier or uploaded through the Skills API and run inside the code execution container. The same page states that custom skills do not sync across surfaces, which is the detail most teams get wrong.",
          "No filesystem path outside Claude Code. Zip upload through settings on claude.ai, and the /v1/skills endpoints on the API",
        ],
      },
      {
        label: "Claude Cowork",
        cells: [
          "Documented on the Claude Code skills page rather than a page of its own. It states that Cowork sessions do not read the personal skills directory on your machine, and that both interactive and scheduled Cowork sessions load the skills enabled for your claude.ai account, synced at the start of the session.",
          "Skills enabled for the claude.ai account, managed from Customize in the desktop app sidebar or from the skills settings on claude.ai",
        ],
      },
      {
        label: "Codex",
        cells: [
          "OpenAI documents that a skill is a directory with a SKILL.md file that must include name and description, that skills build on the open agent skills standard, and that Codex loads the full instructions only when it decides to use a skill. Availability is stated as the Codex CLI, the IDE extension, and the Codex app.",
          ".agents/skills scanned from the working directory up to the repository root, $HOME/.agents/skills, /etc/codex/skills, and skills bundled by OpenAI",
        ],
      },
      {
        label: "Cursor",
        cells: [
          "Cursor calls Agent Skills an open standard twice on the page and links the specification. It walks a skills root recursively and picks up any SKILL.md it finds, scopes skills in nested project directories to files inside that directory, and is the only documented client that names another vendor's directories as a compatibility feature in both directions.",
          ".agents/skills/, .cursor/skills/, ~/.agents/skills/, ~/.cursor/skills/, plus .claude/skills/, .codex/skills/, ~/.claude/skills/, and ~/.codex/skills/ for compatibility",
        ],
      },
      {
        label: "GitHub Copilot",
        cells: [
          "GitHub's concept page calls the Agent Skills specification an open standard used by a range of different AI systems, and lists the surfaces: the Copilot cloud agent, Copilot code review, the Copilot CLI, the Copilot app, and agent mode in Visual Studio Code and JetBrains IDEs. The page never writes the string SKILL.md, which is why the VS Code row exists separately.",
          "Project: .github/skills, .claude/skills, .agents/skills. Personal: ~/.copilot/skills, ~/.agents/skills",
        ],
      },
      {
        label: "VS Code",
        cells: [
          "The VS Code documentation is where the concrete rules live for the Copilot family. It states that skills are stored in directories with a SKILL.md file, links the specification directly, and adds a setting for extra project skill locations plus an extension contribution point that registers a skill from an extension.",
          "Project: .github/skills/, .claude/skills/, .agents/skills/. Personal: ~/.copilot/skills/, ~/.claude/skills/, ~/.agents/skills/",
        ],
      },
      {
        label: "Gemini CLI",
        cells: [
          "Gemini CLI describes a skill as a self-contained directory based on the Agent Skills open standard. It adds a consent step the specification does not define: a confirmation prompt naming the skill, its purpose, and the directory path it will gain access to, shown before the skill activates.",
          "~/.gemini/skills/ with the ~/.agents/skills/ alias, and .gemini/skills/ with the .agents/skills/ alias. Within a tier the neutral alias takes precedence",
        ],
      },
      {
        label: "OpenCode",
        cells: [
          "OpenCode documents SKILL.md definitions loaded on demand through a native skill tool, and publishes a closed frontmatter allowlist of name, description, license, compatibility, and metadata, with unknown fields ignored. It adds an allow, deny, or ask permission model per skill that the specification does not define.",
          ".opencode/skills/, ~/.config/opencode/skills/, .claude/skills/, ~/.claude/skills/, .agents/skills/, ~/.agents/skills/",
        ],
      },
      {
        label: "goose",
        cells: [
          "goose documents placing a SKILL.md file inside a named subdirectory, and describes its skills as compatible with Claude Desktop and other agents that support Agent Skills rather than claiming to implement the standard. Skills arrive through a Skills platform extension enabled by default, not through the core agent.",
          "~/.agents/skills/, .agents/skills/, and plugin directories, with .goose/skills/, .claude/skills/, and ~/.claude/skills/ kept for backward compatibility",
        ],
      },
      {
        label: "Amp",
        cells: [
          "Amp's manual documents a directory containing a SKILL.md file with YAML frontmatter, and that name and description stay visible to the model while the rest of the file loads only on invocation. It never uses the words standard or specification, and calls the Claude paths Claude-compatible locations. A setting turns those paths off.",
          "~/.config/agents/skills/, ~/.agents/skills/, ~/.config/amp/skills/, .agents/skills/ and .claude/skills/ in the project and parent directories, ~/.claude/skills/, a plugin cache, and configured search paths",
        ],
      },
    ],
    notes: [
      "Read the middle column and the pattern is clear: every one of the eleven loads name and description first and the body later, and after that they stop agreeing. Three add a permission or consent step. Two publish a closed list of frontmatter fields. Four add frontmatter fields of their own that no other client is documented to act on, named one by one in the compatibility gaps below. One delivers the whole feature through an optional extension.",
      "Two of the eleven are not agents at all in the ordinary sense. The Claude API row describes skills that run inside a code execution container and are referenced by an identifier, and the Cowork row describes skills that arrive by account sync. Neither reads a folder you can commit to a repository, which matters if your plan for distributing a skill is a git repository.",
      "The Claude row and the Claude Code row are separate for a reason the vendor documentation states outright: custom skills do not sync across Anthropic's own surfaces. A skill uploaded on claude.ai is not present in Claude Code, and a skill in a project directory is not present in a claude.ai conversation.",
    ],
    link: {
      lead: "The Claude Code side of this row has a page of its own in",
      label: "our explainer on Claude skills",
      href: claudeSkillsPath,
      trail: ", including the format and the install paths.",
    },
    sourceIds: [
      "claude-code-skills",
      "anthropic-skills-overview",
      "codex-skills",
      "cursor-skills",
      "github-copilot-skills",
      "vscode-skills",
      "gemini-cli-skills",
      "opencode-skills",
      "goose-skills",
      "amp-manual",
    ],
  },
  showcase: {
    title: "Listed on the client showcase, not read by us today",
    intro:
      "The Agent Skills client showcase carried forty-six entries on August 20, 2026. Ten of them are covered in the matrix above. These are the other thirty-six, in the order the showcase publishes them. A row here means the product appears on that page and, in all but one case, links its own setup instructions. It does not mean we opened those instructions.",
    columns: ["Client", "How the showcase describes it", "Setup instructions"],
    rows: [
      { label: "Junie", cells: ["An LLM-agnostic coding agent built on the IntelliJ Platform", "Linked"] },
      { label: "ZeroClaw", cells: ["An open-source, Rust-first agent runtime for local personal agents", "Linked"] },
      { label: "Autohand Code CLI", cells: ["An autonomous coding agent that runs in the terminal", "Linked"] },
      { label: "OpenHands", cells: ["An open platform for cloud coding agents", "Linked"] },
      { label: "Mux", cells: ["Parallel coding agents, each in an isolated workspace", "Linked"] },
      { label: "Letta", cells: ["A platform for stateful agents with long-lived memory", "Linked"] },
      { label: "Firebender", cells: ["An Android-native coding agent that tests in the emulator", "Linked"] },
      { label: "Piebald", cells: ["A desktop and web app for agentic development", "None listed"] },
      { label: "Factory", cells: ["An AI-native development platform spanning IDE to CI/CD", "Linked"] },
      { label: "pi", cells: ["A minimal terminal coding harness", "Linked"] },
      { label: "Databricks Genie Code", cells: ["An agent purpose-built for data work in Databricks", "Linked"] },
      { label: "Agentman", cells: ["An agentic healthcare platform for revenue cycle workflows", "Linked"] },
      { label: "TRAE", cells: ["An adaptive AI IDE", "Linked"] },
      { label: "Spring AI", cells: ["A framework for adding AI functionality to Spring applications", "Linked"] },
      { label: "Roo Code", cells: ["A multi-agent coding extension for the editor", "Linked"] },
      { label: "Mistral AI Vibe", cells: ["A command-line coding assistant powered by Mistral models", "Linked"] },
      { label: "Command Code", cells: ["A coding agent that adapts to a developer's coding taste", "Linked"] },
      { label: "Ona", cells: ["A platform for background agents running in the cloud", "Linked"] },
      { label: "VT Code", cells: ["An open-source coding agent with multi-provider failover", "Linked"] },
      { label: "Qodo", cells: ["An agentic code integrity platform for review and testing", "Linked"] },
      { label: "Laravel Boost", cells: ["Guidelines and skills for AI-assisted Laravel development", "Linked"] },
      { label: "Emdash", cells: ["A desktop app running parallel agents in git worktrees", "Linked"] },
      { label: "Snowflake Cortex Code", cells: ["An agent integrated into the Snowflake platform", "Linked"] },
      { label: "Kiro", cells: ["An agent built around spec-driven development", "Linked"] },
      { label: "Workshop", cells: ["A cross-platform coding agent as desktop, web, and CLI", "Linked"] },
      { label: "Google AI Edge Gallery", cells: ["An app for running open models on a mobile device", "Linked"] },
      { label: "nanobot", cells: ["A lightweight personal agent for terminal and messaging platforms", "Linked"] },
      { label: "fast-agent", cells: ["A framework for building and evaluating agents", "Linked"] },
      { label: "bub", cells: ["A hook-first Python framework for channel-native agents", "Linked"] },
      { label: "Tabnine", cells: ["An AI engineering platform with agentic workflows", "Linked"] },
      { label: "Vita", cells: ["Autonomous digital workers running on virtual desktops", "Linked"] },
      { label: "Superconductor", cells: ["A multiplayer workspace for a team and its coding agents", "Linked"] },
      { label: "Deep Code", cells: ["An open-source terminal assistant for DeepSeek models", "Linked"] },
      { label: "Pulumi Neo", cells: ["An agent that manages cloud infrastructure with Pulumi", "Linked"] },
      { label: "Hermes Agent", cells: ["A personal agent across CLI, desktop, and messaging platforms", "Linked"] },
      { label: "OpenClaw", cells: ["An open-source personal assistant that runs locally", "Linked"] },
    ],
    notes: [
      "Thirty-five of these thirty-six publish a setup link. Piebald is the one entry on the whole showcase with no instructions URL and no source repository, so there is nothing to check even at this weaker level of evidence.",
      "The showcase is a self-nomination list. A product is on it because someone submitted it, and the page carries no test result, no version claim, and no date for any entry. That is not a criticism of the list, which is useful for discovery, but it is the reason these rows sit in their own matrix instead of the one above.",
      "Two showcase links did not resolve to what the entry claimed when we followed them on August 20, 2026. The goose entry points at a documentation URL that returns a 404, because the project has moved to a new documentation domain under new stewardship. The Cursor entry points at a path that redirects to a different one. Both are minor, and both are the reason a link on a directory page is not the same evidence as a page you opened.",
    ],
    link: {
      lead: "If you are picking a skill rather than a client, the selection criteria are on",
      label: "our register of Claude skills",
      href: bestClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["agentskills-clients", "goose-skills", "cursor-skills"],
  },
  paths: {
    title: "Which directory reaches which clients",
    intro:
      "Support is decided in practice by where a file sits, not by whether a logo appears on a list. This table inverts the matrix above: each row is a directory, and the clients named are the ones whose documentation prints that path. Only the eleven documented clients are counted here.",
    columns: ["Directory", "Documented by", "What that means"],
    rows: [
      {
        label: ".agents/skills/",
        cells: [
          "Codex, Cursor, Gemini CLI as an alias, OpenCode, goose, Amp, GitHub Copilot, VS Code",
          "Eight of the eleven, and the single most widely documented project directory. It is the only repository path OpenAI's Codex documentation lists, and goose calls it the recommended standard location. Claude Code's documentation never mentions it.",
        ],
      },
      {
        label: "~/.agents/skills/",
        cells: [
          "Codex, Cursor, Gemini CLI as an alias, OpenCode, goose, Amp, GitHub Copilot, VS Code",
          "The user-level counterpart, documented by the same eight. A personal skill placed here is visible to more documented clients than one placed anywhere else on the machine.",
        ],
      },
      {
        label: ".claude/skills/",
        cells: [
          "Claude Code, Cursor, OpenCode, GitHub Copilot, VS Code, goose, Amp",
          "Seven of the eleven, but only Claude Code treats it as its own. Cursor and OpenCode call it compatibility, goose calls it backward compatibility, and Amp calls it a Claude-compatible location and offers a setting that turns it off.",
        ],
      },
      {
        label: "~/.claude/skills/",
        cells: [
          "Claude Code, Cursor, OpenCode, VS Code, goose, Amp",
          "Six of the eleven. GitHub's own concept page lists ~/.copilot/skills and ~/.agents/skills for personal skills and does not include this one, while the VS Code page does. The two Copilot pages differ on this row.",
        ],
      },
      {
        label: ".codex/skills/ and ~/.codex/skills/",
        cells: [
          "Cursor only",
          "Cursor documents reading both for compatibility. OpenAI's Codex documentation does not list either as a scan location, and names only the neutral, home, admin, and bundled locations. Whether Codex reads its own namespaced directory is not something its documentation answers.",
        ],
      },
      {
        label: "Vendor-native project directories",
        cells: [
          ".cursor/skills/, .opencode/skills/, .gemini/skills/, .github/skills/, .goose/skills/",
          "One client each, by definition. Useful when a skill is meant for one tool and would be noise in another, and a poor choice for anything a mixed team is supposed to share.",
        ],
      },
      {
        label: "Administrative and managed locations",
        cells: [
          "Claude Code managed settings, /etc/codex/skills",
          "Two of the eleven document a path an administrator controls rather than a developer. Both sit above the personal and project levels in their own precedence rules.",
        ],
      },
      {
        label: "No filesystem path at all",
        cells: [
          "claude.ai, the Claude API, Claude Cowork",
          "Three surfaces, across two of the eleven rows, never read a folder on your machine. Skills arrive by zip upload, by an API endpoint, or by account sync at the start of a session. A git repository is not a distribution channel for these three.",
        ],
      },
    ],
    notes: [
      "The practical reading of this table is that .agents/skills and ~/.claude/skills between them cover every documented client that reads a filesystem at all, and neither one covers all of them alone. A repository that wants both audiences commits one and points the other at it, which several of these clients support through symlinks that their documentation mentions.",
      "None of this is a guarantee that the same file behaves identically once it is found. The directory determines discovery. What happens after discovery depends on frontmatter handling, permission models, and context budgets, which vary and which the next section covers.",
    ],
    link: {
      lead: "The working version of this, for a team that runs more than one agent, is",
      label: "our guide to managing skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "codex-skills",
      "cursor-skills",
      "gemini-cli-skills",
      "opencode-skills",
      "goose-skills",
      "amp-manual",
      "github-copilot-skills",
      "vscode-skills",
    ],
  },
  notDocumented: {
    title: "What is not documented",
    intro:
      "Seven things this page cannot tell you, because no vendor publishes them. Each one is a place where a compatibility claim usually gets invented, so each one is stated as a gap instead.",
    entries: [
      {
        title: "No client publishes a conformance result",
        body: "There is no certification, no badge, and no published test run showing that a given client handles the format correctly. The specification links a reference library that validates a skill file, which checks the file rather than the client reading it. No documented client states which version of the specification it implements, and the specification does not carry a version number that a client could cite.",
      },
      {
        title: "Whether Codex reads its own namespaced directory",
        body: "Cursor documents reading .codex/skills and ~/.codex/skills for compatibility. OpenAI's own skills documentation lists the neutral project path, the home path, an admin path, and bundled skills, and does not mention either .codex directory as a scan location. That is a silence, not a denial, and this page does not resolve it in either direction.",
      },
      {
        title: "What a client does with a frontmatter field it does not recognize",
        body: "One documented client, OpenCode, states outright that unknown frontmatter fields are ignored. The others say nothing. Claude Code documents that fields outside the six spec fields cause a hard error when a skill is packaged or uploaded through other Anthropic paths, but that is a packaging rule rather than a statement about how another vendor's agent will read the same file.",
      },
      {
        title: "How vendor-specific fields behave elsewhere",
        body: "Several documented clients add fields of their own. Claude Code documents a long list including model, effort, and hooks. VS Code documents an experimental field that runs a skill in a subagent. Amp documents a field that declares MCP servers. Cursor documents fields for path scoping and display. No vendor documents what happens when another vendor's agent encounters those fields.",
      },
      {
        title: "Whether a skill produces the same result in two clients",
        body: "Discovery is documented. Behavior after discovery is not. Context budgets for the skill listing differ and two clients publish specific numbers that do not match. Permission models differ, from a per-activation consent prompt to no approval step at all. Nobody publishes a comparison, so a skill that works well in one client is evidence about that client only.",
      },
      {
        title: "How the showcase list is maintained",
        body: "The client showcase does not publish an inclusion policy, a review step, a date for any entry, or a removal process. Forty-six entries appeared on August 20, 2026, and the count on any other date is a different fact. One entry carries no setup link at all, and at least one setup link no longer resolves, which suggests entries are not revalidated on a schedule.",
      },
      {
        title: "What support means for the three surfaces without a filesystem",
        body: "claude.ai, the Claude API, and Claude Cowork all support skills according to Anthropic's own documentation, and none of them read a project directory. The documentation states that custom skills do not sync across surfaces, so a team using both Claude Code and Cowork maintains the same skill in two places. No vendor documents a supported way to keep those two copies aligned.",
      },
    ],
    sourceIds: [
      "agentskills-spec",
      "agentskills-clients",
      "claude-code-skills",
      "anthropic-skills-overview",
      "codex-skills",
      "cursor-skills",
      "opencode-skills",
      "vscode-skills",
      "amp-manual",
    ],
  },
  team: {
    title: "What a team does with this",
    intro:
      "A matrix is only useful if it changes a decision. For most teams it changes two: where the canonical file lives, and how a teammate on a different client finds out that the recommendation exists.",
    body: [
      "The first decision is the cheap one. Put the canonical SKILL.md in .agents/skills in the repository, because eight of the eleven documented clients scan it, and add whatever second path your Claude Code users need. That is a five-minute change and it removes most of the per-teammate friction.",
      "The second decision is the one that actually costs something. Directories solve discovery for a repository somebody has already cloned. They do nothing for the teammate who has not, for the person on Cowork whose skills arrive by account sync, or for the colleague who asks in chat which skill to use for a task and gets a link that will be scrolled away by Thursday.",
      "Skills Board is a web application where a team keeps and shares the AI skills it recommends. Each saved entry keeps its original source visible, and a teammate chooses how to use it: open the repository, copy an install command that suits their client, or download the latest files as a ZIP. That last option is what makes it usable by the three surfaces above that never read a folder.",
    ],
    options: [
      {
        label: "Open the source",
        body: "The repository the skill actually comes from, so a teammate can read the SKILL.md before running anything. This is the path for the technical reviewer who wants to see the file, not a summary of it.",
      },
      {
        label: "Copy an install command",
        body: "A command that fits the client the teammate is running, without assuming everyone on the team uses the same one. Nothing here certifies that the skill behaves identically across clients, and this page is the reason that caveat exists.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files from the source at download time. This is the route for the surfaces with no filesystem to commit to, where a skill arrives as an upload rather than as a folder in a repository.",
      },
      {
        label: "Search from a connected agent",
        body: "An MCP-compatible client can search the team's saved skills and retrieve an install command in the session, so the answer to which skill to use arrives where the question was asked.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation. It is not a security review, an approval, or a compatibility certification, and nothing on this page turns a documented directory into a guarantee that a skill runs correctly.",
      "Skills Board points at the latest version available from the saved source. It does not pin or preserve historical versions, so a skill that changes upstream changes for everyone who opens it next.",
      "A ZIP contains the latest files from the source at download time. It does not guarantee installation in every client, and the frontmatter differences in the section above are exactly why that guarantee cannot be made.",
    ],
    link: {
      lead: "The step before this one, choosing what to recommend at all, is covered in",
      label: "our guide to sharing AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["codex-skills", "cursor-skills", "claude-code-skills"],
  },
  faq: [
    {
      question: "Which AI agents support Agent Skills today?",
      answer:
        "Eleven clients document reading a SKILL.md file in their own published documentation: Claude Code, the Claude apps and API, Claude Cowork, Codex, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenCode, goose, and Amp. A further thirty-six products appeared on the Agent Skills client showcase on August 20, 2026 without being checked here.",
    },
    {
      question: "What counts as agent skills support on this page?",
      answer:
        "Support means the vendor's own documentation states that its client reads SKILL.md or the Agent Skills format, and that we fetched and read that page on August 20, 2026. A blog post, a talk, or an entry on a directory list does not qualify. Undocumented behavior is recorded as undocumented rather than assumed.",
    },
    {
      question: "Does every client on the showcase read a SKILL.md file the same way?",
      answer:
        "No, and no vendor claims it does. Every documented client loads name and description first and the body later, then they diverge on directories, extra frontmatter fields, consent prompts, and context budgets. There is no published conformance test, so a skill that works in one client is evidence about that client only.",
    },
    {
      question: "Will one SKILL.md work in Claude Code, Codex, and Cursor unchanged?",
      answer:
        "The required parts travel. All three document reading a directory with a SKILL.md file whose frontmatter carries name and description. What does not travel is the vendor-specific frontmatter, and the location: Codex documents only the neutral path, Claude Code documents only its own, and Cursor documents both plus its own.",
    },
    {
      question: "Which directory gives a skill the widest client support?",
      answer:
        "The vendor-neutral one. Eight of the eleven documented clients name .agents/skills in a project and the matching path in a home directory, which is more than any other location reaches. Claude Code is the significant exception, since its documentation lists only its own directories and never mentions the neutral path.",
    },
    {
      question: "Do the Claude apps support skills the same way Claude Code does?",
      answer:
        "No. Anthropic documents three surfaces, and only Claude Code reads skills from the filesystem. On claude.ai a skill is uploaded as a zip in settings, and through the API it is referenced by identifier or uploaded through the Skills API. The same documentation states that custom skills do not sync across surfaces.",
    },
    {
      question: "Does GitHub Copilot support agent skills in VS Code?",
      answer:
        "Both vendors document it. GitHub lists agent mode in Visual Studio Code among the supported surfaces, and the VS Code documentation states that skills are stored in directories with a SKILL.md file. The two pages differ slightly on personal directories, so the VS Code page is the more specific source for a developer.",
    },
    {
      question: "What happens to a frontmatter field a skill's client does not support?",
      answer:
        "Mostly undocumented. OpenCode is the one documented client that states unknown fields are ignored. Claude Code documents that fields outside the six specification fields cause a hard error when a skill is packaged or uploaded through other Anthropic paths, which is a packaging rule rather than a cross-client guarantee.",
    },
  ],
  sources: [
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The required directory shape, the six frontmatter fields and their constraints, the progressive disclosure stages, and the reference library that validates a skill file.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: overview",
      href: "https://agentskills.io",
      note: "The format described as an open standard originally developed by Anthropic and released for the wider ecosystem, with the three-stage discovery, activation, and execution model.",
    },
    {
      id: "agentskills-clients",
      label: "Agent Skills: client showcase",
      href: "https://agentskills.io/clients",
      note: "The self-nomination list of agent products that support the format. Forty-six entries when fetched on August 20, 2026, forty-five of them carrying a setup instructions link.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The enterprise, personal, project, and plugin locations, the precedence order, the frontmatter fields Claude Code adds beyond the specification, and the statement that Cowork sessions load skills synced from the claude.ai account.",
    },
    {
      id: "anthropic-skills-overview",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The three surfaces where skills work, the Skills API endpoints and the code execution requirement, the zip upload path on claude.ai, and the statement that custom skills do not sync across surfaces.",
    },
    {
      id: "codex-skills",
      label: "OpenAI: skills for Codex",
      href: "https://developers.openai.com/codex/skills",
      note: "The scan locations from the working directory up to the repository root, the home, admin, and bundled locations, the surfaces where skills are available, and the published budget for the initial skill listing.",
    },
    {
      id: "cursor-skills",
      label: "Cursor: skills",
      href: "https://cursor.com/docs/skills",
      note: "The four native directories, the four compatibility directories belonging to Claude and Codex, the recursive discovery of nested skills, and the frontmatter fields Cursor documents.",
    },
    {
      id: "github-copilot-skills",
      label: "GitHub: about agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "The project and personal directories, and the list of Copilot surfaces where agent skills apply. The page describes the specification as an open standard and never writes the file name itself.",
    },
    {
      id: "vscode-skills",
      label: "Visual Studio Code: agent skills",
      href: "https://code.visualstudio.com/docs/agent-customization/agent-skills",
      note: "The project and personal directory tables, the setting for additional skill locations, the extension contribution point, and the frontmatter fields VS Code adds beyond the specification.",
    },
    {
      id: "gemini-cli-skills",
      label: "Gemini CLI: skills",
      href: "https://geminicli.com/docs/cli/skills",
      note: "The four discovery tiers with the neutral alias taking precedence inside a tier, and the consent prompt shown before a skill activates, which the specification does not define.",
    },
    {
      id: "opencode-skills",
      label: "OpenCode: agent skills",
      href: "https://opencode.ai/docs/skills",
      note: "The six discovery paths, the closed frontmatter allowlist with unknown fields ignored, and the per-skill allow, deny, or ask permission model.",
    },
    {
      id: "goose-skills",
      label: "goose: using skills",
      href: "https://goose-docs.ai/docs/guides/context-engineering/using-skills",
      note: "The recommended neutral locations, the backward-compatible Claude and goose directories, and the Skills platform extension that provides the feature. The URL published on the client showcase returns a 404 and this is where it now lives.",
    },
    {
      id: "amp-manual",
      label: "Amp: owner's manual",
      href: "https://ampcode.com/manual",
      note: "The eleven-entry precedence list, the setting that disables the Claude-compatible locations, and the two frontmatter fields Amp adds. The manual makes no conformance claim to the specification.",
    },
  ],
  related: [
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, and what a skill folder contains before any client reads it.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "The client with the widest documented directory list, covered directory by directory.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The neutral .agents/skills path in detail, and what a Claude skill keeps when Codex reads it.",
    },
    {
      label: "Claude Cowork skills",
      href: coworkSkillsPath,
      description:
        "One of the three surfaces with no filesystem, and how a skill reaches a session there.",
    },
    {
      label: "AGENTS.md vs SKILL.md",
      href: agentsMdVsSkillMdPath,
      description:
        "The other cross-agent file, what it is for, and which of these clients read which one.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical file, and a tested install path per client instead of an assumed one.",
    },
  ],
  og: {
    eyebrow: "Agent Skills Support",
    title: [
      { text: "Eleven clients document it." },
      { text: "Forty-six are on the list.", accent: true },
    ],
    description:
      "Which AI agents read SKILL.md, the directories each vendor names, and the behavior nobody has documented.",
    contextLabel: "skillsboard.sh/agent-skills-support",
    chips: ["SKILL.md", ".agents/skills", "Checked 2026-08-20"],
  },
  ogAlt:
    "Compatibility matrix for the Agent Skills format: the clients whose documentation states they read SKILL.md, and the directories each one names.",
  publishedAt: "2026-08-20",
  modifiedAt: "2026-08-20",
}
