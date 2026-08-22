import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { alternativePaths } from "@/lib/seo/alternatives"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { type ComparePath, comparePaths } from "@/lib/seo/compare/types"
import { coworkSkillsPath } from "@/lib/seo/cowork-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  anthropicSkillsPath,
  type AnthropicSkillsCtaPlacement,
  type AnthropicSkillsPath,
} from "@/lib/seo/anthropic-skills/types"

export interface AnthropicSkillsSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface AnthropicSkillsFaqEntry {
  question: string
  answer: string
}

export interface AnthropicSkillsRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. Same contract
 * as a guide's inline link, widened by the comparison paths, so an internal
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface AnthropicSkillsInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | ComparePath
    | typeof agentSkillsPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof coworkSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

export interface AnthropicSkillsTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: AnthropicSkillsInlineLink
  sourceIds: readonly string[]
}

export interface AnthropicSkillsDefinition {
  path: typeof anthropicSkillsPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof claudeSkillsPath
    | typeof coworkSkillsPath
    | typeof whereToFindClaudeSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first summary of the catalog, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  sets: AnthropicSkillsTableSection
  catalog: AnthropicSkillsTableSection
  bundled: AnthropicSkillsTableSection
  surfaces: AnthropicSkillsTableSection
  licensing: AnthropicSkillsTableSection
  team: {
    title: string
    intro: string
    body: readonly string[]
    paths: readonly {
      label: string
      body: string
    }[]
    limits: readonly string[]
    link: AnthropicSkillsInlineLink
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
  faq: readonly AnthropicSkillsFaqEntry[]
  sources: readonly AnthropicSkillsSource[]
  related: readonly AnthropicSkillsRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const anthropicSkills: AnthropicSkillsDefinition = {
  path: anthropicSkillsPath,
  contentType: "article",
  topics: [
    "anthropic skills",
    "anthropic agent skills",
    "claude document skills",
    "first-party skills",
  ],
  relatedGuidePaths: [
    claudeSkillsPath,
    agentSkillsPath,
    whereToFindClaudeSkillsPath,
    guidePaths.installClaudeSkills,
  ],
  eyebrow: "Anthropic Skills",
  title: "Anthropic skills: every first-party skill and where it loads",
  seoTitle:
    "Anthropic Skills: Every First-Party Skill and Where It Loads | Skills Board",
  description:
    "A catalog of the skills Anthropic itself publishes: four pre-built document skills, nineteen folders in the anthropics/skills repository, and thirteen bundled with Claude Code. What each one does, which surface loads it, and how it is licensed, checked against first-party sources on August 18, 2026.",
  intro: [
    "This page is a catalog, not a definition. It lists the skills Anthropic publishes itself, one row each, with what the skill says it does, which surface loads it, and what its license file actually says. If you are still working out what a skill is, the SKILL.md format and the frontmatter fields are covered on our Claude skills page instead, and nothing here repeats it.",
    "The reason a catalog is worth writing is that Anthropic's first-party skills are not one list. They are three lists that share a vocabulary and almost nothing else. Four pre-built document skills load on claude.ai and through the Claude API and are referenced by a skill_id. Nineteen skill folders live in the public anthropics/skills repository and install like any other skill. Thirteen more ship inside Claude Code, invoked by typing a slash, and are documented in the commands reference rather than in the skills repository.",
    "Two of those three lists collide on the same names. There is a pdf skill in the repository and a pdf skill_id on the API, and they are not the same artifact under the same license. Every row below says which set it belongs to. Counts and file contents were read on August 18, 2026 from the GitHub API and from raw.githubusercontent.com, and the repository gains skills often enough that the count is a snapshot rather than a fact.",
  ],
  answer:
    "Anthropic publishes first-party skills in three separate sets. Four pre-built document skills, pptx, xlsx, docx, and pdf, are available on claude.ai and the Claude API, where you reference them by skill_id alongside the code execution tool. Nineteen skill folders sit in the public anthropics/skills repository, grouped into five plugin bundles. Thirteen more ship bundled inside Claude Code and are invoked with a slash.",
  answerNotes: [
    "The three sets do not sync with each other, and Anthropic says so directly. The overview page states that custom skills do not sync across surfaces, that a skill uploaded to claude.ai must be uploaded separately to the API, and that Claude Code skills are filesystem-based and separate from both. The same separation applies to the first-party skills: the pre-built document skills are documented as not available in Claude Code, and twelve of the thirteen Claude Code bundled skills are not in the repository. The exception is claude-api. The overview page says the open-source Claude API skill comes bundled with Claude Code, and the same skill is published in the repository as its own plugin, so that one artifact is the only place two of the three sets overlap.",
    "The repository is not a product surface either. It is a GitHub repository at 170,257 stars when we read the API today, carrying a skills folder, a one-file spec folder, and a template folder holding a single SKILL.md. Anthropic's own framing is that these skills demonstrate what is possible, with a disclaimer that the implementations and behaviors you receive from Claude may differ from what is shown, and that you should test before relying on them.",
    "One naming rule is worth knowing before you copy a first-party skill and rename it. The platform documentation states that a skill name may contain only lowercase letters, numbers, and hyphens, is capped at 64 characters, and cannot contain the reserved words anthropic or claude. The bundled Claude Code skill is spelled claude-api and the repository folder is spelled claude-api, so the reserved-word rule and Anthropic's own published names disagree on the surfaces where the rule is stated.",
  ],
  answerSourceIds: [
    "platform-skills-overview",
    "anthropic-skills-repo",
    "claude-code-commands",
    "claude-code-skills",
  ],
  sets: {
    title: "The three sets, and why the difference matters",
    intro:
      "Start here before reading any single row. A search for Anthropic skills returns all three of these mixed together, and the install path, the license, and the surface differ in each case.",
    columns: ["Set", "What is in it", "Where it loads"],
    rows: [
      {
        label: "Pre-built document skills",
        cells: [
          "Four: PowerPoint (pptx), Excel (xlsx), Word (docx), and PDF (pdf). Documented as creating presentations and editing slides, creating spreadsheets and generating reports with charts, creating and formatting documents, and generating formatted PDF documents and reports.",
          "claude.ai, the Claude API, Claude Platform on AWS, and Microsoft Foundry. On the API you pass the skill_id in the container parameter with the code execution tool and the skills-2025-10-02 beta header. The overview page states these are not available in Claude Code.",
        ],
      },
      {
        label: "The anthropics/skills repository",
        cells: [
          "Nineteen skill folders on the day we checked, plus a spec folder holding the Agent Skills specification and a template folder holding one SKILL.md. The marketplace manifest groups them into five plugins.",
          "Anywhere that reads a SKILL.md. In Claude Code, run /plugin marketplace add anthropics/skills and install document-skills, example-skills, claude-api, academy-guide, or discernment-nudge. On claude.ai the example skills appear as toggles under Customize, then Skills.",
        ],
      },
      {
        label: "Claude Code bundled skills",
        cells: [
          "Thirteen entries marked Skill in the commands reference, from /batch to /verify. Anthropic describes them as prompt-based: a prompt handed to Claude, which Claude can also invoke automatically when relevant, rather than fixed logic.",
          "Every Claude Code session, with no install step. The disableBundledSkills setting turns off every one of them except /doctor, and a skillOverrides entry hides an individual skill.",
        ],
      },
    ],
    notes: [
      "The overlap is real and it trips people up. There is a pdf folder in the repository and a pdf skill_id on the API, and the same is true for docx, pptx, and xlsx. Anthropic says the repository copies are the document creation and editing skills that power Claude's document capabilities under the hood, and publishes them source-available as a reference for more complex skills. The repository copy is a reference implementation you can read; the skill_id is a thing the API runs for you.",
      "The claude-api skill exists twice on purpose, and the documentation is explicit about it. It comes bundled with Claude Code, where it is invoked as /claude-api, and it is also published in the repository so you can install it in any environment that supports Agent Skills. It covers the Messages API and Claude Managed Agents across eight languages: Python, TypeScript, C#, Go, Java, PHP, Ruby, and cURL.",
      "Read the marketplace manifest rather than counting folders. The five plugins declared in .claude-plugin/marketplace.json cover all nineteen folders on the day we read them: document-skills carries the four document skills, example-skills carries twelve, and claude-api, academy-guide, and discernment-nudge carry one each. The manifest is a hand-edited file rather than a listing of the directory, so a folder can exist before a plugin references it, and the manifest is what decides what /plugin install actually gives you.",
    ],
    link: {
      lead: "For what a skill is before you pick one, including the SKILL.md frontmatter and the fields each product adds on top, see",
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "platform-skills-overview",
      "anthropic-skills-repo",
      "anthropic-skills-readme",
      "anthropic-skills-marketplace",
      "claude-code-skills",
      "claude-code-commands",
      "platform-claude-api-skill",
      "agentskills-home",
    ],
  },
  catalog: {
    title: "The nineteen skills in anthropics/skills",
    intro:
      "One row per folder, in the order GitHub lists them. The middle column paraphrases the description field in that skill's own SKILL.md, read today. The right column is the plugin that installs it and the license file sitting next to it.",
    columns: ["Skill", "What its SKILL.md describes", "How it ships"],
    rows: [
      {
        label: "academy-guide",
        cells: [
          "Recommends matching courses, tutorials, and use cases from Claude Academy at academy.claude.com when someone asks how to use Claude or a Claude product. Its own instruction is to only recommend on a strong match and never invent Academy content.",
          "Its own plugin, academy-guide. Apache 2.0. Renamed from claude-academy-guide earlier today, in the most recent commit on the repository when we read it.",
        ],
      },
      {
        label: "algorithmic-art",
        cells: [
          "Creates generative art in p5.js with seeded randomness, flow fields, and particle systems, working in two passes: an algorithmic philosophy in Markdown first, then the HTML and JavaScript that expresses it.",
          "example-skills. Apache 2.0. Bundles a templates directory.",
        ],
      },
      {
        label: "brand-guidelines",
        cells: [
          "Applies Anthropic's own brand colors and typography to any artifact that should carry the Anthropic look. The SKILL.md itself lists the hex values, starting with Dark #141413 and Light #faf9f5.",
          "example-skills. Apache 2.0. SKILL.md only, no bundled files.",
        ],
      },
      {
        label: "canvas-design",
        cells: [
          "Produces posters, art, and other static designs as .png and .pdf output, again in two passes: a written design philosophy, then the visual expression of it. Instructed to create original work rather than copying existing artists.",
          "example-skills. Apache 2.0. Bundles a canvas-fonts directory.",
        ],
      },
      {
        label: "claude-api",
        cells: [
          "Reference material for the Claude API and the Anthropic SDKs: model ids, pricing, parameters, streaming, tool use, MCP, agents, caching, token counting, and model migration, in eight languages plus Managed Agents.",
          "Its own plugin, claude-api, and bundled with Claude Code as /claude-api. Apache 2.0. Bundles a directory per language.",
        ],
      },
      {
        label: "discernment-nudge",
        cells: [
          "Appends two or three short follow-up questions after a substantive answer or draft, tied to what was just produced, so the reader checks key facts and probes assumptions. Documented to run at most once per conversation.",
          "Its own plugin, discernment-nudge. Apache 2.0. Added to the repository yesterday.",
        ],
      },
      {
        label: "doc-coauthoring",
        cells: [
          "A three-stage workflow for writing documentation, proposals, specs, and decision docs: context gathering, refinement and structure, then reader testing with a fresh Claude that has no prior context.",
          "example-skills. The only folder in the repository with no LICENSE.txt and no license field in its frontmatter.",
        ],
      },
      {
        label: "docx",
        cells: [
          "Creates, reads, and edits Word .docx and .dotx files, including tables of contents, headings, letterheads, tracked changes, comments, and find-and-replace inside the underlying XML.",
          "document-skills. Proprietary, source-available. Bundles a scripts directory.",
        ],
      },
      {
        label: "frontend-design",
        cells: [
          "Aesthetic direction for building or reshaping a UI: palette, typography, structure, and motion, written to push away from choices that read as templated defaults.",
          "example-skills. Apache 2.0. SKILL.md only, no bundled files.",
        ],
      },
      {
        label: "internal-comms",
        cells: [
          "Writes internal communications in a set of house formats: 3P updates covering progress, plans and problems, company newsletters, FAQ answers, status reports, leadership updates, project updates, and incident reports.",
          "example-skills. Apache 2.0. Bundles an examples directory, one file per format.",
        ],
      },
      {
        label: "mcp-builder",
        cells: [
          "A guide to building MCP servers in Python with FastMCP or in Node and TypeScript with the MCP SDK, organized around workflow tools rather than one tool per API endpoint.",
          "example-skills. Apache 2.0. Bundles reference and scripts directories.",
        ],
      },
      {
        label: "pdf",
        cells: [
          "Everything PDF: extracting text and tables, merging, splitting, rotating, watermarking, creating, filling forms, encrypting and decrypting, extracting images, and OCR on scanned files.",
          "document-skills. Proprietary, source-available. Bundles forms.md, reference.md, and a scripts directory.",
        ],
      },
      {
        label: "pptx",
        cells: [
          "Creates, reads, and edits .pptx and .potx files: decks, templates, layouts, speaker notes, and comments, including editing the slide XML directly when building from a template.",
          "document-skills. Proprietary, source-available. Bundles a scripts directory, including a slide thumbnail grid generator.",
        ],
      },
      {
        label: "skill-creator",
        cells: [
          "Creates new skills, edits existing ones, and measures them: writing a draft, generating test prompts, running evals, benchmarking with variance analysis, and tuning a description so it triggers reliably.",
          "example-skills. Apache 2.0 in LICENSE.txt, though its frontmatter carries no license field. Bundles agents, assets, eval-viewer, references, and scripts.",
        ],
      },
      {
        label: "slack-gif-creator",
        cells: [
          "Builds animated GIFs sized for Slack, with the platform constraints written into the file: 128 by 128 for emoji, 480 by 480 for messages, 10 to 30 frames per second, and under three seconds for an emoji GIF.",
          "example-skills. Apache 2.0. Bundles a core package and a requirements.txt.",
        ],
      },
      {
        label: "theme-factory",
        cells: [
          "Applies a visual theme to an artifact, whether a deck, a document, a report, or an HTML landing page. Ships ten preset themes with colors and fonts, and can generate a new one on request.",
          "example-skills. Apache 2.0. Bundles a themes directory and a theme showcase PDF.",
        ],
      },
      {
        label: "web-artifacts-builder",
        cells: [
          "Builds elaborate multi-component claude.ai HTML artifacts with React, Tailwind CSS, and shadcn/ui, then bundles everything into a single HTML file. Explicitly not for simple single-file artifacts.",
          "example-skills. Apache 2.0. Bundles init and bundle shell scripts.",
        ],
      },
      {
        label: "webapp-testing",
        cells: [
          "Drives and tests a local web application with Playwright: verifying frontend behavior, debugging the UI, capturing screenshots, and reading browser logs, with a helper that manages server lifecycle.",
          "example-skills. Apache 2.0. Bundles examples and scripts, with instructions to run the scripts rather than read them into context.",
        ],
      },
      {
        label: "xlsx",
        cells: [
          "Opens, reads, edits, and creates spreadsheets in .xlsx, .xlsm, .xltx, .csv, and .tsv, including formulas, formatting, charts, and cleaning messy tabular data into a proper sheet.",
          "document-skills. Proprietary, source-available. Bundles a scripts directory.",
        ],
      },
    ],
    notes: [
      "The descriptions are worth reading in full, and not because they are long. Several of them are the most instructive examples of description writing Anthropic publishes anywhere: xlsx spends most of its description on when not to trigger, claude-api carries an explicit SKIP clause that defers to another provider's SDK, and academy-guide names the exact phrases that should trigger it. If you are writing a description for your own skill, these are the models to copy rather than the two-line examples in the help center.",
      "Bundled files are the other half of the lesson. Nine of the nineteen ship a scripts or core directory, and webapp-testing states the reason out loud: run the scripts with --help first and do not read the source, because the scripts can be very large and would pollute the context window. That is progressive disclosure used as an instruction to the agent rather than as an architecture diagram.",
      "Five folders carry no reference material at all: brand-guidelines, frontend-design, doc-coauthoring, discernment-nudge, and academy-guide are a SKILL.md and, in four of five cases, a license. A first-party skill does not have to be a package to be useful, which is worth knowing before you overbuild your first one.",
    ],
    link: {
      lead: "For the handful of these folders we would put in front of a team, judged against a stated bar and set beside third-party skills that clear the same one, see",
      label: "Best Claude skills: a register with the criteria behind it",
      href: bestClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "anthropic-skills-readme",
      "anthropic-skills-marketplace",
      "platform-claude-api-skill",
      "anthropic-engineering-skills",
    ],
  },
  bundled: {
    title: "The thirteen skills bundled with Claude Code",
    intro:
      "These are first-party skills too, and almost nobody counts them as such because they are documented in the commands reference rather than in the skills repository. Every entry below is marked Skill in that table, which is Anthropic's own distinction between a prompt handed to Claude and a command that runs fixed logic.",
    columns: ["Command", "What it does", "What to know"],
    rows: [
      {
        label: "/batch",
        cells: [
          "Orchestrates large-scale changes across a codebase in parallel: researches the code, decomposes the work into 5 to 30 independent units, presents a plan, then spawns one background subagent per unit in an isolated git worktree.",
          "Each subagent implements its unit, runs tests, and opens a pull request. Requires a git repository.",
        ],
      },
      {
        label: "/claude-api",
        cells: [
          "Loads Claude API and Managed Agents reference material for your project's language, with migrate, managed-agents-onboard, and prompt-audit subcommands.",
          "The same skill published in the repository. Also activates automatically when your code imports anthropic or @anthropic-ai/sdk.",
        ],
      },
      {
        label: "/code-review",
        cells: [
          "Reviews the current diff, or a pull request, branch, or path you pass, for correctness bugs and cleanup opportunities.",
          "Takes an effort level from low to ultra, --fix to apply findings, and --comment to post them as inline GitHub comments. Aliased as /review.",
        ],
      },
      {
        label: "/dataviz",
        cells: [
          "Design guidance for charts, graphs, and dashboards: picks the chart form for the data, assigns color by role, and applies mark, interaction, and accessibility rules.",
          "Validates the palette for colorblind safety and contrast with a bundled script. Uses a brand-neutral placeholder palette you are expected to replace.",
        ],
      },
      {
        label: "/debug",
        cells: [
          "Turns on debug logging for the current session and troubleshoots by reading the session debug log.",
          "Debug logging is off by default unless you started with claude --debug, so running this mid-session captures from that point forward.",
        ],
      },
      {
        label: "/design-sync",
        cells: [
          "Converts your repository's React design system and uploads it to Claude Design, so generated designs use your real components.",
          "A first-time sync verifies every component and can take hours on a large repository. Unavailable on deployments whose tool cannot reach claude.ai.",
        ],
      },
      {
        label: "/doctor",
        cells: [
          "A setup checkup that diagnoses installation health, PATH problems, unparseable settings, unused skills and MCP servers against their context cost, and slow hooks.",
          "The one bundled skill that stays typable when bundled skills are disabled. Also trims oversized CLAUDE.md files. Aliased as /checkup.",
        ],
      },
      {
        label: "/fewer-permission-prompts",
        cells: [
          "Scans your transcripts for common read-only Bash and MCP calls, then writes a prioritized allowlist into the project settings file.",
          "Edits .claude/settings.json in the project, so the result is a change your teammates inherit through the repository.",
        ],
      },
      {
        label: "/loop",
        cells: [
          "Runs a prompt repeatedly while the session stays open, at an interval you pass or one Claude paces itself.",
          "With no prompt it runs an autonomous maintenance check or whatever is in .claude/loop.md. Aliased as /proactive.",
        ],
      },
      {
        label: "/run",
        cells: [
          "Launches and drives your project's app so you can see a change working, rather than only seeing tests pass.",
          "Infers the launch from the project type and from the README, package.json, or Makefile. That inference gets unreliable for anything beyond a standard launch.",
        ],
      },
      {
        label: "/run-skill-generator",
        cells: [
          "Records how to build, launch, and drive your project from a clean environment, and commits it as a per-project skill at .claude/skills/run-<name>/.",
          "This is the interesting one: a first-party skill whose output is another skill, checked into your repository for every agent that reads the directory.",
        ],
      },
      {
        label: "/simplify",
        cells: [
          "Reviews changed code for cleanup opportunities and applies the fixes, with four review agents running in parallel over reuse, simplification, efficiency, and level of abstraction.",
          "From v2.1.154 it no longer looks for correctness bugs. Use /code-review for those.",
        ],
      },
      {
        label: "/verify",
        cells: [
          "Confirms a code change does what it should by building the app, running it, and observing the result, rather than relying on tests or type checks.",
          "One of the skills documented as running only when you invoke it, which keeps you in control of when a longer check spends time and tokens. Can record its own recipe into .claude/skills/verify/SKILL.md.",
        ],
      },
    ],
    notes: [
      "Two of these write skills rather than only running as skills. /run-skill-generator records a per-project recipe at .claude/skills/run-<name>/, and /verify writes what worked to .claude/skills/verify/SKILL.md when it had to figure out a build without a recorded recipe. Both land in the repository, which means the output of a first-party skill becomes a team skill that any agent reading that directory will pick up, whether or not the person who ran the command intended that.",
      "Precedence runs the other way from what you might expect. Claude Code documents that a skill at any local level overrides a bundled skill with the same name, but not the bundled skill's aliases: a code-review skill in your project's .claude/skills/ replaces the bundled /code-review, while typing the alias /review still runs Anthropic's. That is a genuinely easy way to think a local override is live when half of it is not.",
      "Bundled skills also cost context, which is the honest reason the off switch exists. The disableBundledSkills setting turns off all of them except /doctor, and skillOverrides hides individual entries. /doctor itself reports unused skills, MCP servers, and plugins against their context cost, so Anthropic ships both the crowding and the tool that measures it.",
    ],
    link: {
      lead: "For why Claude Code documents custom commands as merged into skills, and what still differs between a command file and a SKILL.md, see",
      label: "Claude skills vs slash commands",
      href: comparePaths.skillsVsSlashCommands,
      trail: ".",
    },
    sourceIds: ["claude-code-commands", "claude-code-skills"],
  },
  surfaces: {
    title: "Which surface loads which set",
    intro:
      "The question behind most searches for Anthropic skills is really this one: I am sitting in a particular product, what is already here. The middle column answers that. The right column is what you still have to do yourself.",
    columns: ["Surface", "First-party skills already there", "What you add yourself"],
    rows: [
      {
        label: "Claude Code",
        cells: [
          "The thirteen bundled skills, in every session, with no install. The pre-built document skills are documented as not available here.",
          "Everything else. Personal skills in ~/.claude/skills/, project skills in .claude/skills/, or plugins. Add the repository with /plugin marketplace add anthropics/skills, then install document-skills or example-skills.",
        ],
      },
      {
        label: "claude.ai",
        cells: [
          "The pre-built document skills, active when you create documents, with no setup beyond code execution and file creation being enabled. Anthropic's help center lists them as Excel, Word, PowerPoint, and PDF creation.",
          "The repository's example skills appear as toggles under Customize, then Skills. Custom skills upload as a ZIP and are private to your individual account.",
        ],
      },
      {
        label: "Claude Cowork",
        cells: [
          "Whatever is enabled on the claude.ai account the session runs under, synced at session start, plus the skills bundled in any installed plugin.",
          "Nothing local. A Cowork session does not read the skills directory on your machine, so enabling a skill on the account is the step people skip.",
        ],
      },
      {
        label: "Claude API",
        cells: [
          "The four pre-built skills by skill_id: pptx, xlsx, docx, and pdf, referenced in the container parameter alongside the code execution tool with the skills-2025-10-02 beta header.",
          "Custom skills through the /v1/skills endpoints, shared workspace-wide. The container has no network access and no runtime package installation.",
        ],
      },
      {
        label: "Microsoft 365 add-ins",
        cells: [
          "Skills already enabled in your Claude settings are also available in the Claude add-ins for Excel, PowerPoint, Word, and Outlook, applied automatically as you work.",
          "Nothing add-in specific. Type a slash in the sidebar to pick a skill, or describe the task and let Claude match it.",
        ],
      },
    ],
    notes: [
      "The line to remember is that nothing syncs. Anthropic states that custom skills do not sync across surfaces, that a skill uploaded to claude.ai must be separately uploaded to the API, that skills uploaded through the API are not available on claude.ai, and that Claude Code skills are filesystem-based and separate from both. The first-party skills inherit the same fragmentation, which is why a team of five people using three surfaces ends up with three different answers to what is installed.",
      "Sharing scope differs per surface too, and it is the part that decides whether a recommendation survives. On claude.ai a custom skill is individual to each user, and the platform documentation says claude.ai does not support centralized admin management or org-wide distribution of custom skills. On the API, uploaded skills are workspace-wide. In Claude Code they are personal or project-based, or distributed through plugins.",
      "The runtime differs as well, which matters when you copy a first-party skill that shells out. On the Claude API, skills run in a sandboxed container with no network access and no runtime package installation, so only pre-installed packages are available. In Claude Code they have the same network access as any other program on your computer. On claude.ai, network access varies with user and admin settings.",
    ],
    link: {
      lead: "For the surface where none of the local directories apply and the set a session can load comes from an account instead, see",
      label: "Claude Cowork skills",
      href: coworkSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "platform-skills-overview",
      "help-use-skills",
      "claude-code-skills",
      "anthropic-skills-readme",
    ],
  },
  licensing: {
    title: "What you are actually allowed to do with these",
    intro:
      "Open source is doing a lot of work in most write-ups of this repository, and it is only true of part of it. There is no license file at the top level of anthropics/skills. Every license sits inside an individual skill folder, and they are not all the same license.",
    columns: ["Group", "Which skills", "What the license file says"],
    rows: [
      {
        label: "Apache 2.0",
        cells: [
          "academy-guide, algorithmic-art, brand-guidelines, canvas-design, claude-api, discernment-nudge, frontend-design, internal-comms, mcp-builder, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing.",
          "The standard Apache License 2.0 text, in a LICENSE.txt beside the SKILL.md. Fourteen of the nineteen folders.",
        ],
      },
      {
        label: "Source-available",
        cells: [
          "docx, pdf, pptx, xlsx.",
          "Not open source. The LICENSE.txt opens with a copyright line and states that use is governed by your agreement with Anthropic, then adds restrictions: you may not extract the materials from the services, retain copies outside the services, reproduce them except as temporary copies during authorized use, or create derivative works.",
        ],
      },
      {
        label: "No license file",
        cells: [
          "doc-coauthoring.",
          "The folder holds a SKILL.md and nothing else, and the frontmatter has no license field. We are recording the absence rather than reading anything into it.",
        ],
      },
      {
        label: "The repository itself",
        cells: [
          "The spec folder, the template folder, and the marketplace manifest.",
          "The GitHub API reports no license for the repository as a whole. There is a THIRD_PARTY_NOTICES.md carrying attribution for bundled dependencies such as imageio under BSD 2-Clause.",
        ],
      },
      {
        label: "The frontmatter field",
        cells: [
          "Present on seventeen of nineteen. Absent on doc-coauthoring and skill-creator.",
          "Where present it reads either 'Complete terms in LICENSE.txt' or 'Proprietary. LICENSE.txt has complete terms'. It points at the file rather than naming a license identifier, so a tool cannot resolve it without reading the folder.",
        ],
      },
    ],
    notes: [
      "The practical version: you can fork, adapt, and redistribute fourteen of these. You cannot do that with the four document skills, and the restriction is specific rather than vague. The relevant clauses forbid extracting the materials from the services, retaining copies outside the services, and creating derivative works. Anthropic's stated reason for publishing them at all is that they wanted to share the skills behind a production feature as a reference for more complex skills, which is a different offer from an open-source license.",
      "The license field is also not a license identifier, and any tooling that treats it as one will be wrong. In the Agent Skills frontmatter it is a free-text string, and Anthropic's own skills use it to point at a neighboring file. If you are building a library that displays a license per skill, the field tells you a file exists rather than telling you the terms.",
      "None of this is legal advice, and the terms in a source-available LICENSE.txt reference an agreement between you and Anthropic that we cannot read from outside. Read the file in the folder you are about to copy, on the day you copy it.",
    ],
    link: {
      lead: "For which frontmatter fields the open standard actually defines, license included, and which ones are one product's extension, see",
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "anthropic-skills-readme",
      "anthropic-skills-licenses",
    ],
  },
  team: {
    title: "The catalog does not tell your team which of these to use",
    intro:
      "Nineteen folders, thirteen commands, and four skill_ids is a supply problem solved. The question a team gets stuck on is which three of them are worth standardizing on, and none of the three sets above answers it.",
    body: [
      "The scope you install at is different on every surface, which is exactly why a team ends up with three answers. On claude.ai a skill is enabled per person, and the platform documentation says custom skills there are individual to each user with no org-wide distribution and no central admin management. In Claude Code the thirteen bundled skills are present in every session with no install, while anything from the repository is added per user, per project, or through a plugin the project checks in. On the Claude API nothing is installed per person at all: the four pre-built skills are referenced by skill_id, and a custom skill uploaded through /v1/skills is workspace-wide for every member. Someone enables theme-factory on claude.ai, someone else installs example-skills in Claude Code, and a third person is on the API where neither is reachable, and Anthropic states that custom skills do not sync across surfaces, so the drift is designed in rather than accidental.",
      "The decision itself lives nowhere. The repository tells you a skill exists. It does not record that your team tried webapp-testing, found it worked, and agreed it is the one to reach for, or that someone read the docx license and decided the source-available terms rule it out for your fork. That gets said once in a chat thread and then it is gone.",
      "Skills Board is a web app for that smaller layer: the set your team actually recommends, in one searchable place, with the source repository and path visible on every entry, so a teammate can open the original SKILL.md before installing anything anywhere.",
    ],
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md and its LICENSE.txt before installing it. For anything from anthropics/skills, that license check is not a formality.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time. A claude.ai upload wants an archive with the skill folder as its root, which is the same shape.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits, which for this repository usually means the Claude Code marketplace path rather than a claude.ai upload.",
      },
      {
        label: "Connect over MCP",
        body: "An authenticated MCP endpoint lets a compatible agent search the same team library and retrieve install commands, and with the write scope save skills and organize collections.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a license clearance.",
      "Skills Board does not install, enable, or provision anything inside Claude. Every path on this page still runs through Anthropic's own settings or your own filesystem.",
      "It follows the latest version available from the saved source, and does not pin or preserve historical versions. The repository above changed three times in the two days before we wrote this page: two skills added and one of them renamed the next day.",
      "The MCP connection cannot install or run a skill inside an agent, and it cannot edit or delete saved team skills.",
      "The hosted product is free forever, the code is MIT licensed, and you can read or self-host all of it.",
    ],
    link: {
      lead: "For the ownership side of the same problem, one recommendation and a named owner per skill, see",
      label: "How to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: ".",
    },
    sourceIds: ["platform-skills-overview", "anthropic-skills-repo"],
  },
  openQuestions: {
    title: "What is not documented",
    intro:
      "Six things we could not resolve from a first-party source while building this catalog. Each is written out as the absence it is rather than filled in with a reasonable guess.",
    entries: [
      {
        title: "No published index of the repository's skills",
        body: "Anthropic publishes no list of what is in anthropics/skills. The README describes categories and points at the folder. The count of nineteen on this page comes from the GitHub contents API, read today. There is no changelog, no versioning, and no announcement when a skill is added, so the only way to know what is current is to read the directory again.",
      },
      {
        title: "The repository copies and the pre-built skill_ids are not formally linked",
        body: "The README says the docx, pdf, pptx, and xlsx folders are the skills that power Claude's document capabilities under the hood. No page states whether the folder is the same version the API runs, whether they are updated together, or how far the published copy can lag behind the deployed one. We are treating them as related, not identical.",
      },
      {
        title: "The reserved-word rule contradicts Anthropic's own skill names",
        body: "The platform overview states that a skill name cannot contain the reserved words anthropic or claude. Anthropic ships a folder named claude-api in the same repository and bundles it in Claude Code as /claude-api. Nothing reconciles the two, and no page says whether the rule applies only to skills uploaded through a particular surface.",
      },
      {
        title: "No documented context cost for the bundled Claude Code skills",
        body: "Thirteen bundled skills occupy metadata in every session, and /doctor exists partly to report skills against their context cost. No figure is published for what the bundled set itself costs, or where it sits against the listing budget Claude Code documents as one percent of the model's context window.",
      },
      {
        title: "No license on the repository as a whole",
        body: "The GitHub API reports no license for anthropics/skills. Every license lives inside an individual skill folder, and one folder has none at all. What governs the spec folder, the template SKILL.md, and the marketplace manifest is not stated anywhere we could find.",
      },
      {
        title: "The example skills on claude.ai are not enumerated",
        body: "The help center says individual members can toggle on example skills under Customize, then Skills, and the repository README says its example skills are already available to paid plans on claude.ai. Neither page lists which ones, so whether the toggles match the nineteen folders one for one is unverified from outside the product.",
      },
    ],
    sourceIds: [
      "anthropic-skills-repo",
      "anthropic-skills-readme",
      "platform-skills-overview",
      "claude-code-skills",
      "help-use-skills",
    ],
  },
  faq: [
    {
      question: "What are Anthropic skills?",
      answer:
        "They are the Agent Skills that Anthropic publishes itself, in three sets: four pre-built document skills referenced by skill_id on claude.ai and the Claude API, nineteen skill folders in the public anthropics/skills repository, and thirteen more bundled inside Claude Code and invoked with a slash.",
    },
    {
      question: "How many skills does Anthropic publish in its skills repository?",
      answer:
        "Nineteen folders under the skills directory when we read the GitHub API on August 18, 2026, plus a spec folder and a one-file template. Anthropic publishes no index and no changelog for the repository, and it gained two skills in the two days before that reading, so treat any count as a snapshot.",
    },
    {
      question: "Which Anthropic skills are built into claude.ai?",
      answer:
        "The four pre-built document skills: Excel, Word, PowerPoint, and PDF creation. Anthropic's help center says Claude uses them automatically when relevant once code execution and file creation is enabled, with no need to invoke them. The repository's example skills appear separately as toggles under Customize, then Skills.",
    },
    {
      question: "What are the Anthropic document skills?",
      answer:
        "Four skills for file creation: pptx for presentations, xlsx for spreadsheets, docx for Word documents, and pdf for PDF generation and processing. They run on claude.ai, the Claude API, Claude Platform on AWS, and Microsoft Foundry. Anthropic's overview page states they are not available in Claude Code.",
    },
    {
      question: "Are Anthropic agent skills open source?",
      answer:
        "Partly. Fourteen of the nineteen repository folders carry an Apache 2.0 license file. The docx, pdf, pptx, and xlsx skills are source-available rather than open source, with terms that forbid derivative works and retaining copies outside the services. One folder, doc-coauthoring, has no license file at all.",
    },
    {
      question: "How do I install Anthropic skills in Claude Code?",
      answer:
        "Register the repository as a plugin marketplace with /plugin marketplace add anthropics/skills, then install document-skills, example-skills, claude-api, academy-guide, or discernment-nudge. You can also copy a single skill folder into ~/.claude/skills/ for yourself, or into .claude/skills/ to commit it to a project your teammates share.",
    },
    {
      question: "Which skills come bundled with Claude Code from Anthropic?",
      answer:
        "Thirteen entries marked Skill in the commands reference: /batch, /claude-api, /code-review, /dataviz, /debug, /design-sync, /doctor, /fewer-permission-prompts, /loop, /run, /run-skill-generator, /simplify, and /verify. They are available in every session with no install step, and the disableBundledSkills setting turns off all of them except for /doctor.",
    },
    {
      question: "How does a team standardize on a set of Anthropic skills?",
      answer:
        "Not through Anthropic's own settings, which install per person and per surface and do not sync. Pick the few that matter, record the decision somewhere searchable, and keep the source repository and path visible so a teammate can read the SKILL.md and its license before installing anything.",
    },
  ],
  sources: [
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "The nineteen skill folders and their contents, the spec and template folders, the per-skill LICENSE.txt files, the absence of a repository-level license, the THIRD_PARTY_NOTICES.md, and the star count and commit history read through the GitHub API on August 18, 2026.",
    },
    {
      id: "anthropic-skills-readme",
      label: "anthropics/skills README",
      href: "https://github.com/anthropics/skills/blob/main/README.md",
      note: "That many skills are Apache 2.0 while the document skills are source-available, that those four power Claude's document capabilities under the hood, the /plugin marketplace add instruction, that the example skills are already available to paid plans on claude.ai, and the disclaimer that behavior may differ from what the skills show.",
    },
    {
      id: "anthropic-skills-marketplace",
      label: "The anthropic-agent-skills marketplace manifest",
      href: "https://github.com/anthropics/skills/blob/main/.claude-plugin/marketplace.json",
      note: "The five plugins declared today: document-skills carrying xlsx, docx, pptx, and pdf; example-skills carrying twelve; and claude-api, academy-guide, and discernment-nudge each carrying one.",
    },
    {
      id: "anthropic-skills-licenses",
      label: "The docx skill license file",
      href: "https://github.com/anthropics/skills/blob/main/skills/docx/LICENSE.txt",
      note: "The source-available terms on the four document skills: use governed by your agreement with Anthropic, and additional restrictions against extracting the materials from the services, retaining copies outside them, reproducing them, or creating derivative works.",
    },
    {
      id: "platform-skills-overview",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The four pre-built skills and the surfaces they reach, that they are not available in Claude Code, the skill_id and container parameter, the skills-2025-10-02 beta header, the name and description field rules including the reserved words, that custom skills do not sync across surfaces, the per-surface sharing scopes, and the runtime constraints.",
    },
    {
      id: "platform-claude-api-skill",
      label: "Anthropic: the Claude API skill",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/claude-api-skill",
      note: "That the claude-api skill is bundled with Claude Code and also published in the repository, the eight languages it covers, the Messages API and Managed Agents split, and the automatic activation when a project imports an Anthropic SDK.",
    },
    {
      id: "claude-code-commands",
      label: "Claude Code: commands reference",
      href: "https://code.claude.com/docs/en/commands",
      note: "The thirteen entries marked Skill and what each one does, the aliases, the subcommands and flags, and the version requirements for the newer ones.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "That bundled skills are prompt-based rather than fixed logic, the disableBundledSkills and skillOverrides settings, that /doctor stays available when the rest are off, the run and verify skill trio, and that a local skill overrides a bundled skill of the same name but not its aliases.",
    },
    {
      id: "help-use-skills",
      label: "Use skills in Claude",
      href: "https://support.claude.com/en/articles/12512180-using-skills-in-claude",
      note: "The built-in Anthropic skills listed as Excel, Word, PowerPoint, and PDF, that Claude uses them automatically with code execution and file creation on, that members toggle on example skills under Customize then Skills, that custom uploads are private to an individual account, and that enabled skills also apply in the Microsoft 365 add-ins.",
    },
    {
      id: "anthropic-engineering-skills",
      label: "Equipping agents for the real world with Agent Skills",
      href: "https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills",
      note: "The October 16, 2025 announcement, the PDF skill used as the worked example of a skill that powers Claude's document editing, progressive disclosure across three levels, the guidance to audit skills from less-trusted sources, and the December 18, 2025 update publishing Agent Skills as an open standard.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills overview",
      href: "https://agentskills.io",
      note: "The definition of a skill folder with a SKILL.md file, and the statement that the format was developed by Anthropic and released as an open standard, which is the frame the repository README points readers at.",
    },
  ],
  related: [
    {
      label: "Skill examples: real SKILL.md files, explained",
      href: "/skill-examples",
      description:
        "Eight of the folders catalogued here read line by line, with the pattern each one demonstrates.",
    },
    {
      label: "Best Claude skills: a register with the criteria behind it",
      href: bestClaudeSkillsPath,
      description:
        "Seven of the folders above, set beside twenty third-party entries that cleared the same seven criteria.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The definitional page: the SKILL.md format, the frontmatter fields, and what each Claude surface allows.",
    },
    {
      label: "Agent Skills: the open standard for extending AI agents",
      href: agentSkillsPath,
      description:
        "What the specification defines, which agents implement it, and what travels between them.",
    },
    {
      label: "Claude Cowork skills",
      href: coworkSkillsPath,
      description:
        "The surface with no local skills directory, where the set a session loads comes from an account instead.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The marketplaces, directories, and repositories beyond Anthropic's own, and what each one screens.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "The directories on disk and the personal, project, plugin, and managed install paths.",
    },
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "Why the repository ships plugins rather than skills, and what a plugin can carry that a skill cannot.",
    },
    {
      label: "Claude skills vs slash commands",
      href: comparePaths.skillsVsSlashCommands,
      description:
        "Why the bundled Claude Code skills are typed like commands, and which file wins the same name.",
    },
    {
      label: "Skills Board vs a GitHub repo",
      href: alternativePaths.githubRepo,
      description:
        "Keeping recommendations in a repository next to keeping them in a library, and what each costs.",
    },
  ],
  og: {
    eyebrow: "Anthropic Skills",
    title: [
      { text: "Anthropic ships three" },
      { text: "separate sets of skills.", accent: true },
    ],
    description:
      "Four pre-built document skills, nineteen folders in anthropics/skills, and thirteen bundled with Claude Code. What each does, where it loads, and how it is licensed.",
    contextLabel: "skillsboard.sh/anthropic-skills",
    chips: ["Catalog", "Surfaces", "Licenses"],
  },
  ogAlt:
    "Catalog of Anthropic's first-party skills: the four pre-built document skills, the nineteen folders in the anthropics/skills repository, and the thirteen skills bundled with Claude Code.",
  publishedAt: "2026-08-18",
  modifiedAt: "2026-08-19",
}
