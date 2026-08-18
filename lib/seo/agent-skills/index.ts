import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
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
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  agentSkillsPath,
  type AgentSkillsCtaPlacement,
  type AgentSkillsPath,
} from "@/lib/seo/agent-skills/types"

export interface AgentSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface AgentSkillsFaqEntry {
  question: string
  answer: string
}

export interface AgentSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export type AgentSkillsInlineLink = GuideInlineLink

export interface AgentSkillsTableSection {
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

/** A named place, with what it is and what you get from reading it. */
export interface AgentSkillsPlaceSection {
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

export interface AgentSkillsDefinition {
  path: typeof agentSkillsPath
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
  format: AgentSkillsTableSection & { tree: string; link: AgentSkillsInlineLink }
  loading: AgentSkillsTableSection
  support: AgentSkillsTableSection & { link: AgentSkillsInlineLink }
  portability: AgentSkillsTableSection & { link: AgentSkillsInlineLink }
  examples: AgentSkillsPlaceSection
  governance: AgentSkillsPlaceSection
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: AgentSkillsInlineLink
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
  faq: readonly AgentSkillsFaqEntry[]
  sources: readonly AgentSkillsSource[]
  related: readonly AgentSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const agentSkills: AgentSkillsDefinition = {
  path: agentSkillsPath,
  contentType: "article",
  topics: [
    "agent skills",
    "open standard",
    "specification",
    "cross-agent compatibility",
  ],
  relatedGuidePaths: [
    claudeSkillsPath,
    codexSkillsPath,
    cursorSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "Agent Skills",
  title: "Agent Skills: the open standard for extending AI agents",
  seoTitle:
    "Agent Skills: The Open Standard for Extending AI Agents | Skills Board",
  description:
    "What AI agent skills are, what the Agent Skills specification defines, which agents implement it and where each one looks on disk, what actually travels between them, and where to read real examples. Every claim checked against first-party documentation.",
  intro: [
    "An Agent Skill is a folder with a SKILL.md file in it. The file carries YAML frontmatter with a name and a description, and a Markdown body with instructions the agent follows once it decides the skill applies. That is the whole format. Everything else in this space, the scripts folder, the references folder, the install commands, the directories each product scans, is either an optional convention or a product decision layered on top.",
    "The reason the format matters is that it is not one vendor's feature. Anthropic wrote it, released it as an open standard, and other agent products adopted it rather than inventing their own. On the day this page was checked, the standard's own client showcase listed forty-six products, including Claude Code, ChatGPT and Codex, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenHands, Goose, and Amp.",
    "That adoption is real, and it is also narrower than it sounds. The specification defines what goes inside a skill folder. It does not define where the folder lives, how a client resolves a name collision, or what a client must do with a frontmatter field it has never seen. Those are the parts that break when a skill moves between two agents, so this page separates the part that is specified from the part that is convention, and says which is which.",
  ],
  answer:
    "Agent Skills is an open standard for extending an AI agent with procedural knowledge. A skill is a directory containing a SKILL.md file: YAML frontmatter with a required name and description, plus optional license, compatibility, metadata, and allowed-tools fields, followed by Markdown instructions. Agents load the metadata at startup and the instructions only when a task matches. The format was developed by Anthropic and released as an open standard.",
  answerNotes: [
    "The mechanism that makes this useful is progressive disclosure, and it is the one behavior every implementation shares. At startup the agent reads only each skill's name and description, roughly fifty to a hundred tokens apiece. When a task matches a description, it loads the full SKILL.md body, which the specification recommends keeping under five thousand tokens and under five hundred lines. Bundled scripts, references, and assets load only when the instructions point at them.",
    "That three-tier loading is why a team can keep dozens of skills installed without paying for them in context. It is also why the description field carries more weight than anything else in the file: it is the only text the model sees before it decides, so a vague description means a skill that never triggers, and an overbroad one means a skill that triggers on the wrong task.",
    "The word skill is doing double duty in the market, which is worth naming once. This page is about the file format and the standard behind it. It is not about the sales-skills or call-center sense of the phrase, and it is not a synonym for a tool, an MCP server, or a subagent. A skill is instructions the agent reads; those other things are capabilities the agent calls.",
  ],
  answerSourceIds: [
    "agentskills-home",
    "agentskills-spec",
    "agentskills-implementation",
  ],
  format: {
    title: "What the specification actually defines",
    intro:
      "Six frontmatter fields, two of them required, and a set of directory conventions. That is the entire normative surface. Read the constraints column carefully, because most cross-agent failures are a name or a key that one client tolerates and another rejects.",
    columns: ["Field", "Required", "What the specification says"],
    rows: [
      {
        label: "name",
        cells: [
          "Yes",
          "One to sixty-four characters. Lowercase alphanumerics and hyphens only, no leading or trailing hyphen, no consecutive hyphens. Must match the parent directory name.",
        ],
      },
      {
        label: "description",
        cells: [
          "Yes",
          "One to 1,024 characters, non-empty. Should say both what the skill does and when to use it, and should include the keywords that help an agent match a task to it.",
        ],
      },
      {
        label: "license",
        cells: [
          "No",
          "A license name or a reference to a bundled license file. The specification recommends keeping it short.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "No",
          "Up to 500 characters describing environment requirements, such as the intended product, required system packages, or network access. Most skills do not need it.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "No",
          "A map from string keys to string values, for properties the standard does not define. The specification recommends unique key names to avoid collisions between clients.",
        ],
      },
      {
        label: "allowed-tools",
        cells: [
          "No",
          "A space-separated string of pre-approved tools. Marked experimental in the specification, with support that may vary between implementations.",
        ],
      },
    ],
    tree: `my-skill/
├── SKILL.md          # Required: frontmatter + instructions
├── scripts/          # Optional: executable code the agent can run
├── references/       # Optional: documentation loaded on demand
├── assets/           # Optional: templates and static resources
└── ...               # Any other files the skill needs`,
    notes: [
      "The body below the frontmatter has no format restrictions at all. The specification says to write whatever helps an agent perform the task, and recommends step-by-step instructions, example inputs and outputs, and common edge cases. It also recommends splitting a long SKILL.md into referenced files, because the whole body enters context the moment the skill activates.",
      "The three optional directories are conventions rather than requirements. Anything may live in a skill folder; scripts, references, and assets are simply the names the specification recommends for executable code, on-demand documentation, and static resources. The specification asks you to keep file references one level deep from SKILL.md and to avoid nested reference chains, so an agent does not have to follow a trail to find what it needs.",
      "There is a reference validator. The agentskills/agentskills repository ships a library called skills-ref, and running skills-ref validate against a skill folder checks that the frontmatter parses and that the naming conventions hold. It validates a file, not an agent, so it tells you your skill is well formed and nothing about whether a given product will load it.",
    ],
    link: {
      lead: "For the same format seen from inside one product, including the fields Claude Code adds on top of these six, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["agentskills-spec", "agentskills-repo"],
  },
  loading: {
    title: "How an agent loads a skill",
    intro:
      "Three tiers, in this order, in every documented implementation. The value of the format is almost entirely in the fact that tier two and tier three stay out of context until they are needed.",
    columns: ["Tier", "What enters context", "When"],
    rows: [
      {
        label: "1. Discovery",
        cells: [
          "The name and description of every installed skill, roughly fifty to a hundred tokens each.",
          "At session start. The agent now knows what exists without knowing how any of it works.",
        ],
      },
      {
        label: "2. Activation",
        cells: [
          "The full SKILL.md body. The specification recommends staying under five thousand tokens and five hundred lines.",
          "When the model matches a task to a description, or when a person invokes the skill explicitly.",
        ],
      },
      {
        label: "3. Execution",
        cells: [
          "Individual files from scripts, references, or assets, read one at a time.",
          "Only when the loaded instructions point at them.",
        ],
      },
    ],
    notes: [
      "Tier one is where the budgets bite, and every product handles the crowding differently. Codex caps the initial skill list at two percent of the model's context window, or eight thousand characters when the window is unknown, shortening descriptions first and omitting skills with a warning when the set is large. Claude Code truncates the combined description and when_to_use text at 1,536 characters per skill in its listing. Both are documented; neither is in the specification.",
      "Activation is a model decision in every implementation we checked, not a keyword rule in the harness. The client implementation guide is explicit that most implementations rely on the model's own judgment rather than harness-side trigger matching, which is why the guidance everywhere is to front-load the trigger case in the description rather than to tune something in the client.",
      "Explicit invocation exists alongside the automatic path in every product on this page. Claude Code and Cursor use a slash prefix, Codex uses a dollar prefix in the CLI and an at prefix in ChatGPT. The specification says nothing about invocation syntax, so this is a place where the same skill feels different in each tool even though the file is identical.",
    ],
    sourceIds: [
      "agentskills-spec",
      "agentskills-implementation",
      "codex-skills",
      "claude-code-skills",
      "cursor-skills",
    ],
  },
  support: {
    title: "Which agents implement it, and where each one looks",
    intro:
      "The specification does not say where a skill folder lives. Each client picks its own directories and publishes them, which is why the same skill is installed five different ways. The pattern to notice is the .agents/skills convention in the right column.",
    columns: ["Agent", "Project locations", "User locations"],
    rows: [
      {
        label: "Claude Code",
        cells: [
          ".claude/skills/, read from the working directory and every parent up to the repository root, plus nested .claude/skills/ folders that load the first time Claude touches a file in that subdirectory.",
          "~/.claude/skills/, plus plugin skills under a plugin-name:skill-name namespace and enterprise skills deployed through managed settings. The documentation does not list .agents/skills.",
        ],
      },
      {
        label: "ChatGPT and Codex",
        cells: [
          ".agents/skills, scanned in every directory from the working directory up to the repository root.",
          "$HOME/.agents/skills for the user scope, /etc/codex/skills for machine-wide admin skills, plus skills bundled with Codex by OpenAI.",
        ],
      },
      {
        label: "Cursor",
        cells: [
          ".agents/skills/ and .cursor/skills/, discovered recursively, including nested folders inside a monorepo, which are scoped to the files under them automatically.",
          "~/.agents/skills/ and ~/.cursor/skills/. For compatibility Cursor also loads .claude/skills/, .codex/skills/, ~/.claude/skills/, and ~/.codex/skills/.",
        ],
      },
      {
        label: "GitHub Copilot",
        cells: [
          ".github/skills, .claude/skills, or .agents/skills in the repository.",
          "~/.copilot/skills or ~/.agents/skills. Copilot documents skills for its cloud agent, code review, CLI, app, and agent mode in VS Code and JetBrains IDEs.",
        ],
      },
      {
        label: "Gemini CLI",
        cells: [
          ".gemini/skills/ or the .agents/skills/ alias, shared with the team through version control.",
          "~/.gemini/skills/ or the ~/.agents/skills/ alias. Within a tier the .agents path takes precedence over the product-specific one.",
        ],
      },
    ],
    notes: [
      "The .agents/skills convention is the closest thing to a cross-client answer, and it is worth being precise about its status. The client implementation guide calls it a widely adopted convention for cross-client sharing and recommends scanning it, while stating plainly that the specification does not mandate where skill directories live. Codex, Cursor, Copilot, and Gemini CLI all read it. Claude Code's skills documentation does not mention it.",
      "Collision handling is convention too, and here the recommendation is not the behavior. The client implementation guide tells implementers that project-level skills should override user-level skills, and calls that the universal convention across existing implementations, but two of the clients on this page document something else. Claude Code resolves it the other way: across levels, enterprise overrides personal, and personal overrides project, so a personal deploy skill wins over a project one with the same name. Codex does not merge same-named skills at all and lets both appear in the skill selectors. Cursor derives a skill's identity from the folder holding SKILL.md, not from any category folder above it. Read project-over-user as advice to implementers, and check the collision handling your own client documents before relying on it.",
      "Two products document a migration path from their older primitive into skills, which says something about where this is heading. Cursor ships a built-in /migrate-to-skills that converts dynamic rules and slash commands, giving converted commands disable-model-invocation so they still only run when typed. Anthropic went further and merged custom slash commands into skills in the documentation itself: a file in .claude/commands/ and a SKILL.md both produce /deploy, and when both exist the skill wins.",
    ],
    link: {
      lead: "For the per-product walkthrough of the directories in that middle column, including what changes when a teammate switches agents, see",
      label: "How to manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "codex-skills",
      "cursor-skills",
      "copilot-skills",
      "gemini-cli-skills",
      "agentskills-implementation",
    ],
  },
  portability: {
    title: "What travels between agents, and what stops",
    intro:
      "A skill is portable in the sense that any compliant client can read the file. It is not portable in the sense that every behavior survives the trip. This table is the difference, and it is the part most cross-agent surprises come from.",
    columns: ["What you wrote", "Does it travel", "Where it stops"],
    rows: [
      {
        label: "The Markdown body",
        cells: [
          "Yes. The specification puts no restrictions on it, so any client that loads the file gets your instructions verbatim.",
          "Body features a single product invented. Claude Code substitutes argument placeholders and injects the output of shell commands, and its documentation states those do not function in claude.ai chat or through the Claude API.",
        ],
      },
      {
        label: "name and description",
        cells: [
          "Yes. Every client in the table above reads both, and matches tasks against the description.",
          "Nowhere, but the budgets differ. A description that survives intact in one client can be shortened in another, so the trigger case belongs in the first sentence.",
        ],
      },
      {
        label: "The other four spec fields",
        cells: [
          "Partly. license, compatibility, metadata, and allowed-tools are in the specification, so a compliant client accepts them.",
          "Accepting is not acting. Claude Code documents that it accepts license and compatibility without acting on them, and allowed-tools is marked experimental in the specification itself.",
        ],
      },
      {
        label: "Product-specific frontmatter",
        cells: [
          "No. Claude Code documents roughly twenty fields, Cursor documents five, and Codex puts display and policy metadata in a separate agents/openai.yaml file rather than in the frontmatter.",
          "Hard, in one direction. Claude Code accepts every field it defines, but uploading a skill to claude.ai, the Skills API, or the packaging script with any non-spec key fails with an unexpected-key error rather than ignoring it.",
        ],
      },
      {
        label: "scripts/ and references/",
        cells: [
          "The layout does. The convention is the same everywhere, and the specification says supported script languages depend on the implementation.",
          "The runtime. Anthropic documents skills on the Claude API as having no network access and no runtime package installation, while Claude Code skills have the same network access as any program on your machine.",
        ],
      },
      {
        label: "Where the folder goes",
        cells: [
          "No. This is the one thing the specification explicitly does not define.",
          "Immediately. Five products, at least nine documented directories, and one convention that four of the five read.",
        ],
      },
    ],
    notes: [
      "The practical read is that a skill written to the six specified fields, with a self-contained body, moves cleanly. The moment it depends on a field or a body feature one product added, it becomes a skill for that product that happens to parse elsewhere. Claude Code's own documentation makes the same recommendation: restrict frontmatter to the spec's six fields and the unexpected-key error goes away.",
      "Surfaces inside a single vendor are not automatically connected either, which surprises people more than the cross-vendor gaps do. Anthropic documents that custom skills do not sync across surfaces: a skill uploaded to claude.ai is not available through the API, an API skill is not on claude.ai, and Claude Code skills are filesystem-based and separate from both. Sharing scope differs too, individual on claude.ai and workspace-wide on the API.",
    ],
    link: {
      lead: "For the neighboring question of which repository file each agent reads before any skill loads, see",
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      trail: ".",
    },
    sourceIds: [
      "agentskills-spec",
      "claude-code-skills",
      "platform-skills-overview",
      "cursor-skills",
      "codex-skills",
    ],
  },
  examples: {
    title: "Agent skills examples you can read today",
    intro:
      "The fastest way to understand the format is to read a few skills that shipped. These four sources publish the files themselves rather than a listing, so you can open a SKILL.md and see how much instruction a working skill actually carries.",
    entries: [
      {
        name: "anthropics/skills",
        href: "https://github.com/anthropics/skills",
        body: "Anthropic's public repository, holding nineteen skill folders on the day we checked, across creative work, engineering, and enterprise communication. Many are Apache 2.0. The docx, pdf, pptx, and xlsx skills behind Claude's document features are source-available rather than open source, and Anthropic publishes them as a reference for more complex skills. The repository also carries a skill template and a spec folder that now redirects to agentskills.io.",
      },
      {
        name: "openai/skills",
        href: "https://github.com/openai/skills",
        body: "OpenAI's repository of skills for ChatGPT and Codex, with thirty-nine curated skills on the day we checked, including deployment helpers, Figma workflows, Playwright drivers, security reviews, and a CI repair skill. Codex documents installing from it with the built-in skill-installer. Reading a few of these next to the Anthropic ones is the clearest illustration of how much house style the format leaves open.",
      },
      {
        name: "agentskills.io quickstart",
        href: "https://agentskills.io/skill-creation/quickstart",
        body: "The standard's own walkthrough for creating a first skill and seeing it run, alongside guidance pages on writing descriptions that trigger reliably, using scripts, and evaluating whether a skill actually improves output. If you are writing rather than reading, this is the shortest path from an empty folder to something an agent will pick up.",
      },
      {
        name: "Built-in skills in the products themselves",
        href: "https://cursor.com/docs/context/skills",
        body: "Several agents ship skills you can inspect as examples of the pattern at production scale. Cursor documents eighteen built-in skills, including ones that create hooks, rules, subagents, and other skills. Claude Code bundles a set of its own, such as /code-review, /debug, /loop, and /verify, and documents them as prompt-based skills rather than fixed logic.",
      },
    ],
    notes: [
      "Read before you install, in every case. Anthropic's guidance is to use skills only from sources you trust, because a skill hands an agent new instructions and executable code, and a malicious one can direct the agent to call tools in ways its stated purpose does not suggest. The client implementation guide makes the same point from the other side, suggesting clients gate project-level skills behind a workspace trust check so a freshly cloned repository cannot inject instructions silently.",
      "The examples also show where the format's ceiling is, and the ceiling is about what the format guarantees rather than what a folder can physically hold. Nothing in a skill is enforced: no runtime validates the instructions, and Markdown can describe an API contract perfectly well without exposing or enforcing a typed one the way a server's tool definitions do. Credentials are a recommendation, not a limit. A skill folder takes arbitrary files, so a secret pasted into one ships to everybody who installs it, which is why the advice is to keep secrets out rather than to assume the format keeps them out. What the format is good at is the thing a checklist is good at: making a procedure repeatable when the alternative is a paragraph somebody pastes from memory.",
    ],
    sourceIds: [
      "anthropic-skills-repo",
      "openai-skills-repo",
      "agentskills-home",
      "cursor-skills",
      "claude-code-skills",
      "platform-skills-overview",
      "agentskills-implementation",
    ],
  },
  governance: {
    title: "Who owns the standard, and what is still open",
    intro:
      "Open standard is a phrase that covers a wide range of arrangements, so here is the specific one. The format came from a vendor, moved to a neutral site with a public repository, and the interesting open work is happening next door in the Model Context Protocol community.",
    entries: [
      {
        name: "agentskills.io",
        href: "https://agentskills.io",
        body: "The standard's home: the specification, the skill-creation guides, a client showcase that listed forty-six products when we checked, and a guide for adding skills support to an agent. The site states that the format was originally developed by Anthropic, released as an open standard, adopted by a growing number of agent products, and is open to contributions from the broader ecosystem.",
      },
      {
        name: "agentskills/agentskills",
        href: "https://github.com/agentskills/agentskills",
        body: "The public repository behind that site, Apache 2.0 licensed, holding the documentation and the skills-ref reference library used to validate skill folders. Issues and pull requests are the contribution path, and the site also points at a Discord for discussion. The repository published no tags or releases as of the date at the top of this page.",
      },
      {
        name: "Skills Over MCP Working Group",
        href: "https://modelcontextprotocol.io/community/working-groups/skills-over-mcp",
        body: "A Model Context Protocol working group defining how skills are discovered, distributed, and consumed through MCP. It is co-led by a maintainer from Nordstrom and one from Anthropic, meets weekly, and lists participants from Google, Databricks, GitHub, AWS, Bloomberg, and elsewhere. Its charter names coordination with the Agent Skills spec on content format and well-known URI discovery.",
      },
      {
        name: "SEP-2640: Skills Extension",
        href: "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640",
        body: "The working group's current direction: an Extensions Track proposal defining a skill:// resource convention for serving Agent Skills over MCP, under the extension identifier io.modelcontextprotocol/skills. It was still an open pull request labeled draft when we checked, with reference implementations mentioned for the TypeScript SDK, several hosts, and the GitHub MCP server.",
      },
    ],
    notes: [
      "The distance between those last two entries and a shipped feature is the thing to hold onto. A working group charter and an open proposal are evidence that serving skills over a protocol is being worked on seriously by people from several companies. They are not evidence that you can rely on it today, and the charter itself lists client implementation mandates as out of scope, so even a ratified extension would document a pattern rather than require one.",
      "The governance gap that actually affects a skill author is smaller and more mundane. There is no version number on the specification and no release tag on its repository, so when a client says it supports Agent Skills, there is no revision identifier that claim could point at. In practice you check the client's own documentation for the fields it reads, which is the opposite of what a standard is supposed to spare you.",
    ],
    sourceIds: [
      "agentskills-home",
      "agentskills-repo",
      "agentskills-spec",
      "mcp-skills-wg",
      "mcp-sep-2640",
    ],
  },
  team: {
    title: "The part a standard cannot solve",
    intro:
      "A shared format means a teammate's skill will load in your agent. It says nothing about which skills your team decided to use, and that is the question people actually get stuck on.",
    body: [
      "Once the format stops being the obstacle, the obstacle becomes selection. There are tens of thousands of public skills across the repositories on this page and the directories that index them, and a team needs perhaps five: the ones somebody read, ran on a real task, and is willing to stand behind. That set is almost never written down anywhere a new teammate can find it.",
      "The surfaces do not carry it, because none of them was built to. A skill in .claude/skills/ or .agents/skills/ records nothing about who chose it or why. A skill uploaded to claude.ai belongs to one person, and Anthropic documents that claude.ai has no centralized admin management or org-wide distribution for custom skills. Through the API a skill is workspace-wide but arrives with no recommendation attached.",
      "So the recommendation ends up in a chat thread, and the next person starts over at a leaderboard. Skills Board is a shared library for that layer specifically: the smaller set of skills your team recommends, in one searchable place, with the original source visible on every entry and no assumption about which agent a teammate runs.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the GitHub repository and path it came from, so a teammate can read the SKILL.md and anything in scripts before placing it anywhere.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits. It is one option among several rather than the only path.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather drop the folder into a directory their agent already scans.",
      },
      {
        label: "Connect over MCP",
        body: "An authenticated MCP endpoint lets a compatible agent search the same team library and retrieve install commands, and with the write scope save skills and organize collections.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board is not a marketplace and does not host, rank, or distribute skills to the public. It points at the sources on this page.",
      "It follows the latest version available from the saved source, and does not pin or preserve historical versions.",
      "The MCP connection cannot install or run a skill inside an agent, and it cannot edit or delete saved team skills.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "For the ownership side of the same problem, one recommendation and a named owner per skill, see",
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["platform-skills-overview", "claude-code-skills"],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Five things people assume about this standard that no first-party source states. Each one is a gap we hit while checking, written out rather than filled in with a guess.",
    entries: [
      {
        title: "The specification carries no version and the repository no tags",
        body: "The specification page publishes no version identifier and no revision date, and the agentskills/agentskills repository listed no tags or releases when we checked. So there is no way to say which revision a client implements, or when a field's behavior last changed, from the standard alone.",
      },
      {
        title: "Where a skill folder lives is not part of the standard",
        body: "The client implementation guide says outright that the specification does not mandate where skill directories live, and that .agents/skills has emerged as a widely adopted convention rather than a requirement. No source publishes how many clients honor it, so treat the directory as a per-product fact you look up, not a guarantee.",
      },
      {
        title: "There is no published conformance test for clients",
        body: "The skills-ref library validates a SKILL.md file. We found no published test suite, certification, or conformance report that checks whether an agent loads and activates skills correctly, and the client implementation guide is written as guidance rather than as requirements. Supports Agent Skills is therefore a vendor claim, not a measured one.",
      },
      {
        title: "Unknown frontmatter keys have no specified behavior",
        body: "The specification defines six fields and offers metadata for anything else, but does not state what a client must do with a top-level key it does not recognize. In practice the behavior ranges from silently ignoring it to failing a package with a hard error, and each client documents its own choice or does not.",
      },
      {
        title: "Claude Code does not document the .agents/skills path",
        body: "Codex, Cursor, GitHub Copilot, and Gemini CLI all document reading .agents/skills. The Claude Code skills documentation lists enterprise, personal, project, and plugin locations, all under .claude, and says nothing about .agents either way. We are recording an absence in the documentation, not a tested behavior.",
      },
    ],
    sourceIds: [
      "agentskills-spec",
      "agentskills-repo",
      "agentskills-implementation",
      "claude-code-skills",
      "codex-skills",
      "cursor-skills",
      "copilot-skills",
      "gemini-cli-skills",
    ],
  },
  faq: [
    {
      question: "What are AI agent skills?",
      answer:
        "An agent skill is a folder containing a SKILL.md file: YAML frontmatter with a name and a description, followed by Markdown instructions an AI agent reads when a task matches. Skills can bundle scripts, references, and assets. The agent loads the description at startup and the instructions only on demand.",
    },
    {
      question: "Is there an agent skills open standard, and who controls it?",
      answer:
        "Yes. Agent Skills is published at agentskills.io, which states the format was originally developed by Anthropic, released as an open standard, and is open to contributions from the broader ecosystem. The documentation and a reference validator live in the Apache 2.0 licensed agentskills/agentskills repository on GitHub.",
    },
    {
      question: "What does the agent skills specification define?",
      answer:
        "Six frontmatter fields, of which name and description are required, plus optional license, compatibility, metadata, and allowed-tools. It also recommends the scripts, references, and assets directories and the progressive disclosure loading model. It does not define where a skill folder lives on disk or how invocation syntax works.",
    },
    {
      question: "Which agents support agent skills?",
      answer:
        "The client showcase at agentskills.io listed forty-six products on 18 August 2026, including Claude Code, ChatGPT and Codex, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenHands, Goose, and Amp. Each publishes its own directories and its own extra frontmatter, so check the product documentation before assuming behavior.",
    },
    {
      question: "Do agent skills really work across different agents?",
      answer:
        "A valid skill loads only once it sits in a directory a compatible client scans, and each client scans different ones. Behavior does not always follow either. A skill using only the six specified fields with a self-contained body moves cleanly, while product-specific frontmatter does not: claude.ai rejects a non-spec key outright. No conformance test exists.",
    },
    {
      question: "Where can I find agent skills examples to read?",
      answer:
        "Four first-party places. The anthropics/skills repository held nineteen skill folders when we checked and openai/skills held thirty-nine curated ones. The agentskills.io quickstart walks through writing one. Cursor and Claude Code both document built-in skills you can inspect as production examples of the format.",
    },
    {
      question: "What is an agent skills library?",
      answer:
        "Usually one of two things. A public directory that indexes skills anyone published, ranked by installs, or a team library holding the smaller set your own team recommends. Skills Board is the second kind: a shared AI skills library that keeps the original source visible on every saved entry.",
    },
    {
      question: "Are agent skills the same as MCP servers?",
      answer:
        "No. A skill is instructions an agent reads; an MCP server is a running service exposing tools and data the agent calls. They compose rather than compete, and a Model Context Protocol working group is drafting SEP-2640 to serve skills over MCP through a skill:// resource convention.",
    },
  ],
  sources: [
    {
      id: "agentskills-home",
      label: "Agent Skills overview",
      href: "https://agentskills.io",
      note: "The definition of the format, the three-stage progressive disclosure model, the statement that Anthropic developed it and released it as an open standard, and the client showcase we counted forty-six products in.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their exact constraints, the optional directory conventions, the recommended token and line budgets, the file-reference guidance, and the skills-ref validation command. No version identifier is published on the page.",
    },
    {
      id: "agentskills-implementation",
      label: "How to add skills support to your agent",
      href: "https://agentskills.io/client-implementation/adding-skills-support",
      note: "That the specification does not mandate where skill directories live, the .agents/skills cross-client convention, the project-over-user collision rule it recommends to implementers, model-driven activation, lenient validation, and the trust check recommended for project-level skills.",
    },
    {
      id: "agentskills-repo",
      label: "agentskills/agentskills on GitHub",
      href: "https://github.com/agentskills/agentskills",
      note: "The Apache 2.0 license, the documentation and skills-ref reference library the repository holds, and the absence of any tag or release, read from the GitHub API on the date at the top of this page.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The four skill locations and their precedence, the full frontmatter table, the six-field restriction and unexpected-key error outside Claude Code, the merge of custom slash commands into skills, and the bundled skills. It does not mention .agents/skills.",
    },
    {
      id: "platform-skills-overview",
      label: "Claude Platform: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The three loading levels, the security guidance on untrusted skills, that custom skills do not sync across surfaces, the per-surface sharing scope, and the runtime differences between API and Claude Code skills.",
    },
    {
      id: "codex-skills",
      label: "ChatGPT and Codex: build skills",
      href: "https://learn.chatgpt.com/codex/skills",
      note: "The repository, user, admin, and system scan locations, the two percent context budget on the initial skill list, explicit and implicit invocation, the optional agents/openai.yaml, and the skill-installer command.",
    },
    {
      id: "cursor-skills",
      label: "Cursor: Agent Skills",
      href: "https://cursor.com/docs/context/skills",
      note: "The four native directories plus the four Claude and Codex compatibility paths, the five documented frontmatter fields, nested and monorepo scoping, the eighteen built-in skills, and the /migrate-to-skills conversion.",
    },
    {
      id: "copilot-skills",
      label: "GitHub Copilot: about agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "That Copilot treats Agent Skills as an open standard used by a range of AI systems, the project locations including .claude/skills and .agents/skills, the personal locations, and the surfaces skills apply to.",
    },
    {
      id: "gemini-cli-skills",
      label: "Gemini CLI: skills",
      href: "https://geminicli.com/docs/cli/skills/",
      note: "The user and workspace directories, the .agents/skills alias and its precedence within a tier, and the approval step that adds a skill's directory to the agent's allowed file paths on activation.",
    },
    {
      id: "mcp-skills-wg",
      label: "Model Context Protocol: Skills Over MCP charter",
      href: "https://modelcontextprotocol.io/community/working-groups/skills-over-mcp",
      note: "The working group's mission, its two leads and participant list, the weekly cadence, the coordination with the Agent Skills spec, and that client implementation mandates are explicitly out of scope.",
    },
    {
      id: "mcp-sep-2640",
      label: "SEP-2640: Skills Extension",
      href: "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640",
      note: "The skill:// resource convention, the io.modelcontextprotocol/skills extension identifier, the reference implementations listed, and the open and draft state read from the GitHub API on the date at the top of this page.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "The nineteen skill folders counted through the GitHub API on the date at the top of this page, the Apache 2.0 and source-available split, the template folder, and the spec folder that now points at agentskills.io.",
    },
    {
      id: "openai-skills-repo",
      label: "openai/skills on GitHub",
      href: "https://github.com/openai/skills",
      note: "The thirty-nine curated skills counted through the GitHub API on the date at the top of this page, and the skills Codex documentation points at as examples.",
    },
  ],
  related: [
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same format inside one product, including every field Claude Code adds on top of the standard.",
    },
    {
      label: "Codex skills: the .agents/skills directories Codex scans",
      href: codexSkillsPath,
      description:
        "Where ChatGPT and Codex look, what transfers from a skill written for another agent, and how to add one.",
    },
    {
      label: "Cursor skills: every directory Cursor reads",
      href: cursorSkillsPath,
      description:
        "The native paths, the Claude and Codex compatibility paths, and the frontmatter Cursor documents.",
    },
    {
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      description:
        "The repository file agents read before any skill loads, and what belongs in it instead of a skill.",
    },
    {
      label: "Claude skills vs MCP: what each one is for",
      href: comparePaths.skillsVsMcp,
      description:
        "Why instructions and a running service are not alternatives, and which one a given problem needs.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The marketplaces, directories, and repositories skills actually come from, and what each one screens.",
    },
    {
      label: "How to manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One source of truth for a mixed-agent team, without assuming anything synchronizes on its own.",
    },
    {
      label: "Skills Board vs a GitHub repo",
      href: alternativePaths.githubRepo,
      description:
        "Keeping recommendations in a repository next to keeping them in a library, and what each costs.",
    },
  ],
  og: {
    eyebrow: "Agent Skills",
    title: [
      { text: "One folder, one SKILL.md," },
      { text: "forty-six agents that read it.", accent: true },
    ],
    description:
      "What the open standard specifies, which agents implement it, where each one looks, and what actually travels between them.",
    contextLabel: "skillsboard.sh/agent-skills",
    chips: ["Specification", "Adoption", "Portability"],
  },
  ogAlt:
    "Explainer for the Agent Skills open standard: the SKILL.md format, the agents that implement it, the directories each one scans, and what travels between them.",
  publishedAt: "2026-08-18",
  modifiedAt: "2026-08-18",
}
