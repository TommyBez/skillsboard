import { alternativePaths } from "@/lib/seo/alternatives"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { codexSkillsPath } from "@/lib/seo/codex-skills/types"
import type { ComparisonDefinition } from "@/lib/seo/compare/types"
import { comparePaths } from "@/lib/seo/compare/types"
import { guidePaths } from "@/lib/seo/guides/types"

const subagentFileTemplate = `.claude/
  skills/
    api-conventions/
      SKILL.md
  agents/
    api-reviewer.md

# .claude/agents/api-reviewer.md
---
name: api-reviewer
description: Reviews API changes against the team conventions. Use proactively on branches that touch route handlers.
tools: Read, Glob, Grep
model: sonnet
skills:
  - api-conventions
---

Review the API changes on this branch. Follow the conventions from the
preloaded skills and report only what breaks them, with file and line.
`

export const skillsVsSubagents: ComparisonDefinition = {
  path: comparePaths.skillsVsSubagents,
  ctaLocation: "compare_skills_subagents",
  subject: "Skills vs subagents",
  eyebrow: "Claude Skills vs Subagents",
  title: "Claude skills vs subagents",
  seoTitle: "Claude Skills vs Subagents: When to Use Each | Skills Board",
  socialTitle: "Claude skills vs subagents, compared",
  description:
    "A skill is instructions loaded into the conversation you are already in. A subagent is a separate run with its own context window, tools, and model. What each one is, where each lives, when each is the right primitive, and how to use both in one repository.",
  cardSummary:
    "Two Claude Code primitives that look interchangeable and are not. One loads instructions into your conversation, the other starts a separate run with its own context window.",
  intro: [
    "Skills and subagents are both Markdown files with YAML frontmatter that you check into a repository, and both are picked up automatically when Claude decides your request matches their description. That shared surface is why people ask which one to use, and why the answer is not obvious from the file alone.",
    "The difference is where the work happens. A skill puts instructions into the conversation you are already having. A subagent starts a separate run with its own context window, its own system prompt, and its own tool and permission settings, then hands back a summary.",
    "This page sets the two next to each other on the dimensions that decide the choice, states plainly when each one is the wrong pick, and shows the two documented ways they combine. Every claim links to the first-party page it came from, checked on the date at the top.",
  ],
  answer:
    "Use a skill when you want reusable instructions to run inside your current conversation, with the full context you already loaded. Use a subagent when you want the work done in a separate context window with its own tools, permissions, and model, returning only a summary. Skills carry knowledge; subagents carry isolation.",
  answerNotes: [
    "Anthropic's documentation makes the same call in both directions. The subagents page tells you to reach for a subagent when the task produces verbose output you do not need in your main context, when you want to enforce specific tool restrictions or permissions, and when the work is self-contained and can return a summary. The same page then says to consider skills instead when you want reusable prompts or workflows that run in the main conversation context rather than isolated subagent context.",
    "Neither primitive is a smaller version of the other. A skill can be long, bundle scripts and reference files, and still cost nothing until it is triggered. A subagent can be three lines of frontmatter and still change what tools are available and which model runs. The question is not which is more powerful, it is whether the work belongs in your conversation or somewhere else.",
  ],
  answerSourceIds: ["claude-code-subagents", "claude-code-skills"],
  sideBySide: {
    title: "Side by side",
    intro:
      "Seven dimensions that actually differ. Everything here comes from the Claude Code documentation for each primitive and from the Agent Skills specification, not from inference about how they behave.",
    columns: ["Dimension", "Skill", "Subagent"],
    rows: [
      {
        label: "What it is",
        cells: [
          "A folder containing a SKILL.md file: YAML frontmatter with a name and a description, then Markdown instructions. The folder can also bundle scripts, reference documents, templates, and any other files the task needs.",
          "A single Markdown file with YAML frontmatter. The frontmatter configures the run, and the body becomes the subagent's system prompt. Only name and description are required.",
        ],
      },
      {
        label: "Where it lives",
        cells: [
          "~/.claude/skills/<name>/SKILL.md for you, .claude/skills/<name>/SKILL.md for the project, a plugin's skills/ directory, or managed settings for an organization.",
          ".claude/agents/ for the project, ~/.claude/agents/ for you, a plugin's agents/ directory, the --agents flag for one session, or managed settings for an organization.",
        ],
      },
      {
        label: "What it triggers",
        cells: [
          "Instructions loaded into the conversation you are already in. Claude matches your request against the description, then reads the file. You can also invoke it yourself by typing /skill-name.",
          "A separate run in its own context window, with its own system prompt, tool access, permissions, and model. Claude delegates based on the description, or you @-mention the subagent to guarantee it runs.",
        ],
      },
      {
        label: "Who maintains it",
        cells: [
          "Whoever owns the procedure edits one Markdown file. When the same name exists at more than one level, enterprise overrides personal and personal overrides project. Plugin skills are namespaced as plugin-name:skill-name and cannot collide.",
          "Whoever owns the delegation edits one Markdown file. Precedence runs managed settings, then the --agents flag, then the project directory, then your user directory, then plugins. Claude Code watches both agent directories and uses an edited definition within a few seconds, with no restart.",
        ],
      },
      {
        label: "What you share with the team",
        cells: [
          "Commit .claude/skills/ to version control, ship the skill in a plugin, or deploy it organization-wide through managed settings. Uploads to claude.ai and the Skills API are separate copies: Anthropic documents that custom Skills do not sync across surfaces.",
          "Commit .claude/agents/ to version control. The documentation calls project subagents ideal for a codebase and says to check them in so your team can use and improve them collaboratively. Plugins are the documented way to share them across projects.",
        ],
      },
      {
        label: "What it costs in context",
        cells: [
          "Roughly 100 tokens per installed skill at startup, because only the name and description are preloaded. The body enters context when the skill is triggered, and in Claude Code it then stays in the conversation for the rest of the session.",
          "Nothing in your context while it runs, because it runs somewhere else. Its result does return to your conversation, and the documentation warns that running many subagents that each return detailed results can consume significant context.",
        ],
      },
      {
        label: "Where else it works",
        cells: [
          "SKILL.md follows the Agent Skills open standard, published at agentskills.io, which lists a client showcase of other products that read the same file. Only the six specification fields are portable; Claude Code extensions are not.",
          "Documented as a Claude Code feature. There is no equivalent cross-tool specification for subagent files published alongside the Agent Skills standard, so a subagent definition is not portable in the same sense.",
        ],
      },
    ],
    notes: [
      "The startup cost line is the one that surprises people. Anthropic calls the loading order progressive disclosure: metadata for every skill is loaded at startup at roughly 100 tokens each, the SKILL.md body loads only when the skill is triggered, and bundled files load only when something reads them. That is why installing many skills is cheap and why a description that does not say when to use the skill is the most expensive mistake you can make.",
      "The subagent side has the mirror-image cost. A subagent starts with a fresh, isolated context window: it does not see your conversation history, the skills you already invoked, or the files Claude already read. That isolation is the entire point, and it is also why the documentation lists latency as a reason to stay in the main conversation, since subagents start fresh and may need time to gather context.",
      "Tool access differs in a way that matters for review. A subagent inherits the tools available in the main conversation when the tools field is omitted, and an explicit tools list narrows it, which is how you enforce a read-only reviewer. A skill can also declare allowed-tools, but Claude Code documents that workspace trust does not gate that field, so a skill checked into a repository can grant itself broad tool access. Read the frontmatter of skills you did not write.",
      "Both primitives are matched against the same thing: the description. For a subagent the documentation says Claude delegates based on the task description in your request, the description field in the configuration, and the current context, and that phrases like use proactively encourage delegation. For a skill the description is what your request is matched against to decide whether to trigger it. If either one never fires, the description is where to look first.",
    ],
    sourceIds: [
      "claude-code-subagents",
      "claude-code-skills",
      "agentskills-spec",
      "anthropic-agent-skills",
    ],
  },
  skillCase: {
    title: "When a skill is the right primitive",
    intro:
      "A skill is the right choice when the value is in the instructions and the work belongs where you already are. Four cases where that holds, each traceable to something the documentation says rather than to a preference.",
    cases: [
      {
        title: "The work needs the conversation you are already in",
        body: "The main conversation has your history, the files Claude has read, and the half-finished decision you are in the middle of. A skill runs there. The subagents page is explicit about the trade: consider skills when you want reusable prompts or workflows that run in the main conversation context rather than isolated subagent context. If the task needs frequent back-and-forth or iterative refinement, that is the same argument.",
      },
      {
        title: "You are encoding a procedure, not a worker",
        body: "A skill is a folder, so it can carry more than prose: scripts Claude runs, reference documents it reads when the instructions point at them, and templates it fills in. Anthropic's guidance is to keep SKILL.md under 500 lines and move detailed reference material into separate files, which is a description of how a real procedure is written down rather than how a persona is configured.",
      },
      {
        title: "Someone needs to run it on purpose",
        body: "Skills are invocable by name: typing /skill-name runs one directly, and Claude Code adds frontmatter to control invocation, including disable-model-invocation to keep a workflow manual. That matters for the checklist a teammate runs before a release, where the point is that a person decides when it happens.",
      },
      {
        title: "You want it to work outside Claude Code",
        body: "Claude Code skills follow the Agent Skills open standard, and agentskills.io publishes both the specification and a showcase of clients that read the same SKILL.md file. The portability is real but bounded: only the six specification fields are accepted outside Claude Code, and Anthropic documents that a file with a Claude Code extension in its frontmatter fails to package or upload rather than being ignored.",
      },
    ],
    counterweightTitle: "When a skill is the wrong pick",
    counterweight: [
      "The output is verbose and you will not reference it again. A skill's work lands in your conversation, and in Claude Code the rendered SKILL.md content enters the conversation as a single message and stays there for the rest of the session. A search that returns hundreds of matches does not belong there.",
      "You need the tool restriction enforced. A skill can list allowed-tools, but the grant runs in your session and Claude Code notes that workspace trust does not gate the field. If the requirement is that this work cannot write files, a subagent with an explicit tools list is the primitive that expresses it.",
      "You want a different model for this job. The skill frontmatter can set a model in Claude Code, but the override applies for the rest of the current turn and is not saved, and it is a Claude Code extension rather than part of the portable specification.",
    ],
    sourceIds: ["claude-code-skills", "claude-code-subagents", "agentskills-spec"],
  },
  subagentCase: {
    title: "When a subagent is the right primitive",
    intro:
      "A subagent is the right choice when the value is in the isolation. The documentation gives three conditions, and two more follow from what the frontmatter can set.",
    cases: [
      {
        title: "The output would flood your context",
        body: "This is the documented headline use: a side task that would fill your main conversation with search results, logs, or file contents you will not reference again. The subagent does that work in its own context and returns only the summary. The cost of getting this wrong is not an error, it is a conversation that runs out of room halfway through the actual task.",
      },
      {
        title: "The restriction has to hold",
        body: "A subagent has its own tool access and independent permissions. Omit the tools field and it inherits what the main conversation has; set it to Read, Glob, Grep and it cannot edit or write files. The built-in Explore agent is the same idea shipped by default: read-only tools, with Write and Edit denied.",
      },
      {
        title: "The work is self-contained and returns a summary",
        body: "The third documented condition, and the one that decides most real cases. If you can describe the job in a paragraph and accept a written answer, delegate it. If you expect to steer it three times, keep it in the main conversation.",
      },
      {
        title: "The job should run on a cheaper or faster model",
        body: "The model field takes an alias, a full model ID, or inherit, and defaults to inherit when omitted. Anthropic lists cost control as a reason to use subagents, routing tasks to faster, cheaper models like Haiku. A skill has no portable equivalent.",
      },
      {
        title: "Several independent investigations can run at once",
        body: "Subagents can work in parallel on paths that do not depend on each other, and Claude synthesizes the findings. The default ceiling is 20 concurrent subagents in a session, and a subagent can spawn its own up to three layers below the main conversation.",
      },
    ],
    counterweightTitle: "When a subagent is the wrong pick",
    counterweight: [
      "You are in a hurry. The documentation lists latency as a reason to stay in the main conversation, because subagents start fresh and may need time to gather context. For a quick, targeted change the delegation is pure overhead.",
      "The context you already built is the point. A subagent does not see your conversation history, the skills you invoked, or the files Claude read. Anything it needs has to be in the delegation message, its system prompt, or the files it can find for itself.",
      "You are running many of them and reading every word. Results return to the main conversation, and the documentation warns that many subagents each returning detailed results can consume significant context. The isolation saves nothing if you paste it all back.",
      "You expect to resume where it left off. Each invocation creates a new instance with fresh context, and the built-in Explore and Plan agents are one-shot and return no agent ID, so they cannot be resumed at all.",
    ],
    sourceIds: ["claude-code-subagents"],
  },
  together: {
    title: "Using both in the same repo",
    intro:
      "The two primitives are not alternatives at the file level. Anthropic documents them composing in two directions, and a repository that uses both keeps .claude/skills/ and .claude/agents/ side by side in version control.",
    directions: {
      columns: ["Approach", "System prompt", "Task", "Also loads"],
      rows: [
        {
          label: "Skill with context: fork",
          cells: [
            "From the agent type",
            "The SKILL.md content",
            "CLAUDE.md, except when the agent is Explore or Plan",
          ],
        },
        {
          label: "Subagent with a skills field",
          cells: [
            "The subagent's Markdown body",
            "Claude's delegation message",
            "Preloaded skills and CLAUDE.md",
          ],
        },
      ],
    },
    notes: [
      "Reading the table left to right tells you who writes the task. With context: fork, the task is your skill: the skill content becomes the prompt that drives the subagent, it has no access to your conversation history, and the agent field picks which subagent type executes it, defaulting to general-purpose. Anthropic warns that this only makes sense for skills with explicit instructions, because a skill full of guidelines with no task gives the subagent nothing actionable to do.",
      "With a skills field on the subagent, the task is Claude's delegation message and the skill is reference material. The full content of each listed skill is injected into the subagent's context at startup, which is different from a normal session where only descriptions are preloaded. That field controls what is preloaded, not what the subagent can reach: without it, a subagent can still discover and invoke skills through the Skill tool, and skills that set disable-model-invocation cannot be preloaded at all.",
      "In practice one team convention covers most of it. Put the knowledge in a skill, because knowledge is what other people read, edit, and reuse in another tool. Put the isolation in a subagent, because tool limits, permissions, and model choice are the things you want enforced rather than suggested. When a subagent needs the knowledge, preload the skill instead of restating it in the system prompt, so there is one copy to keep current.",
      "The honest caveat: none of this tells a new teammate which skill or subagent your team actually recommends. Both directories are discoverable only if you already have the repository checked out and know to look, and neither carries a reason for existing beyond what the description says. That gap is what a shared library closes, and it is the reason Skills Board exists, but a README that names the three skills your team stands behind closes most of it for free.",
    ],
    template: subagentFileTemplate,
    templateLabel: "A subagent that preloads a skill",
    link: {
      lead: "Once more than one person depends on the same file, the harder problem is agreement rather than syntax:",
      label: "how to share AI agent skills with your team",
      href: guidePaths.shareTeamSkills,
      trail: " covers ownership, the distribution models, and keeping one recommendation instead of five forks.",
    },
    sourceIds: ["claude-code-skills", "claude-code-subagents"],
  },
  faq: [
    {
      question: "What is the difference between Claude skills and subagents?",
      answer:
        "A skill is a folder with a SKILL.md file whose instructions load into the conversation you are already in. A subagent is a Markdown file that defines a separate run with its own context window, system prompt, tool access, permissions, and model, which returns a summary to your conversation. Skills add knowledge in place; subagents move work elsewhere.",
    },
    {
      question: "Are Claude agents and subagents the same thing?",
      answer:
        "The Claude Code documentation calls them subagents, and the tool that spawns one is the Agent tool, which is why both words appear. They refer to the same feature: definitions in .claude/agents/ or ~/.claude/agents/, each running in its own context window. Anthropic also ships built-in ones, including Explore, Plan, and general-purpose.",
    },
    {
      question: "Can a skill run in a subagent?",
      answer:
        "Yes. Adding context: fork to a skill's frontmatter runs it in a forked subagent context, where the skill content becomes the prompt and the skill has no access to your conversation history. The agent field chooses which subagent type executes it and defaults to general-purpose. Anthropic notes this only makes sense for skills that contain an explicit task.",
    },
    {
      question: "Can a subagent use skills?",
      answer:
        "Yes, in two ways. The skills frontmatter field injects the full content of the listed skills into the subagent's context at startup. Without that field, a subagent can still discover and invoke project, user, and plugin skills through the Skill tool while it runs, unless you remove the Skill tool from its tools list.",
    },
    {
      question: "Which one should a team standardize on first?",
      answer:
        "Skills, in most cases, because the format is an open standard that other agent products read and because a skill is the artifact a teammate can open and understand without running anything. Add subagents where a restriction has to hold, such as a review that must not write files, or where the output would otherwise flood the conversation.",
    },
    {
      question: "Do skills and subagents work outside Claude Code?",
      answer:
        "Skills partly do. SKILL.md follows the Agent Skills open standard and agentskills.io lists other clients that read it, but only the six specification fields carry over, and Anthropic documents that custom Skills do not sync automatically between Claude Code, claude.ai, and the API. Subagents are documented as a Claude Code feature, with no equivalent published cross-tool specification.",
    },
  ],
  sources: [
    {
      id: "claude-code-subagents",
      label: "Claude Code: create custom subagents",
      href: "https://code.claude.com/docs/en/sub-agents",
      note: "The definition of a subagent, the isolated context window, the file locations and precedence table, the frontmatter fields and which two are required, automatic delegation and @-mentions, tool inheritance, model selection, the skills preloading field, the concurrency and nesting limits, and the guidance on choosing between a subagent and the main conversation.",
    },
    {
      id: "claude-code-skills",
      label: "Claude Code: extend Claude with skills",
      href: "https://code.claude.com/docs/en/skills",
      note: "Where skills live and how name conflicts resolve, the frontmatter table and which fields are Claude Code extensions, invocation control, context: fork and the agent field, the table of the two ways skills and subagents combine, and the note that skill content stays in the conversation for the rest of the session.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The six frontmatter fields and their limits, the naming rules, the optional scripts, references, and assets directories, and the three progressive disclosure stages with their size guidance.",
    },
    {
      id: "agentskills-home",
      label: "Agent Skills: overview and client showcase",
      href: "https://agentskills.io",
      note: "The format as an open standard originally developed by Anthropic, the progressive disclosure summary, and the showcase of agent products that read the same SKILL.md file.",
    },
    {
      id: "anthropic-agent-skills",
      label: "Anthropic: Agent Skills overview",
      href: "https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview",
      note: "The three progressive disclosure levels and their token costs, the surfaces custom Skills are available on, the statement that Skills do not sync across those surfaces, and the sharing scope for Claude Code, claude.ai, and the API.",
    },
  ],
  related: [
    {
      label: "Claude skills: what they are and how to use them",
      href: claudeSkillsPath,
      description:
        "The reference page for one side of this comparison: the format, the surfaces, and how a skill loads.",
    },
    {
      label: "Codex skills: what they are and how to use them",
      href: codexSkillsPath,
      description:
        "The same standard read by OpenAI's agent, and what a skill keeps when it moves between products.",
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
        "Ownership, distribution models, and keeping one recommendation instead of five forks.",
    },
    {
      label: "Skills Board vs a shared GitHub repository",
      href: alternativePaths.githubRepo,
      description:
        "What a repository of skill files already does well, and the question it leaves unanswered.",
    },
  ],
  og: {
    eyebrow: "Claude Skills vs Subagents",
    title: [
      { text: "Skills carry knowledge." },
      { text: "Subagents carry isolation.", accent: true },
    ],
    description:
      "What each primitive is, where each lives, when each is the right choice, and the two documented ways they combine.",
    contextLabel: "skillsboard.sh/compare",
    chips: ["SKILL.md", ".claude/agents", "context: fork"],
  },
  ogAlt:
    "Comparison of Claude skills and subagents: what each one is, where each lives, and when to use each.",
  publishedAt: "2026-08-15",
  modifiedAt: "2026-08-15",
}
