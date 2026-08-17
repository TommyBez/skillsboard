import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import type { ComparisonDefinition } from "@/lib/seo/compare/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { guidePaths } from "@/lib/seo/guides/types"

const pluginWithSkillTemplate = `release-tools/
  .claude-plugin/
    plugin.json
  skills/
    release-notes/
      SKILL.md

# .claude-plugin/plugin.json
{
  "name": "release-tools",
  "description": "How this team cuts a release",
  "version": "1.0.0"
}

# skills/release-notes/SKILL.md
---
name: release-notes
description: How this team writes release notes. Use when cutting a release or when someone asks for the changelog entry.
---

Group the merged pull requests by user-visible change rather than by author,
and leave anything internal out of the published note.

# Invoked as /release-tools:release-notes
`

export const skillsVsPlugins: ComparisonDefinition = {
  path: comparePaths.skillsVsPlugins,
  ctaLocation: "compare_skills_plugins",
  subject: "Skills vs plugins",
  eyebrow: "Claude Skills vs Plugins",
  title: "Claude skills vs plugins",
  seoTitle: "Claude Skills vs Plugins: Content vs Packaging | Skills Board",
  socialTitle: "Claude skills vs plugins, compared",
  description:
    "A skill is content: one SKILL.md file of instructions. A Claude Code plugin is packaging: a directory that can bundle skills, agents, hooks, and MCP servers, installed from a marketplace. Why they are layers rather than alternatives.",
  cardSummary:
    "Not two formats competing for the same job. One is what you write, the other is how you ship it, and a plugin can carry skills inside it.",
  intro: [
    "Both arrive as folders you install into Claude Code and show up as slash commands in one listing, so the query reads like a choice.",
    "It is a layering. A skill is content: a SKILL.md file of instructions. A plugin is packaging: a directory carrying skills, subagents, hooks, and MCP servers. A plugin can contain skills. A skill cannot contain a plugin.",
  ],
  answer:
    "A skill is a unit of content: one SKILL.md file of instructions the agent loads when your request matches its description. A plugin is a unit of distribution: a Claude Code package bundling skills, agents, hooks, and MCP servers, installed from a marketplace and versioned as one. Skills are what you write. Plugins are how you ship them.",
  answerNotes: [
    "No first-party page frames this as skill or plugin. The plugins guide compares standalone .claude/ configuration against plugins: standalone for personal workflows and quick experiments, plugins for sharing, versioned releases, and reuse.",
    "One file demonstrates it. A folder holding only SKILL.md loads as a plain skill. Add .claude-plugin/plugin.json and the same folder loads as a plugin that can also bundle agents, hooks, and MCP servers.",
  ],
  answerSourceIds: [
    "claude-code-plugins",
    "claude-code-plugins-reference",
    "claude-code-skills",
  ],
  sideBySide: {
    title: "Side by side",
    caption: "Where a skill and a Claude Code plugin genuinely differ.",
    intro:
      "Five dimensions, from the Agent Skills specification and the Claude Code documentation.",
    columns: ["Dimension", "Claude skill", "Claude Code plugin"],
    rows: [
      {
        label: "What it is",
        cells: [
          "A directory whose entrypoint is SKILL.md: frontmatter, Markdown instructions, optional scripts and references. Alone it registers no hook, subagent, or MCP server.",
          "A directory holding skills/, commands/, agents/, hooks/, .mcp.json, .lsp.json, monitors/, bin/, settings.json, and an optional .claude-plugin/plugin.json manifest.",
        ],
      },
      {
        label: "Where it lives",
        cells: [
          "~/.claude/skills/<name>/SKILL.md for you, .claude/skills/<name>/SKILL.md for the project, a plugin's skills/ directory, or managed settings.",
          "Its own directory: loaded with --plugin-dir, discovered in place under a skills directory, or installed from a marketplace.",
        ],
      },
      {
        label: "What you type",
        cells: [
          "/skill-name, from the directory name. Enterprise overrides personal, personal overrides project.",
          "/plugin-name:skill-name, namespaced to prevent conflicts. The last segment can come from frontmatter name, and the bare /skill-name works when nothing else claims it.",
        ],
      },
      {
        label: "Distribution and versions",
        cells: [
          "Commit .claude/skills/, ship it in a plugin, or deploy through managed settings. The specification defines no version field.",
          "A .claude-plugin/marketplace.json listing plugins by name and source. An optional version field gates updates; omit it and git sources use the commit SHA.",
        ],
      },
      {
        label: "Where it works",
        cells: [
          "Follows the Agent Skills open standard, documented as working across multiple AI tools. Also runs on claude.ai and the Claude API.",
          "Documented for Claude Code, plus a desktop-app plugin browser and claude.ai organization sync. No page we checked describes plugins on the Claude API.",
        ],
      },
    ],
    notes: [
      "The trust asymmetry comes first. A skill is text you read in a minute. Claude Code's wording for plugins and marketplaces is that they can execute arbitrary code with your user privileges, which is why the plugin manager lists what will install.",
      "The documentation does not rank them, and no first-party table sets skills against plugins. If that changes, so does this page.",
    ],
    sourceIds: [
      "claude-code-plugins",
      "claude-code-discover-plugins",
      "claude-code-plugin-marketplaces",
      "claude-code-plugins-reference",
      "claude-code-skills",
      "agentskills-spec",
      "anthropic-agent-skills",
    ],
  },
  leftCase: {
    eyebrowLabel: "Skills",
    title: "When a plain skill is enough",
    intro: "Three cases where the manifest buys you nothing.",
    cases: [
      {
        title: "You are the only consumer",
        body: "Personal workflows, project-specific customizations, and quick experiments are what the plugins guide lists standalone .claude/ configuration as best for. No install step to explain.",
      },
      {
        title: "It has to leave Claude Code",
        body: "Claude Code documents its skills as following the Agent Skills open standard, which works across multiple AI tools. Outside it, only the six specification fields are accepted.",
      },
      {
        title: "One checkout already reaches everyone",
        body: "Committing .claude/skills/ is one of the three sharing routes the documentation names, and on one repository it is the whole distribution problem.",
      },
    ],
    counterweightTitle: "When a plain skill is not enough",
    counterweight: [
      "The capability is not only instructions. A procedure plus the hook, subagent, and connection it depends on is more than one SKILL.md holds.",
      "Updates have to reach people. A committed file changes when someone pulls, and nothing records a version or says which copy a teammate runs.",
    ],
    sourceIds: [
      "claude-code-plugins",
      "claude-code-skills",
      "agentskills-spec",
    ],
  },
  rightCase: {
    eyebrowLabel: "Plugins",
    title: "When the plugin wrapper earns its keep",
    intro: "Three cases where the packaging is the point.",
    cases: [
      {
        title: "Several components ship together",
        body: "One install carrying skills, subagents, hooks, and MCP servers is what the manifest exists for, and the docs describe adding plugin.json to a skill folder for exactly that.",
      },
      {
        title: "Other people install it on purpose",
        body: "A .claude-plugin/marketplace.json in a repository, added with /plugin marketplace add and installed with /plugin install name@marketplace at user, project, or local scope.",
      },
      {
        title: "Name collisions are a real risk",
        body: "Every plugin skill gets a namespaced command, and the namespaced form loads alongside a same-named project skill rather than overriding it.",
      },
    ],
    counterweightTitle: "When the plugin wrapper is overhead",
    counterweight: [
      "You are still rewriting it. The guide's sequencing is start standalone in .claude/ for quick iteration, then convert when you are ready to share.",
      "The audience is another product. If the procedure runs through the Claude API, the plugin wrapper does not travel; the SKILL.md does.",
    ],
    sourceIds: [
      "claude-code-plugins",
      "claude-code-discover-plugins",
      "claude-code-plugin-marketplaces",
      "claude-code-plugins-reference",
    ],
  },
  together: {
    title: "A skill inside a plugin",
    caption: "The two layers of one installable unit, and what each decides.",
    intro:
      "The combination runs one way: a plugin packages skills, never the reverse. It changes the skill's name, not its content.",
    directions: {
      columns: ["Layer", "File", "Decides"],
      rows: [
        {
          label: "Skill",
          cells: [
            "skills/<name>/SKILL.md",
            "What the agent does, and what triggers it",
          ],
        },
        {
          label: "Plugin",
          cells: [
            ".claude-plugin/plugin.json",
            "What ships together, under what namespace, at what version",
          ],
        },
      ],
    },
    notes: [
      "The namespace is the visible change. A skills/hello/SKILL.md folder in a plugin named my-first-plugin is invoked as /my-first-plugin:hello, with the prefix from the manifest name field. A single-skill plugin can put SKILL.md at its root.",
      "The manifest is optional, which most summaries get wrong: without it Claude Code auto-discovers components in default locations and derives the name from the directory.",
    ],
    template: pluginWithSkillTemplate,
    templateLabel: "A plugin whose only component is one skill",
    templateCopy: {
      buttonLabel: "Copy example",
      ariaLabel: "Copy the plugin example",
      copiedAriaLabel: "Plugin example copied",
    },
    link: {
      lead: "Once more than one person depends on it, the format stops being the hard part:",
      label: "how to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: " covers ownership, the distribution models, and keeping one recommendation instead of five forks.",
    },
    sourceIds: [
      "claude-code-plugins",
      "claude-code-plugins-reference",
      "claude-code-skills",
    ],
  },
  faq: [
    {
      question: "What is the difference between Claude skills and plugins?",
      answer:
        "A skill is content: one SKILL.md file of instructions Claude loads when your request matches its description. A plugin is a Claude Code package that can bundle skills, subagents, hooks, MCP servers, and LSP servers, installed from a marketplace and versioned as one unit. A plugin can contain skills.",
    },
    {
      question: "Can a Claude Code plugin contain skills?",
      answer:
        "Yes. They live in a skills/ directory at the plugin root, each as a folder with its own SKILL.md. Every plugin skill gets a namespaced command, plugin-name:skill-name, which the docs say prevents conflicts between plugins, so hello inside a plugin named my-first-plugin is invoked as /my-first-plugin:hello.",
    },
    {
      question: "Do I need a plugin to share a skill with my team?",
      answer:
        "No. The skills documentation names three sharing routes: commit .claude/skills/ to version control, ship the skill in a plugin, or deploy it through managed settings. A plugin adds versioned releases, marketplace installation, and the ability to bundle hooks, agents, and MCP servers alongside the skill.",
    },
    {
      question: "Do Claude Code plugins work in claude.ai or the Claude API?",
      answer:
        "The plugin documentation is written for Claude Code. It also references a plugin browser in the Claude desktop app and marketplace sync through claude.ai organization settings. No first-party page we checked describes plugins on the Claude API. Skills do run there.",
    },
    {
      question: "Should I start with a skill or a plugin?",
      answer:
        "The Claude Code guide answers this directly: start with standalone configuration in .claude/ for quick iteration, then convert to a plugin when you are ready to share. Adding a .claude-plugin/plugin.json to an existing skill folder is the documented conversion, and it needs no marketplace and no install step.",
    },
  ],
  sources: [
    {
      id: "claude-code-plugins",
      label: "Claude Code: create plugins",
      href: "https://code.claude.com/docs/en/plugins",
      note: "The standalone-versus-plugins table and its best-for column, the advice to start standalone and convert when ready to share, the plugin structure table covering skills, commands, agents, hooks, .mcp.json, .lsp.json, monitors, bin, and settings.json, the namespacing note and its stated reason, the single-skill plugin root layout, and the migration steps from .claude/ to a plugin.",
    },
    {
      id: "claude-code-discover-plugins",
      label: "Claude Code: discover and install plugins",
      href: "https://code.claude.com/docs/en/discover-plugins",
      note: "The two-step marketplace model, the official and community marketplaces, the user, project, and local install scopes, the details pane showing context cost and a will-install component list, the /plugin install syntax, and the warning that plugins and marketplaces can execute arbitrary code with your user privileges.",
    },
    {
      id: "claude-code-plugin-marketplaces",
      label: "Claude Code: create and distribute a plugin marketplace",
      href: "https://code.claude.com/docs/en/plugin-marketplaces",
      note: "The .claude-plugin/marketplace.json file at a repository root, its name, owner, and plugins fields, the plugin entry requiring a name and a source, the seven source types, and the version field behaviour including the fallback to a resolved commit SHA for git-based sources.",
    },
    {
      id: "claude-code-plugins-reference",
      label: "Claude Code: plugins reference",
      href: "https://code.claude.com/docs/en/plugins-reference",
      note: "The optional manifest with name as its only required field, component auto-discovery and name derivation when the manifest is absent, the skills-directory table showing that adding .claude-plugin/plugin.json turns a skill folder into a plugin that can bundle skills, agents, hooks, and more, and the standard plugin directory layout.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The SKILL.md frontmatter plus Markdown structure, the four locations skills load from and the precedence between them, the plugin-name:skill-name namespace and the fact that it loads alongside rather than overriding, the three sharing routes, and the statement that Claude Code skills follow the Agent Skills open standard with only six fields accepted elsewhere.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The skill directory structure, the required name and description fields and the four optional ones, the absence of any version field, the optional scripts, references, and assets directories, and progressive disclosure with metadata loaded at startup and the body loaded on activation.",
    },
    {
      id: "anthropic-agent-skills",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The surfaces custom Skills run on, the statement that custom Skills do not sync across surfaces, the per-surface sharing model naming Claude Code Plugins as one route, and the runtime constraints for each surface.",
    },
  ],
  related: [
    {
      label: "Claude skills vs MCP",
      href: comparePaths.skillsVsMcp,
      description:
        "The other pair that is not a choice: content against the protocol an agent uses to reach a system it does not own.",
    },
    {
      label: "Claude skills vs subagents",
      href: comparePaths.skillsVsSubagents,
      description:
        "Instructions in your conversation against a separate run with its own context window.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The reference page for one half of this comparison: the format, the surfaces, and how a skill loads.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "The personal, project, plugin, managed, and claude.ai install paths, and how to confirm a skill actually loaded.",
    },
  ],
  editorialSubject: "skills and plugins",
  closing: {
    title: "Packaging is easy. Deciding what deserves packaging is not.",
    body: "Skills Board is a shared library for the skills a team recommends, loose or inside a plugin. Free forever, MIT licensed, and open source.",
  },
  og: {
    eyebrow: "Claude Skills vs Plugins",
    title: [
      { text: "A skill is what you write." },
      { text: "A plugin is how you ship it.", accent: true },
    ],
    description:
      "Content against packaging, why they are layers rather than alternatives, and what a plugin carrying one skill looks like.",
    contextLabel: "skillsboard.sh/compare",
    chips: ["SKILL.md", "plugin.json", "marketplace.json"],
  },
  ogAlt:
    "Comparison of Claude skills and Claude Code plugins: content against packaging, and how a plugin carries skills.",
  publishedAt: "2026-08-17",
  modifiedAt: "2026-08-17",
}
