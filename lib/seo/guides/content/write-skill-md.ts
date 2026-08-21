import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const writeSkillMdGuide: GuideDefinition = {
  path: guidePaths.writeSkillMd,
  contentType: "guide",
  topics: ["skill md", "agent skills", "authoring", "frontmatter"],
  relatedGuidePaths: [
    claudeSkillsPath,
    guidePaths.installClaudeSkills,
    guidePaths.chooseFirstTeamSkill,
    codexSkillsPath,
  ],
  eyebrow: "Author and validate",
  title: "How to write a SKILL.md file",
  seoTitle: "How to Write a SKILL.md File: Agent Skills Guide | Skills Board",
  description:
    "The frontmatter fields, the description that decides whether a skill fires, the body budget, and the validation step. Checked against the Agent Skills specification and Anthropic documentation on 21 August 2026.",
  intro:
    "A skill is a directory with one Markdown file in it, and the format fits on a single page. What is not obvious from the format is which parts an agent actually reads, when it reads them, and which fields survive when the same folder has to load somewhere other than the tool you wrote it in. This guide covers the frontmatter, the authoring decisions that change whether a skill ever fires, and the checks that catch a broken one. Every rule below was read from the linked documentation on 21 August 2026.",
  answer:
    "A skill is a directory containing SKILL.md. The file opens with YAML frontmatter and continues with Markdown instructions. The specification requires two fields, name and description, and allows four more: license, compatibility, metadata, and allowed-tools. The name has to match the parent directory name, stay within 64 characters, and use lowercase letters, numbers, and single hyphens. The description is capped at 1024 characters and is the text an agent matches a request against, so it carries the whole trigger. Keep the body under 500 lines and roughly 5,000 tokens, and move longer material into files the agent loads only when the task reaches them.",
  answerLink: {
    lead: "For which agents implement this format, where each one looks on disk, and what travels between them, see",
    label: "Agent Skills: the open standard",
    href: agentSkillsPath,
    trail: ".",
  },
  citations: {
    answer: ["agentskills-spec"],
    problem: ["agentskills-descriptions", "claude-code-skills"],
    decision: ["agentskills-spec", "claude-code-skills"],
    steps: {
      0: ["agentskills-best-practices"],
      1: ["agentskills-spec", "claude-code-skills", "anthropic-best-practices"],
      2: ["agentskills-descriptions", "anthropic-best-practices"],
      3: ["agentskills-best-practices", "anthropic-best-practices"],
      4: ["agentskills-spec", "anthropic-best-practices"],
      5: ["agentskills-best-practices", "anthropic-best-practices"],
      6: ["agentskills-spec", "skills-ref", "claude-code-skills"],
      7: ["agentskills-descriptions", "anthropic-best-practices"],
    },
  },
  corePrinciple:
    "The frontmatter decides whether a skill is ever loaded. The body only decides what happens after.",
  problem:
    "Most first drafts are readable, valid, and never fire. The reason is structural rather than stylistic: an agent sees only the name and description of every installed skill at startup, and reads the body only after it has already decided this skill is relevant. So a body full of careful instructions does nothing for triggering, and a description written as a title gives the agent nothing to match a request against. The second failure is quieter. Fields that work fine in Claude Code are rejected outright the first time the same folder is uploaded or packaged, because the specification allows six frontmatter fields and the products layer their own on top.",
  decisionTitle: "Which frontmatter fields travel, and which stop at Claude Code",
  decisionIntro:
    "The Agent Skills specification defines six frontmatter fields. Claude Code accepts all six and adds fourteen more of its own. The distinction matters the moment a skill leaves the machine it was written on: claude.ai uploads, the Skills API, and packaging with the package_skill.py script from anthropics/skills accept only the six specification fields, and an extra key fails the operation with an unexpected-key error instead of being ignored.",
  comparisonColumns: [
    "Field",
    "Specification status",
    "What Claude Code does with it",
    "Travels outside Claude Code",
  ],
  comparisonRows: [
    {
      label: "name",
      cells: [
        "Required. One to 64 characters, lowercase letters, numbers, and hyphens, no leading, trailing, or consecutive hyphen, and it has to match the parent directory name.",
        "Optional. In a personal or project skill it sets the display label only, and the command you type still comes from the directory name.",
        "Yes.",
      ],
    },
    {
      label: "description",
      cells: [
        "Required. Non-empty, up to 1024 characters, describing what the skill does and when to use it.",
        "Optional but recommended. When it is missing, Claude Code uses the first paragraph of the body instead.",
        "Yes.",
      ],
    },
    {
      label: "license",
      cells: [
        "Optional. A license name, or the name of a license file bundled with the skill.",
        "Accepted and not acted on.",
        "Yes.",
      ],
    },
    {
      label: "compatibility",
      cells: [
        "Optional. Up to 500 characters, for environment requirements such as the intended product, required system packages, or network access.",
        "Accepted and not acted on.",
        "Yes.",
      ],
    },
    {
      label: "metadata",
      cells: [
        "Optional. A map of string keys to string values, for properties the format does not define.",
        "Read by your own tooling. Claude Code does not act on it and drops a value that is not a map.",
        "Yes.",
      ],
    },
    {
      label: "allowed-tools",
      cells: [
        "Optional, and the only field the specification marks experimental. A space-separated string of pre-approved tools.",
        "Grants those tools without a permission prompt for the turn that invoked the skill, then clears when you send the next message.",
        "Yes.",
      ],
    },
    {
      label: "Claude Code additions",
      cells: [
        "Not defined by the specification: when_to_use, argument-hint, arguments, disable-model-invocation, user-invocable, disallowed-tools, model, effort, context, agent, background, hooks, paths, and shell.",
        "All supported, and several of them are the reason to write a skill rather than a plain instruction file.",
        "No. An upload, a Skills API call, or a packaging run fails with an unexpected-key error naming the six allowed properties.",
      ],
    },
  ],
  stepsAreSequential: true,
  stepsTitle: "Write a SKILL.md that fires, then finishes the job",
  stepsIntro:
    "The order matters. Triggering is decided before the body is ever read, so the description comes before the instructions, and the validation step comes before you hand the folder to anyone. Every constraint quoted below is cited beside the step it belongs to.",
  steps: [
    {
      title: "Start from a task you have already done, not from an idea",
      body: "The documented failure mode of skill authoring is asking a model to generate a skill from general knowledge, which produces vague procedure such as handle errors appropriately rather than the API patterns, edge cases, and project conventions that make a skill worth loading. Work through the real task with an agent first, then extract the reusable part: the sequence that worked, the corrections you made along the way, the input and output shapes, and the project facts the agent did not already have.",
      output: "A page of notes that no general-purpose model could have written for you.",
    },
    {
      title: "Name the directory, then match the frontmatter to it",
      body: "Create the folder first, because the specification requires the name field to match the parent directory name. The constraints are one to 64 characters, lowercase letters, numbers, and hyphens only, and no leading, trailing, or consecutive hyphen. Anthropic's authoring guidance adds two rules the specification does not state: prefer gerund names such as processing-pdfs over vague ones such as helper or utils, and avoid the reserved words anthropic and claude in the name. Claude Code treats the field as optional and, in a personal or project skill, uses it only as a display label, so a mismatch between file and folder passes locally and fails validation.",
      output: "One directory whose name is also the command, and a name field that agrees with it.",
    },
    {
      title: "Write the description as the trigger, not as a title",
      body: "This is the field with the highest leverage in the file. At startup an agent loads only the name and description of each installed skill, roughly a hundred tokens each, and decides from that alone whether to read the rest. Say what the skill does and when to use it, in the words a person would actually type, and include the cases where the user will not name the domain at all. Note that the two primary sources disagree on voice: Anthropic's best practices tell you to write in third person and treat you can use this to as an anti-pattern, while the specification site tells you to use imperative phrasing such as use this skill when. The descriptions Anthropic itself publishes reconcile the two by stating the capability in third person and the trigger as a Use when clause.",
      output: "A description under 1024 characters that a stranger could match to their own request.",
    },
    {
      title: "Write the body for an agent that is already competent",
      body: "Once the skill activates, the whole body enters the context window and stays there for the rest of the session, so every line is a recurring cost. Add only what the agent would get wrong without you: project conventions, non-obvious edge cases, the specific tool to use. Skip the paragraph explaining what a PDF is. Match the specificity to the fragility of the task: leave room where several approaches work and explain why, and be exact where a sequence must not vary. Where several tools would do, give one default and one escape hatch instead of a menu.",
      output: "A body where every paragraph would change what the agent does.",
    },
    {
      title: "Split anything long into referenced files, one level deep",
      body: "The specification recommends keeping SKILL.md under 500 lines and its instructions under roughly 5,000 tokens, with everything else in scripts, references, or assets beside it. Those files cost nothing until they are read. The rule that gets broken is depth: references have to link directly from SKILL.md, because an agent following a reference inside a reference often previews the file rather than reading it, and takes away partial information. Say when to load each one, not just that it exists, and put a table of contents at the top of any reference file longer than a hundred lines.",
      output: "A SKILL.md that reads as a map, with the detail one hop away.",
    },
    {
      title: "Bundle scripts only for work that should be deterministic",
      body: "A bundled script never enters the context window; only its output does, which makes it cheaper and more repeatable than asking the agent to regenerate the same logic each run. Use one when you see the agent reinventing the same parsing, chart, or validation step across runs. Write the script to handle its own error cases rather than failing and leaving the agent to improvise, justify any constant it hard-codes, and use forward slashes in every path so it works on all platforms. Say explicitly whether the agent should run the script or read it as reference.",
      output: "Fewer generated lines, and a step that produces the same result twice.",
    },
    {
      title: "Validate the frontmatter before anyone else runs it",
      body: "The specification points at one validator, the skills-ref reference library: skills-ref validate ./my-skill checks the frontmatter and the naming rules. Read its warning first, because the project states plainly that it is for demonstration purposes and not meant for production, so treat a pass as a syntax check rather than a certification. Inside Claude Code the equivalent checks are indirect: malformed YAML loads the body with empty metadata, so the slash command still works while the skill never triggers on its own, and starting with the debug flag shows the parse error.",
      output: "Frontmatter that parses, and a name that will not be rejected on upload.",
    },
    {
      title: "Test triggering and output as two separate questions",
      body: "Seeing a skill fire tells you the description worked, not that the instructions did. Test them apart. For triggering, write around twenty realistic prompts, half that should fire the skill and half near-misses that share its vocabulary but need something else, run each a few times because model behavior varies, and keep a validation subset back so you tune the description rather than memorize the test set. For output, build the evaluation cases before writing more documentation, and compare each run in a fresh session against the same task with the skill turned off.",
      output: "Two numbers you can move independently: how often it fires, and how good the result is.",
    },
  ],
  stepsLink: {
    lead: "Once the folder exists, it still has to land somewhere the agent reads, which is the subject of",
    label: "how to install Claude skills in Claude Code",
    href: guidePaths.installClaudeSkills,
    trail: ".",
  },
  team: {
    title: "What a team still has to hand over",
    intro:
      "A finished SKILL.md answers what the skill does. It does not answer the question a teammate asks next: is this the one we use for this job, and who decided that. A folder in someone's home directory is invisible, a repository reaches only the people working in it, and a plugin distributes files rather than a decision. Skills Board is a web app where a team keeps and shares the AI skills it recommends. It is free and MIT licensed, and it gives a teammate four ways to act on a saved entry.",
    paths: [
      {
        label: "Open the original source",
        body: "Every saved skill records the repository and path it came from, so a teammate can read the SKILL.md you wrote before running anything.",
      },
      {
        label: "Copy an install command",
        body: "For the teammates whose setup the command fits, without claiming it fits everyone.",
      },
      {
        label: "Download a ZIP",
        body: "The latest files available from the source at download time, for anyone who would rather place the folder themselves.",
      },
      {
        label: "Connect an agent over MCP",
        body: "An authenticated endpoint lets a compatible agent search the same set of recommendations and retrieve install commands. Sign-in happens in the browser, with no API key to copy.",
      },
    ],
    limits: [
      "A saved skill is a team recommendation, not a security review, an approval, or a compatibility certification.",
      "Skills Board follows the latest version available from the saved source. It does not pin or preserve historical versions.",
      "It does not write SKILL.md for you, create directories, or run skills inside your agent. The authoring above stays yours.",
    ],
  },
  templateTitle: "The record worth keeping beside the skill",
  templateIntro:
    "Six lines written once, next to the folder. They answer what the next author would otherwise have to reverse engineer from the file, and they record the date the constraints were checked, because both the specification and the products keep moving.",
  templateFields: [
    {
      label: "Directory and name",
      value: "The folder name, and confirmation that the frontmatter name matches it exactly.",
    },
    {
      label: "Trigger",
      value: "The requests this skill should fire on, and the near-misses it should stay out of.",
    },
    {
      label: "Freedom",
      value: "Which parts of the body are prescriptive on purpose, and why that part is fragile.",
    },
    {
      label: "Bundled files",
      value: "Every file beside SKILL.md, and the condition under which the agent should open it.",
    },
    {
      label: "Validation",
      value: "The command that was run, its result, and whether the folder has to pass the six-field rule.",
    },
    {
      label: "Reviewed at",
      value: "Who checked the constraints, on what date, against which documentation page.",
    },
  ],
  copyTemplate: `---
name: release-notes
description: Drafts release notes from merged pull requests and groups them by change type. Use when preparing a release, writing a changelog, or summarizing what shipped since the last tag.
license: Apache-2.0
---

# Release notes

## When this applies
The user is preparing a release or asking what shipped since a tag.

## Steps
1. List the pull requests merged since the last tag.
2. Group them into Added, Changed, and Fixed.
3. Write one line per change, in plain language, from the reader's point of view.
4. Link every entry to its pull request.

## Gotchas
- Squashed commits hide the original PR title. Read the merge commit body.
- Dependency bumps go in a single collapsed line, not one line each.

## Reference
For the full changelog format, read references/format.md before writing.

## Output
A Markdown section ready to paste into the release description.`,
  pitfallsTitle: "Where a first SKILL.md goes wrong",
  pitfalls: [
    {
      title: "Writing the description as a label",
      body: "Processes data and Helps with documents are the published examples of what not to write. The description is the only text the agent has when it decides whether to read the file at all, so it has to carry both the capability and the situation. A description that only names the skill guarantees the body is never reached.",
    },
    {
      title: "Assuming a valid file is a portable file",
      body: "Claude Code accepts twenty frontmatter fields. An upload to claude.ai, a Skills API call, and packaging with package_skill.py accept six. The extra field is not ignored: the operation fails with an unexpected-key error listing allowed-tools, compatibility, description, license, metadata, and name. Decide early whether the skill has to leave Claude Code.",
    },
    {
      title: "Letting the folder and the name field drift apart",
      body: "The specification requires the name to match the parent directory name. Claude Code does not enforce it, and in a personal or project skill the command comes from the directory anyway, so the mismatch is invisible until the folder is validated or uploaded. Rename both together, or do not set name at all until you do.",
    },
    {
      title: "Trusting a passing validator",
      body: "The library the specification points to, skills-ref, states in its own README that it is for demonstration purposes and not meant for production use. It checks frontmatter syntax and naming, which is worth running, but there is no official production validator that certifies a skill. Passing it says the file parses, not that the skill works.",
    },
    {
      title: "Chaining references two levels deep",
      body: "An agent that follows a reference from inside another reference tends to preview the file rather than read it, and acts on partial information. Keep every reference one hop from SKILL.md, name the file for its contents rather than doc2.md, and state the condition that should make the agent open it.",
    },
    {
      title: "Padding the description to the character limit",
      body: "The limit is 1024 characters, but the listing an agent actually receives is budgeted. Claude Code caps the combined description and when_to_use text at 1,536 characters and sizes the whole listing at one percent of the model context window, dropping descriptions of the skills you invoke least when it overflows. Put the key use case in the first sentence.",
    },
  ],
  checklist: [
    "The skill came out of a task you had already completed, not out of a plausible idea.",
    "The directory name and the frontmatter name are the same string.",
    "The description names both the capability and the requests that should reach it.",
    "The body is under 500 lines, and everything longer sits in a file the agent is told when to open.",
    "The frontmatter passes a validation run, and you know whether it has to stay inside the six specification fields.",
    "You have tested triggering and output separately, in a session that was not the one you wrote the skill in.",
  ],
  faq: [
    {
      question: "What is the minimum valid SKILL.md file?",
      answer:
        "A directory containing SKILL.md, with YAML frontmatter holding a name and a description, followed by Markdown instructions. Nothing else is required. Anthropic's own published template is five lines: the two fields between frontmatter markers and a single heading you replace with the instructions.",
    },
    {
      question: "Which frontmatter fields does SKILL.md support?",
      answer:
        "The specification defines six: name and description are required, and license, compatibility, metadata, and allowed-tools are optional. Claude Code accepts those six and adds fourteen of its own, including when_to_use, disable-model-invocation, user-invocable, context, and paths. The additional fields work only inside Claude Code.",
    },
    {
      question: "How long should a SKILL.md file be?",
      answer:
        "Under 500 lines, and the instructions under roughly 5,000 tokens. That guidance appears in both the specification and Anthropic's authoring documentation. Longer material belongs in separate files under scripts, references, or assets, which stay on disk and cost nothing until the agent is told to open one.",
    },
    {
      question: "Why does my skill never trigger?",
      answer:
        "Almost always the description. The agent sees only names and descriptions at startup and reads the body afterwards, so an unspecific description ends the decision before your instructions are seen. Malformed YAML is the other cause: the body loads with empty metadata, so the command works while automatic matching cannot.",
    },
    {
      question: "Should the description be written in first, second, or third person?",
      answer:
        "The two primary sources disagree. Anthropic's best practices require third person and name second person as an anti-pattern. The specification site recommends imperative phrasing such as use this skill when. The published examples reconcile them: state the capability in third person, then add a Use when clause.",
    },
    {
      question: "How do I validate a SKILL.md before sharing it?",
      answer:
        "Run skills-ref validate on the skill directory, using the reference library the specification links to. Read its caveat first: the project describes itself as demonstration software rather than production software. Inside Claude Code, starting a session with the debug flag surfaces frontmatter parse errors that otherwise fail silently.",
    },
  ],
  sources: [
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The directory layout, the six frontmatter fields with their required status and limits, the name constraints including the match with the parent directory, the experimental marking on allowed-tools, the progressive disclosure tiers, the 500-line and 5,000-token guidance, and the one-level-deep rule for file references. Checked 21 August 2026.",
    },
    {
      id: "agentskills-descriptions",
      label: "Agent Skills: optimizing skill descriptions",
      href: "https://agentskills.io/skill-creation/optimizing-descriptions",
      note: "That the description carries the entire burden of triggering, the imperative phrasing recommendation, the twenty-query eval set split between should-trigger and near-miss prompts, repeated runs and a trigger rate, and the train and validation split that keeps a description from being tuned onto its own test set. Checked 21 August 2026.",
    },
    {
      id: "agentskills-best-practices",
      label: "Agent Skills: best practices for skill creators",
      href: "https://agentskills.io/skill-creation/best-practices",
      note: "Starting from a completed task rather than a generated one, adding only what the agent lacks, matching specificity to fragility, providing one default instead of a menu, gotchas sections, and the instruction to say when each reference file should be loaded. Checked 21 August 2026.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: skills documentation",
      href: "https://code.claude.com/docs/en/skills",
      note: "Every frontmatter field being optional with description recommended, the name field acting as a display label while the directory supplies the command, the fourteen Claude Code additions, the six-field restriction outside Claude Code and its unexpected-key error, the 1,536-character listing cap and the one percent context budget, the session-long lifecycle of loaded skill content, and the malformed-YAML behavior. Checked 21 August 2026.",
    },
    {
      id: "anthropic-best-practices",
      label: "Anthropic: skill authoring best practices",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices",
      note: "The third-person rule for descriptions, the reserved words anthropic and claude in a name, gerund naming, degrees of freedom, the partial-read problem behind one-level-deep references, tables of contents in reference files over a hundred lines, forward slashes in paths, and building evaluations before writing more documentation. Checked 21 August 2026.",
    },
    {
      id: "skills-ref",
      label: "skills-ref reference library",
      href: "https://github.com/agentskills/agentskills/tree/main/skills-ref",
      note: "The validate command the specification points to, and the project's own statement that the library is intended for demonstration purposes and not meant to be used in production. Checked 21 August 2026.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "The five-line template at template/SKILL.md, the nineteen published skill folders including skill-creator, the packaging script at skills/skill-creator/scripts/package_skill.py, and the spec folder now reduced to a pointer at the agentskills.io specification. Checked 21 August 2026.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · Author and validate",
    title: [
      { text: "Two fields decide" },
      { text: "whether it ever fires.", accent: true },
    ],
    description:
      "The SKILL.md frontmatter, the description that triggers a skill, the body budget, and the validation step.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["name", "description"],
  },
  ogAlt:
    "Skills Board guide: how to write a SKILL.md file, from frontmatter to validation.",
  publishedAt: "2026-08-21",
  modifiedAt: "2026-08-21",
}
