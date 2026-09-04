import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { skillCreatorPath } from "@/lib/seo/skill-creator/types"
import { skillExamplesPath } from "@/lib/seo/skill-examples/types"
import type { SkillDraft } from "@/lib/skill-creator/skill-md"

export {
  skillCreatorPath,
  type SkillCreatorPath,
} from "@/lib/seo/skill-creator/types"

export interface SkillCreatorSource {
  /** Stable key referenced by the sections the source supports. */
  id: string
  label: string
  href: string
  note: string
}

export interface SkillCreatorFaqEntry {
  question: string
  answer: string
}

export interface SkillCreatorRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * is the set of internal destinations this page is allowed to point at, so a
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface SkillCreatorInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof anthropicSkillsPath
    | typeof claudeSkillsPath
    | typeof skillExamplesPath
  trail: string
}

export interface SkillCreatorNote {
  title: string
  body: string
}

/** The generator itself: the copy around it and the draft it opens with. */
export interface SkillCreatorToolSection {
  title: string
  intro: string
  /** Stated on the page because it is the reason the tool has no API route. */
  privacyNote: string
  /** Prefilled so the preview shows a well formed file on first paint. */
  exampleDraft: SkillDraft
  sourceIds: readonly string[]
}

export interface SkillCreatorTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  notes: readonly string[]
  link: SkillCreatorInlineLink
  sourceIds: readonly string[]
}

export interface SkillCreatorNoteSection {
  title: string
  intro: string
  entries: readonly SkillCreatorNote[]
  notes: readonly string[]
  link: SkillCreatorInlineLink
  sourceIds: readonly string[]
}

export interface SkillCreatorDefinition {
  path: typeof skillCreatorPath
  /**
   * Not "guide" and not "article": the payload is a generator, and the prose
   * under it exists to explain what the generator produced. The value keeps
   * this page out of the resource registry, which is the collection that
   * feeds the /resources hub and the Markdown twins.
   */
  contentType: "tool"
  topics: readonly string[]
  eyebrow: string
  title: string
  seoTitle: string
  socialTitle: string
  description: string
  intro: readonly string[]
  tool: SkillCreatorToolSection
  fields: SkillCreatorTableSection
  checks: SkillCreatorNoteSection
  official: SkillCreatorNoteSection
  faq: readonly SkillCreatorFaqEntry[]
  sources: readonly SkillCreatorSource[]
  related: readonly SkillCreatorRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

/**
 * The draft the tool opens with.
 *
 * A worked example rather than an empty form: the description is the field
 * that decides whether a skill is ever loaded, and showing one that states
 * both the capability and the timing teaches more than a placeholder does.
 */
const exampleDraft: SkillDraft = {
  name: "reviewing-pull-requests",
  description:
    "Reviews a pull request against the team's engineering conventions and separates blocking problems from suggestions. Use when the user asks for a code review, opens a pull request, or asks whether a change is ready to merge.",
  license: "Apache-2.0",
  compatibility: "",
  allowedTools: "",
  metadata: [],
  body: `# Reviewing pull requests

## When this applies
The user asks for a review of a diff, a branch, or an open pull request.

## Steps
1. Read the whole diff before commenting on any part of it.
2. Sort every finding into Blocking, Worth fixing, or Optional.
3. Quote the exact line for each finding and say what to do instead.
4. Say so explicitly when a change is correct and needs nothing.

## Conventions this team holds
- Database access goes through the repository layer, never inline SQL.
- A new public function ships with its test in the same commit.
- Generated files are read for intent rather than line by line.

## Output
A Markdown review with the three sections above, in that order.`,
}

export const skillCreator: SkillCreatorDefinition = {
  path: skillCreatorPath,
  contentType: "tool",
  topics: ["skill md", "agent skills", "authoring", "frontmatter", "free tool"],
  eyebrow: "Free tool",
  title: "Claude skill creator: build a valid SKILL.md in the browser",
  seoTitle: "Claude Skill Creator: Generate a Valid SKILL.md | Skills Board",
  socialTitle: "Generate a valid SKILL.md in the browser",
  description:
    "A free browser tool that writes a SKILL.md from the six Agent Skills frontmatter fields, checks the name and the description against the published limits as you type, and downloads the skill folder. Nothing is uploaded. Checked against the specification and Anthropic documentation on 25 August 2026.",
  intro: [
    "A skill is a directory with one Markdown file in it, and the file opens with YAML frontmatter. Getting that frontmatter wrong is the common failure: a name that does not match its directory fails validation, malformed YAML loads the body with empty metadata so the skill never triggers on its own, and a field that Claude Code accepts is rejected outright the first time the same folder is uploaded or packaged.",
    "This page writes the file for you and checks it while you type. It runs entirely in the browser, calls no model, and emits only the six frontmatter fields the Agent Skills specification defines, which is the set every documented distribution path accepts.",
  ],
  tool: {
    title: "Write the file",
    intro:
      "Fill in the two required fields and the body. The preview on the right is the file you will download, byte for byte, and the checks under it are the constraints the specification and Anthropic's authoring guidance state.",
    privacyNote:
      "The generator is a script in this page. Your draft is not posted to a server, saved to an account, or read by anything else, and reloading the page clears it.",
    exampleDraft,
    sourceIds: ["agentskills-spec", "anthropic-best-practices"],
  },
  fields: {
    title: "What makes a SKILL.md valid",
    intro:
      "Six fields, two of them required. The specification states each limit below; the last column is why the field changes what an agent does with your skill.",
    columns: ["Field", "Required", "What the specification allows", "Why it matters"],
    rows: [
      {
        label: "name",
        cells: [
          "Yes",
          "1 to 64 characters. Lowercase letters, numbers, and hyphens only, no leading, trailing, or consecutive hyphen. Must match the parent directory name.",
          "It is half of the metadata an agent holds for every installed skill, and the string a validator compares against the folder. A mismatch passes locally in Claude Code and fails on upload.",
        ],
      },
      {
        label: "description",
        cells: [
          "Yes",
          "1 to 1024 characters, non-empty. Should state what the skill does and when to use it.",
          "The field with the highest leverage in the file. An agent loads names and descriptions at startup and reads the body only after it has decided this skill is relevant, so a description written as a title ends the decision before your instructions are seen.",
        ],
      },
      {
        label: "license",
        cells: [
          "No",
          "A license name, or the name of a license file bundled with the skill. The specification recommends keeping it short.",
          "It travels with the folder. Claude Code accepts the field and does not act on it, so the value matters to the people reading the skill rather than to the agent running it.",
        ],
      },
      {
        label: "compatibility",
        cells: [
          "No",
          "Up to 500 characters, for environment requirements such as the intended product, required system packages, or network access.",
          "The specification notes that most skills do not need it. Set it when the skill would fail silently somewhere, for example when it shells out to a binary that is not everywhere.",
        ],
      },
      {
        label: "metadata",
        cells: [
          "No",
          "A map from string keys to string values, for properties the format does not define. The specification recommends unique key names to avoid collisions.",
          "Your own tooling reads it. Claude Code accepts it, does not act on its contents, and drops a value that is not a map.",
        ],
      },
      {
        label: "allowed-tools",
        cells: [
          "No",
          "A space-separated string of pre-approved tools. The only field the specification marks experimental.",
          "Support varies between agents. In Claude Code it grants those tools without a permission prompt for the turn that invoked the skill, then clears on your next message.",
        ],
      },
    ],
    notes: [
      "Claude Code accepts those six and adds fourteen fields of its own, among them when_to_use, disable-model-invocation, user-invocable, context, and paths. Those work only inside Claude Code: a claude.ai upload, a Skills API call, or a packaging run with package_skill.py fails with an unexpected-key error that lists the six allowed properties by name.",
      "That is why the generator above writes six fields and no more. If you need a Claude Code field, add it by hand after downloading, and treat the folder as one that stays inside Claude Code from then on.",
    ],
    link: {
      lead: "For the authoring decisions behind the fields, including the body budget and how to test whether a skill fires, read",
      label: "how to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      trail: ".",
    },
    sourceIds: ["agentskills-spec", "claude-code-skills"],
  },
  checks: {
    title: "What this tool checks, and what it cannot",
    intro:
      "The checks are worth exactly what they cover. Stating the boundary is more useful than implying the file is certified because a form went green.",
    entries: [
      {
        title: "It checks the frontmatter, not the skill",
        body: "The name rules, the two character limits, the shape of the metadata map, and the YAML quoting are all mechanical, so they can be checked while you type. Whether the instructions are any good is not, and nothing on this page claims to know.",
      },
      {
        title: "It cannot tell you whether the skill will trigger",
        body: "Triggering is measured rather than inspected. The published method is a set of around twenty realistic prompts, half that should fire the skill and half near-misses that share its vocabulary, run several times, with part of the set held back so the description is tuned rather than memorized. This page can warn that a description never says when to use the skill. It cannot tell you how often it fires.",
      },
      {
        title: "It is not the reference validator",
        body: "The specification points at one validator, the skills-ref library, and that project states in its own README that it is for demonstration purposes and not meant for production use. There is no official validator that certifies a skill. Running skills-ref validate on the downloaded folder is still worth doing, and it checks the same frontmatter rules this page does.",
      },
      {
        title: "It quotes YAML only when it has to",
        body: "A description with a colon and a space in it, or one that reads as a number or as the word no, is written as a double-quoted scalar so it parses back as the string you typed. Everything else is left plain, the way the published examples write it. This matters because malformed frontmatter does not error loudly: the body loads with empty metadata and the skill quietly stops triggering on its own.",
      },
      {
        title: "Nothing leaves the browser",
        body: "There is no API route behind this page and no model call. The draft lives in the tab until you close it.",
      },
    ],
    notes: [],
    link: {
      lead: "For eight real SKILL.md files read line by line, including where the published examples diverge from the specification, see",
      label: "skill examples",
      href: skillExamplesPath,
      trail: ".",
    },
    sourceIds: ["agentskills-spec", "skills-ref", "anthropic-skill-creator"],
  },
  official: {
    title: "Anthropic ships a skill creator of its own",
    intro:
      "The term belongs to a skill before it belongs to any website. anthropics/skills publishes skill-creator, and it does things a static page cannot. Here is what it actually does, read from its own SKILL.md, so you can tell which of the two you want.",
    entries: [
      {
        title: "It interviews you first",
        body: "The skill opens by capturing intent: what the skill should let Claude do, which user phrases should trigger it, the expected output format, and whether test cases make sense for this kind of skill. It is told to pull answers out of the conversation you already had, when the request is to turn that work into a skill.",
      },
      {
        title: "It runs the draft against test prompts",
        body: "For each test case it launches two runs in the same turn, one with the skill and one without, saves the outputs, grades them against assertions, and aggregates pass rate, time, and token counts into a benchmark. You review the outputs and the numbers in a viewer it generates, and your written feedback goes back into the next revision.",
      },
      {
        title: "It optimizes the description as a measured loop",
        body: "A separate script builds twenty trigger queries split between should-trigger and deliberate near-misses, splits them into a training set and a held-out test set, runs each query several times to get a trigger rate, proposes new descriptions, and picks the winner by the held-out score rather than the training score.",
      },
      {
        title: "It packages the folder",
        body: "A packaging script turns the directory into an installable file, and that path accepts only the six specification fields, which is the rule the unexpected-key error enforces.",
      },
      {
        title: "It needs a Claude session to do any of that",
        body: "It is a skill, so it runs inside Claude Code, claude.ai, or Cowork, and its own file records which parts are unavailable in each: no subagents on claude.ai means no baseline runs and no benchmark, and the description optimizer needs the Claude Code command line.",
      },
    ],
    notes: [
      "The two are not competing. Use this page when you know what the skill should say and want a correct file in the time it takes to type a description, or when you are writing the tenth skill of a set and already know its shape. Use Anthropic's skill when you want the interview, the baseline comparison, and the triggering numbers, and you have a session to spend on them.",
    ],
    link: {
      lead: "For what Anthropic publishes in total, across the pre-built document skills, the folders in anthropics/skills, and the ones bundled with Claude Code, see",
      label: "Anthropic skills: the first-party catalog",
      href: anthropicSkillsPath,
      trail: ".",
    },
    sourceIds: ["anthropic-skill-creator", "claude-code-skills"],
  },
  faq: [
    {
      question: "What is the skill creator skill?",
      answer:
        "skill-creator is a skill Anthropic publishes in the anthropics/skills repository. Loading it turns a Claude session into an authoring workflow: it asks what the skill should do and when it should trigger, writes a draft, runs test prompts with the skill and without it, grades the outputs, and can run a loop that tunes the description for triggering. Because it is a skill rather than a website, it runs wherever Claude reads skills, and it needs a session each time.",
    },
    {
      question: "Is this the same as the Claude skills creator from Anthropic?",
      answer:
        "No. Two different things with similar names. Anthropic's skill-creator is interactive and runs inside Claude, and its value is the interview and the evaluation loop. The tool on this page is a generator: it writes the frontmatter, checks it against the published limits while you type, and hands you the folder. It never calls a model, so it costs nothing and answers instantly, and it cannot do the parts that need a running agent.",
    },
    {
      question: "Does this write the instructions for me?",
      answer:
        "No, and that is on purpose. It scaffolds the structure and validates the fields that decide whether the skill loads. The body has to come from a task you have already completed. Anthropic's own authoring guidance is direct about it: a skill generated from general knowledge produces vague procedure such as handle errors appropriately rather than the API patterns, edge cases, and project conventions that make a skill worth loading at all.",
    },
    {
      question: "Will the generated SKILL.md work outside Claude Code?",
      answer:
        "Yes. The generator writes only the six frontmatter fields the Agent Skills specification defines, which is exactly the set claude.ai uploads, the Skills API, and packaging with package_skill.py accept. Any other key fails those three paths with an unexpected-key error naming allowed-tools, compatibility, description, license, metadata, and name. Claude Code accepts all six as well, so the same folder loads there without changes.",
    },
    {
      question: "What should the description actually say?",
      answer:
        "Both what the skill does and when to use it, in the words a person would type. The two primary sources disagree on voice: Anthropic's best practices require third person and name second person as an anti-pattern, while the specification site recommends imperative phrasing such as use this skill when. The published examples reconcile them by stating the capability in third person and then adding a Use when clause, which is the shape the example in the tool follows.",
    },
    {
      question: "Where does the downloaded folder go?",
      answer:
        "The download gives you the directory the specification requires, with SKILL.md inside it and the directory name matching the name field. Where that directory goes depends on the agent, and each one documents its own locations. The install guide lists the documented paths for Claude Code, from personal and project skills to plugin and managed ones, and how to confirm a skill actually loaded.",
    },
    {
      question: "Is my draft uploaded anywhere?",
      answer:
        "No. The generator is a script that runs in this page, there is no API route behind it, and no model is called. The draft is not posted to a server, stored in an account, or used for anything else, and reloading the page clears it.",
    },
    {
      question: "How does my team keep the skill after I write it?",
      answer:
        "Commit the folder to a repository first, then save it to your team's library on Skills Board. Skills Board is the web app where a team keeps and shares its AI skills: the saved entry records the repository and path it came from, and a teammate can open the source, copy a compatible install command, or download the latest files as a ZIP. An MCP-compatible agent can search the same library. It is free, MIT licensed, and it does not write or edit SKILL.md for you.",
    },
  ],
  sources: [
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The directory layout, the six frontmatter fields with their required status and limits, the full name constraints including the match with the parent directory and the ban on consecutive hyphens, the 1024-character description cap, the 500-character compatibility cap, the experimental marking on allowed-tools, the progressive disclosure tiers, and the skills-ref validate command. Checked 25 August 2026.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "The twenty frontmatter fields Claude Code accepts, the fourteen it adds on top of the specification, the table restricting claude.ai uploads, the Skills API, and package_skill.py packaging to the six specification fields, and the verbatim unexpected-key error those paths raise. Checked 25 August 2026.",
    },
    {
      id: "anthropic-skill-creator",
      label: "anthropics/skills: the skill-creator skill",
      href: "https://github.com/anthropics/skills/tree/main/skills/skill-creator",
      note: "Read from its own SKILL.md: the intent capture questions, the paired with-skill and baseline runs, the grading and benchmark aggregation, the generated review viewer, the twenty-query trigger eval set with its train and held-out test split, the packaging script, and the per-surface notes on what is unavailable in claude.ai and Cowork. Checked 25 August 2026.",
    },
    {
      id: "anthropic-best-practices",
      label: "Anthropic: skill authoring best practices",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices",
      note: "The third-person rule for descriptions and the second-person anti-pattern, gerund naming, the reserved words anthropic and claude in a name, the statement that neither name nor description may contain XML tags, the 500-line body guidance, and the instruction to build evaluations before writing more documentation. Checked 25 August 2026.",
    },
    {
      id: "skills-ref",
      label: "skills-ref reference library",
      href: "https://github.com/agentskills/agentskills/tree/main/skills-ref",
      note: "The validate command the specification points at, and the project's own statement that the library is intended for demonstration purposes and is not meant to be used in production. Checked 25 August 2026.",
    },
  ],
  related: [
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The authoring decisions the generator cannot make for you: the description that triggers, the body budget, and how to test firing and output as two separate questions.",
    },
    {
      label: "How to install Claude skills in Claude Code",
      href: guidePaths.installClaudeSkills,
      description:
        "Where the folder goes once you have it, across personal, project, plugin, and managed installs, and how to confirm the skill loaded.",
    },
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, which agents implement it, where each one looks on disk, and what travels between them.",
    },
    {
      label: "Skill examples: real SKILL.md files",
      href: skillExamplesPath,
      description:
        "Eight published skills read file by file, with what all nineteen examples declare in frontmatter and the six places they diverge from the specification.",
    },
    {
      label: "Claude skills",
      href: claudeSkillsPath,
      description:
        "What a Claude skill is, where skills run, and how to install, write, and share one.",
    },
    {
      label: "Which clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "The clients whose own documentation states they read SKILL.md, the directories each one names, and which directory reaches which client.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Free tool",
    title: [{ text: "Six fields," }, { text: "one valid file.", accent: true }],
    description:
      "Write a SKILL.md in the browser, checked against the Agent Skills specification as you type.",
    contextLabel: "skillsboard.sh/skill-creator",
    titleSize: 78,
    chips: ["name", "description"],
  },
  ogAlt:
    "Skills Board free tool: generate a valid SKILL.md file from the six Agent Skills frontmatter fields.",
  publishedAt: "2026-08-25",
  modifiedAt: "2026-08-25",
}
