import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { alternativePaths } from "@/lib/seo/alternatives"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { type ComparePath, comparePaths } from "@/lib/seo/compare/types"
import { coworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  coworkSkillsPath,
  type CoworkSkillsCtaPlacement,
  type CoworkSkillsPath,
} from "@/lib/seo/cowork-skills/types"

export interface CoworkSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface CoworkSkillsFaqEntry {
  question: string
  answer: string
}

export interface CoworkSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. Same contract
 * as a guide's inline link, widened by the comparison paths, so an internal
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface CoworkSkillsInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | ComparePath
    | typeof agentSkillsPath
    | typeof claudeSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

export interface CoworkSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: CoworkSkillsInlineLink
  sourceIds: readonly string[]
}

export interface CoworkSkillsStepSection {
  title: string
  intro: string
  steps: readonly {
    title: string
    body: string
  }[]
  link: CoworkSkillsInlineLink
  sourceIds: readonly string[]
}

export interface CoworkSkillsDefinition {
  path: typeof coworkSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof claudeSkillsPath
    | typeof whereToFindClaudeSkillsPath
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
  format: CoworkSkillsTableSection & { tree: string }
  loading: CoworkSkillsTableSection
  channels: CoworkSkillsTableSection
  surfaces: CoworkSkillsTableSection
  authoring: CoworkSkillsStepSection & { template: string }
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: CoworkSkillsInlineLink
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
  faq: readonly CoworkSkillsFaqEntry[]
  sources: readonly CoworkSkillsSource[]
  related: readonly CoworkSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const coworkSkills: CoworkSkillsDefinition = {
  path: coworkSkillsPath,
  contentType: "article",
  topics: [
    "claude cowork",
    "cowork skills",
    "plugins",
    "skill sharing",
  ],
  relatedGuidePaths: [
    claudeSkillsPath,
    agentSkillsPath,
    whereToFindClaudeSkillsPath,
    guidePaths.installClaudeSkills,
  ],
  eyebrow: "Cowork Skills",
  title: "Claude Cowork skills: how they load and where a team keeps them",
  seoTitle:
    "Claude Cowork Skills: How They Load and Where a Team Keeps Them | Skills Board",
  description:
    "What a skill is inside Claude Cowork, how a session finds and invokes one, the four channels that put a skill in front of it, what changes between desktop, web, and mobile, and how to write one. Every claim checked against first-party documentation.",
  intro: [
    "A skill in Claude Cowork is the same object it is everywhere else Claude runs: a folder with a SKILL.md file, YAML frontmatter carrying a name and a description, and Markdown instructions Claude follows once it decides the skill applies. Anthropic describes skills as folders of instructions, scripts, and resources that Claude loads dynamically, and publishes the format as an open standard at agentskills.io. None of that changes because the session is a Cowork task rather than a chat.",
    "What changes is where the folder has to be sitting, and that is documented in one sentence most people never read. Cowork sessions do not read the skills directory on your machine. They load the skills enabled for your claude.ai account, synced at session start. A skill you dropped into a local folder yesterday is not in today's Cowork task until you enable it on the account.",
    "So the useful question is not what a skill is. It is which channel puts one in front of a Cowork session, what that channel implies about who else on your team gets it, and which parts stop working when the desktop app is closed. This page separates those, cites the first-party source under each section, and keeps a list at the end of the things no first-party page states at all.",
  ],
  answer:
    "Claude Cowork skills are Agent Skills: folders holding a SKILL.md file with a name, a description, and Markdown instructions that Claude loads when a task matches the description. A Cowork session loads the skills enabled for your claude.ai account rather than the ones stored on your machine, plus the skills bundled in any plugin you have installed. Cowork itself runs on paid plans only.",
  answerNotes: [
    "The mechanism behind that is progressive disclosure, and Anthropic states it plainly: Claude determines which skills are relevant and loads the information it needs, which helps prevent context window overload. The frontmatter is the first level, giving Claude enough to know when a skill should be used without loading all of the content. The Markdown body is the second, read only after the metadata matches. Bundled reference files are the third.",
    "Invocation runs on two tracks in the same session. Claude uses Anthropic's built-in skills automatically when relevant, with no explicit call needed, and it can pick up a custom skill the same way when the description matches. Alongside that, typing a slash or clicking the plus button shows the skills your installed plugins provide, in chat and in Cowork, and you can also name a skill in the request. Anthropic's own worked example is asking Claude to use your brand guidelines skill to create a presentation.",
    "Plan availability is two separate questions and it is worth keeping them apart. Skills as a feature reach Free, Pro, Max, Team, and Enterprise accounts and require code execution and file creation to be enabled. Cowork is available on paid plans only: Pro, Max, Team, and Enterprise. So the floor for using a skill inside Cowork is a paid plan, whatever the skills article says about Free.",
  ],
  answerSourceIds: [
    "what-are-skills",
    "use-skills",
    "use-plugins",
    "cowork-get-started",
    "claude-code-skills",
  ],
  format: {
    title: "What a skill is, in the format Cowork reads",
    intro:
      "One required file, two required fields, and a folder that can hold anything the instructions point at. The third column is where Anthropic's own pages disagree with each other, so read it before you copy a limit from memory.",
    columns: ["Part", "What it holds", "What the documentation says"],
    rows: [
      {
        label: "SKILL.md",
        cells: [
          "The entry point: YAML frontmatter, then the Markdown instructions.",
          "Required. The Claude Code documentation, the organization provisioning article, and the open specification all spell it SKILL.md. The help center article on creating custom skills spells the same file skill.md, in lowercase, throughout.",
        ],
      },
      {
        label: "name",
        cells: [
          "A human-friendly name for the skill.",
          "Required. The help center caps it at 64 characters, and the upload troubleshooting notes list a folder name that does not match the skill name as a documented cause of a failed upload.",
        ],
      },
      {
        label: "description",
        cells: [
          "What the skill does and when to use it.",
          "Required, and the field Claude reads to decide whether to invoke the skill. The help center says 200 characters maximum. The open specification allows up to 1,024. Claude Code truncates the combined description and when_to_use text at 1,536 characters in its own listing.",
        ],
      },
      {
        label: "dependencies",
        cells: [
          "Software packages the skill needs, such as python>=3.8 or pandas>=1.5.0.",
          "Optional, and the only optional frontmatter field the custom skills article documents. Claude Code defines many more fields of its own, and only six of them are valid on a claude.ai upload.",
        ],
      },
      {
        label: "The Markdown body",
        cells: [
          "The instructions Claude follows once the skill loads.",
          "No format restrictions. The documented guidance is clear step-by-step instructions, examples where they help, and an explicit statement of when the skill applies.",
        ],
      },
      {
        label: "Bundled files",
        cells: [
          "Reference documents such as REFERENCE.md, plus executable scripts.",
          "Optional. Anthropic's own document skills use Python with pandas, numpy, and matplotlib, JavaScript and Node.js, file editing packages, and visualization tools. Claude can install packages from PyPI and npm when loading skills.",
        ],
      },
      {
        label: "The ZIP",
        cells: [
          "How a custom skill actually gets uploaded.",
          "The archive has to contain the skill folder as its root rather than the files loose at the top level. The documented upload failures are an oversized ZIP, a folder name mismatch, a missing skill file, and invalid characters in the name or description.",
        ],
      },
    ],
    tree: `my-skill/
├── SKILL.md          # Required: name, description, instructions
├── REFERENCE.md      # Optional: detail loaded only when pointed at
├── scripts/          # Optional: executable code Claude can run
└── assets/           # Optional: templates and static files`,
    notes: [
      "The spelling and the description limit are the two places to slow down. Three first-party pages write SKILL.md and one writes skill.md, so a team standard of uppercase is the safe read rather than a certainty. The limit is worse: 200 characters in the help center, 1,024 in the open specification, and a 1,536-character listing cap in the Claude Code documentation, with no page reconciling the three. Write the trigger case in the first sentence and the disagreement stops mattering.",
      "The description does more work than the body does. Anthropic's troubleshooting list for a skill Claude is not using has four items: check that the skill is toggled on, check that the description clearly explains when it should be used, check that the instructions are clear and well structured, and be more explicit in the request. Three of the four are about text you wrote, and two of those are about the description specifically.",
      "Skills compose without referring to each other. Anthropic documents that skills cannot explicitly reference other skills, while Claude can use multiple skills together automatically, and calls that composability one of the most powerful parts of the feature. The practical consequence is that several small focused skills beat one large one, which is also the documented best practice.",
    ],
    link: {
      lead: "For the same file read from Claude Code, the Claude API, and claude.ai, including the fields that exist inside only one product, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "what-are-skills",
      "create-skills",
      "use-skills",
      "provision-skills",
      "claude-code-skills",
      "agentskills-home",
      "claude-skills-feature",
    ],
  },
  loading: {
    title: "How a Cowork session finds a skill and decides to use it",
    intro:
      "Two mechanisms that are easy to conflate. Loading is about context and runs on its own. Invocation is about who decides, and it has both an automatic and a manual path in the same session.",
    columns: ["Stage", "What happens", "What the documentation says"],
    rows: [
      {
        label: "1. Sync",
        cells: [
          "The session collects the skills it is allowed to see.",
          "Cowork sessions load the skills enabled for your claude.ai account, synced at session start, and do not read the skills directory on your machine. You manage that set from Customize in the Desktop app sidebar or from the skills settings on claude.ai.",
        ],
      },
      {
        label: "2. Review",
        cells: [
          "Claude reads what each skill is for, not how it works.",
          "Skills work through progressive disclosure: Claude reviews the available skills, loads the relevant ones, and applies their instructions. The frontmatter is the first level, carrying just enough for Claude to know when a skill should be used.",
        ],
      },
      {
        label: "3. Activation",
        cells: [
          "The instructions enter the task.",
          "The Markdown body is the second level of detail, which Claude accesses after reading the metadata when the task calls for it. Bundled reference files come after that, once the loaded instructions point at them.",
        ],
      },
      {
        label: "4. Invocation",
        cells: [
          "You ask, or Claude decides.",
          "Claude uses Anthropic's built-in skills automatically when relevant. For skills from installed plugins, typing a slash or clicking the plus button lists what is available, in chat and in Cowork alike. Naming the skill in the request also works.",
        ],
      },
    ],
    notes: [
      "The sync line is the single most useful sentence about skills in Cowork, and it cuts both ways. Because the session runs on Anthropic's servers rather than your laptop, a skill sitting in a local directory is simply not present. The Claude Code documentation says the same thing from the other side: when you enable a personal skill for Cowork and cloud sessions, you upload it to claude.ai, so the rules that govern an upload apply to it.",
      "One documented behavior does change for skill bodies that shell out. In a Cowork session on your desktop, Claude Code replaces every shell command line in a skill body with a placeholder that disables skill shell execution, the same treatment it gives every skill you supply there. A skill that injects the output of a local command into its own instructions loses that step in Cowork.",
      "Crowding is real and the numbers for it are not published for this surface. Claude Code documents a skill listing budget scaled to one percent of the model's context window, a 1,536-character cap per entry, and a 25,000-token budget for skills re-attached after the conversation is compacted. Those are Claude Code figures. No first-party page states the equivalent for a Cowork session, so treat the pressure as real and the exact thresholds as unknown.",
    ],
    link: {
      lead: "For the three-tier loading model as the open standard defines it, and the budgets other agents publish alongside it, see",
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "claude-code-skills",
      "what-are-skills",
      "use-skills",
      "use-plugins",
      "create-skills",
    ],
  },
  channels: {
    title: "The four channels that put a skill in a Cowork session",
    intro:
      "Every skill a Cowork task can reach arrived through one of these four. The column that matters for a team is the third one: who else gets the skill, and who is able to take it away again.",
    columns: ["Channel", "How it gets there", "Who else gets it"],
    rows: [
      {
        label: "Anthropic skills",
        cells: [
          "Built in. Enhanced Excel spreadsheet creation, professional Word documents, PowerPoint generation, and PDF creation and processing, available once code execution and file creation is on.",
          "Everyone. Claude uses them automatically when relevant, and the documentation is explicit that you do not need to invoke them yourself.",
        ],
      },
      {
        label: "Your own upload",
        cells: [
          "Package the folder as a ZIP, then go to Customize, then Skills, click the plus button, choose Create skill, and select Upload a skill. On Claude for Mac you can instead record yourself doing the task and let Claude propose the skill from what it observed.",
          "Nobody, by default. Custom skills you upload are private to your individual account, and the article on using skills says so directly.",
        ],
      },
      {
        label: "Your organization",
        cells: [
          "A Team or Enterprise owner uploads a ZIP under Organization settings, then Skills, and it is provisioned to everyone immediately. Members can also share a skill with named colleagues, with a group, or with the organization directory, once an owner turns the matching toggles on.",
          "Everyone, one group, or the named recipients. Owner-provisioned skills are enabled by default and members can toggle them off but cannot delete them. Shared skills are view-only, and an update from the author reaches recipients.",
        ],
      },
      {
        label: "A plugin",
        cells: [
          "Each plugin bundles skills, connectors, and sub-agents in one package. Install from the Plugins tab under Customize, add a marketplace, or upload a plugin file you built yourself. The skills it carries appear in the slash and plus menus.",
          "Whoever installs it. On Team and Enterprise plans an owner can distribute plugins through marketplaces, organization-managed plugins cannot be edited by members, and some may be auto-installed or required.",
        ],
      },
    ],
    notes: [
      "There is no approval step on organization-wide sharing, and the help center states it rather than implying it: if you enable Share with organization, any member can publish a skill to the directory without review. The documented alternative is to leave that toggle off and have members submit skills to an owner for provisioning instead. The audit log records that a skill was shared and with whom, not what was inside it, and there is no admin dashboard for browsing the contents.",
      "Scoping a skill to one team runs through plugins rather than through the skills settings. Provisioning under Organization settings gives a skill to everyone in the organization. To give it to only some members, the documented path is to bundle the skills into a plugin and assign that plugin to a group, and group targeting set up for Cowork carries over to chat with no extra steps.",
      "Reading before installing is Anthropic's own instruction, repeated on both the skills and the plugins pages. Install only from sources you trust, read the bundled files, and pay attention to code dependencies, bundled scripts, and any instruction that reaches an external network source. On Enterprise plans an owner can turn on skill and plugin scanning, currently in beta, which blocks a skill carrying malicious content and puts a caution banner on one that may carry risk. Scanning applies to new uploads and edits only.",
    ],
    link: {
      lead: "For where the skills you would push through those channels actually come from, and what each source does and does not screen, see",
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "use-skills",
      "create-skills",
      "provision-skills",
      "use-plugins",
      "cowork-plugins-blog",
    ],
  },
  surfaces: {
    title: "What changes between desktop, web, and mobile",
    intro:
      "Skills and plugins sit in the available column on every surface. What splits is the parts of a plugin that reach your computer, and the parts of Cowork that were never on web and mobile to begin with.",
    columns: ["Capability", "Desktop", "Web and mobile"],
    rows: [
      {
        label: "Skills and plugins",
        cells: [
          "Available.",
          "Available. The per-surface table marks skills and plugins as available on desktop, web, and mobile alike.",
        ],
      },
      {
        label: "Plugins with a local MCP server",
        cells: [
          "Available.",
          "Not available. Local connectors, and the plugins that include local MCP servers, work through the desktop app only.",
        ],
      },
      {
        label: "Local files a skill reads or writes",
        cells: [
          "Direct, in the folders you connected.",
          "Through the desktop app. A cloud session reaches those files only while the desktop app is open on that computer, and only for folders you connected.",
        ],
      },
      {
        label: "Recording a skill",
        cells: [
          "Available in Cowork in Claude for Mac, on Pro, Max, and Team plans.",
          "Not available. Recording is documented as unavailable in chat, on Windows, and on Free and Enterprise plans.",
        ],
      },
      {
        label: "Live artifacts",
        cells: ["Available.", "Not available. Documented as desktop only."],
      },
      {
        label: "Computer use",
        cells: [
          "Available.",
          "Through the desktop app, and documented as a research preview for Pro and Max plans.",
        ],
      },
    ],
    notes: [
      "The split looks arbitrary until you notice it is not about skills at all. Cowork runs your tasks in the cloud, in beta, in an isolated environment on Anthropic's servers, and reaches anything on your computer through the Claude Desktop app. So a skill whose instructions open a local folder or drive your browser needs that app open even though the session itself is running somewhere else entirely.",
      "Plan availability differs by surface too, which is worth checking before you promise a teammate a skill will be there. Cowork is on paid plans only. Desktop for macOS and Windows is on all paid plans. Web and mobile are on Pro, Max, and Team, and on Enterprise where an admin has enabled it. The Chrome side panel is on Max and Team, rolling out to Pro, and on Enterprise where an admin has enabled it, and opening that panel starts a Cowork session directly.",
      "A skill also adapts to the surface rather than producing the same artifact everywhere. Anthropic's example is a research skill that may produce a Word document in Cowork and detailed data breakdowns in Excel, with the caveat that some skills work better on one surface than others. If you build a skill around a specific Excel or PowerPoint template, the Microsoft 365 add-ins can load that template into the open file.",
    ],
    link: {
      lead: "For the difference between the two things you are installing, since a plugin is a container and a skill is one of the things it can hold, see",
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      trail: ".",
    },
    sourceIds: [
      "cowork-surfaces",
      "cowork-get-started",
      "create-skills",
      "use-skills",
      "use-plugins",
      "cowork-product",
    ],
  },
  authoring: {
    title: "How to write a skill for Cowork",
    intro:
      "Five of these six steps are the documented custom skill workflow and apply anywhere Claude runs. The sixth is the one that is specific to Cowork, and it is the one people skip.",
    steps: [
      {
        title: "Pick one repeatable task",
        body: "The documented characteristics of a good skill are narrow on purpose: it solves a specific, repeatable task, has clear instructions Claude can follow, includes examples where they help, defines when it should be used, and stays focused on one workflow instead of trying to do everything. Separate skills for separate workflows compose better than one large skill.",
      },
      {
        title: "Write the frontmatter before the body",
        body: "The name is the human-friendly title and has to match the folder name. The description is what Claude reads to decide whether the skill applies, so it has to carry both what the skill does and when to use it. Anthropic's worked example reads: apply Acme Corp brand guidelines to presentations and documents, including official colors, fonts, and logo usage.",
      },
      {
        title: "Keep the body short and push detail into files",
        body: "The metadata is the first level of progressive disclosure and the body is the second, so everything you leave in the main file enters the task the moment the skill activates. If a section only applies in some scenarios, move it into a reference file inside the skill directory and mention that file in SKILL.md so Claude can decide whether it needs to open it.",
      },
      {
        title: "Add scripts only when instructions are not enough",
        body: "Attach executable code when the task genuinely needs it. The documented security guidance is to exercise caution when adding scripts, never hardcode API keys or passwords, review any skill you download before enabling it, and use an MCP connection for external service access rather than credentials sitting in the folder.",
      },
      {
        title: "Test against the description, not the output",
        body: "Review SKILL.md for clarity, check that the description reflects when Claude should use the skill, verify every referenced file exists where the instructions say it does, then try several prompts that should trigger it and read Claude's thinking to confirm the skill loaded. If it is not triggering, the documented fix is to iterate on the description rather than the body.",
      },
      {
        title: "Enable it for the account the session uses",
        body: "This is the Cowork-specific step. Package the folder as a ZIP with the skill folder as the archive root, upload it under Customize, then Skills, and toggle it on. A Cowork session loads the skills enabled for your claude.ai account, so a skill that exists only in a directory on your machine will not be in the task no matter how correct the file is.",
      },
    ],
    template: `---
name: weekly-status-note
description: Turn raw notes and a task list into the weekly status note this team sends on Fridays. Use for a status update, a weekly summary, or a Friday note.
---

# Weekly status note

## When to use this
Use this for the recurring Friday note. Do not use it for incident write-ups.

## Steps
1. Group the notes provided into Shipped, In progress, and Blocked.
2. Keep every line under twenty words, and name an owner where the notes give one.
3. Put blocked items first, with what each one is waiting on.
4. Close with one sentence on what changes next week.

## Format
See REFERENCE.md for the heading order and two examples of the tone.`,
    link: {
      lead: "For the harder question of which skill is worth writing first, and how a team agrees on it, see",
      label: "how to choose the first AI agent skill for your team",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ".",
    },
    sourceIds: ["create-skills", "what-are-skills", "use-skills", "claude-code-skills"],
  },
  team: {
    title: "The part enabling a skill does not solve",
    intro:
      "Every channel above answers how a skill reaches a session. None of them answers which skill your team decided on, and that is the question people actually get stuck on.",
    body: [
      "Enabling is a per-account act, provisioning is an owner act, and a plugin is a package. None of the three records who read the skill, what they used it for, or whether it held up on a real task. The recommendation ends up in a chat thread, and the next person starts over at a public directory.",
      "The seams are visible in Anthropic's own documentation once you look for them. Custom skills you upload are private to your individual account. Organization-wide sharing publishes into a directory with no approval step. Scoping to a group runs through plugins rather than through the skills list. And the audit log captures that a skill was shared, not what was in it, with no admin view for browsing the contents.",
      "Skills Board is a shared library for that smaller layer: the set your team actually recommends, in one searchable place, with the source repository and path visible on every entry, and no assumption about whether a teammate is working in Cowork, in a terminal, or in a different agent altogether.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read SKILL.md and anything in scripts before uploading or enabling it anywhere.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time. A Cowork upload wants an archive with the skill folder as its root, which is the same shape.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits, which usually means the ones working in a terminal rather than the ones working in Cowork.",
      },
      {
        label: "Connect over MCP",
        body: "An authenticated MCP endpoint lets a compatible agent search the same team library and retrieve install commands, and with the write scope save skills and organize collections.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board does not upload, enable, or provision anything inside Claude. Every channel on this page still runs through Anthropic's own settings.",
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
    sourceIds: ["use-skills", "provision-skills"],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Five gaps we hit while checking this page. Each is written out as the absence it is rather than filled in with a reasonable guess.",
    entries: [
      {
        title: "No published context budget for skills in Cowork",
        body: "Claude Code publishes exact figures for skill crowding: a listing budget scaled to one percent of the model's context window, a 1,536-character cap per entry, and a 25,000-token budget for skills re-attached after compaction. No first-party page publishes an equivalent for a Cowork session, so how many enabled skills it takes before descriptions start getting shortened is unstated.",
      },
      {
        title: "No documented collision rule between an enabled skill and a plugin skill",
        body: "A Cowork session can carry skills enabled on your account and skills bundled in installed plugins at once. Nothing we found states what happens when two of them share a name, which one wins, or whether both simply appear in the menus. Claude Code documents precedence across its own four locations, and those are locations Cowork does not read.",
      },
      {
        title: "The per-surface table does not cover the Chrome side panel",
        body: "The support article listing what works on each surface has columns for desktop, web, and mobile, and marks skills and plugins as available on all three. Opening the Chrome side panel starts a Cowork session directly, but the panel is not a column in that table, so its skill behavior is an absence in the documentation rather than a confirmed match.",
      },
      {
        title: "The description limit is stated three different ways",
        body: "The article on creating custom skills caps the description at 200 characters. The open specification allows up to 1,024. The Claude Code documentation describes a 1,536-character cap on the combined description and when_to_use text in the skill listing. No page reconciles the three or says which one applies to a ZIP uploaded for use in Cowork.",
      },
      {
        title: "Cowork is not named in the Agent Skills client showcase",
        body: "The client showcase at agentskills.io listed forty-six products on the day we checked. Anthropic appears twice, as Claude Code and as Claude. Cowork is not an entry, and the word does not appear on the page. Skills plainly work in Cowork; what we are recording is that the standard's own adoption list does not name it.",
      },
    ],
    sourceIds: [
      "claude-code-skills",
      "cowork-surfaces",
      "create-skills",
      "agentskills-home",
      "use-plugins",
    ],
  },
  faq: [
    {
      question: "What are Claude Cowork skills?",
      answer:
        "Skills are folders of instructions, scripts, and resources that Claude loads when a task matches them. In Cowork they use the same SKILL.md format as everywhere else: YAML frontmatter with a name and a description, then Markdown instructions. Anthropic publishes that format as an open standard at agentskills.io.",
    },
    {
      question: "How do I use skills in Claude Cowork?",
      answer:
        "Enable the skill for your claude.ai account under Customize, then Skills. A Cowork session loads whatever is enabled there at session start. Claude invokes a relevant skill on its own, and for skills that came from an installed plugin you can type a slash or click plus to pick one directly.",
    },
    {
      question: "Do Claude Cowork plugins and skills differ?",
      answer:
        "A plugin is a package and a skill is one of the things it holds. Each plugin bundles skills, connectors, and sub-agents together, so installing one adds its skills to your session. Those skills work in chat and in Cowork alike, while hooks and sub-agents run only in Cowork.",
    },
    {
      question: "Does Cowork read the skills folder on my machine?",
      answer:
        "No. The Claude Code documentation states that Cowork and cloud sessions do not read the skills directory on your machine. They load the skills enabled for your claude.ai account, synced at session start. Cloud sessions additionally load project skills committed to the cloned repository.",
    },
    {
      question: "How do I share a Cowork skill with my team?",
      answer:
        "On Team and Enterprise plans an owner uploads it under Organization settings to reach everyone, or a member shares it with colleagues, a group, or the organization directory once an owner enables those toggles. To scope skills to one team, bundle them into a plugin and assign that plugin to the group.",
    },
    {
      question: "How do I create a custom skill for Cowork?",
      answer:
        "Write a SKILL.md with a name and a description that says when to use it, keep the body short and push detail into referenced files, package the folder as a ZIP with the folder as its root, then upload and enable it. On Claude for Mac you can record a task instead.",
    },
    {
      question: "Which plans include Claude Cowork skills?",
      answer:
        "Cowork runs on paid plans only: Pro, Max, Team, and Enterprise. Skills as a feature reach Free accounts too and need code execution and file creation enabled. Recording a skill is narrower again, documented for Pro, Max, and Team plans in Cowork on Claude for Mac.",
    },
    {
      question: "What is a Cowork skills library?",
      answer:
        "Usually one of two things: a public directory indexing whatever anyone published, or a team library holding the smaller set your own colleagues recommend. Skills Board is the second kind, keeping the original repository and path visible on every saved entry so a teammate can read a skill before enabling it.",
    },
  ],
  sources: [
    {
      id: "cowork-get-started",
      label: "Get started with Claude Cowork",
      href: "https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork",
      note: "That Cowork is available on paid plans only, the per-surface availability, that sessions run in the cloud in beta on Anthropic's servers, that anything on your computer is reached through the desktop app, and that live artifacts and plugins with local MCP servers are desktop only.",
    },
    {
      id: "cowork-surfaces",
      label: "Use Claude Cowork on web, desktop, and mobile",
      href: "https://support.claude.com/en/articles/15520349-use-claude-cowork-on-web-desktop-and-mobile",
      note: "The feature table marking skills and plugins available on desktop, web, and mobile, the desktop-only rows, the plan availability per surface, that the Chrome side panel starts a Cowork session directly, and that computer use is a research preview for Pro and Max.",
    },
    {
      id: "what-are-skills",
      label: "What are skills?",
      href: "https://support.claude.com/en/articles/12512176-what-are-skills",
      note: "The definition of a skill as folders of instructions, scripts, and resources, progressive disclosure, the four types including organization provisioned skills, the plans skills reach, and the statement that the Agent Skills specification is published as an open standard at agentskills.io.",
    },
    {
      id: "use-skills",
      label: "Use skills in Claude",
      href: "https://support.claude.com/en/articles/12512180-use-skills-in-claude",
      note: "The built-in Anthropic skills and their automatic invocation, the upload steps, that custom skills are private to your individual account, that skill sharing works in both chat and Cowork, the surface adaptation example, and the troubleshooting list for a skill Claude is not using.",
    },
    {
      id: "create-skills",
      label: "How to create custom skills",
      href: "https://support.claude.com/en/articles/12512198-how-to-create-custom-skills",
      note: "The required and optional frontmatter fields with the 64 and 200 character limits, the ZIP packaging rule, the reference and script guidance, the testing workflow, the security guidance, and the recording feature limited to Cowork in Claude for Mac on Pro, Max, and Team plans.",
    },
    {
      id: "provision-skills",
      label: "Provision and manage skills for your organization",
      href: "https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization",
      note: "Owner provisioning through Organization settings, the requirement that the ZIP include a SKILL.md file, group scoping through plugins, the three sharing toggles, the absence of an approval workflow for org-wide sharing, the audit log limits, and skill scanning in beta on Enterprise.",
    },
    {
      id: "use-plugins",
      label: "Use plugins in Claude",
      href: "https://support.claude.com/en/articles/13837440-use-plugins-in-claude",
      note: "That plugins are on all paid plans and bundle skills, connectors, and sub-agents, that plugin skills work in chat and Cowork while hooks and sub-agents run only in Cowork, the slash and plus menus, marketplaces, and organization-managed plugins.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "That Cowork and cloud sessions do not read the local skills directory and load the skills enabled for your claude.ai account synced at session start, the shell execution placeholder in Cowork bodies, the six spec fields valid outside Claude Code, and the listing and compaction budgets.",
    },
    {
      id: "cowork-plugins-blog",
      label: "Customize Cowork with plugins",
      href: "https://claude.com/blog/cowork-plugins",
      note: "The January 2026 announcement that plugin support in Cowork shipped as a research preview for all paid Claude users, the eleven open-sourced plugins, and that plugins were saved locally at the time with organization-wide management still to come.",
    },
    {
      id: "cowork-product",
      label: "Claude Cowork product page",
      href: "https://claude.com/product/cowork",
      note: "That Cowork works with a paid plan and is rolling out on web and mobile in beta, that computer use is in research preview, the per-plan inclusion of Cowork, and the plugin framing of skills, connectors, and sub-agents.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills overview",
      href: "https://agentskills.io",
      note: "The definition of a skill folder with a SKILL.md file, the statement that the format was developed by Anthropic and released as an open standard, and the client showcase we counted forty-six products in, where Cowork does not appear as an entry.",
    },
    {
      id: "claude-skills-feature",
      label: "Claude: Skills",
      href: "https://claude.com/skills",
      note: "That skills are folders with a SKILL.md file containing Markdown instructions, plus reference files, scripts, or code, and the claim that the same skill runs across Claude.ai, Claude Code, and the API without modification for each platform.",
    },
  ],
  related: [
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The same SKILL.md read from Claude Code, claude.ai, and the Claude API, and what each surface allows.",
    },
    {
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      description:
        "What the specification actually defines, which agents implement it, and what travels between them.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The marketplaces, directories, and repositories skills come from, and what each one screens.",
    },
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "Why a plugin is a container and a skill is one of the things it holds, and when each one is the answer.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "The terminal half of the same question, including the directories Cowork does not read.",
    },
    {
      label: "Manage skills across Claude Code, Codex, and Cursor",
      href: guidePaths.manageCrossAgentSkills,
      description:
        "One source of truth for a team whose members are split across several agents.",
    },
    {
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      description:
        "Ownership, distribution models, and one recommendation per skill that survives a new teammate.",
    },
    {
      label: "Skills Board vs a GitHub repo",
      href: alternativePaths.githubRepo,
      description:
        "Keeping recommendations in a repository next to keeping them in a library, and what each costs.",
    },
  ],
  og: {
    eyebrow: "Cowork Skills",
    title: [
      { text: "Cowork does not read" },
      { text: "your local skills folder.", accent: true },
    ],
    description:
      "Which channels put a skill in a Cowork session, what changes between desktop, web, and mobile, and where a team keeps the set it recommends.",
    contextLabel: "skillsboard.sh/cowork-skills",
    chips: ["Channels", "Surfaces", "Authoring"],
  },
  ogAlt:
    "Explainer for skills in Claude Cowork: the SKILL.md format, how a session loads and invokes a skill, the four channels that deliver one, and what only works on desktop.",
  publishedAt: "2026-08-18",
  modifiedAt: "2026-08-18",
}
