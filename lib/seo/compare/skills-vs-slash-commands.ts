import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import type { ComparisonDefinition } from "@/lib/seo/compare/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { guidePaths } from "@/lib/seo/guides/types"

const sameCommandTwoFilesTemplate = `.claude/
  commands/
    deploy.md
  skills/
    deploy/
      SKILL.md
      checklist.md

# commands/deploy.md
---
description: Ship the current branch to staging
argument-hint: [environment]
---

Run the staging deploy for $ARGUMENTS and report the release URL.

# skills/deploy/SKILL.md
---
name: deploy
description: How this team ships to staging. Use when someone asks to deploy or release.
disable-model-invocation: true
---

Follow checklist.md, then run the staging deploy for $ARGUMENTS.

# Both files answer to /deploy. The skill wins the name.
`

export const skillsVsSlashCommands: ComparisonDefinition = {
  path: comparePaths.skillsVsSlashCommands,
  ctaLocation: "compare_skills_slash_commands",
  subject: "Skills vs slash commands",
  eyebrow: "Claude Skills vs Slash Commands",
  title: "Claude skills vs slash commands",
  seoTitle:
    "Claude Skills vs Slash Commands: One Merged Mechanism | Skills Board",
  socialTitle: "Claude skills vs slash commands, compared",
  description:
    "Claude Code documents custom commands as merged into skills: a file in .claude/commands/ and a SKILL.md both create the same slash command. What still differs, which one the docs recommend, and what the slash menu actually contains.",
  cardSummary:
    "Not two competing formats. The slash is the menu, the skill is the unit, and the documentation now treats a command file as a skill with fewer options.",
  intro: [
    "The query assumes a fork in the road. Claude Code closed it: the page at /docs/en/slash-commands now serves a page titled Extend Claude with skills.",
    "Custom commands have been merged into skills. A command file and a SKILL.md both produce a slash command and behave the same way.",
  ],
  answer:
    "A slash command is how something is invoked: you type / and pick from a menu. A skill is what gets invoked: a directory with SKILL.md at its entrypoint. In Claude Code they are one mechanism, since a Markdown file in .claude/commands/ and a skill directory create the same command and take the same frontmatter. The skill directory is the recommended shape, because it can carry supporting files.",
  answerNotes: [
    "The documentation states it directly: .claude/commands/deploy.md and .claude/skills/deploy/SKILL.md both create /deploy and work the same way, and existing command files keep working.",
    "No page we checked announces a date when command files stop working, and none tells you to pick one. The stated preference is that skills are recommended because they support features like supporting files.",
  ],
  answerSourceIds: ["claude-code-skills", "claude-code-commands"],
  sideBySide: {
    title: "Side by side",
    caption: "What still differs once the two mechanisms are one.",
    intro:
      "Five dimensions, from the Claude Code documentation and the Agent Skills specification.",
    columns: ["Dimension", "Claude skill", "Command file"],
    rows: [
      {
        label: "What it is",
        cells: [
          "A directory with SKILL.md at its entrypoint, plus optional scripts, references, and assets beside it.",
          "One Markdown file under .claude/commands/, taking the same frontmatter as a skill except name and paths.",
        ],
      },
      {
        label: "What you type",
        cells: [
          "/skill-name from the directory name. A plugin skill becomes /plugin-name:skill-name.",
          "/file-name, the file name without its extension. No namespacing, because there is no directory to name.",
        ],
      },
      {
        label: "Who invokes it",
        cells: [
          "You or Claude. The description stays in context, so Claude can load it when a request matches.",
          "The same. Automatic loading follows disable-model-invocation in the frontmatter, not the folder the file sits in.",
        ],
      },
      {
        label: "Supporting files",
        cells: [
          "A directory, so scripts and references load only when a task calls for them.",
          "One file. This is the difference the docs name when they recommend skills.",
        ],
      },
      {
        label: "Where it works",
        cells: [
          "The Agent Skills open standard, documented as working across multiple AI tools, and on claude.ai and the Claude API.",
          "A Claude Code convention. The specification we checked defines no commands folder and no invocation syntax at all.",
        ],
      },
    ],
    notes: [
      "The slash is a menu, not a mechanism. Typing / lists built-in commands coded into the CLI, bundled skills such as /code-review, your own skills and command files, plugin skills, and MCP prompts in the form /mcp__servername__promptname.",
      "Only two of those are files you write, and the documentation now treats both as skills.",
    ],
    sourceIds: [
      "claude-code-skills",
      "claude-code-commands",
      "claude-code-mcp",
      "agentskills-spec",
      "anthropic-agent-skills",
    ],
  },
  leftCase: {
    eyebrowLabel: "Skills",
    title: "When the skill directory earns its keep",
    intro: "Three cases where the folder beats the single file.",
    cases: [
      {
        title: "The instructions need company",
        body: "The specification puts scripts, references, and assets beside SKILL.md and loads them progressively: metadata at startup, the body on activation, resources only when required. A command file has nowhere to put any of it.",
      },
      {
        title: "It has to leave Claude Code",
        body: "Claude Code documents its skills as following the Agent Skills open standard. Outside it only six fields are accepted, and an extra one such as argument-hint fails packaging.",
      },
      {
        title: "You want the documented path",
        body: "The commands reference no longer describes a commands folder. To add your own commands it points at the skills page.",
      },
    ],
    counterweightTitle: "What the skill directory does not buy you",
    counterweight: [
      "Not a different trigger. Both shapes read disable-model-invocation and user-invocable, so moving a file does not change who can call it.",
      "Not the built-ins. A skill can override a bundled skill of the same name, though not its aliases, and commands such as /compact are coded into the CLI.",
    ],
    sourceIds: ["claude-code-skills", "claude-code-commands", "agentskills-spec"],
  },
  rightCase: {
    eyebrowLabel: "Slash commands",
    title: "When a command file is still the right shape",
    intro: "Three cases where the flat file is the honest answer.",
    cases: [
      {
        title: "It exists and it works",
        body: "The documentation says existing files in .claude/commands/ keep working and take the same frontmatter minus two fields. Nothing we found sets a migration deadline.",
      },
      {
        title: "The prompt is the whole artifact",
        body: "A short procedure with no script, reference file, or template gains nothing from a directory. The file name is the command.",
      },
      {
        title: "You did not write it",
        body: "Much of the slash menu is not yours to shape: built-in commands, bundled skills, and MCP prompts discovered from connected servers.",
      },
    ],
    counterweightTitle: "When the command file is the wrong shape",
    counterweight: [
      "The procedure grows a script. One Markdown file cannot hold the scripts and references the skill format expects.",
      "Someone has to run it elsewhere. SKILL.md is what claude.ai and the Claude API accept, and custom skills do not sync across surfaces.",
    ],
    sourceIds: [
      "claude-code-skills",
      "claude-code-commands",
      "claude-code-mcp",
      "anthropic-agent-skills",
    ],
  },
  together: {
    title: "The same slash, two files",
    caption: "What answers /deploy, and what decides which one does.",
    intro:
      "Not a setup you configure. Both files register the same command, and a documented precedence rule settles it.",
    directions: {
      columns: ["Source", "What you type", "Decides"],
      rows: [
        {
          label: "Skill",
          cells: [
            ".claude/skills/deploy/SKILL.md",
            "/deploy",
            "Wins the name, and can carry supporting files",
          ],
        },
        {
          label: "Command file",
          cells: [
            ".claude/commands/deploy.md",
            "/deploy",
            "Runs when no skill claims that name",
          ],
        },
        {
          label: "MCP prompt",
          cells: [
            "A connected server",
            "/mcp__servername__promptname",
            "Discovered from the server, not stored in your repository",
          ],
        },
      ],
    },
    notes: [
      "Precedence is documented rather than incidental: with both files present, /deploy runs the skill. Enterprise overrides personal, and personal overrides project.",
      "Arguments behave the same in both, and the indexing catches people out: $ARGUMENTS is everything you typed, $ARGUMENTS[N] is zero-based, so $0 is first and $1 is second.",
    ],
    template: sameCommandTwoFilesTemplate,
    templateLabel: "One command name, claimed by two files",
    templateCopy: {
      buttonLabel: "Copy example",
      ariaLabel: "Copy the two-file example",
      copiedAriaLabel: "Example copied",
    },
    link: {
      lead: "If the question underneath is where a file has to sit before it becomes a command,",
      label: "how to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      trail: " walks the personal, project, plugin, and managed paths and how to confirm one actually loaded.",
    },
    sourceIds: ["claude-code-skills", "claude-code-mcp"],
  },
  faq: [
    {
      question:
        "What is the difference between Claude skills and slash commands?",
      answer:
        "A slash command is the invocation: what you type to run something. A skill is the unit that runs: a directory with SKILL.md inside. Claude Code documents custom commands as merged into skills, so a file in .claude/commands/ and a skill directory both create the same command and read the same frontmatter fields.",
    },
    {
      question: "Are Claude Code custom commands deprecated?",
      answer:
        "The documentation does not use that word. It says existing files in .claude/commands/ keep working and support the same frontmatter except name and paths, which a command file ignores. It recommends skills for the extra features, such as supporting files. No page we checked gives a removal date.",
    },
    {
      question: "Should I use .claude/commands or .claude/skills?",
      answer:
        "Use a skill directory for anything that needs scripts, reference files, or templates beside the instructions, and for anything you want to reuse outside Claude Code. Keep a command file when the prompt is the entire artifact and it already works, since the docs set no deadline for converting it.",
    },
    {
      question: "Can Claude invoke a slash command on its own?",
      answer:
        "Yes, for the ones loaded from files. A skill description sits in context so Claude can load it when your request matches, and setting disable-model-invocation to true limits it to manual use. Command files read the same field, so the folder you choose does not change this behavior.",
    },
    {
      question: "Do Claude Code slash commands work in claude.ai or the API?",
      answer:
        "The slash menu is a Claude Code interface. Custom skills do run on claude.ai and the Claude API, but the documentation says they do not sync across surfaces, and outside Claude Code only the six specification fields are accepted, so an argument-hint field fails packaging.",
    },
  ],
  sources: [
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The statement that custom commands have been merged into skills and that both files create the same command, the frontmatter a command file supports and the two fields it ignores, the command-name table including the file-name and plugin-namespace rules, the conflict list in which a skill beats a same-named command file, the invocation matrix for disable-model-invocation and user-invocable, the argument substitutions and their zero-based indexing, and the six fields accepted outside Claude Code. The /docs/en/slash-commands path serves this same page.",
    },
    {
      id: "claude-code-commands",
      label: "Claude Code: commands reference",
      href: "https://code.claude.com/docs/en/commands",
      note: "The framing that most entries are built-in commands whose behavior is coded into the CLI, the Skill and Workflow markers for bundled entries such as /code-review, the note that a command is only recognized at the start of a message, the pointer that says to add your own commands see skills, and the absence of any commands-folder documentation on the page.",
    },
    {
      id: "claude-code-mcp",
      label: "Claude Code: Model Context Protocol",
      href: "https://code.claude.com/docs/en/mcp",
      note: "The /mcp__servername__promptname format for prompts exposed by MCP servers, their dynamic discovery from connected servers, arguments passed space-separated after the command name, and the normalization of server and prompt names.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The skill directory with SKILL.md as the required entrypoint, the optional scripts, references, and assets directories, the required name and description fields plus four optional ones, progressive disclosure with metadata loaded at startup and the body on activation, and the absence of any command, invocation, or arguments field in the format.",
    },
    {
      id: "anthropic-agent-skills",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The surfaces custom Skills run on, the statement that custom Skills do not sync across surfaces, and the per-surface sharing model that describes Claude Code skills as filesystem-based and separate from claude.ai and the API.",
    },
  ],
  related: [
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "The packaging layer above this one: what a plugin bundles, and how it renames the commands inside it.",
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
        "The reference page for the format underneath both shapes: frontmatter, surfaces, and how a skill loads.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "Where a file has to sit before it becomes a command, and how to confirm it loaded.",
    },
  ],
  editorialSubject: "skills and slash commands",
  closing: {
    title: "The format stopped being the argument. The library did not.",
    body: "Skills Board is a web app for a team's AI skills, whichever folder they started in. Free forever, MIT licensed, and open source.",
  },
  og: {
    eyebrow: "Claude Skills vs Slash Commands",
    title: [
      { text: "The slash is the menu." },
      { text: "The skill is the unit.", accent: true },
    ],
    description:
      "Custom commands merged into skills, what still differs between a command file and a SKILL.md, and which file wins the same name.",
    contextLabel: "skillsboard.sh/compare",
    chips: ["SKILL.md", ".claude/commands", "/mcp__server__prompt"],
  },
  ogAlt:
    "Comparison of Claude skills and slash commands: the slash menu as invocation and SKILL.md as the unit that runs.",
  publishedAt: "2026-08-17",
  modifiedAt: "2026-08-17",
}
