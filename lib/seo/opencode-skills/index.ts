import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { opencodeSkillsPath } from "@/lib/seo/opencode-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { vercelSkillsPath } from "@/lib/seo/vercel-skills/types"

export {
  opencodeSkillsPath,
  type OpencodeSkillsCtaPlacement,
  type OpencodeSkillsPath,
} from "@/lib/seo/opencode-skills/types"

export interface OpencodeSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface OpencodeSkillsFaqEntry {
  question: string
  answer: string
}

export interface OpencodeSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface OpencodeSkillsInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface OpencodeSkillsTableSection {
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

export interface OpencodeSkillsDefinition {
  path: typeof opencodeSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsSupportPath
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
  locations: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
  loading: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
  frontmatter: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
  permissions: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
  versions: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
  transfers: OpencodeSkillsTableSection & { link: OpencodeSkillsInlineLink }
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
    link: OpencodeSkillsInlineLink
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
  faq: readonly OpencodeSkillsFaqEntry[]
  sources: readonly OpencodeSkillsSource[]
  related: readonly OpencodeSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const opencodeSkills: OpencodeSkillsDefinition = {
  path: opencodeSkillsPath,
  contentType: "article",
  topics: [
    "opencode skills",
    "skill format",
    "compatibility",
    "skill sharing",
  ],
  relatedGuidePaths: [
    agentSkillsSupportPath,
    codexSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "OpenCode Skills",
  title: "OpenCode skills: what they are and how to use them",
  seoTitle:
    "OpenCode Skills: What They Are and How to Use Them | Skills Board",
  description:
    "An OpenCode skill is a folder with a SKILL.md file that OpenCode loads on demand through a built-in skill tool. The six directories it scans, the five frontmatter fields it recognizes, the allow, ask, and deny model it puts in front of every skill, what the OpenCode 2 beta changes, and how a team distributes one.",
  intro: [
    "OpenCode reads the same SKILL.md file that Claude Code, Codex, and Cursor read, and then does two things none of them do. It exposes skills to the model as a tool call rather than as a list of instructions, and it puts a permission decision in front of every single one. Both are documented, and both change how you would design a skill for a team that runs OpenCode.",
    "The file itself is the ordinary one. A folder, a SKILL.md inside it, YAML frontmatter with a name and a description, then Markdown. The Agent Skills specification at agentskills.io defines that shape, and OpenCode appears on its client showcase alongside Claude Code, Codex, and Cursor. Nothing you write for one of them has to be rewritten for OpenCode.",
    "One thing to settle before anything else. OpenCode publishes two documentation sets right now, and they do not describe the same behavior. The stable set at opencode.ai/docs is what a normal install follows, and it is what this page describes by default. A second set at opencode.ai/v2/docs covers a beta that will become OpenCode 2.0, and its skills page answers several questions the stable one leaves open. Every claim below is labelled with the set it came from.",
    "What follows is what those pages say, fetched on August 21, 2026: every directory OpenCode scans, the walk it does to find them, the five frontmatter fields it accepts and what happens to the rest, the skill tool and the permission model wrapped around it, what the beta changes, what happens when the same file moves between agents, what a team does once more than one person depends on a skill, and the parts neither set documents.",
  ],
  answer:
    "An OpenCode skill is a directory containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. OpenCode discovers skills from six directories at startup, lists each name and description inside the description of a built-in skill tool, and the agent loads the full file by calling that tool when a task matches.",
  answerNotes: [
    "The loading route is the part that is specific to OpenCode. Other clients present discovered skills as context the model reads. OpenCode publishes an available_skills block inside the description of its skill tool, one entry per skill with its name and description, and the agent activates one by calling skill with that name. Loading a skill is a tool call, which is why it can be permissioned like any other tool call.",
    "Every activation passes a permission check. OpenCode documents a skill key in its permission config that takes allow, ask, or deny, supports wildcard patterns over skill names, and can be overridden per agent. A skill set to deny is hidden from the agent entirely rather than merely refused, and the whole tool can be switched off for an agent that should not have skills at all.",
    "The frontmatter allowlist is closed and short. The stable documentation recognizes name, description, license, compatibility, and metadata, and states that unknown frontmatter fields are ignored. That makes it the one documented client on our compatibility matrix that says out loud what it does with a field it does not know, and it also means the specification's experimental allowed-tools field does nothing here.",
    "The beta moves several of these answers. The OpenCode 2 documentation derives a skill ID from the path rather than the frontmatter, stops enforcing the name rules, reads a different set of frontmatter fields, publishes a precedence order between sources, adds skill sources you configure yourself including HTTP catalogs, and switches the permission config to an ordered array of rules. The versions section below is the row by row difference.",
  ],
  answerSourceIds: ["opencode-skills", "opencode-tools", "agentskills-home"],
  locations: {
    title: "Where OpenCode looks for skills",
    intro:
      "Six directories, in three pairs: OpenCode's own, the Claude-compatible pair, and the vendor-neutral pair. Each pair has a project form and a global form, and every skill is a folder with SKILL.md inside it, named after the folder.",
    columns: ["Location", "Scope", "What it is for"],
    rows: [
      {
        label: ".opencode/skills/<name>/SKILL.md",
        cells: [
          "Project",
          "OpenCode's own project directory, alongside the agents, commands, plugins, and tools folders that live under .opencode in the same repository.",
        ],
      },
      {
        label: "~/.config/opencode/skills/<name>/SKILL.md",
        cells: [
          "Global",
          "OpenCode's own personal directory, next to the global opencode.json and the global AGENTS.md. Applies to every project you open.",
        ],
      },
      {
        label: ".claude/skills/<name>/SKILL.md",
        cells: [
          "Project, Claude compatible",
          "Documented as Claude Code compatibility, so a repository already set up for Claude Code needs no second copy of anything.",
        ],
      },
      {
        label: "~/.claude/skills/<name>/SKILL.md",
        cells: [
          "Global, Claude compatible",
          "The personal half of the same compatibility. Both Claude paths can be switched off with an environment variable, which the notes below cover.",
        ],
      },
      {
        label: ".agents/skills/<name>/SKILL.md",
        cells: [
          "Project, agent neutral",
          "The vendor-neutral project path that Codex and Cursor also document. This is the folder to pick when teammates run more than one agent.",
        ],
      },
      {
        label: "~/.agents/skills/<name>/SKILL.md",
        cells: [
          "Global, agent neutral",
          "The personal form of the neutral path, shared with Cursor. The skills CLI installs OpenCode global skills to the OpenCode path instead, which the portability section covers.",
        ],
      },
    ],
    notes: [
      "Project discovery walks upward, and it stops at the git worktree. OpenCode starts at your current working directory and walks up until it reaches the worktree, loading any matching skills folder in .opencode, .claude, or .agents along the way. In a monorepo that means a skill placed beside a package is found when you launch OpenCode inside that package, and a skill at the repository root is found from anywhere below it.",
      "The subdirectory names are plural, and the singular spelling still works. OpenCode's config documentation states that .opencode and ~/.config/opencode use plural subdirectory names, listing agents, commands, modes, plugins, skills, tools, and themes, and that singular names such as agent are supported for backwards compatibility.",
      "The Claude compatibility is a switch, not a promise. OPENCODE_DISABLE_CLAUDE_CODE_SKILLS turns off loading from .claude/skills, and OPENCODE_DISABLE_CLAUDE_CODE turns off every .claude behavior including the prompt file. If you are relying on the Claude directories for a whole team, that is a variable somebody can set on their own machine without telling you.",
    ],
    link: {
      lead: "For the same directory question across every client that documents an answer, including which ones share the neutral path with OpenCode, see",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: ["opencode-skills", "opencode-rules", "opencode-config"],
  },
  loading: {
    title: "How a skill actually reaches the model",
    intro:
      "This is the part that is worth reading even if you have written skills before, because OpenCode does not put your skill in the prompt. It puts a tool in the prompt, and your skill is one of the things that tool can fetch.",
    columns: ["Stage", "What OpenCode documents"],
    rows: [
      {
        label: "Discovery at startup",
        cells: [
          "OpenCode searches the six locations above and collects every folder that holds a SKILL.md, reading the frontmatter to get the name and the description.",
        ],
      },
      {
        label: "The listing",
        cells: [
          "Available skills appear inside the description of the built-in skill tool, as an available_skills block with one entry per skill carrying its name and its description. Nothing else from the file is present at this point.",
        ],
      },
      {
        label: "Activation",
        cells: [
          "The agent calls the tool by name, in the documented form skill with a name argument. The documentation for that tool describes it as loading a SKILL.md file and returning its content in the conversation.",
        ],
      },
      {
        label: "The permission gate",
        cells: [
          "The call is checked against the skill permission rules before it runs. Allow loads it immediately, ask prompts you first, and deny both rejects the call and hides the skill from the agent.",
        ],
      },
      {
        label: "Turning the whole thing off",
        cells: [
          "Setting the skill tool to false for an agent removes skills from it, and OpenCode documents that the available_skills section is then omitted entirely.",
        ],
      },
    ],
    notes: [
      "The description is the entire trigger surface, more literally here than elsewhere. It is the only thing besides the name that reaches the model before activation, and it reaches it as part of a tool description rather than as a system instruction. Write it as what the skill does and when to use it, in the words a teammate would type. OpenCode's own guidance is to keep it specific enough for the agent to choose correctly, within the 1 to 1024 character range it enforces.",
      "Because activation is a tool call, everything OpenCode does to tool calls applies. It can be denied, it can be made to ask, it can be restricted per agent, and it shows up in the permission events a plugin can subscribe to. That is a genuinely different model from a client that simply injects discovered skill metadata into context and hopes the model behaves.",
      "There is no documented explicit invocation syntax for skills. Codex documents a slash command and a prefix character for mentioning a skill, and Cursor documents typing a forward slash in Agent chat. OpenCode's skills page documents implicit selection through the tool and does not describe a user-facing way to force a specific skill, so the closest documented equivalent is a custom command whose template asks for it by name.",
    ],
    link: {
      lead: "For what the format defines before any client reads it, including progressive disclosure and the optional scripts, references, and assets folders, see",
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: ["opencode-skills", "opencode-tools", "codex-skills", "cursor-skills"],
  },
  frontmatter: {
    title: "The five frontmatter fields OpenCode recognizes",
    intro:
      "The stable documentation publishes an allowlist rather than a set of extensions. Two fields are required, three are optional, and it states plainly that anything else in the frontmatter is ignored. The OpenCode 2 beta reads a different set, which the versions section below sets out side by side.",
    columns: ["Field", "Required", "What OpenCode does with it"],
    rows: [
      {
        label: "name",
        cells: [
          "Yes",
          "The identifier the agent passes to the skill tool. OpenCode enforces 1 to 64 characters, lowercase alphanumerics with single hyphen separators, no leading or trailing hyphen, no consecutive hyphens, and a match with the directory that contains SKILL.md. It even publishes the regular expression.",
        ],
      },
      {
        label: "description",
        cells: [
          "Yes",
          "1 to 1024 characters, and the only content that reaches the model before activation. OpenCode's instruction is to keep it specific enough for the agent to choose correctly.",
        ],
      },
      {
        label: "license",
        cells: [
          "No",
          "Recognized and accepted. OpenCode does not document any behavior attached to it, and the specification describes it as the license name or a reference to a bundled license file.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "No",
          "Recognized and accepted. The specification caps it at 500 characters and uses it for environment requirements such as an intended product or a required system package. OpenCode's own example sets it to opencode.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "No",
          "A string to string map, the same shape the specification defines for client-specific properties. OpenCode's example carries an audience and a workflow key.",
        ],
      },
      {
        label: "Anything else",
        cells: [
          "No",
          "Ignored. That includes the specification's experimental allowed-tools field and every field another product added on top, so a skill that relies on one of them loses that behavior here rather than failing loudly.",
        ],
      },
    ],
    notes: [
      "Ignoring allowed-tools is not the same as ignoring the problem it solves. OpenCode's answer to which tools a skill may use is the permission config in the next section, which sits outside the skill file and belongs to the person running the agent rather than to the person who wrote the skill. That is a defensible split, and it means a skill cannot pre-approve its own tools here.",
      "One widely circulated compatibility table disagrees with the vendor on this point. The README of the skills CLI, the one behind npx skills add, lists allowed-tools as supported for OpenCode. OpenCode's own documentation publishes a five-field allowlist that does not include it and says unknown fields are ignored. We treat the vendor documentation as authoritative and record the disagreement rather than smoothing it over.",
      "The body below the frontmatter is ordinary Markdown with no documented restrictions, and the whole of it is returned into the conversation once the skill is activated. The specification recommends keeping SKILL.md under 500 lines and moving detail into separate files, which is advice the stable page does not restate. The beta does: it hands the agent the skill base directory and a sample of up to ten supporting file paths, without loading their contents.",
    ],
    link: {
      lead: "For the same field by field walkthrough on the OpenAI side, including the separate agents/openai.yaml metadata file Codex reads, see",
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      trail: ".",
    },
    sourceIds: ["opencode-skills", "agentskills-spec", "skills-cli"],
  },
  permissions: {
    title: "The permission model in front of every skill",
    intro:
      "Two other clients get close. Codex publishes an enabled flag per skill path in its config file, and our own client matrix found that Gemini CLI shows a confirmation prompt before a skill activates. Only OpenCode publishes a rule language: allow, ask, or deny matched against skill names, in the same config that gates bash and file edits. It is the single most useful thing to know before a team turns a shared skills folder on. The syntax below is the stable one; the beta keeps the same three effects and changes the shape of the config.",
    columns: ["Where it goes", "Example", "What it does"],
    rows: [
      {
        label: "Global default",
        cells: [
          'permission.skill set to "allow" in opencode.json',
          "Every skill loads without a prompt. This is effectively the starting point, since OpenCode documents that most permissions default to allow.",
        ],
      },
      {
        label: "Per-skill patterns",
        cells: [
          '"internal-*": "deny" beside "*": "allow"',
          "Wildcard matching on the skill name. A denied skill is hidden from the agent and the call is rejected, so it is not a soft preference.",
        ],
      },
      {
        label: "Prompt before loading",
        cells: [
          '"experimental-*": "ask"',
          "The agent has to get your approval before the skill is loaded. The prompt offers once, always for the rest of the session, or reject.",
        ],
      },
      {
        label: "Per custom agent",
        cells: [
          'permission.skill in the agent Markdown frontmatter',
          "A subagent or custom agent defined in a Markdown file carries its own skill rules, merged with the global config, with the agent rules taking precedence.",
        ],
      },
      {
        label: "Per built-in agent",
        cells: [
          'agent.plan.permission.skill in opencode.json',
          "The same override for the agents OpenCode ships, so the planning agent can reach a set of skills the building agent cannot, or the reverse.",
        ],
      },
      {
        label: "No skills at all",
        cells: [
          "tools.skill set to false for an agent",
          "Removes the tool. OpenCode documents that the available_skills listing then disappears from that agent completely.",
        ],
      },
    ],
    notes: [
      "The defaults are permissive, and that is a deliberate design choice rather than an oversight. OpenCode documents that most permissions default to allow, with only the repeated-call guard and the external directory guard defaulting to ask. If your team wants a skill to be reviewed before it can load, somebody has to write the rule, and the rule lives in config that a developer can edit on their own machine.",
      "Rules are matched by pattern with the last matching rule winning, which is the opposite of what most people assume. The documented pattern is to put the catch-all first and the specific rules after it. The same wildcard syntax used elsewhere applies: an asterisk matches any run of characters and a question mark matches exactly one.",
      "The command line knows about it too. The opencode agent create command takes a comma separated permissions list, and skill is one of the values it accepts, with anything omitted denied. That is the fastest way to produce an agent that can read and search but cannot pull in a skill.",
    ],
    link: {
      lead: "Deciding which skills deserve an allow rule is the same decision as deciding what to adopt in the first place, which has its own scorecard in",
      label: "Choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ".",
    },
    sourceIds: [
      "opencode-skills",
      "opencode-permissions",
      "opencode-agents",
      "opencode-cli",
      "codex-skills",
    ],
  },
  versions: {
    title: "What the OpenCode 2 beta changes about skills",
    intro:
      "The beta documentation carries its own banner: these are the docs for the beta version of OpenCode, which will become OpenCode 2.0, and things may still break. Its skills page is not a rewrite of the stable one, it is a different design, and it answers three questions the stable page leaves open. Nothing in this column is a promise about the release you have installed today.",
    columns: ["Area", "Stable documentation", "OpenCode 2 beta"],
    rows: [
      {
        label: "Skill identity",
        cells: [
          "The frontmatter name is the identifier, and it has to match the directory that contains SKILL.md",
          "The ID comes from the path and the frontmatter name is only a display label. A root-level Markdown file works too, so skills/git-release.md and skills/git-release/SKILL.md both produce the ID git-release",
        ],
      },
      {
        label: "Name validation",
        cells: [
          "1 to 64 characters, lowercase alphanumerics with single hyphens, matching the directory, with the regular expression published",
          "Not enforced. The beta states plainly that it does not currently enforce the Agent Skills name regex, the length limits, the directory match, or the description cap, and recommends the same shape anyway",
        ],
      },
      {
        label: "Frontmatter read",
        cells: [
          "name and description required, license, compatibility, and metadata optional, everything else ignored",
          "name, description, a slash field, and two metadata keys under opencode/. Frontmatter is optional at runtime, but a skill without a description is not advertised to the model. license and compatibility are accepted for portability and not interpreted",
        ],
      },
      {
        label: "Precedence between sources",
        cells: [
          "Not published. The troubleshooting list only says to keep names unique",
          "Published as an ordered list, later source wins: built-in skills, then the Claude paths, then the neutral paths, then the OpenCode global folder, then the project folder, then explicit config entries",
        ],
      },
      {
        label: "Extra skill sources",
        cells: [
          "None. The six directories are the whole discovery surface",
          "A skills array in opencode.json takes additional local directories and HTTP catalogs, and the arrays from every discovered config document add up rather than replacing each other",
        ],
      },
      {
        label: "Supporting files",
        cells: [
          "Not mentioned. The page describes SKILL.md and its frontmatter only",
          "On activation the agent is given the skill base directory and a sample of up to ten supporting file paths. Contents are not loaded automatically, and a flat Markdown skill gets no neighboring file list at all",
        ],
      },
      {
        label: "Permission syntax",
        cells: [
          "An object under permission with a skill key holding a pattern to action map",
          "An ordered array under permissions of action, resource, and effect rules, where skill is the action and the skill ID is the resource. The beta warns that V1 field and action names are not valid in V2 configuration",
        ],
      },
      {
        label: "Default when no rule matches",
        cells: [
          "Allow. Most permissions default to allow, with only the repeated-call and external directory guards defaulting to ask",
          "Ask. The beta states that if no rule matches, the result is ask, and then lists the ordered defaults each shipped agent starts from",
        ],
      },
      {
        label: "Invoking a skill on purpose",
        cells: [
          "No documented user-facing syntax",
          "A skill can be activated explicitly by its exact ID, and a slash field hides a skill from interactive command catalogs when set to false",
        ],
      },
    ],
    notes: [
      "The practical reading is that a skill written to the stable rules keeps working in the beta, and the reverse is not true. Lowercase kebab-case IDs, a directory per skill, a real description, and no reliance on frontmatter beyond name and description survive both. A skill that leans on the beta's slash or autoinvoke keys, or on an HTTP catalog, has nothing to fall back on in the stable release.",
      "The HTTP catalog is the most interesting thing in either document for a team, and also the least settled. A base URL serving an index.json that lists skills with a name, a version, and a file list is a distribution channel that needs no package manager and no repository clone, with the version field acting as the cache buster. It is beta, it is same-origin only, and the beta itself notes an ID quirk for root-level SKILL.md files, so treat it as a direction rather than a plan.",
      "Neither document states which released binary implements which behavior beyond the beta banner, and OpenCode updates itself on startup unless you turn that off. If a detail on this page matters to your team, check it against the version you actually run rather than against a date.",
    ],
    link: {
      lead: "For the wider question of which clients read the format at all, and how little of this is standardized across them, see",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: [
      "opencode-v2-skills",
      "opencode-v2-permissions",
      "opencode-skills",
      "opencode-permissions",
      "opencode-config",
    ],
  },
  transfers: {
    title: "OpenCode skills, Codex skills, and Cursor skills: what transfers",
    intro:
      "All three read SKILL.md and all three read the neutral .agents/skills path, so the file moves. What does not move is everything each product built around the file, and OpenCode built more around it than the other two.",
    columns: ["Area", "OpenCode", "Codex", "Cursor"],
    rows: [
      {
        label: "Project directories",
        cells: [
          ".opencode/skills/, .claude/skills/, and .agents/skills/, walking up to the git worktree",
          ".agents/skills in every directory from the working directory up to the repository root",
          ".agents/skills/ and .cursor/skills/, plus .claude/skills/ and .codex/skills/ for compatibility",
        ],
      },
      {
        label: "Personal directories",
        cells: [
          "~/.config/opencode/skills/, ~/.claude/skills/, and ~/.agents/skills/",
          "$HOME/.agents/skills, plus /etc/codex/skills for an administrator",
          "~/.cursor/skills/ and ~/.agents/skills/, plus the two Claude and Codex ones",
        ],
      },
      {
        label: "Optional frontmatter recognized",
        cells: [
          "license, compatibility, metadata, and nothing else",
          "Invocation policy and interface metadata live in a separate agents/openai.yaml file rather than in the frontmatter",
          "paths, disable-model-invocation, metadata, and the legacy globs spelling",
        ],
      },
      {
        label: "Unknown frontmatter fields",
        cells: [
          "Documented as ignored in the stable set, and the beta reads a different set entirely",
          "Not documented",
          "Not documented",
        ],
      },
      {
        label: "How the agent reaches a skill",
        cells: [
          "A built-in skill tool the agent calls by name, listed in the tool description",
          "Implicit matching on the description, or explicit invocation with /skills or a dollar prefix",
          "Implicit matching, or typing a forward slash in Agent chat and searching the name",
        ],
      },
      {
        label: "Per-skill access control",
        cells: [
          "allow, ask, or deny per skill name, globally or per agent",
          "An enabled flag per skill path in the config file",
          "No permission rules, although disable-model-invocation in the frontmatter turns off automatic use for one skill",
        ],
      },
      {
        label: "Published context budget for the listing",
        cells: [
          "None published in either documentation set",
          "At most 2 percent of the context window, or 8,000 characters when it is unknown",
          "None published",
        ],
      },
    ],
    notes: [
      "Claude Code sits in this picture through OpenCode's compatibility paths rather than through a column of its own. OpenCode documents loading from .claude/skills and ~/.claude/skills, and Cursor documents the same two paths, so a repository set up for Claude Code is already readable by both. The reverse is not documented anywhere: no other client documents reading .opencode/skills.",
      "If you want one folder that all three of these agents read, it is .agents/skills. That is the path OpenCode, Codex, and Cursor all name, and adding a Claude Code copy or a symlink beside it covers the fourth. Committing that folder is the cheapest cross-agent setup available today, and it needs no tooling at all.",
      "Portability of the file is not portability of the result. The same instructions can load in four products and still produce different work, because the tools, the sandboxing, the models, and the surrounding instructions differ, and in OpenCode a permission rule can stop the skill from loading at all. Test a skill in each agent your teammates actually run before telling them it works there.",
    ],
    link: {
      lead: "For the Claude side of the same standard, including the format and the surfaces a skill runs on, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "opencode-skills",
      "codex-skills",
      "cursor-skills",
      "agentskills-spec",
    ],
  },
  install: {
    title: "How to add a skill to OpenCode, step by step",
    intro:
      "There is no marketplace step and no install command in OpenCode's own documentation. A skill is a folder you put in a directory OpenCode scans, and the fastest honest path is to write the folder yourself.",
    steps: [
      {
        title: "Pick the directory that matches the audience",
        body: "A skill everyone working in the repository should have goes in .agents/skills/ at the project root, because Codex and Cursor read it too. Use .opencode/skills/ instead when the skill only makes sense in OpenCode, for example when it depends on a custom tool a plugin registers. A skill that is yours alone goes in ~/.config/opencode/skills/.",
      },
      {
        title: "Create the folder and the SKILL.md file",
        body: "Make a directory named after the skill and put a SKILL.md inside it, spelled in capitals. The name in the frontmatter has to match that directory, use lowercase alphanumerics with single hyphens, avoid leading, trailing, and consecutive hyphens, and stay within 64 characters.",
      },
      {
        title: "Write the description as the trigger",
        body: "In OpenCode the description is the only thing the model sees before it decides to call the skill tool. Say what the skill does and when to use it, using the words someone would actually type. A description that reads like a table of contents entry gives the agent nothing to match on.",
      },
      {
        title: "Keep the body short and put the bulk beside it",
        body: "The whole SKILL.md body is returned into the conversation on activation, so length is a cost you pay every time. The specification recommends staying under 500 lines and moving detailed material into references/, executable code into scripts/, and templates into assets/, with relative paths from the skill root.",
      },
      {
        title: "Decide the permission before anyone else runs it",
        body: "Add a skill block to permission in opencode.json if the default of loading everything without asking is not what you want. Put the catch-all first and the specific patterns after it, since the last matching rule wins. A deny rule hides the skill from the agent rather than only refusing the call.",
      },
      {
        title: "Start OpenCode inside the project and check the listing",
        body: "Discovery walks up from the working directory to the git worktree, so launch OpenCode somewhere at or below the folder you used. Ask the agent what skills it has: the listing it reports comes from the available_skills block in the skill tool description, which is the same thing the model sees.",
      },
      {
        title: "If it does not appear, work through the four documented causes",
        body: "OpenCode's own troubleshooting list is short: SKILL.md has to be spelled in all capitals, the frontmatter has to include name and description, skill names have to be unique across all six locations, and a skill set to deny is hidden from the agent by design rather than by accident.",
      },
    ],
    template: `---
name: release-notes
description: Draft release notes from merged pull requests. Use when the user asks for release notes, a changelog entry, or a summary of what shipped.
license: MIT
metadata:
  audience: maintainers
---

## Steps

1. List the merged pull requests since the last tag.
2. Group them into features, fixes, and internal changes.
3. Write one line per user-visible change, in plain language.
4. Leave internal refactors out unless they change behavior.

## Output

A Markdown section titled with the version and the date.`,
    sourceIds: ["opencode-skills", "agentskills-spec", "opencode-permissions"],
  },
  team: {
    title: "How a team keeps one answer per job across OpenCode and everything else",
    intro:
      "Two problems hide behind the word sharing. Distribution is getting the files onto each teammate's machine. Selection is knowing which skill to use for a task and why that one. OpenCode has a good answer to the first inside a repository and no answer at all to the second.",
    body: [
      "If every skill your team uses belongs to one repository everybody works in, commit them to .agents/skills/ and you are finished. OpenCode picks them up by walking up from the working directory, Codex and Cursor read the same folder, and no tooling is involved. That is the right setup for a single-repository team and nothing here should talk you out of it.",
      "It stops being enough the moment the skills come from someone else's repository, are useful in more than one repository, or have to reach a teammate who is not in OpenCode at all. OpenCode's stable extension mechanisms do not close that gap: plugins here are JavaScript or TypeScript modules loaded from a plugins folder or from npm, and the documentation describes them as hooks, events, and custom tools rather than as a way to package a skill. Its central config and managed settings can push configuration to a fleet, including permission rules, but the documentation does not describe them delivering skill files.",
      "The beta is the first place OpenCode addresses distribution directly, and it is worth watching. A skills array in opencode.json accepts extra local directories and HTTP catalogs, where a catalog is a base URL serving an index.json that lists each skill with a name, a version, and a file list. That is a real answer to getting files onto machines, and it is beta, same-origin only, and not something to build a team process on this month. It also still answers only the distribution half.",
      "Skills Board is a web application where a team keeps, searches, and shares its AI skills. Each saved entry keeps the original source repository and path visible, teammates search it by task or by a tag the team invented, and each of them picks the way of using the skill that suits the agent they actually run. It makes no assumption that everyone is in OpenCode, which is the assumption every per-product mechanism above has to make.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and the path it came from, so a teammate can read the SKILL.md, and anything in scripts beside it, before putting the folder in a directory OpenCode scans.",
      },
      {
        label: "Copy an install command",
        body: "The command is npx skills add for the saved source, and that CLI documents opencode as a target, writing to .agents/skills/ in a project or ~/.config/opencode/skills/ globally. It is one option among several, for the teammates whose setup it fits.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather place the folder by hand in .opencode/skills, .agents/skills, or wherever their agent looks.",
      },
      {
        label: "Connect over MCP",
        body: "Skills Board is reachable as a Streamable HTTP MCP server at https://www.skillsboard.sh/api/mcp, with browser sign-in and no API key to copy. OpenCode documents remote MCP servers in opencode.json with automatic OAuth, including dynamic client registration, and an opencode mcp auth command to trigger the flow.",
      },
    ],
    limits: [
      "A saved skill is a team's own choice, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "The official Skills Board plugin is an Agent Plugins package. OpenCode plugins are a different thing entirely, so on OpenCode the MCP entry in opencode.json is the route, not the plugin.",
      "Skills Board does not publish an OpenCode HTTP catalog. The beta's skills array expects a base URL serving an index.json in its own shape, and nothing here serves that shape today.",
      "An MCP connection cannot install or run a skill inside OpenCode, and it cannot edit or delete saved team skills. The files still have to land in a directory OpenCode scans.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "The operational version of this, with one canonical source and a tested install path per agent, is in",
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      trail: ".",
    },
    sourceIds: [
      "opencode-plugins",
      "opencode-mcp",
      "opencode-config",
      "opencode-v2-skills",
      "skills-cli",
    ],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Six things neither documentation set answers, or answers only in the beta, found while reading both on August 21, 2026. Each one is a place where a confident claim usually gets invented, so each one is written down as a gap instead. The implementation is public and MIT licensed at anomalyco/opencode, the repository the older sst/opencode path now redirects to, but reading source code is not a documented guarantee and this page does not treat it as one.",
    entries: [
      {
        title: "The stable documentation has no precedence rule",
        body: "Its troubleshooting list says to ensure skill names are unique across all locations, which implies collisions are a real failure mode, but it never says which of the six directories wins. The beta does publish an ordered list where the later source wins. That is a beta answer to a stable question, so on a current install treat two skills that share a name as untested.",
      },
      {
        title: "Neither set publishes a context budget for the skill listing",
        body: "Every discovered skill contributes a name and a description to the listing the model sees, and no figure is published anywhere for how large that block may grow or what happens when it does not fit. Codex publishes a specific budget for the equivalent list. How many skills you can keep installed in OpenCode is something you observe rather than look up.",
      },
      {
        title: "The stable page says nothing about scripts, references, or assets",
        body: "The specification defines those three optional folders and the progressive disclosure they enable, and the stable skills page describes SKILL.md and its frontmatter only. The beta fills the gap, handing the agent a base directory and a sample of up to ten supporting file paths without loading their contents. What the stable release does with a bundled script is still unstated, and neither set documents a sandbox around one.",
      },
      {
        title: "Whether the custom config directory includes skills",
        body: "OPENCODE_CONFIG_DIR is documented as a directory searched for agents, commands, modes, and plugins just like the standard .opencode directory. The skills folder is named in the plural-subdirectory list elsewhere on the same page but is absent from that sentence. Whether a skills folder inside a custom config directory is discovered is not stated.",
      },
      {
        title: "Which surfaces beyond the terminal load skills",
        body: "OpenCode ships a TUI, a desktop app, an IDE extension, a web UI, an ACP integration, a server, an SDK, and GitHub and GitLab integrations. Both skills pages describe discovery from your repository or home directory without naming a surface, and none of the surface pages mention skills. Assume the terminal behavior and verify anywhere else.",
      },
      {
        title: "Which behavior the binary you have actually implements",
        body: "Neither set states which released version it describes, beyond the beta banner on the second one, and OpenCode updates itself on startup unless autoupdate is turned off. Two pages that disagree about identity, validation, precedence, and permission syntax, with no version boundary printed on either, is the one gap on this list that affects every other line of it.",
      },
    ],
    sourceIds: [
      "opencode-skills",
      "opencode-v2-skills",
      "opencode-config",
      "opencode-cli",
      "opencode-repo",
      "agentskills-spec",
      "codex-skills",
    ],
  },
  faq: [
    {
      question: "What is an OpenCode skill?",
      answer:
        "An OpenCode skill is a folder holding a SKILL.md file with YAML frontmatter and Markdown instructions. The frontmatter needs a name and a description. OpenCode finds skills in six directories at startup, lists their names and descriptions in its built-in skill tool, and the agent loads one by calling that tool.",
    },
    {
      question: "Where do skills go in OpenCode?",
      answer:
        "OpenCode reads project skills from .opencode/skills/, .claude/skills/, and .agents/skills/, walking up from your working directory to the git worktree. Global skills come from ~/.config/opencode/skills/, ~/.claude/skills/, and ~/.agents/skills/. Each skill is one folder containing SKILL.md, and the folder name has to match the name in the frontmatter.",
    },
    {
      question: "Does OpenCode read Claude Code skills?",
      answer:
        "Yes. OpenCode documents .claude/skills/ and ~/.claude/skills/ as Claude-compatible skill locations, so a repository already set up for Claude Code needs no second copy. Two environment variables switch that behavior off, one for skills alone and one for every .claude behavior, so a teammate can disable it locally.",
    },
    {
      question: "How do you install a skill in OpenCode?",
      answer:
        "Create the folder yourself in a directory OpenCode scans and put SKILL.md inside it, spelled in capitals. OpenCode documents no marketplace and no install command of its own. The skills CLI behind npx skills add lists opencode as a target and writes to .agents/skills/ or the OpenCode global skills folder.",
    },
    {
      question: "Can you stop OpenCode from loading a skill?",
      answer:
        "Yes, and this is unusual among skill clients. The permission config takes a skill key with allow, ask, or deny values, matched by wildcard against skill names and overridable per agent. A denied skill is hidden from the agent entirely. Setting the skill tool to false removes skills from an agent completely.",
    },
    {
      question: "Do OpenCode plugins bundle skills?",
      answer:
        "No, not as documented. An OpenCode plugin is a JavaScript or TypeScript module loaded from a plugins folder or from npm that hooks into events and can register custom tools. The documentation describes hooks, events, and tools, and never describes a plugin shipping a SKILL.md file the way some other clients do.",
    },
    {
      question: "Does the OpenCode 2 beta change how skills work?",
      answer:
        "Yes, in ways worth knowing. The beta derives the skill ID from the path instead of the frontmatter, stops enforcing the name rules, publishes a precedence order where the later source wins, adds configurable skill sources including HTTP catalogs, hands the agent a sample of supporting file paths, and switches permissions to an ordered rule array.",
    },
    {
      question: "How does a team share OpenCode skills?",
      answer:
        "Inside one repository, commit them to .agents/skills/ and OpenCode finds them by walking up from the working directory. Across repositories and across agents, nothing in OpenCode covers which skill the team settled on and why, which is the layer Skills Board holds beside the source, the command, and the ZIP.",
    },
  ],
  sources: [
    {
      id: "opencode-skills",
      label: "OpenCode: Agent Skills",
      href: "https://opencode.ai/docs/skills",
      note: "The six skill locations, the walk up to the git worktree, the five-field frontmatter allowlist with unknown fields ignored, the name and description constraints, the available_skills listing in the skill tool, the permission patterns and per-agent overrides, and the four troubleshooting causes. Fetched August 21, 2026; the page itself carries a last updated date of August 20, 2026.",
    },
    {
      id: "opencode-tools",
      label: "OpenCode: Tools",
      href: "https://opencode.ai/docs/tools",
      note: "The built-in tool list, including the skill tool described as loading a SKILL.md file and returning its content in the conversation, and the permission key that gates it.",
    },
    {
      id: "opencode-permissions",
      label: "OpenCode: Permissions",
      href: "https://opencode.ai/docs/permissions",
      note: "The allow, ask, and deny actions, the skill permission keyed on the skill name, last matching rule wins, wildcard syntax, the permissive defaults, the once, always, and reject prompt, and auto mode.",
    },
    {
      id: "opencode-agents",
      label: "OpenCode: Agents",
      href: "https://opencode.ai/docs/agents",
      note: "The permission keys an agent can override, including skill, and the Markdown frontmatter form used by custom agents and subagents.",
    },
    {
      id: "opencode-config",
      label: "OpenCode: Config",
      href: "https://opencode.ai/docs/config",
      note: "The config precedence order, the plural subdirectory names including skills with singular fallback, the custom config directory environment variable and the folders it lists, and the managed settings tiers.",
    },
    {
      id: "opencode-rules",
      label: "OpenCode: Rules",
      href: "https://opencode.ai/docs/rules",
      note: "The AGENTS.md file OpenCode reads beside skills, and the Claude Code compatibility section that names ~/.claude/skills and the environment variables that disable it.",
    },
    {
      id: "opencode-plugins",
      label: "OpenCode: Plugins",
      href: "https://opencode.ai/docs/plugins",
      note: "What an OpenCode plugin is, where it is loaded from, how npm plugins are installed, the load order, and the event list. No mention of packaging a skill.",
    },
    {
      id: "opencode-mcp",
      label: "OpenCode: MCP servers",
      href: "https://opencode.ai/docs/mcp-servers",
      note: "Remote MCP servers in opencode.json, automatic OAuth with dynamic client registration, and the opencode mcp auth, list, and logout commands.",
    },
    {
      id: "opencode-cli",
      label: "OpenCode: CLI",
      href: "https://opencode.ai/docs/cli",
      note: "The agent create command with skill among the permissions it accepts, and the environment variable table including the two that disable Claude Code compatibility for skills.",
    },
    {
      id: "opencode-v2-skills",
      label: "OpenCode 2 beta: Skills",
      href: "https://opencode.ai/v2/docs/skills",
      note: "The beta documentation set, which carries its own banner saying it covers the version that will become OpenCode 2.0. Path-derived skill IDs, the frontmatter fields it reads, the precedence order between sources, the configurable skills array and its HTTP catalogs, the supporting-file sample on activation, and the array form of the skill permission.",
    },
    {
      id: "opencode-v2-permissions",
      label: "OpenCode 2 beta: Permissions",
      href: "https://opencode.ai/v2/docs/permissions",
      note: "The action, resource, and effect rule schema, the skill action keyed on the skill ID, last matching rule wins, and the beta default of ask when no rule matches, which inverts the stable default.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their constraints, allowed-tools marked experimental, the optional scripts, references, and assets folders, and the progressive disclosure and file size recommendations.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: client showcase",
      href: "https://agentskills.io/clients",
      note: "OpenCode listed among the products that read the format, pointing at the OpenCode skills documentation as its setup link. Read from the showcase data in the agentskills/agentskills repository, which listed forty-six entries on August 21, 2026 and still records OpenCode's source repository under its former owner.",
    },
    {
      id: "codex-skills",
      label: "OpenAI: build skills for ChatGPT and Codex",
      href: "https://learn.chatgpt.com/docs/build-skills",
      note: "The directories Codex scans, its explicit invocation syntax, the per-skill enabled flag in config.toml, and the published budget for the initial skill list. The older developers.openai.com and learn.chatgpt.com/codex URLs both redirect here.",
    },
    {
      id: "cursor-skills",
      label: "Cursor: Agent Skills",
      href: "https://cursor.com/docs/skills",
      note: "The four Cursor directories plus the Claude and Codex compatibility paths, the frontmatter fields Cursor adds, and its forward slash invocation in Agent chat.",
    },
    {
      id: "skills-cli",
      label: "vercel-labs/skills: the skills CLI README",
      href: "https://github.com/vercel-labs/skills",
      note: "The agent target table mapping opencode to .agents/skills/ and ~/.config/opencode/skills/, the -a flag for installing to named agents, and the feature matrix whose allowed-tools row disagrees with OpenCode's own documentation.",
    },
    {
      id: "opencode-repo",
      label: "anomalyco/opencode on GitHub",
      href: "https://github.com/anomalyco/opencode",
      note: "The source repository, MIT licensed, read through the GitHub API on August 21, 2026. The former sst/opencode path still redirects here, which is why older write-ups cite a repository name the project no longer uses.",
    },
  ],
  related: [
    {
      label: "Vercel skills: the official collection, explained",
      href: vercelSkillsPath,
      description:
        "The publisher behind the skills CLI, and the nine skills its own collection ships.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "OpenCode beside the ten other clients whose own documentation states they read the format.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The other agent built around .agents/skills, and what a skill keeps when it moves between the two.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "The client with the widest documented directory list, covered directory by directory.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same standard from the Claude side, and the directories OpenCode reads for compatibility.",
    },
    {
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      description:
        "The other file OpenCode reads, what belongs in each, and how the two work together.",
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
  ],
  og: {
    eyebrow: "OpenCode Skills",
    title: [
      { text: "Six folders, five fields," },
      { text: "and a permission on every skill.", accent: true },
    ],
    description:
      "What OpenCode skills are, every directory it scans, how the skill tool loads one, and how teams keep one answer per job.",
    contextLabel: "skillsboard.sh/opencode-skills",
    chips: ["SKILL.md", "skill tool", ".opencode/skills"],
  },
  ogAlt:
    "Explainer on OpenCode skills: the SKILL.md format, the directories OpenCode scans, and the permission model around the skill tool.",
  publishedAt: "2026-08-21",
  modifiedAt: "2026-08-21",
}
