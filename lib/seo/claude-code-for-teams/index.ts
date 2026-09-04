import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeCodeForTeamsPath } from "@/lib/seo/claude-code-for-teams/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { skillExamplesPath } from "@/lib/seo/skill-examples/types"

export {
  claudeCodeForTeamsPath,
  type ClaudeCodeForTeamsPath,
} from "@/lib/seo/claude-code-for-teams/types"

export interface ClaudeCodeForTeamsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface ClaudeCodeForTeamsFaqEntry {
  question: string
  answer: string
}

export interface ClaudeCodeForTeamsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface ClaudeCodeForTeamsInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface ClaudeCodeForTeamsTableSection {
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

export interface ClaudeCodeForTeamsDefinition {
  path: typeof claudeCodeForTeamsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsSupportPath
    | typeof manageAiSkillsPath
    | typeof bestClaudeSkillsPath
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
  plans: ClaudeCodeForTeamsTableSection & { link: ClaudeCodeForTeamsInlineLink }
  settings: ClaudeCodeForTeamsTableSection & {
    link: ClaudeCodeForTeamsInlineLink
  }
  conventions: ClaudeCodeForTeamsTableSection & {
    link: ClaudeCodeForTeamsInlineLink
  }
  skills: ClaudeCodeForTeamsTableSection & {
    link: ClaudeCodeForTeamsInlineLink
  }
  plugins: ClaudeCodeForTeamsTableSection & {
    link: ClaudeCodeForTeamsInlineLink
  }
  mcp: ClaudeCodeForTeamsTableSection & { link: ClaudeCodeForTeamsInlineLink }
  trust: ClaudeCodeForTeamsTableSection & { link: ClaudeCodeForTeamsInlineLink }
  install: {
    title: string
    intro: string
    steps: readonly {
      title: string
      body: string
    }[]
    template: string
    templateLanguage: string
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
    link: ClaudeCodeForTeamsInlineLink
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
  faq: readonly ClaudeCodeForTeamsFaqEntry[]
  sources: readonly ClaudeCodeForTeamsSource[]
  related: readonly ClaudeCodeForTeamsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const claudeCodeForTeams: ClaudeCodeForTeamsDefinition = {
  path: claudeCodeForTeamsPath,
  contentType: "article",
  topics: [
    "claude code for teams",
    "claude code team plan",
    "managed settings",
    "team skills",
  ],
  relatedGuidePaths: [
    manageAiSkillsPath,
    agentSkillsSupportPath,
    guidePaths.shareTeamSkills,
  ],
  eyebrow: "Claude Code for Teams",
  title: "Claude Code for teams: what a rollout actually configures",
  seoTitle:
    "Claude Code for Teams: Plans, Settings, Skills, Plugins, and MCP | Skills Board",
  description:
    "What changes when Claude Code stops being one developer's tool: which plan carries which admin feature, the five layers a setting can live in, where a team skill goes, how a plugin marketplace reaches everyone, which MCP scope is actually shared, and what a cloned repository does not give a teammate on the first run.",
  intro: [
    "Claude Code for teams is not a separate product. It is the same binary your developers already run, plus a set of decisions about where configuration lives, who can change it, and what a teammate gets automatically when they clone the repository. Anthropic publishes those decisions across about a dozen pages, and almost none of them are on the page you land on when you search for the phrase.",
    "This page collects them in the order a rollout hits them. First the plan, because three of the admin features below simply do not exist on Pro and Max. Then settings, because every other decision is a key in one of five layers. Then the three things a team actually shares day to day: conventions in CLAUDE.md, skills in a SKILL.md folder, and tools behind MCP. Then plugins, which is the only mechanism that moves all three at once. Then the trust step, which is the reason a carefully committed configuration does nothing on a teammate's first run.",
    "Everything below was read on August 24, 2026 from Anthropic's own documentation and help center. Two notes on sourcing. The docs.claude.com links you may have bookmarked now redirect to code.claude.com, and this page cites the destination. And where two Anthropic pages disagree, or where a table points at a page that does not answer it, this page says so rather than smoothing it over.",
    "One thing this page does not do is tell you which skills your team should use. That is the question no vendor mechanism answers, and it is the one that gets worse the better your distribution gets.",
  ],
  answer:
    "Rolling out Claude Code to a team means choosing four things: a plan, because the analytics dashboard, server-managed settings, SSO, and Code Review exist only on Team and Enterprise; a delivery mechanism for managed settings, which override everything a developer sets; what to commit to the repository, which is .claude/settings.json, CLAUDE.md, .claude/skills, and .mcp.json; and how the rest travels, which is a plugin marketplace declared in extraKnownMarketplaces.",
  answerNotes: [
    "The split that matters is enforcement versus convention. Managed settings are applied by the client whatever the model decides, and nothing a developer writes overrides them apart from a short list of security-sensitive exceptions. A managed CLAUDE.md is the opposite: Anthropic states plainly that CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer. Put policy in settings and guidance in CLAUDE.md, and expect the second to be followed rather than obeyed.",
    "Almost everything a team shares is a file in the repository. The shared settings file, the project CLAUDE.md, the project skills folder, and the project MCP file are all committed, which means code review is already your change-control process for them. The exceptions are managed settings, which never come from the repository, and plugins, which come from a marketplace the repository only points at.",
    "The order of the five settings layers has one thing teams get wrong. Project local settings sit above shared project settings, which sit above user settings. So a teammate can override the committed team file for themselves without a commit, on purpose. But list keys such as permissions.allow merge across every layer instead of replacing, and a deny at any layer beats an allow at any other, so the team file can add without a developer being able to subtract.",
    "The rollout step nobody plans for is workspace trust. Allow rules and marketplace entries that come from a repository do nothing until each person accepts the trust dialog for that exact folder, and a claude -p or Agent SDK run never shows that dialog at all. A configuration that works on the machine where it was written can be inert on every other one.",
  ],
  answerSourceIds: [
    "admin-setup",
    "settings",
    "memory",
    "skills",
    "permissions",
  ],
  plans: {
    title: "What a plan decides before anything else",
    intro:
      "Claude Code runs the same on Pro, Max, Team, and Enterprise. What changes is the administrative surface around it. The feature availability page publishes a per-plan matrix, and the rows below are the ones that decide whether a team rollout is possible at all, read on August 24, 2026.",
    columns: ["Capability", "Team", "Enterprise", "What the source adds"],
    rows: [
      {
        label: "Claude Code seat",
        cells: [
          "Included with every seat",
          "Included with the single seat on new and self-serve plans",
          "The help center article, dated June 11, 2026, adds that premium seats carry more usage on Team, and that older Enterprise plans need a Chat + Claude Code seat with usage-based billing or a Premium seat with seat-based billing. The same seat also covers the VS Code, VS Code fork, and JetBrains extensions.",
        ],
      },
      {
        label: "Server-managed settings",
        cells: [
          "Yes",
          "Yes",
          "Delivered from the claude.ai admin console with no endpoint infrastructure. Viewing or editing them takes the Owner or Primary Owner role: Admin is not enough. Clients fetch them at authentication and refresh hourly during a session.",
        ],
      },
      {
        label: "Analytics dashboard and contribution metrics",
        cells: [
          "Yes",
          "Yes",
          "Marked unavailable on Pro and Max. Admins and Owners can view the dashboard at claude.ai/analytics/claude-code. Contribution metrics are in public beta and need the Claude GitHub app installed by a GitHub admin.",
        ],
      },
      {
        label: "Enterprise Analytics API",
        cells: [
          "No",
          "Yes",
          "The only programmatic per-user usage and cost feed on the subscription side. Console organizations get a different one, the Claude Code Analytics API.",
        ],
      },
      {
        label: "SSO",
        cells: [
          "Yes",
          "Yes",
          "Configured at the Claude account level rather than in Claude Code. The admin setup page routes SSO, SCIM, and seat assignment to the Enterprise Administrator Guide.",
        ],
      },
      {
        label: "SCIM provisioning",
        cells: [
          "No",
          "Yes",
          "Enterprise only in the same matrix, alongside the Compliance API.",
        ],
      },
      {
        label: "Code Review",
        cells: [
          "Yes",
          "Yes",
          "One of the few rows that runs the other way: Code Review is marked unavailable on Pro and Max and available on Team and Enterprise.",
        ],
      },
      {
        label: "Computer use",
        cells: [
          "No",
          "No",
          "The clearest example of a capability a developer loses by joining an organization. It is available on Pro and Max and unavailable on Team and Enterprise, as is Dispatch in the desktop app.",
        ],
      },
      {
        label: "Remote Control and Channels",
        cells: [
          "Admin-enabled",
          "Admin-enabled",
          "Both are on by default on Pro and Max and off until an administrator turns them on for an organization.",
        ],
      },
      {
        label: "Zero Data Retention",
        cells: [
          "No",
          "Requires separate enablement",
          "The matrix footnote says it is not included in the standard Enterprise plan and needs enablement by Anthropic for qualified accounts. Turning it on also removes contribution metrics from the analytics dashboard.",
        ],
      },
    ],
    notes: [
      "The plan is also the provider decision. Anthropic lists five ways to authenticate Claude Code: a Claude for Teams or Enterprise subscription, the Claude Console, Amazon Bedrock, Google Cloud's Agent Platform, and Microsoft Foundry. Anthropic names the subscription as its default choice, and the reason is feature coverage rather than price: Claude Code on the web, Routines, Code Review, Remote Control, and the Chrome extension are not reachable through Console API keys or cloud-provider credentials alone. A team on Bedrock that also wants those features needs seats as well.",
      "Skills, plugins, hooks, subagents, CLAUDE.md, MCP servers, OpenTelemetry metrics, and the managed settings file work on every provider. That is the useful half of the matrix: the whole configuration story on this page is provider independent, and only the administrative console around it is not.",
      "Usage limits work differently by plan shape. A usage-based Enterprise plan, including self-serve Enterprise, has no per-seat limit and bills consumption at API rates. A Team plan or a seat-based Enterprise plan can enable usage credits so people keep working past their included usage. Neither is a Claude Code setting; both are billing configuration on the organization.",
    ],
    link: {
      lead: "The organization-level version of this question, with what each vendor does and does not offer, is in",
      label: "How to manage AI skills across an organization",
      href: manageAiSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "feature-availability",
      "seats-support",
      "admin-setup",
      "server-managed-settings",
      "analytics",
    ],
  },
  settings: {
    title: "The five layers a Claude Code setting can live in",
    intro:
      "Claude Code reads settings from four files plus whatever your organization delivers as managed policy. When the same key appears in more than one, the highest layer that sets it wins. The list below is in precedence order, highest first.",
    columns: ["Layer", "Where it lives", "Who it reaches"],
    rows: [
      {
        label: "Managed settings",
        cells: [
          "The claude.ai admin console, an MDM or registry policy, or managed-settings.json on disk",
          "Everyone your organization deploys it to. Nothing a developer sets overrides it, apart from a few security-sensitive keys where the stricter value wins.",
        ],
      },
      {
        label: "Command line",
        cells: [
          "claude --settings, for one session",
          "You, for that run. Claude Code merges the JSON key by key with your files rather than replacing them.",
        ],
      },
      {
        label: "Project local",
        cells: [
          ".claude/settings.local.json",
          "You, in this one project. Claude Code adds it to your global git excludes the first time it writes the file, so it stays out of commits.",
        ],
      },
      {
        label: "Shared project",
        cells: [
          ".claude/settings.json, committed to the repository",
          "Everyone who starts Claude Code in that folder, and the cloud session that clones the repository.",
        ],
      },
      {
        label: "User",
        cells: [
          "~/.claude/settings.json",
          "You, in every project on this machine. Nothing on a teammate's machine.",
        ],
      },
    ],
    notes: [
      "Installing Claude Code creates none of these files. If a machine has one, somebody or something wrote it: the organization deployed it, the repository shipped it, or Claude Code created it the first time a developer changed an option in /config or answered a permission prompt with yes and do not ask again. A team rollout that assumes a default file exists is assuming something the documentation denies.",
      "Lists merge instead of replacing. Setting permissions.allow in the team file and again in a developer's own file gives a session both lists, and a deny rule at any layer blocks a tool that any other layer allows. Two list keys break the pattern and are worth knowing before you write them into a team file: fallbackModel is taken whole from the highest layer that defines it, because position in the chain carries meaning, and availableModels defined by the highest-precedence managed source is applied as is, with entries added lower down ignored.",
      "Managed settings reach a machine four ways, and Claude Code uses the first one that delivers at least one policy key: server-managed settings from the claude.ai console, then a macOS plist or Windows HKLM policy, then a managed-settings.json file at /Library/Application Support/ClaudeCode on macOS, /etc/claude-code on Linux and WSL, or C:\\Program Files\\ClaudeCode on Windows, and last the Windows HKCU registry. The documentation is blunt about the last one: HKCU is writable without elevation, so treat it as a convenience default rather than an enforcement channel.",
      "The two mechanisms have different reach as well as different strength. Endpoint-managed settings can be protected from user modification at the OS level, which is the stronger guarantee, but they do not reach cloud sessions in Anthropic-hosted environments. A team using Claude Code on the web needs server-managed settings too. To check which one won on a given machine, run /status: the Setting sources line names the managed source in parentheses.",
    ],
    link: {
      lead: "The document a team writes once and then points every settings file at is in",
      label: "AI coding guidelines template",
      href: guidePaths.aiCodingGuidelinesTemplate,
      trail: ".",
    },
    sourceIds: [
      "settings",
      "managed-settings",
      "server-managed-settings",
      "settings-reference",
    ],
  },
  conventions: {
    title: "Where a team convention goes, and what actually enforces it",
    intro:
      "CLAUDE.md is the file teams reach for first and the one they most often put in the wrong scope. Anthropic documents four locations plus two keys, in load order from broadest to most specific, so a project instruction lands in context after a user instruction.",
    columns: ["Scope", "Location", "Shared with"],
    rows: [
      {
        label: "Managed policy",
        cells: [
          "/Library/Application Support/ClaudeCode/CLAUDE.md on macOS, /etc/claude-code/CLAUDE.md on Linux and WSL, C:\\Program Files\\ClaudeCode\\CLAUDE.md on Windows",
          "Every user in the organization, in every repository on the machine. It cannot be excluded by an individual setting.",
        ],
      },
      {
        label: "User instructions",
        cells: [
          "~/.claude/CLAUDE.md",
          "Just you, across all your projects.",
        ],
      },
      {
        label: "Project instructions",
        cells: [
          "./CLAUDE.md or ./.claude/CLAUDE.md",
          "Team members via source control. This is the one a team commits.",
        ],
      },
      {
        label: "Local instructions",
        cells: [
          "./CLAUDE.local.md",
          "Just you, in this project. Add it to .gitignore yourself.",
        ],
      },
      {
        label: "Topic rules",
        cells: [
          ".claude/rules/",
          "Same reach as the project file. Rules let a large project scope instructions to specific file types or subdirectories instead of growing one file.",
        ],
      },
      {
        label: "The claudeMd key",
        cells: [
          "Inside managed-settings.json",
          "The same reach as a managed CLAUDE.md file, for organizations that would rather ship one JSON file than two artifacts. Setting it in user, project, or local settings has no effect at all.",
        ],
      },
    ],
    notes: [
      "The sentence to take away is Anthropic's own: settings rules are enforced by the client regardless of what Claude decides to do, while CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer. Their guidance follows from it. Blocking a tool, a command, or a path goes in permissions.deny. Sandbox isolation, environment variables, and login restrictions go in managed settings. Code style, data handling reminders, and behavioral instructions go in a managed CLAUDE.md. Writing never touch production in CLAUDE.md and calling it a control is a category error the documentation warns against.",
      "Monorepos get an escape hatch and a lock. The claudeMdExcludes setting skips ancestor CLAUDE.md files by path or glob, it can be set at any layer including managed policy, and its arrays merge across layers. A managed policy CLAUDE.md is exempt: it cannot be excluded, which is the point of putting compliance text there rather than in a repository file anyone can edit.",
      "Loading is not uniform either. CLAUDE.md and CLAUDE.local.md files above the working directory load at launch, while files in subdirectories load on demand when Claude reads a file in that directory. To see what actually loaded in a session, run /context and read the Memory files list. That is the check to give a teammate when they report that Claude is ignoring the team conventions.",
    ],
    link: {
      lead: "How the project file relates to the other convention file teams commit is in",
      label: "AGENTS.md vs SKILL.md",
      href: agentsMdVsSkillMdPath,
      trail: ".",
    },
    sourceIds: ["memory", "settings-reference", "admin-setup"],
  },
  skills: {
    title: "The places a Claude Code skill can come from",
    intro:
      "A skill is a folder with a SKILL.md inside it, and where you put the folder decides who has it. Anthropic publishes four locations plus three more ways a folder reaches a session, and the precedence between them is not the one a team would guess.",
    columns: ["Location", "Path", "Who gets it"],
    rows: [
      {
        label: "Enterprise",
        cells: [
          "See managed settings",
          "All users in your organization. This is the row the documentation leaves as a pointer rather than a path.",
        ],
      },
      {
        label: "Personal",
        cells: [
          "~/.claude/skills/<skill-name>/SKILL.md",
          "You, in all your projects. Nothing on a teammate's machine.",
        ],
      },
      {
        label: "Project",
        cells: [
          ".claude/skills/<skill-name>/SKILL.md",
          "This project only, and everyone who clones it. This is the row a team commits.",
        ],
      },
      {
        label: "Plugin",
        cells: [
          "<plugin>/skills/<skill-name>/SKILL.md",
          "Wherever the plugin is enabled. Plugin skills are namespaced as plugin-name:skill-name, so they cannot collide with the other levels.",
        ],
      },
      {
        label: "Nested project",
        cells: [
          "apps/web/.claude/skills/<skill-name>/SKILL.md",
          "The same people, but only once Claude reads or edits a file in that subdirectory. Until then the skill is not in autocomplete and cannot be invoked by name.",
        ],
      },
      {
        label: "Added directory",
        cells: [
          ".claude/skills inside an --add-dir or /add-dir directory",
          "You, for that session. This is a documented exception: the flag grants file access rather than configuration, and skills and commands are the carve-out. The permissions.additionalDirectories setting does not do this.",
        ],
      },
      {
        label: "Synced from claude.ai",
        cells: [
          "~/.claude/skills/synced/",
          "You, from the skills enabled on your claude.ai account, and only in a non-interactive run with CLAUDE_CODE_SYNC_SKILLS set. The folder name synced is reserved in the other locations.",
        ],
      },
    ],
    notes: [
      "The precedence is the sentence to read twice: across levels, enterprise overrides personal, and personal overrides project. A deploy skill in a developer's ~/.claude/skills wins over the deploy skill your team committed to the repository, and nothing warns anybody. That is the opposite direction from settings, where project local and shared project both sit above user settings. Two subsystems, two orders, and no page reconciles them. If your team relies on a repository skill being the one that runs, the name is the whole contract.",
      "Committing .claude/skills is the first distribution answer and it is a good one. Anthropic lists three scopes for sharing a skill: commit the project folder to version control, put a skills directory in a plugin, or deploy organization-wide through managed settings. A skill that lives in one repository everybody works in needs nothing beyond the first.",
      "Two limits arrive together once a team grows. Cowork sessions and cloud sessions do not read ~/.claude/skills on your machine at all: they load the skills enabled on your claude.ai account, synced at session start, and cloud sessions additionally load project skills committed to the cloned repository. And an administrator who sets strictPluginOnlyCustomization with skills in the list turns off ~/.claude/skills, .claude/skills, the commands directories, --add-dir skills, and claude.ai synced skills in one move, leaving only plugin skills, bundled skills, and skills in the managed policy directory. That setting is the exact opposite of the commit it to the repository advice, and both are documented as good practice on different pages.",
      "Smaller things worth knowing before you write a team skill. A skill beats a custom command of the same name. A skill at any level overrides a bundled skill of the same name, but not the bundled skill's aliases, so replacing code-review does not change what /review runs. Claude Code watches the skill directories and picks up SKILL.md edits inside the session without a restart. And a skill folder can be a symlink to somewhere else on disk, loaded once even when two locations reach the same target.",
    ],
    link: {
      lead: "The authoring rules for the file itself, field by field, are in",
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ".",
    },
    sourceIds: ["skills", "settings-reference", "admin-setup"],
  },
  plugins: {
    title: "How a plugin reaches everyone without anyone installing it by hand",
    intro:
      "A plugin is the only mechanism that carries skills, subagents, hooks, commands, and MCP servers in one package, which makes it the unit a team distributes once a second repository appears. There are two halves: registering the marketplace, and enabling the plugins inside it.",
    columns: ["Mechanism", "Where it is declared", "What it does"],
    rows: [
      {
        label: "extraKnownMarketplaces",
        cells: [
          "The project's .claude/settings.json",
          "Registers your marketplace for anyone who clones the repository, with no separate prompt, once they trust the project folder.",
        ],
      },
      {
        label: "enabledPlugins",
        cells: [
          "The project's .claude/settings.json",
          "Names which plugins from that marketplace should be on by default, as a map of plugin@marketplace to true.",
        ],
      },
      {
        label: "extraKnownMarketplaces with autoUpdate",
        cells: [
          "managed-settings.json",
          "Registers an organization marketplace on every machine the policy reaches and keeps it updated without each user turning auto-update on.",
        ],
      },
      {
        label: "CLAUDE_CODE_PLUGIN_SEED_DIR",
        cells: [
          "A container image or CI environment variable",
          "Pre-populates marketplaces and plugin caches at build time so nothing is cloned at runtime. The seed is read-only, its entries overwrite matching user configuration on every startup, and /plugin disable is the documented way to opt out of a seeded plugin.",
        ],
      },
      {
        label: "strictKnownMarketplaces",
        cells: [
          "Managed settings only",
          "An allowlist of the marketplace sources users may add. It restricts what can be added but does not register anything, so an allowed marketplace still needs an extraKnownMarketplaces entry beside it.",
        ],
      },
      {
        label: "disableSideloadFlags and disableCommandPluginSources",
        cells: [
          "Managed settings only",
          "Reject the CLI flags that sideload plugins, agents, and MCP servers for a single run, and block plugins whose source is a command rather than a repository.",
        ],
      },
      {
        label: "strictPluginOnlyCustomization",
        cells: [
          "Managed settings only",
          "The inverse policy: skills, agents, hooks, and MCP servers can then come only from plugins or managed settings. It takes true to lock all four or an array naming which.",
        ],
      },
    ],
    notes: [
      "One behavior change is worth putting in your rollout notes because it looks like a bug. As of Claude Code v2.1.195, adding a marketplace does not install plugins that come from an external source, on any path that loads plugins. A plugin that only the project settings enable, and that comes from a GitHub repository or an npm package, does not load until the team member installs it. Claude Code reports it as not installed and prints the claude plugin install command to run. Expect your enabledPlugins entry to produce a prompt rather than a plugin on the first run.",
      "Marketplace state is per user, not per project: it lives in ~/.claude/plugins/known_marketplaces.json. A relative directory or file source resolves against the repository's main checkout, so every git worktree shares one marketplace location. And the official Anthropic marketplace is the only one Claude Code registers on its own, only when the allowlist permits it, and not on every machine, so an organization that depends on it should add it to extraKnownMarketplaces explicitly.",
      "The pairing to remember is that the two managed keys do different jobs. strictKnownMarketplaces decides what may be added. extraKnownMarketplaces decides what is added. Deploying only the first gives you an organization where nobody can add the marketplace you approved.",
    ],
    link: {
      lead: "How a plugin differs from the skill it contains, and when a team needs each, is in",
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      trail: ".",
    },
    sourceIds: [
      "discover-plugins",
      "plugin-marketplaces",
      "settings-reference",
      "admin-setup",
    ],
  },
  mcp: {
    title: "Which MCP scope your team is actually sharing",
    intro:
      "MCP servers have their own scope system, separate from settings and from skills, with its own file and its own precedence order. Only one of the three developer scopes is shared with the team, and it is not the one called local.",
    columns: ["Scope", "Stored in", "Shared with the team"],
    rows: [
      {
        label: "Local",
        cells: [
          "~/.claude.json, under that project's path",
          "No. The default scope, private to you and scoped to the one project you added it in.",
        ],
      },
      {
        label: "Project",
        cells: [
          ".mcp.json at the project root",
          "Yes, via version control. This is the scope a team commits, and claude mcp add --scope project writes it for you.",
        ],
      },
      {
        label: "User",
        cells: [
          "~/.claude.json",
          "No. Available in all your projects on this machine and nowhere else.",
        ],
      },
      {
        label: "Plugin-provided",
        cells: [
          ".mcp.json at the plugin root, or inline in plugin.json",
          "Wherever the plugin is enabled, which is how an MCP server travels across repositories rather than within one.",
        ],
      },
      {
        label: "claude.ai connectors",
        cells: [
          "Your claude.ai account",
          "Per person. They load only when the claude.ai subscription is the active authentication method.",
        ],
      },
      {
        label: "Managed",
        cells: [
          "managed-mcp.json, or allowedMcpServers and deniedMcpServers in managed settings",
          "Everyone the policy reaches. A managed-mcp.json with an empty server map disables MCP entirely, apart from the VS Code extension's own in-process server.",
        ],
      },
    ],
    notes: [
      "Precedence runs local, then project, then user, then plugin-provided servers, then claude.ai connectors, and the whole server entry from the winning source is used rather than fields being merged. The three developer scopes match duplicates by name; plugins and connectors match by endpoint, so a plugin pointing at the same URL as a committed server is treated as the same server rather than a second one.",
      "The approval step is where a committed .mcp.json behaves differently by session type. Interactive sessions prompt before using a project-scoped server. A claude -p run, an Agent SDK session, and a cloud session cannot show that prompt, so they load the servers without asking. To keep one out everywhere, the documented answer is a disabledMcpjsonServers entry, not an approval. Approvals committed to the repository do not count for a cloned repository until the folder is trusted.",
      "Environment variable expansion is what makes one committed file work on several machines: ${VAR} in a .mcp.json entry expands from the environment, and a project-scoped entry that references CLAUDE_PROJECT_DIR needs a default such as ${CLAUDE_PROJECT_DIR:-.} because the variable is set in the server's environment rather than in Claude Code's own.",
      "Anthropic states the gap on the administrative side itself, and it is the most quotable sentence on that page: Claude Code does not have a built-in MCP server registry that users can browse and install from. Its advice for an approved-catalog rollout is to share the approved list and its claude mcp add commands somewhere your users will find them, such as an internal wiki, or to distribute the servers as plugins so people can browse them from /plugin. The mechanism enforces; the list of what is approved is left to you.",
    ],
    link: {
      lead: "The version of this with one MCP endpoint in front of the whole team library is in",
      label: "Set up a shared MCP skill library for teams",
      href: guidePaths.sharedMcpSkillLibrary,
      trail: ".",
    },
    sourceIds: ["mcp", "managed-mcp", "settings-reference"],
  },
  trust: {
    title: "What a cloned repository does not give a teammate on the first run",
    intro:
      "This is the section to read before you blame your configuration. Content that a repository supplies is held back until the person accepts the workspace trust dialog for that exact folder, and two situations never show that dialog. The rows below are Anthropic's own table, with the two columns being trusting only a parent folder and running claude -p or the Agent SDK in a folder that was never trusted.",
    columns: [
      "What the repository supplies",
      "Parent folder trusted only",
      "claude -p or the SDK",
    ],
    rows: [
      {
        label:
          "Hooks in settings files, the env block, helper commands, and a project skill's hooks and allowed-tools",
        cells: [
          "Used",
          "Used. Workspace trust never gates a skill's allowed-tools in any session.",
        ],
      },
      {
        label:
          "permissions.allow rules and additionalDirectories in .claude/settings.json",
        cells: [
          "Not used until you accept the trust dialog, which appears again listing them",
          "Not used. Claude Code prints a workspace has not been trusted warning to stderr.",
        ],
      },
      {
        label:
          "Frontmatter hooks in a project subagent, a project skills-directory plugin, and extraKnownMarketplaces entries",
        cells: [
          "Not used, and no dialog is offered",
          "Not used.",
        ],
      },
      {
        label: "Inline mcpServers in the frontmatter of a project subagent",
        cells: [
          "Not used, and no dialog is offered",
          "Not used.",
        ],
      },
      {
        label:
          "Servers in .mcp.json, including ones the repository approves in its own settings",
        cells: [
          "Claude Code asks you before connecting them. The repository's own approvals do not count",
          "Connected without asking, approved or not.",
        ],
      },
      {
        label: "A headersHelper on a server in .mcp.json",
        cells: [
          "Not run until you accept the trust dialog, which names where the helper is declared",
          "Not run. Claude Code connects the server with its static headers alone.",
        ],
      },
    ],
    notes: [
      "Trust is keyed on the git repository root, so accepting it once covers the whole repository apart from a nested repository such as a submodule. Outside a repository it is keyed on the directory you started in. Starting in your home directory holds the trust for that session only and never writes it to disk.",
      "The asymmetry is deliberate and useful. Rules that grant capability wait for trust; rules that restrict do not. Deny and ask rules from a committed settings file apply in every session, trusted or not. So a team file that denies reading .env and secrets works on a fresh clone immediately, while the allow list that makes the day pleasant does not.",
      "One more trap for teams that keep a tracked local settings file. .claude/settings.local.json is normally treated as yours and its allow rules apply without the trust step, but when the file is tracked in git, or when .claude is a symlink, Claude Code treats it as repository-supplied and holds its rules until you trust the folder. If you are committing that file on purpose, you have quietly moved it into the same queue as the shared one.",
      "For automation there is a documented manual override: set projects[<path>].hasTrustDialogAccepted to true in ~/.claude.json, where the path is the repository root. That is the honest way to make a CI image work, rather than discovering at 2am that half a committed configuration is inert.",
    ],
    link: {
      lead: "Which other clients read the same folders your team is committing is in",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: ["permissions", "mcp", "settings"],
  },
  install: {
    title: "A rollout in the order that avoids rework",
    intro:
      "Seven steps, in the order that stops you from redoing the previous one. The first four are decisions, the last three are files. A team that already runs Claude Code individually can start at step three.",
    steps: [
      {
        title: "Confirm the plan carries what you are about to rely on",
        body: "Server-managed settings, the analytics dashboard, SSO, and Code Review exist on Team and Enterprise and not on Pro or Max. On an older Enterprise plan, check the seat type: Claude Code needs a Chat + Claude Code seat or a Premium seat there, while new and self-serve Enterprise plans include it with the single seat. Get this wrong and steps two and seven have nothing to run on.",
      },
      {
        title: "Choose how managed settings reach machines, or decide not to have any",
        body: "Server-managed settings need only the Owner or Primary Owner role and the claude.ai console, and they reach cloud sessions. An MDM plist or HKLM registry policy resists tampering because writing it takes admin rights, and it works on any provider. A file at /etc/claude-code or the macOS equivalent is the simplest to script. Claude Code applies the first source that delivers at least one policy key, so pick one as the primary and treat the rest as fallback.",
      },
      {
        title: "Decide what is policy and what is guidance",
        body: "Tools, commands, paths, sandboxing, login method, and model restrictions are settings keys and are enforced by the client. Code style, review expectations, and data-handling reminders are CLAUDE.md and are followed rather than obeyed. Write the list in two columns before writing any JSON, because moving an item later means moving it between two different delivery mechanisms.",
      },
      {
        title: "Commit the shared settings file first, and start with deny",
        body: "Deny and ask rules apply on a fresh clone with no trust step, so they are the part of the file that works on day one. Allow rules and extraKnownMarketplaces entries wait for each person to trust the folder. Put the deny list, the ask list, the env block, and the hooks in .claude/settings.json, commit it, and tell people the first run will show a dialog listing what the repository wants to grant.",
      },
      {
        title: "Put the conventions where their scope actually is",
        body: "One project CLAUDE.md at ./CLAUDE.md or ./.claude/CLAUDE.md for anything repository specific, .claude/rules/ once that file stops being readable, and a managed policy CLAUDE.md only for text that must apply in every repository on the machine. Ask a teammate to run /context and read the Memory files list rather than assuming the file loaded.",
      },
      {
        title: "Commit the skills and the MCP file the same way",
        body: "A skill folder goes in .claude/skills/<skill-name>/SKILL.md and travels with the clone, including into cloud sessions. A shared MCP server goes in .mcp.json at the repository root, and each teammate approves it once in an interactive session. Remember that a personal skill of the same name outranks the committed one, so pick names your team will not shadow by accident.",
      },
      {
        title: "Move everything that outlives one repository into a plugin",
        body: "Declare the marketplace in extraKnownMarketplaces and the plugins in enabledPlugins in the same committed settings file, then expect the first run to print a claude plugin install command rather than installing an external plugin silently. For containers and CI, build a seed directory once and point CLAUDE_CODE_PLUGIN_SEED_DIR at it so nothing is cloned at runtime.",
      },
    ],
    template: `{
  "permissions": {
    "allow": ["Bash(npm run *)"],
    "ask": ["Bash(git push *)"],
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./secrets/**)"]
  },
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp"
  },
  "extraKnownMarketplaces": {
    "acme-tools": {
      "source": { "source": "github", "repo": "acme-corp/claude-plugins" }
    }
  },
  "enabledPlugins": {
    "code-formatter@acme-tools": true
  }
}`,
    templateLanguage: "json",
    sourceIds: [
      "settings-example",
      "settings",
      "memory",
      "skills",
      "discover-plugins",
      "permissions",
      "seats-support",
    ],
  },
  team: {
    title: "The half of the rollout that has no setting",
    intro:
      "Everything above is distribution: getting files onto machines and keeping the wrong ones off. Selection is the other half, and it is knowing which skill to reach for and why that one. Claude Code has an excellent answer to the first and, by Anthropic's own account, none to the second.",
    body: [
      "Start with what works, because it works well. If every skill your team uses belongs to one repository everybody works in, commit them to .claude/skills, commit .claude/settings.json beside them, and you are close to finished. Teammates get the whole set on the next pull, cloud sessions get the ones in the clone, and an administrator can lock the rest of the surface down with managed settings. Nothing on this page should talk you out of any of that.",
      "It stops being enough at three edges. The first is more than one repository: a settings file is per repository, so a skill useful in eight of them has to be published as a plugin or copied eight times. The second is more than one agent, because a teammate who lives in Codex, Cursor, or Copilot is not going to read your .claude/settings.json even though they may read the same SKILL.md. The third is the one none of the mechanisms address. Anthropic writes it out in the managed MCP documentation: there is no built-in registry to browse, and the advice is to publish the approved list somewhere your users will find it, such as an internal wiki. The same is true of skills. The install path is solved; the shortlist is a document somebody has to keep.",
      "Skills Board is the web app where a team keeps and shares its AI skills. Each saved entry keeps the original source repository and path visible, teammates search the library by task or by a tag the team invented, and each of them picks the way of using the skill that suits the agent they actually run. It is the internal wiki page the documentation tells you to write, except that it is searchable by an agent and it carries the install commands.",
    ],
    paths: [
      {
        label: "Install the plugin",
        body: "Run /plugin marketplace add TommyBez/skillsboard and then /plugin install skills-board@skills-board, and Claude Code has the team library in session. The install is per user, not per team: committing the marketplace in extraKnownMarketplaces and the plugin in enabledPlugins makes every fresh clone prompt each teammate with that exact install command on the first run, and the seed directory provisions it without a prompt in containers and CI, exactly as the plugins section above describes.",
      },
      {
        label: "Or point one MCP endpoint at it",
        body: "Skills Board is reachable as a Streamable HTTP MCP server at https://www.skillsboard.sh/api/mcp, with browser sign-in and no API key to copy. Added with claude mcp add --scope project it lands in the committed .mcp.json and every teammate approves it once; added at user scope it follows one developer across every repository.",
      },
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and the path it came from, so a teammate can read the SKILL.md, and anything in scripts beside it, before the folder goes anywhere Claude Code scans. That is the read that matters most for a skill with allowed-tools in its frontmatter, because workspace trust never gates that field.",
      },
      {
        label: "Copy an install command or download a ZIP",
        body: "The command is npx skills add for the saved source, and the ZIP is the latest files available from the source at download time, for anyone who would rather place the folder in .claude/skills by hand. Both sit beside the plugin and MCP routes rather than instead of them.",
      },
    ],
    limits: [
      "Saving a skill records that a team has it in use. It is not a security review, an approval, or a license opinion, and it is a team's own choice rather than a verdict on the code.",
      "Skills Board follows the latest version available from the saved source. Saved skills track the source; a published collection release pins the commit it was built from.",
      "Saving a skill does not install it. The folder still has to land in a directory Claude Code scans, by the plugin, by the CLI, or by hand.",
      "An MCP connection cannot install or run a skill, and it cannot edit or delete saved team skills.",
      "None of this replaces managed settings. Policy enforcement is the client's job, and no external service can substitute for a permissions.deny rule.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "A worked shortlist, with the selection criteria written down rather than implied, is in",
      label: "The best Claude skills, with the criteria used to pick them",
      href: bestClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["managed-mcp", "skills", "discover-plugins"],
  },
  openQuestions: {
    title: "What the documentation does not answer",
    intro:
      "Six things a team rollout runs into that Anthropic's pages either leave open or answer in two places that disagree. Each is stated as an absence rather than filled in with a guess.",
    entries: [
      {
        title: "The enterprise skills location has no published path",
        body: "The skills page lists Enterprise as one of the four locations and points at managed settings for the path. The managed settings page documents managed-settings.json, a managed-settings.d directory, and managed-mcp.json in the system directory, and never names a skills folder. The settings reference calls it the managed policy directory without saying where that is. An administrator cannot deploy an organization-wide skill from these three pages alone.",
      },
      {
        title: "Personal skills outrank project skills, and settings do the opposite",
        body: "The skills page states that enterprise overrides personal and personal overrides project. The settings page puts project local and shared project above user settings. Both orders are documented clearly; no page acknowledges that the two subsystems disagree, or says why a developer's own skill should win over the one their team committed.",
      },
      {
        title: "The plan matrix and the seat types do not line up",
        body: "The feature availability matrix has columns for Pro, Max, Team, and Enterprise. The help center article adds that on older Enterprise plans Claude Code needs a Chat + Claude Code or Premium seat, and that Team has premium seats with more usage. The matrix has no column for seat type, so a row marked available for Enterprise can still be unavailable to a given person.",
      },
      {
        title: "Analytics stops at usage and contribution",
        body: "The dashboard publishes daily active users, sessions, suggestion accept rate, lines of code accepted, pull requests with Claude Code, and a top ten leaderboard. Nothing on that page reports which skills, plugins, or MCP servers a team actually used. The one adoption question a configuration rollout creates is the one the adoption dashboard does not answer.",
      },
      {
        title: "There is no registry to browse, and Anthropic says so",
        body: "The managed MCP page states outright that Claude Code has no built-in MCP server registry users can browse and install from, and suggests publishing the approved list on an internal wiki instead. The skills documentation has no equivalent sentence, and no equivalent registry either. The distribution mechanisms are complete; the catalog is left to each organization.",
      },
      {
        title: "Nothing records why a skill was chosen",
        body: "A committed folder, a plugin manifest, and a settings file all record what got installed. None of them record who decided, when, what the alternatives were, or when the choice should be revisited. That knowledge lives in a thread today, which is not a gap in the documentation so much as a gap the documentation leaves for a team to fill.",
      },
    ],
    sourceIds: [
      "skills",
      "settings",
      "managed-settings",
      "feature-availability",
      "seats-support",
      "analytics",
      "managed-mcp",
    ],
  },
  faq: [
    {
      question: "Does Claude Code come with a Team plan seat?",
      answer:
        "Yes. Anthropic states that Claude Code is included with every Team plan seat, with premium seats carrying more usage for heavier workloads. On new and self-serve Enterprise plans it is included with the single seat. On older Enterprise plans it needs a Chat + Claude Code seat or a Premium seat instead.",
    },
    {
      question: "How does a team share Claude Code settings?",
      answer:
        "Commit .claude/settings.json at the repository root. Everyone who starts Claude Code in that folder gets the same permissions, hooks, environment variables, and plugin declarations, and so does a cloud session that clones the repository. Each teammate can still override it for themselves in .claude/settings.local.json, which Claude Code keeps out of git.",
    },
    {
      question: "Where do team skills go in Claude Code?",
      answer:
        "In the project skills directory, .claude/skills, one folder per skill with a SKILL.md inside it. That folder travels with every clone, including into cloud sessions. For skills that outlive one repository, put a skills directory in a plugin and declare the marketplace in the committed settings file instead.",
    },
    {
      question: "How does a team share an MCP server in Claude Code?",
      answer:
        "Use project scope. Run claude mcp add --scope project, or add the entry under mcpServers in .mcp.json at the repository root and commit it. Each teammate approves the server once in an interactive session. Local and user scope both live in ~/.claude.json and are never shared with anyone.",
    },
    {
      question:
        "What is the difference between CLAUDE.md and managed settings for a team?",
      answer:
        "Enforcement. Anthropic writes that settings rules are enforced by the client regardless of what Claude decides to do, while CLAUDE.md instructions shape behavior without being a hard enforcement layer. Put blocked tools, commands, paths, and login restrictions in settings, and put code style, review expectations, and compliance reminders in CLAUDE.md.",
    },
    {
      question: "Can an admin lock down what Claude Code loads for the team?",
      answer:
        "Yes, from managed settings and nowhere else. strictPluginOnlyCustomization limits skills, agents, hooks, and MCP servers to plugins and managed sources, strictKnownMarketplaces allowlists the marketplace sources people may add, allowManagedPermissionRulesOnly drops every permission rule that is not managed, and a managed-mcp.json with an empty server map turns MCP off entirely.",
    },
    {
      question:
        "Why do the permission rules my team committed not apply after cloning?",
      answer:
        "Workspace trust. Allow rules and additionalDirectories from a repository settings file are held until the person accepts the trust dialog for that exact folder, and a claude -p or Agent SDK run never shows the dialog. Deny and ask rules are unaffected and apply in every session, trusted or not.",
    },
  ],
  sources: [
    {
      id: "admin-setup",
      label: "Set up Claude Code for your organization",
      href: "https://code.claude.com/docs/en/admin-setup",
      note: "The decision map for a rollout: provider, delivery mechanism, what to enforce, usage visibility, data handling, and the verify step with /status.",
    },
    {
      id: "settings",
      label: "Claude Code settings",
      href: "https://code.claude.com/docs/en/settings",
      note: "The four settings files, who each one reaches, the five-layer precedence order, and the list-merge rules.",
    },
    {
      id: "settings-reference",
      label: "Claude Code settings reference",
      href: "https://code.claude.com/docs/en/settings-reference",
      note: "Every key with its scope, including strictPluginOnlyCustomization and its four surface sub-keys.",
    },
    {
      id: "settings-example",
      label: "Example settings files",
      href: "https://code.claude.com/docs/en/settings-example",
      note: "A team's shared settings file, published as a copyable JSON document with the three caveats that precede committing one.",
    },
    {
      id: "managed-settings",
      label: "Deploy managed settings",
      href: "https://code.claude.com/docs/en/managed-settings",
      note: "The four delivery mechanisms with their file paths, precedence within the managed tier, and what a developer can still change.",
    },
    {
      id: "server-managed-settings",
      label: "Configure server-managed settings",
      href: "https://code.claude.com/docs/en/server-managed-settings",
      note: "Delivery from the claude.ai console: the plan requirement, the Owner or Primary Owner role, hourly refresh, and the cloud-session reach that endpoint-managed settings do not have.",
    },
    {
      id: "memory",
      label: "How Claude remembers your project",
      href: "https://code.claude.com/docs/en/memory",
      note: "The CLAUDE.md scope table, the managed policy file and the claudeMd key, claudeMdExcludes, and the enforcement versus guidance distinction.",
    },
    {
      id: "skills",
      label: "Extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where skills live, the precedence between the levels, nested and added directories, the three sharing scopes, and what Cowork and cloud sessions do not read.",
    },
    {
      id: "discover-plugins",
      label: "Discover and install prebuilt plugins through marketplaces",
      href: "https://code.claude.com/docs/en/discover-plugins",
      note: "The team marketplace section, and the v2.1.195 change that stops an external plugin from installing itself when only project settings enable it.",
    },
    {
      id: "plugin-marketplaces",
      label: "Create and distribute a plugin marketplace",
      href: "https://code.claude.com/docs/en/plugin-marketplaces",
      note: "extraKnownMarketplaces and enabledPlugins in a repository, the plugin seed directory for containers, and the managed marketplace restrictions.",
    },
    {
      id: "mcp",
      label: "Connect Claude Code to tools via MCP",
      href: "https://code.claude.com/docs/en/mcp",
      note: "The three installation scopes with their storage locations, the precedence order including plugins and connectors, and the approval behavior by session type.",
    },
    {
      id: "managed-mcp",
      label: "Control MCP server access for your organization",
      href: "https://code.claude.com/docs/en/managed-mcp",
      note: "The seven restriction patterns, and the statement that Claude Code has no built-in MCP server registry to browse.",
    },
    {
      id: "permissions",
      label: "Configure permissions",
      href: "https://code.claude.com/docs/en/permissions",
      note: "Project allow rules and workspace trust, and the table of what a repository supplies before the folder itself is trusted.",
    },
    {
      id: "analytics",
      label: "Track team usage with analytics",
      href: "https://code.claude.com/docs/en/analytics",
      note: "The Team and Enterprise dashboard, the metrics it publishes, the GitHub app that contribution metrics require, and the Zero Data Retention exclusion.",
    },
    {
      id: "feature-availability",
      label: "Feature availability",
      href: "https://code.claude.com/docs/en/feature-availability",
      note: "The per-provider tables and the availability by subscription plan matrix that the plans section reproduces.",
    },
    {
      id: "seats-support",
      label: "Use Claude Code with your Team or Enterprise plan",
      href: "https://support.claude.com/en/articles/11845131-use-claude-code-with-your-team-or-enterprise-plan",
      note: "Anthropic help center article dated June 11, 2026: which seat types include Claude Code, IDE coverage, and what happens at the usage limit.",
    },
  ],
  related: [
    {
      label: "How to manage AI skills across an organization",
      href: manageAiSkillsPath,
      description:
        "The same question one level up, across every agent your organization runs rather than Claude Code alone.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "Claude Code beside ten other clients whose own documentation says they read the format.",
    },
    {
      label: "The best Claude skills, with the criteria used to pick them",
      href: bestClaudeSkillsPath,
      description:
        "A worked shortlist for the selection half of the problem, with every rejection reason named.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The format itself, from the Claude side, and the folder your team commits to .claude/skills.",
    },
    {
      label: "Install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "The per-machine version of the skills section, with the locations and the precedence in step form.",
    },
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The authoring rules field by field, including the two sources that disagree about the description.",
    },
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "When a team needs the package rather than the folder, and what a plugin carries that a skill cannot.",
    },
    {
      label: "Share Agent Skills with your team",
      href: guidePaths.shareTeamSkills,
      description:
        "The short operational version, for a team that wants one canonical source before it configures anything.",
    },
    {
      label: "Skill examples: eight real SKILL.md files",
      href: skillExamplesPath,
      description:
        "Real files read line by line, useful before you commit the first folder to a repository everyone clones.",
    },
    {
      label: "Agent Skills: the format, explained",
      href: agentSkillsPath,
      description:
        "The vendor-neutral definition, for the teammates who are not in Claude Code at all.",
    },
  ],
  og: {
    eyebrow: "Claude Code for Teams",
    title: [
      { text: "Five settings layers," },
      { text: "and one trust dialog.", accent: true },
    ],
    description:
      "What a Claude Code rollout actually configures: the plan, managed settings, CLAUDE.md, skills, plugins, MCP, and what a clone does not give a teammate.",
    contextLabel: "skillsboard.sh/claude-code-for-teams",
    chips: ["managed settings", ".claude/skills", "workspace trust"],
  },
  ogAlt:
    "Explainer on Claude Code for teams: plan requirements, the five settings layers, where team skills and MCP servers live, and the workspace trust step.",
  publishedAt: "2026-08-24",
  modifiedAt: "2026-08-24",
}
