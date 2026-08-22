import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentsMdVsSkillMdPath } from "@/lib/seo/agents-md-vs-skill-md/types"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { skillExamplesPath } from "@/lib/seo/skill-examples/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  skillExamplesPath,
  type SkillExamplesCtaPlacement,
  type SkillExamplesPath,
} from "@/lib/seo/skill-examples/types"

export interface SkillExamplesSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface SkillExamplesFaqEntry {
  question: string
  answer: string
}

export interface SkillExamplesRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * keeps an internal path that does not exist from shipping as a dead link.
 */
export interface SkillExamplesInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentsMdVsSkillMdPath
    | typeof anthropicSkillsPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

export interface SkillExamplesTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
  notes: readonly string[]
  link: SkillExamplesInlineLink
  sourceIds: readonly string[]
}

/**
 * A quoted fragment of a real SKILL.md. `template` is the verbatim block, which
 * the Markdown twin renders inside a fence and the page renders in a code
 * block. `permalink` is deliberately not called `href`: a record array where
 * every entry carries an `href` collapses into a plain link list in the twin,
 * which would drop the quoted block.
 */
export interface SkillExamplesExcerpt {
  title: string
  file: string
  permalink: string
  template: string
  takeaway: string
}

export interface SkillExamplesDefinition {
  path: typeof skillExamplesPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof anthropicSkillsPath
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
  patterns: SkillExamplesTableSection
  frontmatter: SkillExamplesTableSection
  descriptions: SkillExamplesTableSection
  layout: SkillExamplesTableSection
  excerpts: {
    title: string
    intro: string
    entries: readonly SkillExamplesExcerpt[]
    link: SkillExamplesInlineLink
    sourceIds: readonly string[]
  }
  divergence: SkillExamplesTableSection
  starter: {
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
    link: SkillExamplesInlineLink
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
  faq: readonly SkillExamplesFaqEntry[]
  sources: readonly SkillExamplesSource[]
  related: readonly SkillExamplesRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

/**
 * The anthropics/skills commit every excerpt, line count and byte count on
 * this page was read from. Pinned rather than tracking main so a quote stays
 * checkable against the exact bytes it was taken from after the branch moves.
 */
const skillsRepoCommit = "3b3fad96af16a10759d930941b4520ba0c40edae"

/** Blob URL prefix for files in anthropics/skills at {@link skillsRepoCommit}. */
const skillsRepoBlob = `https://github.com/anthropics/skills/blob/${skillsRepoCommit}`

export const skillExamples: SkillExamplesDefinition = {
  path: skillExamplesPath,
  contentType: "article",
  topics: [
    "skill examples",
    "claude skills examples",
    "agent skills examples",
    "SKILL.md",
    "skill authoring",
  ],
  relatedGuidePaths: [
    guidePaths.writeSkillMd,
    anthropicSkillsPath,
    agentSkillsPath,
  ],
  eyebrow: "Skill Examples",
  title: "Skill examples: eight real SKILL.md files, and the pattern each one teaches",
  seoTitle: "Skill Examples: Real SKILL.md Files, Explained | Skills Board",
  description:
    "Eight real Agent Skills from anthropics/skills, read file by file: what each SKILL.md does, the pattern worth copying, verbatim excerpts with their source, what all nineteen example skills actually declare in frontmatter, and the six places the examples disagree with the specification they are written to.",
  intro: [
    "When developers search for skill examples they are almost never asking for a definition. They want to open a real SKILL.md, see how long it is, see what the frontmatter carries, and work out how much of the format they actually have to use. This page is built for that: eight real files, quoted where quoting helps, grouped by the pattern each one demonstrates rather than listed alphabetically.",
    "The examples come from anthropics/skills, the public repository Anthropic publishes for this purpose. It holds nineteen skill folders, a five-line starter template, and a spec folder that is now a single line pointing at agentskills.io. Its own README calls the contents demonstration and educational material and warns that what Claude actually does may differ from what the files show, which is a useful frame: read them as evidence of what people ship, not as a conformance suite.",
    "Two things this page deliberately does not do. It does not re-list the catalog, because the full inventory of what Anthropic publishes and where each set loads already lives on its own page. And it does not teach the format from scratch, because the authoring rules, the field constraints, and the validation step live in the companion guide. This page sits between them: the files themselves, and what a reader should take from each one.",
    "Everything below was read on August 22, 2026, from the GitHub API, the raw files in the repository, the Agent Skills specification, and the Claude Code documentation. Line counts, character counts, and folder counts are from that reading. Repositories move, so check the linked source before you rely on a number.",
  ],
  answer:
    "The skill examples most developers are looking for are the nineteen folders in anthropics/skills, plus the five-line template the same repository ships at template/SKILL.md. Each folder is a directory holding a SKILL.md: YAML frontmatter carrying a name and a description, then Markdown instructions. Eight of the nineteen bundle a scripts folder, five bundle nothing beyond the file itself, and none of them uses more than three frontmatter fields.",
  answerNotes: [
    "The count of nineteen is the folder count under skills/ in the repository. The packaging agrees: .claude-plugin/marketplace.json groups exactly those nineteen into five installable plugins, four document skills, twelve example skills, and three that stand alone as claude-api, academy-guide and discernment-nudge.",
    "The smallest complete example in the repository is not one of the nineteen. It is template/SKILL.md, at 140 bytes and five lines: three lines of frontmatter, a blank line, and a heading that says where the instructions go. Everything else on this page is an elaboration of that file.",
    "The repository states its own status plainly. Its README says the skills are provided for demonstration and educational purposes only, and that the implementations and behaviors you receive from Claude may differ from what is shown. It also says the document skills are source-available rather than open source, and that many of the others are Apache 2.0.",
    "Reading real files is the fastest way to calibrate how much format you need, and it is also the fastest way to inherit somebody else's shortcuts. Six places where these examples and the published guidance disagree are tabled further down, including one that can break at runtime.",
  ],
  answerSourceIds: [
    "anthropic-skills-repo",
    "anthropic-skills-readme",
    "anthropic-template",
    "anthropic-marketplace",
  ],
  patterns: {
    title: "Eight examples, and the pattern each one is good for",
    intro:
      "Ordered from the smallest file that still works to the one that outgrew the format. Each row names what the file actually is, then the reusable move inside it. Sizes are the byte and line counts read from the repository on the date at the top of this page.",
    columns: ["Example", "What the SKILL.md is", "The pattern to take"],
    rows: [
      {
        label: "template/SKILL.md",
        cells: [
          "Five lines and 140 bytes. A name, a description that says to replace it, and a single heading reading Insert instructions below. It is not one of the nineteen skills, it sits in its own folder at the repository root.",
          "The floor. A skill is a directory, a name, a description, and prose. Every other row on this page is optional structure layered on top of this file, which is worth knowing before you copy a 500-line example.",
        ],
      },
      {
        label: "brand-guidelines",
        cells: [
          "74 lines, 2,235 bytes, and no bundled files at all beyond a license. The body is hex codes, two typeface names with fallbacks, and the rules for applying them to headings, body text, and shapes.",
          "A skill can be pure reference data. When the agent already knows how to do the task and only lacks your facts, the facts are the whole skill. No scripts, no reference folder, no workflow.",
        ],
      },
      {
        label: "internal-comms",
        cells: [
          "33 lines and 1,511 bytes, the shortest SKILL.md in the repository. It lists seven kinds of internal communication, then routes to one of four files in its examples folder, then closes with a keyword list.",
          "The router. The body carries the branch table and nothing else, and the actual instructions sit one file down. This is the clearest working demonstration of progressive disclosure in the repository.",
        ],
      },
      {
        label: "webapp-testing",
        cells: [
          "96 lines with a scripts folder and an examples folder. It names one helper script, tells the agent to run it with the help flag before reading it, then gives a decision tree and one worked Playwright snippet.",
          "Scripts as black boxes. The file spends its words on when to reach for the script and what to do with the result, and explicitly tells the agent not to load the source into context.",
        ],
      },
      {
        label: "pdf",
        cells: [
          "315 lines, eight scripts, and two long reference files, forms and reference, kept beside SKILL.md instead of inside a references folder. The body covers the common operations and defers form filling and troubleshooting.",
          "Split by frequency rather than by topic. The operations that run on every invocation stay inline; the ones that run occasionally move out and are named in a quick reference table at the end.",
        ],
      },
      {
        label: "xlsx",
        cells: [
          "100 lines, twelve scripts, and a 948-character description whose last sentence exists only to stop the skill from firing on a Word document, an HTML report, or a Google Sheets integration.",
          "The description is the interface. A long description is not padding when every clause rules a case in or out, and the closing negative list is the single most copyable move in the repository.",
        ],
      },
      {
        label: "claude-api",
        cells: [
          "557 lines and 68 files across ten folders named after languages rather than roles. The description is 1,068 characters and is organised into a reference line, a trigger block, and a skip block that overrides it.",
          "What outgrowing the format looks like. Genuinely useful to read, and also the one example that breaks three separate pieces of guidance published by the same repository and the same specification.",
        ],
      },
      {
        label: "skill-creator",
        cells: [
          "486 lines and the only folder in the repository using both directory names the specification recommends, references and assets, alongside scripts, an agents folder for subagent instructions, and an eval viewer.",
          "The skill that writes skills. It states the three-level loading model, the 500-line rule, and the domain-organisation layout, so it doubles as the repository's own opinion on how the other eighteen should be built.",
        ],
      },
    ],
    notes: [
      "These eight are a selection, not the repository. The other twelve folders are academy-guide, algorithmic-art, canvas-design, discernment-nudge, doc-coauthoring, docx, frontend-design, mcp-builder, pptx, slack-gif-creator, theme-factory and web-artifacts-builder. Several of them repeat a pattern already covered here: pptx and docx share the shape of xlsx, and canvas-design bundles fonts the way theme-factory bundles themes.",
      "There is no ranking implied by the order. A 74-line skill with no bundled files is not a worse skill than a 557-line one, and in the repository the smallest files are the ones whose intent is easiest to read in a single pass.",
      "One honest caveat about copying: license terms differ per folder in this repository, and two folders declare nothing at all. Check the license file next to the SKILL.md you are borrowing from before the pattern turns into a paste.",
    ],
    link: {
      lead: "For the full inventory of what Anthropic publishes, including the sets that never appear in this repository, see",
      label: "Anthropic skills: the first-party catalog",
      href: anthropicSkillsPath,
      trail: ", which covers where each set loads and how it is licensed.",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "anthropic-template",
      "internal-comms-skill",
      "webapp-testing-skill",
      "pdf-skill",
      "xlsx-skill",
      "claude-api-skill",
      "skill-creator-skill",
      "brand-guidelines-skill",
    ],
  },
  frontmatter: {
    title: "What the nineteen examples actually declare",
    intro:
      "The specification defines six frontmatter fields. Reading all nineteen SKILL.md files in the repository, exactly three of them are ever used. This is the cheapest calibration a first-time author can get: the field table is a menu, not a checklist.",
    columns: [
      "Field",
      "What the specification says",
      "What the nineteen examples do",
    ],
    rows: [
      {
        label: "name",
        cells: [
          "Required. Up to 64 characters, lowercase letters, numbers and hyphens only, no leading, trailing or consecutive hyphens, and it must match the parent directory name.",
          "Declared by all nineteen, and all nineteen match their own folder. The Claude Code documentation describes every frontmatter field as optional and only recommends the description, so the examples satisfy the stricter of the two readings.",
        ],
      },
      {
        label: "description",
        cells: [
          "Required. Up to 1,024 characters, non-empty, describing what the skill does and when to use it.",
          "Declared by all nineteen. The shortest is 204 characters, shared by frontend-design and webapp-testing. The longest is claude-api at 1,068, which is 44 characters past the documented maximum.",
        ],
      },
      {
        label: "license",
        cells: [
          "Optional. A license name or a reference to a bundled license file, kept short.",
          "Declared by seventeen. Thirteen say Complete terms in LICENSE.txt and four say Proprietary. LICENSE.txt has complete terms, which is the exact string the specification uses as its own example. None declares an SPDX identifier, even though the specification also shows Apache-2.0 in a sample.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "Optional, up to 500 characters, for environment requirements such as the intended product, required system packages, or network access.",
          "Used by none of the nineteen. That includes webapp-testing, which needs Playwright, the four document skills, which need a Python toolchain, and canvas-design, which ships its own fonts.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "Optional. An arbitrary map of string keys to string values, for anything a client wants to record that the specification does not define.",
          "Used by none of the nineteen. There is no version field anywhere in the nineteen files. The repository keeps its packaging metadata in .claude-plugin/marketplace.json instead, outside the skills.",
        ],
      },
      {
        label: "allowed-tools",
        cells: [
          "Optional and marked experimental. A space-separated string of tools that are pre-approved to run.",
          "Used by none of the nineteen, including the eight that bundle scripts and ask the agent to execute them. The Claude Code documentation presents this field as the way a bundled script runs without a permission prompt.",
        ],
      },
    ],
    notes: [
      "Three fields carry the whole repository: name, description, and license. If you are copying an example and wondering which of the six optional-looking fields you are missing, the answer these files give is none of them.",
      "The absent fields are absent for different reasons. compatibility and metadata are recent optional additions with no client behaviour attached to them in these files. allowed-tools is different: it is the field with the security weight, it is the one Claude Code documents for running bundled scripts unprompted, and its absence here means every script in these skills goes through the normal permission flow.",
      "One consequence worth stating for anyone borrowing a file: because none of the nineteen declares a version or a review date inside the file, a copy you make today carries no marker of which revision it came from. That is a gap the examples leave for you to fill.",
    ],
    link: {
      lead: "The field constraints, the two documented readings of the name field, and the validation step are worked through in",
      label: "how to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ", which is the companion to this page.",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "agentskills-spec",
      "claude-code-skills-docs",
      "anthropic-marketplace",
    ],
  },
  descriptions: {
    title: "The description is the part worth copying most carefully",
    intro:
      "Every other part of a skill runs after the agent has decided to load it. The description is the part that makes that decision, and it is the field where the nineteen examples vary the most. Lengths below are the exact character counts of the description as parsed from each file.",
    columns: ["Example", "Length", "What the shape is doing"],
    rows: [
      {
        label: "webapp-testing",
        cells: [
          "204 characters",
          "Capability only. It names Playwright and lists four things it supports, with no use-when clause at all. The shortest description in the repository, tied with frontend-design, and the one that leans hardest on the skill name to do the triggering.",
        ],
      },
      {
        label: "brand-guidelines",
        cells: [
          "236 characters",
          "One sentence of capability, then one sentence that starts with Use it when and names three situations. This is the smallest shape that carries both halves the specification asks for, and it is a good template for a first skill.",
        ],
      },
      {
        label: "docx",
        cells: [
          "835 characters",
          "Trigger keywords first, including file extensions and the words a user would actually type, then a closing sentence naming what must not fire it: PDFs, spreadsheets, Google Docs, and general coding tasks.",
        ],
      },
      {
        label: "xlsx",
        cells: [
          "948 characters",
          "The same shape with a longer stop list: a Word document, an HTML report, a standalone Python script, a database pipeline, or a Google Sheets API integration, even when tabular data is involved. It also states the deliverable rule explicitly.",
        ],
      },
      {
        label: "discernment-nudge",
        cells: [
          "984 characters",
          "A behavioural skill, so the description carries the entire activation contract: what kind of reply triggers it, a once-per-conversation limit, and seven cases to skip. The body then explains the boundaries rather than restating them.",
        ],
      },
      {
        label: "academy-guide",
        cells: [
          "993 characters",
          "Also behavioural, and the only description in the repository that tells the agent how to compose with other skills rather than how to win against them. It also closes with an instruction never to invent the content it recommends.",
        ],
      },
      {
        label: "claude-api",
        cells: [
          "1,068 characters",
          "Three labelled parts in one field: a reference line, a TRIGGER block listing the shapes of prompt that should load it, and a SKIP block that overrides every trigger. Also 44 characters past the specification maximum.",
        ],
      },
    ],
    notes: [
      "The two voices in these files do not agree, and that is not an accident of this repository. The Claude Code documentation writes descriptions in the third person, describing the skill; the agentskills.io guidance recommends telling the agent when to use it. The examples above use both, sometimes inside the same field, which is a reasonable reading: state the capability, then state the trigger.",
      "Length is not free. Claude Code loads a listing of every skill name and description into context, caps each entry's combined text at 1,536 characters, and sizes the whole listing at one percent of the model's context window by default. When the listing overflows it drops descriptions, starting with the skills you invoke least. A 1,068-character description that is never truncated on your machine can be truncated on a teammate's.",
      "The single most transferable move on this table is the closing negative clause in docx and xlsx. It costs one sentence, it is the part a first draft always omits, and it is what stops a spreadsheet skill from firing on a request for a report.",
    ],
    link: {
      lead: "For the two documented voices, the truncation maths, and how to test whether a description triggers, see",
      label: "how to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ", which covers the description field in full.",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "xlsx-skill",
      "claude-api-skill",
      "claude-code-skills-docs",
      "agentskills-spec",
      "agentskills-descriptions",
    ],
  },
  layout: {
    title: "What the folders next to SKILL.md are actually called",
    intro:
      "The specification recommends three directory names and then says a skill may contain any files and directories at all. The examples take the second half of that sentence seriously: twenty distinct subdirectory names appear across the nineteen folders, and the three recommended names account for ten uses between them.",
    columns: [
      "Directory",
      "What the specification recommends it for",
      "Which of the nineteen use it",
    ],
    rows: [
      {
        label: "scripts",
        cells: [
          "Executable code the agent runs, self-contained or with documented dependencies, with helpful error messages.",
          "Eight: docx, mcp-builder, pdf, pptx, skill-creator, web-artifacts-builder, webapp-testing and xlsx. A ninth, slack-gif-creator, ships four Python modules in a folder it calls core instead. This is still the one recommended name the repository uses with any consistency.",
        ],
      },
      {
        label: "references",
        cells: [
          "Documentation the agent reads on demand, kept focused so a load costs little context.",
          "One: skill-creator. mcp-builder uses the singular reference instead, and pdf keeps its two reference documents beside SKILL.md with no folder at all.",
        ],
      },
      {
        label: "assets",
        cells: [
          "Static resources used in the output, such as templates, images, and data files.",
          "One: skill-creator. algorithmic-art calls the same idea templates, theme-factory calls it themes and also drops a showcase PDF beside its SKILL.md, and canvas-design calls it canvas-fonts and fills it with 54 font files and 27 license files.",
        ],
      },
      {
        label: "examples",
        cells: [
          "Not a name the specification uses.",
          "Two, for two different purposes. internal-comms puts its actual instructions there, so the folder is load-bearing. webapp-testing puts runnable sample scripts there, so it is closer to documentation.",
        ],
      },
      {
        label: "Language folders",
        cells: [
          "Not a name the specification uses, though it allows any additional directories and shows a domain-organised layout as a pattern.",
          "One: claude-api, with csharp, curl, go, java, php, python, ruby, shared and typescript beside its SKILL.md, plus a per-language managed-agents folder inside several of them.",
        ],
      },
      {
        label: "No subdirectory",
        cells: [
          "Nothing beyond SKILL.md is required.",
          "Five: academy-guide, brand-guidelines, discernment-nudge, doc-coauthoring and frontend-design. Four of them still ship a license file beside the SKILL.md; doc-coauthoring ships nothing else at all.",
        ],
      },
    ],
    notes: [
      "The lesson is not that the conventions are wrong. It is that they are conventions, and an agent finds a bundled file because the SKILL.md tells it where to look, not because the folder has a blessed name. The specification says as much when it calls these recommendations for organizing common types of content.",
      "Inside one team the calculation is different. Nineteen folders with twenty directory names is fine for a demonstration repository and expensive in a repository your teammates have to read. Picking one layout and holding it is worth more than matching the specification exactly.",
      "One layout detail from skill-creator is worth stealing directly: it keeps an agents folder holding instructions for the subagents it spawns, separate from references, which it reserves for material the main skill reads. Splitting reference material by who reads it is a cleaner rule than splitting it by topic.",
    ],
    link: {
      lead: "For how a bundled file travels between clients, and which of them read the same directory on disk, see",
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      trail: ", which covers the portability question this layout raises.",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "agentskills-spec",
      "skill-creator-skill",
      "internal-comms-skill",
      "claude-api-skill",
    ],
  },
  excerpts: {
    title: "Five excerpts, quoted as published",
    intro:
      "Each block below is copied verbatim from the file named above it, on the date at the top of this page. Nothing is tidied, including one typo. The permalink points at the file on GitHub so you can check the quote against the source and read what surrounds it.",
    entries: [
      {
        title: "The whole official template, unedited",
        file: "template/SKILL.md in anthropics/skills, 140 bytes and five lines",
        permalink: `${skillsRepoBlob}/template/SKILL.md`,
        template: "---\nname: template-skill\ndescription: Replace with description of the skill and when Claude should use it.\n---\n\n# Insert instructions below",
        takeaway: "Two frontmatter fields and a heading. The repository README describes the same shape in prose and states that the frontmatter requires only two fields, name and description. If a skill you are reading is longer than this, everything past this point was a choice somebody made.",
      },
      {
        title: "internal-comms: a body that is a routing table",
        file: "skills/internal-comms/SKILL.md, the shortest of the nineteen at 1,511 bytes",
        permalink: `${skillsRepoBlob}/skills/internal-comms/SKILL.md`,
        template: "## How to use this skill\n\nTo write any internal communication:\n\n1. **Identify the communication type** from the request\n2. **Load the appropriate guideline file** from the `examples/` directory:\n    - `examples/3p-updates.md` - For Progress/Plans/Problems team updates\n    - `examples/company-newsletter.md` - For company-wide newsletters\n    - `examples/faq-answers.md` - For answering frequently asked questions\n    - `examples/general-comms.md` - For anything else that doesn't explicitly match one of the above\n3. **Follow the specific instructions** in that file for formatting, tone, and content gathering",
        takeaway: "This is the whole procedure. The skill never states the house format for a status report; it states which file holds it and when to open that file. The four files in the examples folder carry the content, so a session that writes a newsletter never loads the incident report guidance.",
      },
      {
        title: "webapp-testing: the instruction that keeps a script out of context",
        file: "skills/webapp-testing/SKILL.md, in the opening section",
        permalink: `${skillsRepoBlob}/skills/webapp-testing/SKILL.md`,
        template: "**Helper Scripts Available**:\n- `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)\n\n**Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is abslutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.",
        takeaway: "The rule is that a bundled script is an interface, not reading material, and the help flag is how the agent learns the interface. The typo in the fourth sentence is in the published file and is left here as read, which is a fair reminder that these are demonstration files rather than polished artifacts.",
      },
      {
        title: "xlsx: the sentence that stops the wrong trigger",
        file: "skills/xlsx/SKILL.md, the closing clause of a 948-character description",
        permalink: `${skillsRepoBlob}/skills/xlsx/SKILL.md`,
        template: "The deliverable must be a spreadsheet file. Do NOT trigger when the primary deliverable is a Word document, HTML report, standalone Python script, database pipeline, or Google Sheets API integration, even if tabular data is involved.",
        takeaway: "Everything before this clause tells the agent when to load the skill. This clause tells it when not to, by naming five adjacent deliverables a spreadsheet request is most often confused with. The agentskills.io guidance recommends exactly this move when a description fires too often.",
      },
      {
        title: "brand-guidelines: frontmatter with nothing optional in it",
        file: "skills/brand-guidelines/SKILL.md, the first seven lines",
        permalink: `${skillsRepoBlob}/skills/brand-guidelines/SKILL.md`,
        template: "---\nname: brand-guidelines\ndescription: Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.\nlicense: Complete terms in LICENSE.txt\n---\n\n# Anthropic Brand Styling",
        takeaway: "Three fields, and the license field is a sentence pointing at a bundled file rather than an SPDX identifier. The description is 236 characters: one sentence of capability, one sentence of trigger. Seventeen of the nineteen files in this repository open with a version of these three lines.",
      },
    ],
    link: {
      lead: "If none of these shapes fits the job you have in mind, the register of skills other people already published is at",
      label: "the best Claude skills",
      href: bestClaudeSkillsPath,
      trail: ", where each entry was opened and read before it was listed.",
    },
    sourceIds: [
      "anthropic-template",
      "internal-comms-skill",
      "webapp-testing-skill",
      "xlsx-skill",
      "brand-guidelines-skill",
      "agentskills-descriptions",
    ],
  },
  divergence: {
    title: "Six places the examples and the published guidance disagree",
    intro:
      "This is the section that makes reading examples worth more than reading rules. Each row states a piece of published guidance, where it is published, and what the files in anthropics/skills actually do. Five of the six are harmless. One of them can break at runtime.",
    columns: ["The guidance", "Where it is published", "What the examples do"],
    rows: [
      {
        label: "Keep SKILL.md under 500 lines",
        cells: [
          "Stated three times over: in the Agent Skills specification, in the Claude Code documentation, and inside skill-creator, the repository's own skill for writing skills.",
          "Seventeen of the nineteen are under 500 lines. claude-api is 557. skill-creator itself is 486, which is close enough to its own limit to be worth noticing.",
        ],
      },
      {
        label: "The description is capped at 1,024 characters",
        cells: [
          "The specification frontmatter table, restated as a hard limit in the agentskills.io guidance on optimizing descriptions.",
          "claude-api declares 1,068 characters, 44 over. Nothing in the repository flags it, and no validator output is published beside the file.",
        ],
      },
      {
        label: "Keep file references one level deep",
        cells: [
          "The specification, under file references, which also says to avoid deeply nested reference chains.",
          "claude-api sends the agent to python/claude-api/sdk-upgrade.md, two levels down, and repeats the shape across nine other language folders.",
        ],
      },
      {
        label: "Reference supporting files so the agent knows what each one holds",
        cells: [
          "The Claude Code documentation, which shows the pattern with relative links from SKILL.md.",
          "skills/pdf/SKILL.md names REFERENCE.md and FORMS.md four times each, in capitals. The files in that folder are reference.md and forms.md, in lower case. On a case-sensitive filesystem those paths do not resolve.",
        ],
      },
      {
        label: "Use scripts, references and assets for bundled files",
        cells: [
          "The specification's optional directories section, echoed by the layout diagram inside skill-creator.",
          "Eight folders use scripts, one uses references, one uses assets. Twenty distinct subdirectory names appear in total, and five folders bundle no directory at all.",
        ],
      },
      {
        label: "name is required and must match the parent directory",
        cells: [
          "The specification. The Claude Code documentation says the opposite about the requirement, describing every frontmatter field as optional with only the description recommended.",
          "All nineteen declare a name and all nineteen match their folder, so the examples satisfy the stricter reading even on a client that would not enforce it. Copying that habit costs nothing and removes a portability question.",
        ],
      },
    ],
    notes: [
      "Only the fourth row can bite you. Everything else on this table is a style deviation in a repository that describes itself as demonstration material. The capitalised reference paths in the pdf skill are a real mismatch between what the instructions say and what is on disk, and nothing in that SKILL.md, its two reference files, or the repository README mentions it.",
      "The wider lesson is about how to read any example, including the ones on this page. A skill that ships and works is evidence that a pattern is viable, not evidence that it is compliant. If you need compliance, the specification points at a reference validator, and the guide linked below covers running it.",
      "It also means a wholesale copy inherits the deviations. If you fork claude-api as a starting point you inherit a 1,068-character description and a two-level reference chain, and neither will announce itself.",
    ],
    link: {
      lead: "The two readings of the name field, the frontmatter fields each surface accepts, and the validation step are worked through in",
      label: "how to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ", which documents the same disagreement from the rules side.",
    },
    sourceIds: [
      "agentskills-spec",
      "agentskills-descriptions",
      "claude-code-skills-docs",
      "skill-creator-skill",
      "claude-api-skill",
      "pdf-skill",
      "anthropic-skills-repo",
    ],
  },
  starter: {
    title: "A starter file assembled from the patterns above",
    intro:
      "Nothing here is invented. The frontmatter is the shape seventeen of the nineteen files use, the description follows the capability-then-trigger-then-stop-list shape from brand-guidelines and xlsx, the body is short the way internal-comms is short, the script line follows the black-box rule from webapp-testing, and the reference pointer is the one-level-deep form the specification asks for.",
    steps: [
      {
        title: "Start from the template, not from a blank file",
        body:
          "Copy the five lines in template/SKILL.md into a new folder and fill them in. Every additional structure on this page is something you add when the file asks for it, not something you begin with.",
      },
      {
        title: "Name the folder first, then match the frontmatter to it",
        body:
          "The specification wants the name field to equal the parent directory name, and all nineteen examples honour that even though one documented client does not require it. Deciding the folder name first makes the rule free.",
      },
      {
        title: "Write the description as a trigger, then add the stop list",
        body:
          "State the capability, state when to use it, then name the adjacent tasks that must not fire it. docx and xlsx both end that way, and the published guidance on descriptions recommends adding specificity about what a skill does not do when it triggers too broadly.",
      },
      {
        title: "Write the body for the path you actually take",
        body:
          "brand-guidelines is 74 lines because the task is a lookup. internal-comms is 33 lines because the task is a routing decision. Neither pads the file to look thorough, and both are easier to keep true than a long one.",
      },
      {
        title: "Move anything long one level down and say when to read it",
        body:
          "Name the file and the condition, the way internal-comms names four files and the situation each one covers. A pointer with no condition attached costs the same context as no pointer at all.",
      },
      {
        title: "Bundle a script only for work that should be deterministic",
        body:
          "The published guidance is to avoid interactive prompts, document the interface behind a help flag, write errors that tell the agent what to try next, and prefer structured output. webapp-testing goes one step further and tells the agent not to read the source.",
      },
      {
        title: "Record where each borrowed piece came from",
        body:
          "License terms in the example repository differ per folder and two folders declare nothing, so a pattern you lift is worth a line of attribution in your own file. It also tells the next reader which upstream file to check when it changes.",
      },
    ],
    template: [
      "---",
      "name: release-notes",
      "description: Writes the release notes for this repository from merged pull requests, in the house format. Use when the user asks for release notes, a changelog entry, or a summary of what shipped since the last tag. Do NOT use for commit messages, for pull request descriptions, or for customer emails.",
      "license: Complete terms in LICENSE.txt",
      "---",
      "",
      "# Release notes",
      "",
      "## When this applies",
      "",
      "Tagged releases of this repository only. For anything else, stop and ask.",
      "",
      "## Steps",
      "",
      "1. Collect the pull requests merged since the previous tag.",
      "2. Group them under Added, Changed, and Fixed, in that order.",
      "3. Write one line per entry, past tense, no ticket numbers.",
      "4. Run `scripts/check_format.py notes.md` with the `--help` flag first, then against the draft, and fix what it reports.",
      "",
      "## Reference",
      "",
      "For the full house format, including the sections we drop when a release is patch only, read `references/format.md`.",
    ].join("\n"),
    sourceIds: [
      "anthropic-template",
      "agentskills-spec",
      "agentskills-scripts",
      "agentskills-descriptions",
      "internal-comms-skill",
      "webapp-testing-skill",
    ],
  },
  team: {
    title: "When the examples stop being examples",
    intro:
      "Reading files is a solo activity. The moment a second person on your team writes one, the question changes from what does a good SKILL.md look like to which one of ours is the one we use, and none of the examples above answers that.",
    body: [
      "The failure is quiet and familiar. One person reads anthropics/skills, adapts the internal-comms routing pattern, and lands a genuinely good skill in a repository. Three weeks later a teammate writes a second version of it in their own dotfiles because nobody knew the first one existed. Both work. Neither is the one.",
      "Skills Board is a web application where a team keeps and shares the AI skills it recommends. A teammate opens it, sees which skill the team stands behind for a job, and takes it away as an install command for the agent they actually run, or as the original source, or as a ZIP of the latest files. The point is the recommendation, not the storage.",
      "The honest boundary: saving a skill is a team recommendation, not a security review and not a compatibility certificate. Someone still has to read the SKILL.md before it lands on a machine, and the divergence table above is exactly the kind of thing that reading catches.",
    ],
    paths: [
      {
        label: "Copy the pattern, not the folder",
        body:
          "Most of what is useful in these examples is a shape: a routing body, a stop list in the description, a script behind a help flag. Lift the shape into your own file and you avoid inheriting an upstream deviation you did not notice.",
      },
      {
        label: "One canonical copy per job",
        body:
          "The value of a team library is that there is a single answer to which skill to use for a job. Two good skills for the same task is the problem it solves, not a nice-to-have it enables.",
      },
      {
        label: "An install command per agent",
        body:
          "Teammates run different clients, and the same SKILL.md lands in different directories on each. A shared entry that hands over the right command is cheaper than a wiki page that lists all of them.",
      },
      {
        label: "The read the examples do not give you",
        body:
          "An example repository is not reviewed for your codebase. The step a team adds is one person reading the file, saying what it is for, and putting their name on the recommendation.",
      },
    ],
    limits: [
      "Skills Board points at the latest version from the saved source and does not pin historical versions, so a skill you saved from an example repository moves when the upstream file moves.",
      "None of the nineteen example files carries a version or a review date inside it, so the date on your own entry is the only marker of when a teammate last looked at it.",
      "A shared entry does not change what a client will do with the file. Portability is decided by the agent reading it, which is a separate question from where the recommendation lives.",
    ],
    link: {
      lead: "For the workflow of picking the first skill a team agrees on, rather than the file format, see",
      label: "how to choose your first team skill",
      href: guidePaths.chooseFirstTeamSkill,
      trail: ", which starts from the job rather than from the catalog.",
    },
    sourceIds: ["anthropic-skills-repo", "anthropic-skills-readme"],
  },
  openQuestions: {
    title: "What the examples do not tell you",
    intro:
      "Four things a reader would reasonably expect from a reference collection and does not get. Stated here so this page is not read as more authoritative than its own sources.",
    entries: [
      {
        title: "No validation output is published with the files",
        body:
          "The specification points at a reference library and a validate command, and the repository ships no result of running it. The 1,068-character description in claude-api is the visible consequence: a constraint that a published run would have caught.",
      },
      {
        title: "No version or review date inside any of the nineteen",
        body:
          "The metadata field exists for exactly this and is used by none of them. A file you copy today carries no marker of which revision you took, which matters most for the skills that change often.",
      },
      {
        title: "No published context cost for any example",
        body:
          "Byte and line counts are on disk; token cost is not published for any of the nineteen. Claude Code reports a Skills row in its context command, which is a per-machine measurement rather than a property of the file.",
      },
      {
        title: "The case mismatch in the pdf skill is unacknowledged",
        body:
          "Nothing in that SKILL.md, in its two reference files, or in the repository README mentions that REFERENCE.md and FORMS.md are named in capitals while the files on disk are lower case. Whether it is a known non-issue on the platform it runs on is not stated anywhere we could read.",
      },
    ],
    sourceIds: [
      "anthropic-skills-repo",
      "agentskills-spec",
      "claude-code-skills-docs",
      "pdf-skill",
      "claude-api-skill",
    ],
  },
  faq: [
    {
      question: "Where are the official Claude skill examples?",
      answer:
        "In anthropics/skills on GitHub, the public repository Anthropic publishes for that purpose. It holds nineteen skill folders under skills, a five-line starter at template/SKILL.md, and a spec folder that is now one line pointing at agentskills.io. Its README calls the contents demonstration and educational material.",
    },
    {
      question: "What does a minimal SKILL.md example look like?",
      answer:
        "Two frontmatter fields and a heading. The official template declares a name and a description between two marker lines, then opens the body. The smallest of the nineteen real skills, internal-comms, is 33 lines: a list of the cases it covers and a rule for which bundled file to read.",
    },
    {
      question: "Do the example skills use the scripts, references and assets folders?",
      answer:
        "Only partly. Eight of the nineteen use a scripts folder, one uses references, and one uses assets. Five bundle no folder at all. Twenty distinct subdirectory names appear across the repository, including language folders, themes, canvas-fonts, and an examples folder used two different ways.",
    },
    {
      question: "Can I copy an example skill into my own repository?",
      answer:
        "Check the license file beside the SKILL.md first, because terms differ per folder. Seventeen of the nineteen declare a license field pointing at a bundled file, and two declare nothing. Copying the pattern rather than the folder also avoids inheriting deviations the upstream file carries.",
    },
    {
      question: "Which example should I read first?",
      answer:
        "internal-comms, because it is 33 lines and shows progressive disclosure working. Then webapp-testing for how to bundle a script without loading it into context, then xlsx for a description that names what must not trigger it. Skip claude-api until those three make sense.",
    },
    {
      question: "Do these examples work outside Claude?",
      answer:
        "The file format is the open Agent Skills format, so any client that reads SKILL.md can load one. What travels is the file and its bundled folder; what does not travel automatically is the on-disk location, which differs per client, and any behaviour a specific product adds on top.",
    },
    {
      question: "How does a team share the examples it settles on?",
      answer:
        "By keeping one recommendation per job somewhere teammates can find it. Skills Board is a web application where a team keeps and shares the AI skills it recommends, handing over the source, a compatible install command, or a ZIP of the latest files for whichever agent a teammate runs.",
    },
  ],
  sources: [
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills",
      href: "https://github.com/anthropics/skills",
      note: "The repository the examples come from, read through the GitHub API tree on August 22, 2026. The nineteen folders under skills, every subdirectory name, the file counts, and the frontmatter of all nineteen SKILL.md files.",
    },
    {
      id: "anthropic-skills-readme",
      label: "anthropics/skills README",
      href: `${skillsRepoBlob}/README.md`,
      note: "The disclaimer that the skills are for demonstration and educational purposes only, the two-field frontmatter description, the note that the document skills are source-available rather than open source, and the plugin install commands.",
    },
    {
      id: "anthropic-template",
      label: "The official skill template",
      href: `${skillsRepoBlob}/template/SKILL.md`,
      note: "The five-line starter file quoted in full on this page, at 140 bytes. The smallest complete example the repository publishes.",
    },
    {
      id: "anthropic-marketplace",
      label: "anthropics/skills marketplace.json",
      href: `${skillsRepoBlob}/.claude-plugin/marketplace.json`,
      note: "The packaging that groups the nineteen folders into five plugins: four document skills, twelve example skills, and claude-api, academy-guide and discernment-nudge on their own.",
    },
    {
      id: "internal-comms-skill",
      label: "skills/internal-comms/SKILL.md",
      href: `${skillsRepoBlob}/skills/internal-comms/SKILL.md`,
      note: "The shortest SKILL.md in the repository at 1,511 bytes and 33 lines, and the routing body quoted on this page. Its four guideline files live in an examples folder.",
    },
    {
      id: "webapp-testing-skill",
      label: "skills/webapp-testing/SKILL.md",
      href: `${skillsRepoBlob}/skills/webapp-testing/SKILL.md`,
      note: "The black-box script instruction quoted on this page, the decision tree, and the split between a scripts folder and an examples folder holding sample automation.",
    },
    {
      id: "pdf-skill",
      label: "skills/pdf/SKILL.md",
      href: `${skillsRepoBlob}/skills/pdf/SKILL.md`,
      note: "The 315-line body, the eight bundled scripts, and the four references each to REFERENCE.md and FORMS.md against the reference.md and forms.md that are actually in the folder.",
    },
    {
      id: "xlsx-skill",
      label: "skills/xlsx/SKILL.md",
      href: `${skillsRepoBlob}/skills/xlsx/SKILL.md`,
      note: "The 948-character description quoted in part on this page, including the closing clause that names the deliverables which must not trigger it.",
    },
    {
      id: "claude-api-skill",
      label: "skills/claude-api/SKILL.md",
      href: `${skillsRepoBlob}/skills/claude-api/SKILL.md`,
      note: "The 557-line body, the 1,068-character description with its trigger and skip blocks, and the ten language and shared folders it references, including a path two levels deep.",
    },
    {
      id: "skill-creator-skill",
      label: "skills/skill-creator/SKILL.md",
      href: `${skillsRepoBlob}/skills/skill-creator/SKILL.md`,
      note: "The repository's own skill for writing skills. The three-level progressive disclosure model, the 500-line rule, the domain-organised layout, and the only folder using both references and assets.",
    },
    {
      id: "brand-guidelines-skill",
      label: "skills/brand-guidelines/SKILL.md",
      href: `${skillsRepoBlob}/skills/brand-guidelines/SKILL.md`,
      note: "A 74-line skill with no bundled files beyond a license, and the three-line frontmatter quoted on this page. Its description is 236 characters.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The format these files are written to. The six frontmatter fields and their limits, the rule that the name matches the parent directory, the optional scripts, references and assets folders, progressive disclosure, the 500-line recommendation, and the one-level-deep reference rule.",
    },
    {
      id: "agentskills-descriptions",
      label: "Optimizing skill descriptions",
      href: "https://agentskills.io/skill-creation/optimizing-descriptions",
      note: "The imperative phrasing recommendation, the statement that the description carries the entire burden of triggering, the 1,024-character hard limit, and the advice to add specificity about what a skill does not do.",
    },
    {
      id: "agentskills-scripts",
      label: "Using scripts in skills",
      href: "https://agentskills.io/skill-creation/using-scripts",
      note: "The design rules for a bundled script: no interactive prompts, a documented help flag, error messages that shape the next attempt, structured output, and predictable output size.",
    },
    {
      id: "claude-code-skills-docs",
      label: "Claude Code: Skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "The client-side reading. Every frontmatter field described as optional with only the description recommended, the 500-line tip, the supporting-file pattern, the allowed-tools grant for running a bundled script, and the listing budget that truncates long descriptions.",
    },
  ],
  related: [
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The companion guide. The rules these examples are written to, field by field, with the validation step at the end.",
    },
    {
      label: "Anthropic skills: the first-party catalog",
      href: anthropicSkillsPath,
      description:
        "The full inventory these eight were selected from, including the sets that never appear in the repository.",
    },
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "The format underneath every example here, and which agents read it from where.",
    },
    {
      label: "The best Claude skills, and the bar we used",
      href: bestClaudeSkillsPath,
      description:
        "Skills other people published, each one opened and read before it was listed.",
    },
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The client most of these examples were written for, and what each Claude surface does with a skill.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The places a skill comes from beyond this one repository, and what each of them screens for.",
    },
    {
      label: "AGENTS.md vs SKILL.md",
      href: agentsMdVsSkillMdPath,
      description:
        "The other file that lives in a repository root, and why it is not an alternative to these.",
    },
  ],
  og: {
    eyebrow: "Skill Examples",
    title: [
      { text: "Eight real SKILL.md files," },
      { text: "and what each one teaches.", accent: true },
    ],
    description:
      "Real Agent Skills read line by line: the pattern in each file, verbatim excerpts, what nineteen examples actually declare, and where they disagree with the spec.",
    contextLabel: "skillsboard.sh/skill-examples",
    chips: ["SKILL.md", "anthropics/skills", "Progressive disclosure"],
  },
  ogAlt:
    "Explainer on skill examples: eight real SKILL.md files from anthropics/skills, the pattern each one demonstrates, and where the examples diverge from the specification.",
  publishedAt: "2026-08-22",
  modifiedAt: "2026-08-22",
}
