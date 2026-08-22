import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { copilotSkillsPath } from "@/lib/seo/copilot-skills/types"
import { cursorSkillsPath } from "@/lib/seo/cursor-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { skillExamplesPath } from "@/lib/seo/skill-examples/types"
import { vercelSkillsPath } from "@/lib/seo/vercel-skills/types"

export {
  copilotSkillsPath,
  type CopilotSkillsCtaPlacement,
  type CopilotSkillsPath,
} from "@/lib/seo/copilot-skills/types"

export interface CopilotSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface CopilotSkillsFaqEntry {
  question: string
  answer: string
}

export interface CopilotSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/** One contextual link out of a section, rendered as a sentence. */
export interface CopilotSkillsInlineLink {
  lead: string
  label: string
  href: string
  trail: string
}

export interface CopilotSkillsTableSection {
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

export interface CopilotSkillsDefinition {
  path: typeof copilotSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsSupportPath
    | typeof agentSkillsPath
    | typeof skillExamplesPath
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
  surfaces: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
  locations: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
  frontmatter: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
  invocation: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
  instructions: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
  distribution: CopilotSkillsTableSection & { link: CopilotSkillsInlineLink }
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
    link: CopilotSkillsInlineLink
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
  faq: readonly CopilotSkillsFaqEntry[]
  sources: readonly CopilotSkillsSource[]
  related: readonly CopilotSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const copilotSkills: CopilotSkillsDefinition = {
  path: copilotSkillsPath,
  contentType: "article",
  topics: [
    "github copilot skills",
    "copilot agent skills",
    "custom instructions",
    "skill format",
  ],
  relatedGuidePaths: [
    agentSkillsSupportPath,
    agentSkillsPath,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "GitHub Copilot Skills",
  title: "GitHub Copilot skills: what Copilot supports and how to use them",
  seoTitle:
    "GitHub Copilot Skills: What Copilot Supports and How to Use Them | Skills Board",
  description:
    "GitHub Copilot reads the same SKILL.md file the rest of the ecosystem reads. The five directories it scans, the surfaces where skills work and the two where they do not, the frontmatter fields VS Code adds on top of the specification, how gh skill installs and pins one, and where custom instructions still beat a skill.",
  intro: [
    "Yes, GitHub Copilot supports Agent Skills, and it has since December 18, 2025. That is not a preview claim or a roadmap item: GitHub's own concept page describes agent skills as folders of instructions, scripts, and resources that Copilot loads when relevant, names the Agent Skills specification as an open standard, and lists the five directories Copilot reads them from. The file you write for Claude Code is the file Copilot reads.",
    "The confusion is worth clearing first, because the word skills does at least three jobs inside GitHub's documentation. Agent skills are the SKILL.md format this page is about. Built-in skills are a separate list of GitHub-provided capabilities in the Copilot app, invoked with a slash command such as /orchestrate, which you cannot write and cannot install. And custom instructions, which many people mean when they search for skills, are a different feature entirely, with different files and a different loading rule.",
    "One more thing to settle before the details. Three GitHub pages give three different answers about where agent skills work. The concept page names Visual Studio Code and JetBrains IDEs. The how-to page beside it names only Visual Studio Code. The customization cheat sheet, which is the most precise of the three, marks JetBrains as preview and adds Visual Studio, which neither of the other two mentions. This page uses the cheat sheet and says where it disagrees with its neighbours.",
    "What follows is what GitHub, the VS Code documentation, and the GitHub CLI manual say, read on August 22, 2026: every directory Copilot scans, which surfaces load a skill and which do not, the frontmatter fields the specification defines and the extra ones VS Code adds, how a skill is chosen and invoked, how skills and custom instructions divide the work, how gh skill and plugins move a skill between people, and the questions none of these pages answer.",
  ],
  answer:
    "A GitHub Copilot skill is a directory containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. Copilot reads project skills from .github/skills, .claude/skills, or .agents/skills in the repository, and personal skills from ~/.copilot/skills or ~/.agents/skills, and loads one when its description matches what you asked for.",
  answerNotes: [
    "The format is not a GitHub format. GitHub's concept page calls the Agent Skills specification an open standard used by a range of different AI systems and links to the specification repository, and the VS Code documentation links agentskills.io directly. A folder that Claude Code, Codex, Cursor, or OpenCode already reads works here without an edit, which is the point of the standard and the reason the .claude/skills path appears in GitHub's own list.",
    "Selection is automatic by default. GitHub's cheat sheet lists the trigger for agent skills as chosen by Copilot when relevant to your prompt, in contrast with prompt files and custom agents, which you pick by hand. In Copilot CLI and in VS Code you can also force the choice by typing the skill name after a forward slash, and VS Code adds two frontmatter fields that turn either half of that behavior off.",
    "The surfaces are not uniform. Agent skills are supported in VS Code, Visual Studio, GitHub.com, and Copilot CLI, are in preview in JetBrains IDEs, and are marked unsupported in Eclipse and Xcode. Custom instructions, by contrast, have no cross anywhere in their row: supported in four of the seven and preview in the other three. If your team standardises on Eclipse or Xcode, skills are not the mechanism to reach for, and that is a documented answer rather than an inference.",
    "The skill is a folder, not just a file. When a skill is invoked, Copilot discovers every file in the skill directory and makes it available alongside the instructions, so scripts, templates, and reference documents ride along and are read only when the instructions point at them. That is the part custom instructions cannot do at all, and it is the cleanest reason to choose one over the other.",
  ],
  answerSourceIds: [
    "copilot-agent-skills",
    "copilot-cheat-sheet",
    "copilot-add-skills",
    "vscode-agent-skills",
    "agentskills-spec",
  ],
  surfaces: {
    title: "Where a Copilot skill actually loads",
    intro:
      "The customization cheat sheet publishes a support matrix with an agent skills row, and it is the only GitHub page that answers this question cell by cell. Its seven columns are reproduced below, with three surfaces added underneath that the matrix has no column for and other pages do document.",
    columns: ["Surface", "Agent skills", "What the documentation adds"],
    rows: [
      {
        label: "Visual Studio Code",
        cells: [
          "Supported",
          "The most detailed skills documentation in the whole Copilot family lives on the VS Code side, not on docs.github.com. It is the only place that publishes the frontmatter constraints, the extra fields, the extension contribution point, and the setting for additional skill directories.",
        ],
      },
      {
        label: "Visual Studio",
        cells: [
          "Supported",
          "Named only in the cheat sheet matrix. The concept page and the how-to page beside it both omit Visual Studio from their surface lists, and no Visual Studio specific skills article exists.",
        ],
      },
      {
        label: "JetBrains IDEs",
        cells: [
          "Preview",
          "The matrix marks it P for under preview. The concept page lists JetBrains alongside VS Code without that qualifier, and the Agent Customizations editor in JetBrains is documented as a place to manage reusable skills.",
        ],
      },
      {
        label: "Eclipse",
        cells: [
          "Not supported",
          "Marked with a cross in the matrix. Custom instructions and MCP servers are supported in Eclipse, so the absence is specific to skills rather than to the IDE.",
        ],
      },
      {
        label: "Xcode",
        cells: [
          "Not supported",
          "Marked with a cross in the matrix, in the same row as Eclipse. Prompt files are marked preview here while skills are not supported at all.",
        ],
      },
      {
        label: "GitHub.com",
        cells: [
          "Supported",
          "This column covers two things the other pages name separately: Copilot cloud agent, and Copilot code review. Support for skills in code review reached general availability on July 29, 2026 for Pro, Pro+, Business, and Enterprise.",
        ],
      },
      {
        label: "Copilot CLI",
        cells: [
          "Supported",
          "The only surface with an interactive management interface for skills: /skills list, /skills info, /skills add, /skills remove, and /skills reload inside a session, plus a copilot skill subcommand from the terminal for scripting.",
        ],
      },
      {
        label: "GitHub Copilot app",
        cells: [
          "No column in the matrix",
          "The concept page and the how-to page both list the Copilot app among the surfaces where agent skills work, and the app has its own reference page for the built-in skills GitHub ships with it. The matrix simply has no column for the app.",
        ],
      },
      {
        label: "Copilot SDK",
        cells: [
          "No column in the matrix",
          "Documented on its own page instead. A session created through the SDK takes a skillDirectories option in TypeScript, or skill_directories in Python, listing directories whose skills are loaded into that session.",
        ],
      },
      {
        label: "Copilot code review",
        cells: [
          "Inside the GitHub.com column",
          "The narrowest case on this page. Both the general availability changelog and the how-to name .github/skills specifically for code review, and neither names .claude/skills or .agents/skills there. Comments generated with a skill are attributed as such in the review.",
        ],
      },
    ],
    notes: [
      "The disagreement between the three GitHub pages is not a rounding error, and it is worth knowing which one to trust for what. The cheat sheet is a matrix maintained as a matrix, and it is the only source that distinguishes preview from supported. The concept page reads like an overview and its surface list is a sentence rather than a table. The how-to page repeats that sentence with JetBrains removed. Where they conflict, this page follows the cheat sheet and says so.",
      "Copilot code review deserves the separate row it gets. It is the one surface where a skill runs without anybody typing a prompt, which means a skill in .github/skills can start shaping review comments on every pull request as soon as it is committed. GitHub's own advice is to name a review focused skill directory something like code-review so that code review is sure to pick it up, and it adds that other skills in .github/skills can be used automatically when they are relevant to the review.",
      "None of this is a claim about which models or plans include the feature beyond what is written above. The code review changelog names the four plans that got it at general availability. The rest of the matrix is a feature matrix, not a plan matrix, and GitHub publishes plan availability elsewhere.",
    ],
    link: {
      lead: "Copilot beside the ten other clients whose own documentation says they read the format is in",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-cheat-sheet",
      "copilot-agent-skills",
      "copilot-add-skills",
      "copilot-cli-skills",
      "copilot-app-builtin-skills",
      "copilot-sdk-skills",
      "changelog-code-review-ga",
    ],
  },
  locations: {
    title: "Every directory Copilot reads a skill from",
    intro:
      "GitHub publishes five directories. VS Code publishes six, adding one GitHub omits, and a setting for adding more. Each row below says which documentation names it, because the difference between the two lists is the difference between a skill that loads on a teammate's machine and one that does not.",
    columns: ["Directory", "Scope", "Which documentation names it"],
    rows: [
      {
        label: ".github/skills/<name>/SKILL.md",
        cells: [
          "Project",
          "Every page: the concept page, both how-to pages, the cheat sheet, and the VS Code documentation. It is also the only project directory named for Copilot code review, which makes it the safe default for a repository.",
        ],
      },
      {
        label: ".claude/skills/<name>/SKILL.md",
        cells: [
          "Project",
          "The concept page, both how-to pages, the cheat sheet, and VS Code. The December 2025 changelog put it plainly: if you have already set up skills for Claude Code in .claude/skills, Copilot picks them up automatically.",
        ],
      },
      {
        label: ".agents/skills/<name>/SKILL.md",
        cells: [
          "Project",
          "The concept page, both how-to pages, the cheat sheet, and VS Code. This is the vendor-neutral directory Codex, Cursor, and OpenCode also read, so a skill placed here reaches the widest set of agents without duplication.",
        ],
      },
      {
        label: "~/.copilot/skills/<name>/SKILL.md",
        cells: [
          "Personal",
          "The concept page, both how-to pages, the cheat sheet, and VS Code. The same ~/.copilot directory also holds personal custom instructions for Copilot CLI and the CLI settings file.",
        ],
      },
      {
        label: "~/.agents/skills/<name>/SKILL.md",
        cells: [
          "Personal",
          "The concept page, both how-to pages, the cheat sheet, and VS Code. The personal counterpart of the vendor-neutral project directory.",
        ],
      },
      {
        label: "~/.claude/skills/<name>/SKILL.md",
        cells: [
          "Personal",
          "VS Code only. GitHub's concept page lists exactly two personal directories and this is not one of them, while the VS Code table lists three and includes it. Treat it as a VS Code behavior rather than a Copilot behavior until docs.github.com says otherwise.",
        ],
      },
      {
        label: "chat.agentSkillsLocations",
        cells: [
          "Project, configured",
          "VS Code only. A setting that adds further project skill directories, for teams that want a different folder structure or more than one skill directory. Nothing equivalent is documented for Copilot CLI or the cloud agent.",
        ],
      },
      {
        label: "Plugin skills directory",
        cells: [
          "Installed",
          "A plugin contributes skills from a skills/ subdirectory inside the plugin package. In Copilot CLI and VS Code these appear beside locally defined skills, and in the CLI you remove them by managing the plugin rather than the skill.",
        ],
      },
      {
        label: "VS Code extension contribution",
        cells: [
          "Installed",
          "VS Code only. An extension registers a skill through the chatSkills contribution point in its package.json, pointing at a SKILL.md inside the extension. The name in the frontmatter must match the parent directory name or the skill is not loaded.",
        ],
      },
    ],
    notes: [
      "The lowercase spelling of the skill folder matters and the uppercase spelling of the file matters more. Both GitHub how-to pages carry the same instruction in an Important callout: skill files must be named SKILL.md. The subdirectory around it should be lowercase and use hyphens for spaces, and VS Code adds that a name containing anything other than lowercase letters, numbers, and hyphens causes the skill to silently fail to load, which is the worst possible failure mode because there is nothing to see.",
      "In a monorepo, VS Code has a second setting worth knowing about. chat.useCustomizationsInParentRepositories extends discovery to the parent repository root, so a skill committed once at the top of a monorepo reaches sessions opened inside a package. Again, this is documented on the VS Code side and has no published counterpart for the cloud agent.",
      "Nothing in any of these pages says what happens when the same skill name appears in two of these directories at once. Claude Code publishes a precedence rule and OpenCode's beta publishes an ordered list; Copilot publishes neither. Two skills with the same name in .github/skills and .claude/skills is untested territory, and the safe move is to keep names unique across the whole set.",
    ],
    link: {
      lead: "The same directories seen from the other side, with the clients that read each one, are in",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-agent-skills",
      "copilot-add-skills",
      "copilot-cli-skills",
      "copilot-cheat-sheet",
      "vscode-agent-skills",
      "copilot-plugins",
      "changelog-copilot-skills",
    ],
  },
  frontmatter: {
    title: "The frontmatter fields, and the four VS Code adds",
    intro:
      "A SKILL.md written for Copilot is a SKILL.md, with the fields the Agent Skills specification defines. VS Code then documents four fields the specification does not mention, which is where portability starts to cost something. Each row says what the specification requires and what the Copilot side documents.",
    columns: ["Field", "In the specification", "What Copilot documents"],
    rows: [
      {
        label: "name",
        cells: [
          "Required. Maximum 64 characters, lowercase letters, numbers, and hyphens only, no leading or trailing hyphen, and it must match the parent directory name.",
          "Required on both GitHub how-to pages, described as a unique identifier that must be lowercase with hyphens for spaces and typically matches the directory. VS Code restates the 64 character cap and adds that invalid characters cause the skill to silently fail to load, and that namespace prefixes such as myorg/name or myorg:name break it the same way.",
        ],
      },
      {
        label: "description",
        cells: [
          "Required. Maximum 1024 characters, non-empty, describing what the skill does and when to use it.",
          "Required on both GitHub how-to pages, described as what the skill does and when Copilot should use it. VS Code repeats the 1024 character maximum and says to be specific about both capabilities and use cases, because this is what Copilot matches your prompt against.",
        ],
      },
      {
        label: "license",
        cells: [
          "Optional. A license name or a reference to a bundled license file, which the specification suggests keeping short.",
          "Optional, and the only optional specification field either GitHub how-to page lists. Described as a description of the license that applies to this skill.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "Optional. Maximum 500 characters, for environment requirements such as an intended product, required system packages, or network access.",
          "Not mentioned on any Copilot or VS Code page read for this article. Nothing says it is rejected either, which is a different thing from saying it is read.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "Optional. An arbitrary map from string keys to string values, which clients may use for properties the specification does not define.",
          "Not documented as a field either page reads, but it is where gh skill writes provenance. The GitHub CLI records the source repository, the ref, and the tree SHA in the installed skill's frontmatter, and gh skill update compares that against the remote.",
        ],
      },
      {
        label: "allowed-tools",
        cells: [
          "Optional and marked experimental. A space-separated string of pre-approved tools, with support explicitly allowed to vary between implementations.",
          "Documented and used. Both GitHub how-to pages show allowed-tools: shell in a working example, and say that a tool not listed there makes Copilot prompt for permission before using it. Copilot is the client that gives this experimental field the most concrete published behavior.",
        ],
      },
      {
        label: "argument-hint",
        cells: [
          "Not in the specification.",
          "VS Code only. Hint text shown in the chat input when the skill is invoked as a slash command, for example [test file] [options].",
        ],
      },
      {
        label: "user-invocable",
        cells: [
          "Not in the specification.",
          "VS Code only. Defaults to true. Set it to false to hide the skill from the slash command menu while still letting the agent load it automatically.",
        ],
      },
      {
        label: "disable-model-invocation",
        cells: [
          "Not in the specification.",
          "VS Code only. Defaults to false. Set it to true to stop Copilot loading the skill on its own, leaving the slash command as the only route in.",
        ],
      },
      {
        label: "context",
        cells: [
          "Not in the specification.",
          "VS Code only, and marked experimental there. Defaults to inline, which puts the skill body in the parent agent's context. Set it to fork to run the skill in a dedicated subagent and return only its result, behind the github.copilot.chat.skillTool.enabled setting.",
        ],
      },
    ],
    notes: [
      "The security warning attached to allowed-tools is GitHub's own and it is unusually direct, so it is worth quoting the shape of it rather than paraphrasing it away. Both how-to pages warn that pre-approving shell or bash removes the confirmation step for terminal commands and can allow attacker-controlled skills or prompt injections to execute arbitrary commands in your environment, and they advise omitting both when in doubt. That is the same field the specification labels experimental, which tells you how much weight to put on it in a skill you did not write.",
      "The four VS Code fields are the portability tax on this client. A skill that uses argument-hint, user-invocable, disable-model-invocation, or context is still a valid SKILL.md and still loads elsewhere, because the specification puts no restriction on additional keys and OpenCode, for one, documents that it ignores fields it does not know. What you lose is the behavior, not the file. A skill whose only safety mechanism is disable-model-invocation is not safe anywhere else.",
      "Nothing in the Copilot documentation publishes a size budget for the skill body, a cap on the number of installed skills, or what happens when the combined descriptions of every discovered skill outgrow the context window. VS Code explains the three-level loading model in detail and says the design means you can install many skills without consuming context, but many is not a number.",
    ],
    link: {
      lead: "The field by field authoring rules, including the two sources that disagree about how to write a description, are in",
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ".",
    },
    sourceIds: [
      "agentskills-spec",
      "copilot-add-skills",
      "copilot-cli-skills",
      "vscode-agent-skills",
      "changelog-gh-skill",
    ],
  },
  invocation: {
    title: "How a skill gets chosen, and how you override the choice",
    intro:
      "The cheat sheet lists the trigger for agent skills as automatic, chosen by Copilot when relevant to your prompt. That is the default and it is not the only route. Below are the documented ways a skill enters a session, and where each one works.",
    columns: ["Route", "Where it is documented", "What happens"],
    rows: [
      {
        label: "Automatic selection",
        cells: [
          "Every surface",
          "Copilot decides when to use a skill based on your prompt and the skill's description. When it chooses one, the SKILL.md file is injected into the agent's context and the agent follows the instructions, using any scripts or examples in the same directory.",
        ],
      },
      {
        label: "Slash command",
        cells: [
          "Copilot CLI, VS Code",
          "Type the skill name after a forward slash. VS Code puts skills in the same slash menu as prompt files and lets you add context after the command, as in /webapp-testing for the login page.",
        ],
      },
      {
        label: "Naming it in a sentence",
        cells: [
          "Copilot CLI",
          "The CLI documentation shows the skill name used inside a normal prompt: use the /frontend-design skill to create a responsive navigation bar in React. It is the slash form embedded in a request rather than a separate mechanism.",
        ],
      },
      {
        label: "Progressive loading",
        cells: [
          "VS Code",
          "Three levels, not two. Copilot reads the name and description from the frontmatter, loads the SKILL.md body when it matches, and reads other files in the directory only when the instructions reference them. A file the instructions never mention is never loaded.",
        ],
      },
      {
        label: "Forked context",
        cells: [
          "VS Code, experimental",
          "With context: fork in the frontmatter, the skill runs in a dedicated subagent and only its final result returns to the parent conversation. Discovery works the same way; the difference is where the body and the files it reads land.",
        ],
      },
      {
        label: "Turning a skill off",
        cells: [
          "Copilot CLI, VS Code",
          "The CLI has a /skills command that toggles individual skills with the arrow keys and space bar. VS Code has the two frontmatter fields instead: user-invocable: false hides the slash command, disable-model-invocation: true stops automatic loading, and both together disable the skill.",
        ],
      },
      {
        label: "Plugin namespace",
        cells: [
          "Copilot CLI, VS Code",
          "A skill delivered through a plugin gets the plugin name as a command prefix automatically, as in /my-plugin:test-runner. VS Code is explicit that you must not write the prefix into the name field yourself, because a name containing a slash or a colon fails to load.",
        ],
      },
      {
        label: "No prompt at all",
        cells: [
          "Copilot code review",
          "A skill in .github/skills can be used by code review when it is relevant, without anyone typing anything. Comments produced with a skill are attributed to it in the review, so you can see which of your skills fired.",
        ],
      },
      {
        label: "SDK session option",
        cells: [
          "Copilot SDK",
          "A session created through the SDK takes an explicit list of skill directories, so the set of skills is a property of the session your code created rather than of the machine it runs on.",
        ],
      },
    ],
    notes: [
      "There is a real asymmetry here that matters when you write a skill for a team. The description is the only thing the model sees before it decides, so a description written as a title gives Copilot nothing to match on. Both GitHub how-to pages describe the description as what the skill does and when Copilot should use it, and VS Code asks for both capabilities and use cases in the same field. Write the trigger, not the label.",
      "The forked context option is the one place where Copilot's behavior meaningfully diverges from the rest of the ecosystem, and it is experimental on both counts: the field is not in the specification, and VS Code puts it behind a setting. Used well it keeps a long skill from flooding a conversation. Used on a skill somebody else wrote, it means the intermediate reasoning you would want to inspect never reaches you.",
      "Nothing documents what Copilot does when two skills match a prompt equally well, or in what order the descriptions are presented to the model. That is not a Copilot specific gap; almost no client publishes it. It is listed again in the limits section because it is the kind of detail that gets invented in write-ups.",
    ],
    link: {
      lead: "Eight real SKILL.md files, read line by line, with the descriptions that make selection work, are in",
      label: "Skill examples: eight real SKILL.md files",
      href: skillExamplesPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-cheat-sheet",
      "copilot-add-skills",
      "copilot-cli-skills",
      "vscode-agent-skills",
      "copilot-sdk-skills",
      "changelog-code-review-ga",
    ],
  },
  instructions: {
    title: "Skills or custom instructions: what each one is for",
    intro:
      "Most searches for Copilot skills are really searches for custom instructions, and the two features overlap enough that the confusion is fair. GitHub answers it directly on both how-to pages. Here is the whole customization family, with the file each one lives in and when Copilot reads it.",
    columns: ["Customization", "File and location", "When Copilot reads it"],
    rows: [
      {
        label: "Repository-wide instructions",
        cells: [
          ".github/copilot-instructions.md",
          "Automatically, on every interaction within its scope. The only customization with no cross anywhere in the matrix, and the custom instructions reference confirms that Copilot Chat in both Eclipse and Xcode reads this file, which is where skills cannot reach at all.",
        ],
      },
      {
        label: "Path-specific instructions",
        cells: [
          ".github/instructions/**/*.instructions.md",
          "Automatically, when the applyTo glob in the frontmatter matches. GitHub's examples include applyTo: \"app/models/**/*.rb\", a comma-separated applyTo: \"**/*.ts,**/*.tsx\", and applyTo: \"**\" for everything.",
        ],
      },
      {
        label: "Agent instructions",
        cells: [
          "AGENTS.md, and on several surfaces CLAUDE.md or GEMINI.md",
          "Automatically, and the support table is uneven: the cloud agent reads all three names on GitHub.com, VS Code, JetBrains, Eclipse, and Xcode, while Copilot code review on GitHub.com is documented as reading AGENTS.md only.",
        ],
      },
      {
        label: "Personal instructions",
        cells: [
          "Copilot settings on GitHub, plus ~/.copilot/copilot-instructions.md and ~/.copilot/instructions/**/*.instructions.md in the CLI",
          "Automatically, and first: personal instructions take the highest priority in the published precedence order.",
        ],
      },
      {
        label: "Organization instructions",
        cells: [
          "An organization's Copilot settings",
          "Automatically, for all members of the organization, whether or not they get their Copilot subscription from it. Last in the precedence order.",
        ],
      },
      {
        label: "Prompt files",
        cells: [
          ".github/prompts/*.prompt.md",
          "Manually. You reference the file in chat or pick it from the prompt file picker. Available in VS Code, Visual Studio, and JetBrains IDEs only, and not on GitHub.com or in the CLI.",
        ],
      },
      {
        label: "Custom agents",
        cells: [
          ".github/agents/AGENT-NAME.md, or organization and enterprise level equivalents",
          "Manually. You select the agent from a dropdown in the IDE, on GitHub, or in Copilot CLI. A custom agent carries its own instructions, tool restrictions, and context.",
        ],
      },
      {
        label: "Agent skills",
        cells: [
          ".github/skills/<name>/SKILL.md, .claude/skills/, .agents/skills/, ~/.copilot/skills/, ~/.agents/skills/",
          "Automatically when relevant to the prompt, or on demand through the slash command. The only member of this family that can carry scripts and other files alongside the instructions.",
        ],
      },
      {
        label: "Hooks",
        cells: [
          ".github/hooks/*.json",
          "Automatically, at configured lifecycle events, with guaranteed execution. This is the answer when what you need is determinism rather than judgment, which no skill can give you.",
        ],
      },
    ],
    notes: [
      "GitHub's own guidance is one sentence long and it appears identically at the bottom of both skills how-to pages: use custom instructions for simple instructions relevant to almost every task, such as your repository's coding standards, and skills for more detailed instructions that Copilot should only access when relevant. Read the other way round, if a rule has to apply to every request, a skill is the wrong container, because a skill only loads when its description matches.",
      "The precedence order for instructions is published and skills are not in it. Personal instructions win, then repository instructions in the order path-specific, repository-wide, agent instructions, and organization instructions last, with the note that all relevant sets are still provided to Copilot. Where a loaded skill sits relative to any of that is not stated anywhere.",
      "VS Code adds a comparison the GitHub pages do not, and it is the most useful one for a team choosing between them. It lists the portability of Agent Skills as working across VS Code, Copilot CLI, and the Copilot cloud agent, and the portability of custom instructions as VS Code and GitHub.com only, and it calls custom instructions VS Code specific where it calls Agent Skills an open standard. If the same rules have to reach a teammate in Claude Code or Cursor, that is the row that decides it.",
    ],
    link: {
      lead: "The format-level comparison, including which agent reads which file and how the two work together, is in",
      label: "AGENTS.md vs SKILL.md: two formats, two different jobs",
      href: agentsMdVsSkillMdPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-cheat-sheet",
      "copilot-instructions-support",
      "copilot-response-customization",
      "copilot-repo-instructions",
      "copilot-add-skills",
      "vscode-agent-skills",
    ],
  },
  distribution: {
    title: "Getting a skill from a repository onto someone else's machine",
    intro:
      "This is the part of the Copilot story that changed most in 2026, and it is now the strongest in the ecosystem. There is a package manager, a plugin format, marketplaces, and enterprise policy, and they solve different halves of the problem. Each row says what it covers and what it leaves open.",
    columns: ["Mechanism", "Where it is configured", "What it covers"],
    rows: [
      {
        label: "gh skill install",
        cells: [
          "GitHub CLI, version 2.90.0 or later",
          "Searches, previews, and installs skills from GitHub repositories, with @TAG and @SHA for a specific version and --pin to lock one. It picks the destination directory for you: --agent selects the agent host and --scope the scope, and the default is Copilot at project scope. Documented as public preview and subject to change.",
        ],
      },
      {
        label: "gh skill preview",
        cells: [
          "GitHub CLI",
          "Renders the SKILL.md and the file tree in the terminal without installing anything. GitHub pairs it with a warning worth repeating: skills are not verified by GitHub and may contain prompt injections, hidden instructions, or malicious scripts.",
        ],
      },
      {
        label: "gh skill update",
        cells: [
          "GitHub CLI",
          "Reads provenance written into the installed skill's frontmatter, including the source repository, the ref, and the tree SHA, and compares the local tree SHA against the remote so that a version bump without a content change does not look like an update. Pinned skills are skipped.",
        ],
      },
      {
        label: "gh skill publish",
        cells: [
          "GitHub CLI, in a skills repository",
          "Validates your skills against the Agent Skills specification and checks remote settings such as tag protection, secret scanning, and code scanning. --dry-run validates without publishing, --fix repairs metadata issues without publishing, and publishing offers to enable immutable releases.",
        ],
      },
      {
        label: "Committing the folder",
        cells: [
          "The repository itself",
          "Still the simplest answer, and for a single-repository team it is the right one. A folder in .github/skills reaches every teammate who pulls, reaches the cloud agent, and reaches code review. It reaches nobody working in a different repository.",
        ],
      },
      {
        label: "Downloading a folder or a ZIP",
        cells: [
          "Anywhere",
          "The manual path both how-to pages document: download a skill directory, unzip it if needed, and move it into one of the five locations. In the CLI you then run /skills reload and check with /skills info rather than restarting.",
        ],
      },
      {
        label: "Plugins",
        cells: [
          "A plugin.json manifest with a skills/ subdirectory",
          "Bundles skills with custom agents, hooks, MCP server configurations, and LSP configurations in one installable unit. Skills from installed plugins appear beside local ones, and a skill from a plugin is removed by managing the plugin.",
        ],
      },
      {
        label: "Marketplaces",
        cells: [
          "A marketplace.json file in a repository, or any Git host or file system",
          "A versioned registry of plugins. github/copilot-plugins and github/awesome-copilot are added by default, and the documentation also names the Anthropic and ClaudeForge marketplaces as examples.",
        ],
      },
      {
        label: "Repository plugin settings",
        cells: [
          ".github/copilot/settings.json",
          "The declarative team route. An enabledPlugins list installs plugins for everyone working in that repository, and extraKnownMarketplaces registers a marketplace that is not one of the defaults. The cloud agent installs plugins this way only.",
        ],
      },
      {
        label: "Enterprise managed settings",
        cells: [
          "managed-settings.json",
          "Enterprise administrators use enabledPlugins to install or block plugins automatically, extraKnownMarketplaces to add marketplaces, and strictKnownMarketplaces to restrict installation to managed ones, across VS Code, Copilot CLI, the Copilot app, and the cloud agent.",
        ],
      },
    ],
    notes: [
      "The public collection GitHub points people at is github/awesome-copilot, described on the concept page as GitHub's community-created collection. Read through the GitHub API on August 22, 2026 it carries 412 directories under skills/, is MIT licensed, and had 38,115 stars. It is also browsable as a website at awesome-copilot.github.com/skills/, which is where the how-to sends you for a manual download. The concept page names anthropics/skills in the same sentence, so the two catalogues most of this ecosystem uses are both named by GitHub itself here.",
      "Agent Plugins 1.0 is the piece that makes plugins interesting beyond Copilot. Published on August 6, 2026 with AWS, Anysphere, Microsoft, OpenAI, and Vercel, and with Google joining as a core maintainer the same day, it standardises how skills and MCP servers are packaged so one plugin installs into several clients. The migration is mostly manifest work: add a $schema to plugin.json, keep skills under skills/ and MCP configuration in mcp.json, and move Copilot-specific files into a com.github.copilot/ directory that other clients ignore. Existing Copilot plugins keep working without migration.",
      "What none of this covers is the choice. Every mechanism above answers the question of how a file reaches a machine. None of them answers which of the 412 skills in awesome-copilot your team should use for a given task, or why that one, or who on your team already tried it and found it wanting. That gap is the same on every agent, and it is why the section below exists.",
    ],
    link: {
      lead: "The wider catalogue landscape, and what each source does and does not screen, is in",
      label: "Vercel skills: the official collection, explained",
      href: vercelSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-add-skills",
      "copilot-cli-skills",
      "gh-skill-manual",
      "changelog-gh-skill",
      "copilot-plugins",
      "copilot-enterprise-plugins",
      "changelog-agent-plugins",
      "awesome-copilot",
    ],
  },
  install: {
    title: "How to add a skill to GitHub Copilot, step by step",
    intro:
      "Two routes, and the shorter one only works if the skill already exists in a repository. Write it yourself with the steps below, or run one gh skill command and let the CLI put the folder in the right place. Both end with the same thing on disk.",
    steps: [
      {
        title: "Pick the directory that matches who should have it",
        body: "A skill everyone working in the repository should have goes in .github/skills/, because that is the only project directory Copilot code review is documented to read and it is named on every Copilot page. Use .agents/skills/ instead when teammates on Codex, Cursor, or OpenCode should get the same folder, and .claude/skills/ when the repository already has one for Claude Code. A skill that is yours alone goes in ~/.copilot/skills/.",
      },
      {
        title: "Create the folder and the SKILL.md file",
        body: "Make a directory named after the skill and put a SKILL.md inside it, spelled in capitals: both GitHub how-to pages carry that as an Important callout. The directory name should be lowercase with hyphens for spaces, and the name in the frontmatter should match it. VS Code adds a 64 character cap and warns that a name with any other character makes the skill silently fail to load.",
      },
      {
        title: "Write the description as the trigger, not the title",
        body: "The description is what Copilot matches your prompt against, and it is capped at 1024 characters. GitHub's own example spells out both halves in one line: a guide for debugging failing GitHub Actions workflows, and then use this when asked to debug failing GitHub Actions workflows. Say what it does and when to use it, in the words someone would actually type.",
      },
      {
        title: "Put the bulk of the material beside the file, not in it",
        body: "The whole SKILL.md body enters the context when the skill is chosen, so length is a cost you pay on every activation. Copilot discovers every file in the skill directory and makes it available alongside the instructions, and VS Code is explicit that a file the instructions never reference is never loaded. Reference scripts and templates by relative path and keep the body about the procedure.",
      },
      {
        title: "Decide about allowed-tools before anyone else runs it",
        body: "Leave it out and Copilot asks for confirmation before using a tool. Add allowed-tools: shell and it stops asking, which is exactly what GitHub warns against unless you have read the skill and every script it calls. On a skill you wrote for yourself this is a convenience; on a skill somebody else wrote it is the whole attack surface.",
      },
      {
        title: "Load it and confirm it is actually there",
        body: "In Copilot CLI run /skills reload rather than restarting, then /skills info with the skill name to check it loaded and see where it came from. In VS Code open the Configure Chat gear, go to the Skills tab in the Agent Customizations editor, or type /skills in the chat input. On GitHub.com the cloud agent and code review pick the folder up from the repository once it is committed.",
      },
      {
        title: "Or skip all of it and install someone else's",
        body: "gh skill preview OWNER/REPOSITORY SKILL prints the SKILL.md and the file tree without installing. gh skill install OWNER/REPOSITORY SKILL then puts it in the right directory for your agent host, with @TAG or @SHA for a version and --pin to freeze it. Preview first: GitHub says outright that skills are not verified and may contain prompt injections, hidden instructions, or malicious scripts.",
      },
    ],
    template: `---
name: actions-failure-triage
description: Triage a failing GitHub Actions run on a pull request. Use when a check is red, a workflow fails, or the user asks why CI is broken.
license: MIT
---

## Steps

1. Find the most recent failed run for the branch and read its status.
2. Summarise the failed jobs before reading full logs, to keep the context small.
3. Read the full log only for the job that failed first.
4. Reproduce the failing command locally before proposing a fix.
5. Propose the smallest change that makes the check pass.

## Output

The failing job, the line that failed, the cause in one sentence, and the fix.`,
    sourceIds: [
      "copilot-add-skills",
      "copilot-cli-skills",
      "vscode-agent-skills",
      "gh-skill-manual",
      "agentskills-spec",
    ],
  },
  team: {
    title: "How a team keeps its AI skills usable outside one repository",
    intro:
      "Two problems hide behind the word sharing. Distribution is getting the files onto each teammate's machine. Selection is knowing which skill to use for a task and why that one. Copilot now has the best distribution answer of any client on our compatibility matrix, and no answer at all to the second.",
    body: [
      "Start with what works, because it works well. If every skill your team uses belongs to one repository everybody works in, commit them to .github/skills/ and you are finished: teammates get them on the next pull, the cloud agent gets them, and Copilot code review gets them without anyone configuring anything. Add .github/copilot/settings.json with an enabledPlugins list and the same repository also installs a plugin for everyone. On Copilot Business or Enterprise, managed-settings.json extends that across VS Code, the CLI, the app, and the cloud agent at once. Nothing on this page should talk you out of any of that.",
      "It stops being enough at three specific edges. The first is more than one repository: a settings.json is per repository, and a skill that is useful in eight of them has to be published as a plugin or copied eight times. The second is more than one agent: gh skill has an --agent flag and Agent Plugins 1.0 is a genuine cross-vendor standard, but a teammate who lives in Claude Code or Cursor is not going to read your .github/copilot/settings.json. The third is the one none of it addresses, which is knowing which skill to reach for at all. GitHub says so itself, in the sentence that warns that skills are not verified and may contain prompt injections. The tooling installs; it does not judge.",
      "Skills Board is the web app where a team keeps and shares its AI skills. Each saved entry keeps the original source repository and path visible, teammates search the library by task or by a tag the team invented, and each of them picks the way of using the skill that suits the agent they actually run. It makes no assumption that everyone is in Copilot, which is the assumption a repository settings file has to make.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and the path it came from, so a teammate can read the SKILL.md, and anything in scripts beside it, before putting the folder anywhere Copilot scans. That is the same read that gh skill preview gives you, available to someone who is not at a terminal.",
      },
      {
        label: "Copy an install command",
        body: "The command is npx skills add for the saved source. It is one option among several, for the teammates whose setup it fits, and it sits beside rather than instead of gh skill install, which is the first-party route for a skill that lives in a GitHub repository.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather place the folder by hand in .github/skills, .agents/skills, or ~/.copilot/skills. This is the manual route both GitHub how-to pages describe, without the browsing step.",
      },
      {
        label: "Connect over MCP",
        body: "Skills Board is reachable as a Streamable HTTP MCP server at https://www.skillsboard.sh/api/mcp, with browser sign-in and no API key to copy. Copilot supports MCP servers on every surface in its own matrix, including the two where skills are not supported, so an agent can search the team library even where it cannot load a SKILL.md.",
      },
    ],
    limits: [
      "Saving a skill records that a team has it in use. It is not a security review, an approval, or a compatibility certification, and GitHub's warning about unverified skills applies to anything you find through us too.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions, which is exactly what gh skill install --pin does do, so use the CLI when a frozen version is what you need.",
      "The official Skills Board plugin is an Agent Plugins package. It is not published in a Copilot plugin marketplace today, so on Copilot the MCP entry is the route rather than an enabledPlugins line.",
      "An MCP connection cannot install or run a skill inside Copilot, and it cannot edit or delete saved team skills. The folder still has to land in a directory Copilot scans.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "The organisation-level version of this question, with what each vendor does and does not offer, is in",
      label: "Manage AI skills across an organization",
      href: manageAiSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "copilot-plugins",
      "copilot-enterprise-plugins",
      "copilot-add-skills",
      "copilot-cheat-sheet",
      "gh-skill-manual",
    ],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Seven things none of the pages read for this article answer, found while reading them on August 22, 2026. Each one is a place where a confident claim usually gets invented, so each one is written down as a gap instead of filled in.",
    entries: [
      {
        title: "No precedence rule between the five directories",
        body: "Copilot reads three project directories and two personal ones, and nothing says which wins when the same skill name appears in two of them, or whether a personal skill overrides a project skill. VS Code adds a sixth personal directory and a setting for more, without a rule either. Keep names unique across the whole set.",
      },
      {
        title: "No published budget for how many skills you can keep",
        body: "VS Code explains the three-level loading model and says it means you can install many skills without consuming context. No page publishes a cap on the number of skills, a size budget for the descriptions Copilot reads during discovery, or what happens when that block outgrows the window. Codex publishes a figure for the equivalent list; Copilot does not.",
      },
      {
        title: "Two specification fields are simply not addressed",
        body: "The specification defines compatibility and metadata as optional fields. No Copilot or VS Code page read here says whether either is parsed, ignored, or rejected. OpenCode states out loud that it ignores unknown fields; Copilot says nothing, so a skill that relies on either field is relying on untested behavior here.",
      },
      {
        title: "There is no single authoritative surface list",
        body: "The concept page names Visual Studio Code and JetBrains IDEs. The how-to page beside it names only Visual Studio Code. The cheat sheet marks JetBrains as preview and adds Visual Studio, which neither of the others mentions, and has no column for the Copilot app that both of them list. All three are current pages.",
      },
      {
        title: "No organization-level setting for skills",
        body: "GitHub documents organization custom instructions that apply to every member, and enterprise managed plugin settings that install plugins automatically. There is no equivalent organization-level skills setting: the documented routes to an organization are a repository, a plugin, or a marketplace, and the skills pages never mention organizations at all.",
      },
      {
        title: "The provenance keys gh skill writes are not published",
        body: "Both the changelog and the how-to say gh skill records the source repository, the ref, and the tree SHA in the installed skill's frontmatter, and that gh skill update reads them back. Neither names the keys it uses, so you cannot write them by hand or read them reliably with a script.",
      },
      {
        title: "Where a skill sits in the instruction precedence order",
        body: "The precedence order for custom instructions is published in full, from personal down to organization. A loaded skill is not in that list, and nothing says what happens when a skill's instructions contradict a repository-wide instruction file that is also in the context. Both are in there; which one wins is unstated.",
      },
    ],
    sourceIds: [
      "copilot-agent-skills",
      "copilot-add-skills",
      "copilot-cheat-sheet",
      "copilot-response-customization",
      "vscode-agent-skills",
      "agentskills-spec",
      "changelog-gh-skill",
    ],
  },
  faq: [
    {
      question: "Does GitHub Copilot support agent skills?",
      answer:
        "Yes, and it has since December 18, 2025. GitHub's concept page describes agent skills as folders of instructions, scripts, and resources that Copilot loads when relevant, calls the Agent Skills specification an open standard, and lists the directories it reads. The customization cheat sheet marks the feature supported in four surfaces and preview in one.",
    },
    {
      question: "Where does GitHub Copilot look for SKILL.md files?",
      answer:
        "Copilot reads project skills from three repository directories, .github/skills, .claude/skills, and .agents/skills, and personal skills from two home directories, ~/.copilot/skills and ~/.agents/skills. VS Code documents a sixth personal location, ~/.claude/skills, plus a setting that adds further project directories. Each skill gets its own subdirectory with a SKILL.md inside.",
    },
    {
      question: "How do you install a skill for GitHub Copilot?",
      answer:
        "Either put the folder in one of the five directories yourself, or run gh skill install with the owner, repository, and skill name in GitHub CLI 2.90.0 or later. The command picks the destination directory for your agent host, supports a tag or commit SHA, and can pin a version. It is documented as public preview.",
    },
    {
      question: "What is the difference between Copilot skills and custom instructions?",
      answer:
        "GitHub answers this on both skills how-to pages. Use custom instructions for simple guidance relevant to almost every task, such as coding standards, and skills for detailed instructions Copilot should only load when relevant. Custom instructions are always applied and are text only; a skill loads on demand and can carry scripts and other files.",
    },
    {
      question: "Do Claude Code skills work in GitHub Copilot?",
      answer:
        "Yes. The December 2025 changelog says that if you have already set up skills for Claude Code in the .claude/skills directory of your repository, Copilot picks them up automatically, and .claude/skills appears in GitHub's own directory list. The file format is the same specification, so no edit is required to move a folder across.",
    },
    {
      question: "Does GitHub Copilot support skills in VS Code and JetBrains?",
      answer:
        "The customization cheat sheet marks agent skills supported in Visual Studio Code and Visual Studio, and preview in JetBrains IDEs. The VS Code documentation is where the concrete rules live: frontmatter constraints, four extra fields, a setting for additional skill directories, and an extension contribution point that registers a skill from an extension.",
    },
    {
      question: "How does a team share GitHub Copilot skills across repositories?",
      answer:
        "Inside one repository, commit the folder to .github/skills. Beyond that, package the skills as a plugin and list it under enabledPlugins in .github/copilot/settings.json, or in managed-settings.json for an enterprise. For teammates who are not in Copilot, a plugin following Agent Plugins 1.0 installs into several clients from one package.",
    },
    {
      question: "Can Copilot code review use an agent skill?",
      answer:
        "Yes, and it reached general availability on July 29, 2026 for Pro, Pro+, Business, and Enterprise. GitHub names .github/skills specifically for code review and suggests a review focused directory name such as code-review to be certain it is picked up. Comments produced with a skill are attributed to it in the review.",
    },
  ],
  sources: [
    {
      id: "copilot-agent-skills",
      label: "GitHub Docs: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "The definition, the Agent Skills specification described as an open standard, the three project directories and two personal directories, the pointer to anthropics/skills and github/awesome-copilot, and the surface list naming the cloud agent, code review, the CLI, the Copilot app, and agent mode in VS Code and JetBrains IDEs. Fetched August 22, 2026.",
    },
    {
      id: "copilot-add-skills",
      label: "GitHub Docs: Adding agent skills for GitHub Copilot",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills",
      note: "The SKILL.md naming callout, the three frontmatter fields it lists, the worked GitHub Actions example, the allowed-tools example with its security warning, the manual download route, the whole gh skill section including pinning and publishing, the code-review directory naming advice, and the skills versus custom instructions guidance.",
    },
    {
      id: "copilot-cli-skills",
      label: "GitHub Docs: Adding agent skills for GitHub Copilot CLI",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills",
      note: "The same authoring instructions plus the CLI-only parts: /skills list, info, add, remove, and reload, the toggle interface, the forward slash invocation inside a prompt, the copilot skill terminal subcommand, and the note that a skill from a plugin is removed by managing the plugin.",
    },
    {
      id: "copilot-cheat-sheet",
      label: "GitHub Docs: Copilot customization cheat sheet",
      href: "https://docs.github.com/en/copilot/reference/customization-cheat-sheet",
      note: "The support matrix with an agent skills row across VS Code, Visual Studio, JetBrains IDEs, Eclipse, Xcode, GitHub.com, and Copilot CLI, with a key that distinguishes supported, not supported, and under preview. Also the filename and location column for every customization feature, and the trigger column that marks agent skills automatic.",
    },
    {
      id: "copilot-instructions-support",
      label: "GitHub Docs: Support for different types of custom instructions",
      href: "https://docs.github.com/en/copilot/reference/custom-instructions-support",
      note: "Which instruction types each surface reads, per Copilot feature: the AGENTS.md, CLAUDE.md, and GEMINI.md triple for the cloud agent, AGENTS.md alone for code review on GitHub.com, and the personal instruction files ~/.copilot/copilot-instructions.md and ~/.copilot/instructions/**/*.instructions.md in Copilot CLI.",
    },
    {
      id: "copilot-response-customization",
      label: "GitHub Docs: About customizing GitHub Copilot responses",
      href: "https://docs.github.com/en/copilot/concepts/prompting/response-customization",
      note: "The full precedence order for custom instructions, from personal down to organization, with path-specific instructions above repository-wide ones and agent instructions below both, and the note that all relevant sets are still provided to Copilot. Also the statement that prompt files are available only in VS Code, Visual Studio, and JetBrains IDEs.",
    },
    {
      id: "copilot-repo-instructions",
      label: "GitHub Docs: Adding repository custom instructions for GitHub Copilot",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions",
      note: "The applyTo frontmatter keyword for path-specific instruction files and its glob syntax, with the three worked examples this page cites, plus the .github/copilot-instructions.md file and the option to disable repository instructions for Copilot code review.",
    },
    {
      id: "copilot-plugins",
      label: "GitHub Docs: About GitHub Copilot plugins",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-plugins",
      note: "The plugin.json manifest and the skills/ subdirectory inside a plugin, the four default and example marketplaces, the marketplace.json registry format, and the two declarative install routes: enabledPlugins and extraKnownMarketplaces in a user-level ~/.copilot/settings.json or a repository-level .github/copilot/settings.json.",
    },
    {
      id: "copilot-enterprise-plugins",
      label: "GitHub Docs: About enterprise-managed plugin standards",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-enterprise-plugin-standards",
      note: "The managed-settings.json file, what an administrator can define with it, and the statement that the policies apply to all users on the enterprise Copilot plan across supported clients once a client authenticates.",
    },
    {
      id: "copilot-app-builtin-skills",
      label: "GitHub Docs: Built-in skills for the GitHub Copilot app",
      href: "https://docs.github.com/en/copilot/reference/github-copilot-app-reference/built-in-skills",
      note: "The six GitHub-provided built-in skills in the Copilot app, invoked as slash commands such as /orchestrate, and the explicit statement that this page does not list agent skills from plugins, repositories, organizations, or personal customizations. The source for the disambiguation this page opens with.",
    },
    {
      id: "copilot-sdk-skills",
      label: "GitHub Docs: Custom skills in the Copilot SDK",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-sdk/features/skills",
      note: "The skillDirectories option in TypeScript and skill_directories in Python, which load skills from named directories into a session created through the SDK, and the description of a skill as a named directory containing a SKILL.md whose content is injected into the session context.",
    },
    {
      id: "vscode-agent-skills",
      label: "VS Code Docs: Agent Skills",
      href: "https://code.visualstudio.com/docs/agent-customization/agent-skills",
      note: "The six directories, the chat.agentSkillsLocations and chat.useCustomizationsInParentRepositories settings, the frontmatter table including argument-hint, user-invocable, disable-model-invocation, and the experimental context field, the three-level loading model, the chatSkills extension contribution point, and the Agent Skills versus custom instructions comparison.",
    },
    {
      id: "gh-skill-manual",
      label: "GitHub CLI manual: gh skill",
      href: "https://cli.github.com/manual/gh_skill",
      note: "The six subcommands install, list, preview, publish, search, and update, the gh skills alias, the worked examples, and the notice that working with agent skills in the GitHub CLI is in preview and subject to change without notice. Read August 22, 2026, against GitHub CLI v2.98.0.",
    },
    {
      id: "changelog-copilot-skills",
      label: "GitHub Changelog: GitHub Copilot now supports Agent Skills",
      href: "https://github.blog/changelog/2025-12-18-github-copilot-now-supports-agent-skills",
      note: "The announcement, dated December 18, 2025, naming the coding agent, Copilot CLI, and agent mode in VS Code Insiders, and stating that skills already set up for Claude Code in .claude/skills are picked up automatically.",
    },
    {
      id: "changelog-gh-skill",
      label: "GitHub Changelog: Manage agent skills with GitHub CLI",
      href: "https://github.blog/changelog/2026-04-16-manage-agent-skills-with-github-cli",
      note: "The gh skill launch on April 16, 2026, the 2.90.0 minimum, immutable releases, content-addressed change detection using the git tree SHA, the statement that provenance is stored in the skill frontmatter, and the --pin flag with the reasoning about supply chain risk.",
    },
    {
      id: "changelog-code-review-ga",
      label: "GitHub Changelog: Copilot code review, agent skills and MCP now generally available",
      href: "https://github.blog/changelog/2026-07-29-copilot-code-review-agent-skills-and-mcp-now-generally-available",
      note: "General availability on July 29, 2026 for Pro, Pro+, Business, and Enterprise, the .github/skills directory named for code review specifically, and the attribution of review comments generated using agent skills.",
    },
    {
      id: "changelog-agent-plugins",
      label: "GitHub Changelog: Agent Plugins 1.0 in VS Code, Copilot CLI, and the Copilot app",
      href: "https://github.blog/changelog/2026-08-12-agent-plugins-1-0-in-vs-code-copilot-cli-and-the-copilot-app",
      note: "Agent Plugins 1.0 published August 6, 2026 with AWS, Anysphere, Microsoft, OpenAI, and Vercel, with Google as a core maintainer, the migration steps including the com.github.copilot/ namespaced directory, and the managed-settings.json keys enabledPlugins, extraKnownMarketplaces, and strictKnownMarketplaces.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their constraints, including the 64 character name cap, the 1024 character description cap, the 500 character compatibility field, the metadata map, and allowed-tools marked experimental with support allowed to vary between implementations.",
    },
    {
      id: "awesome-copilot",
      label: "github/awesome-copilot on GitHub",
      href: "https://github.com/github/awesome-copilot",
      note: "The collection GitHub's own concept page points at. Read through the GitHub API on August 22, 2026: 412 directories under skills/, MIT licensed, 38,115 stars, last pushed August 21, 2026. It is also the source of the documented gh skill example and a default plugin marketplace.",
    },
  ],
  related: [
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "GitHub Copilot and VS Code as two separate rows, beside the nine other clients with vendor documentation.",
    },
    {
      label: "Agent Skills: the format, explained",
      href: agentSkillsPath,
      description:
        "The vendor-neutral definition of the standard Copilot says it implements, and where the specification actually lives.",
    },
    {
      label: "Skill examples: eight real SKILL.md files",
      href: skillExamplesPath,
      description:
        "Real files read line by line, including the descriptions that decide whether Copilot loads a skill at all.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The other agent built around .agents/skills, and what a folder keeps when it moves between the two.",
    },
    {
      label: "Cursor skills: what they are and how to use them",
      href: cursorSkillsPath,
      description:
        "The client with the widest documented directory list, including the Copilot and Claude folders.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same standard from the Claude side, and the .claude/skills folder Copilot reads without an edit.",
    },
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The authoring rules field by field, including the two sources that disagree about the description.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One canonical SKILL.md, and a tested install path for each agent your teammates run.",
    },
  ],
  og: {
    eyebrow: "GitHub Copilot Skills",
    title: [
      { text: "Five folders, one SKILL.md," },
      { text: "and a CLI that pins it.", accent: true },
    ],
    description:
      "What GitHub Copilot supports today, every directory it scans, where custom instructions still win, and how a team keeps its AI skills usable.",
    contextLabel: "skillsboard.sh/copilot-skills",
    chips: ["SKILL.md", "gh skill", ".github/skills"],
  },
  ogAlt:
    "Explainer on GitHub Copilot skills: the SKILL.md format, the directories Copilot scans, and how skills differ from custom instructions.",
  publishedAt: "2026-08-22",
  modifiedAt: "2026-08-22",
}
