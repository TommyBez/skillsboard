import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const manageCrossAgentSkillsGuide: GuideDefinition = {
  path: guidePaths.manageCrossAgentSkills,
  contentType: "guide",
  topics: ["team operations", "skill sharing", "compatibility", "mixed-agent teams"],
  eyebrow: "Cross-agent operations",
  title: "Manage skills across Claude Code, Codex, and Cursor",
  seoTitle: "Manage Claude Code, Codex & Cursor Skills | Skills Board",
  description:
    "Use one source of truth to manage SKILL.md workflows across Claude Code, Codex, and Cursor without confusing portability with automatic synchronization.",
  intro:
    "Claude Code, Codex, and Cursor can all work with reusable skills, but “supported” does not mean “kept in sync.” A durable team setup separates the shared skill source from each agent’s installation and discovery rules.",
  corePrinciple:
    "One canonical source. One visible recommendation. Explicit setup for every agent path.",
  problem:
    "Mixed-agent teams usually fail in one of two ways: they maintain three unrelated skill collections, or they assume one folder will behave identically everywhere. The safer model is one canonical artifact, one team recommendation record, and a thin, tested adapter for each agent surface.",
  decisionTitle: "Standardize the layers, not every implementation detail",
  decisionIntro:
    "The common layer is the skill’s purpose, source, owner, and SKILL.md workflow. Agent-specific installation, discovery, invocation, and administrative controls remain explicit adapters that your team verifies against current vendor documentation.",
  comparisonColumns: ["Layer", "Team standard", "Agent-specific adapter"],
  comparisonRows: [
    {
      label: "Skill artifact",
      cells: [
        "One canonical SKILL.md plus versioned scripts, templates, and references.",
        "Confirm which bundled resources and extensions each agent supports before rollout.",
      ],
    },
    {
      label: "Discovery",
      cells: [
        "One shared recommendation record explains when the skill should be used.",
        "Claude Code, Codex, and Cursor can expose skills differently by product, version, workspace, or project.",
      ],
    },
    {
      label: "Installation",
      cells: [
        "Keep the reviewed source and intended version stable.",
        "Document the current supported install or access path for each agent instead of inventing a universal command.",
      ],
    },
    {
      label: "Invocation",
      cells: [
        "Use the same task fixture and expected output in compatibility tests.",
        "Record whether the skill is selected automatically, invoked explicitly, or constrained by local settings.",
      ],
    },
    {
      label: "Updates",
      cells: [
        "Review changes at the canonical source and publish one new recommendation state.",
        "Refresh or reinstall through each tested agent path; portability alone does not perform this step.",
      ],
    },
  ],
  stepsTitle: "A cross-agent rollout that stays understandable",
  stepsIntro:
    "Pilot one skill across the three agents before generalizing the process. The goal is to expose differences early and keep them in a small compatibility record.",
  steps: [
    {
      title: "Choose one representative workflow",
      body: "Pick a skill with a clear input and reviewable output, such as release-note drafting or a code-review checklist. Avoid a first pilot that depends on many private tools or broad write permissions.",
      output: "One narrow workflow and one reusable test fixture.",
    },
    {
      title: "Normalize the portable core",
      body: "Keep purpose, trigger, inputs, procedure, output format, and final checks in SKILL.md. Put templates, examples, and scripts beside it so the source remains inspectable and versioned.",
      output: "A canonical skill directory with a stable source URL.",
    },
    {
      title: "Create three small setup notes",
      body: "For Claude Code, Codex, and Cursor, link the current official instructions and record only the settings or locations your team actually uses. Do not duplicate the full skill to create the notes.",
      output: "One concise adapter note per agent and environment.",
    },
    {
      title: "Run the same fixture in every agent",
      body: "Use the same input, expected sections, and pass/fail checks. Record meaningful differences in discovery, permissions, tool access, output, and invocation behavior.",
      output: "A compatibility matrix based on observed results.",
    },
    {
      title: "Publish the team recommendation",
      body: "Point teammates to the canonical source, explain the recommended use case, and expose only the agent paths that passed. A shared library makes this discoverable without pretending to be a universal installer.",
      output: "One searchable recommendation with tested use paths.",
    },
    {
      title: "Update source first, adapters second",
      body: "Review changes at the canonical source, repeat the fixture, then refresh each agent path. If one agent fails, mark that path needs-review rather than forking the skill silently.",
      output: "One version history and explicit per-agent lifecycle states.",
    },
  ],
  templateTitle: "The compatibility record",
  templateIntro:
    "Keep this beside the recommendation. It records evidence, not a timeless promise: agent behavior and supported setup paths can change.",
  templateFields: [
    { label: "Canonical version", value: "Commit, tag, or reviewed source state used in the test." },
    { label: "Agent and environment", value: "Claude Code, Codex, or Cursor plus the relevant workspace, CLI, editor, or project context." },
    { label: "Setup path", value: "The official installation or access instructions the tester followed." },
    { label: "Invocation", value: "Automatic selection, explicit invocation, or another observed trigger." },
    { label: "Fixture result", value: "Pass, partial, or fail against the same expected output and checks." },
    { label: "Reviewed at", value: "Date, owner, and reason to retest after a source or agent change." },
  ],
  pitfallsTitle: "Cross-agent shortcuts to avoid",
  pitfalls: [
    {
      title: "Assuming format means synchronization",
      body: "A shared SKILL.md reduces duplication, but it does not automatically install, update, or enable the skill in every agent environment.",
    },
    {
      title: "Maintaining three canonical copies",
      body: "Agent folders should consume or reference the reviewed source. If each copy evolves independently, the team no longer knows which behavior it approved.",
    },
    {
      title: "Publishing untested compatibility badges",
      body: "Support claims should name the tested environment and date. A vendor announcing skill support is not evidence that your specific scripts and permissions work there.",
    },
    {
      title: "Hiding agent-specific differences",
      body: "Different discovery and invocation rules are normal. Small adapter notes are cheaper and clearer than forcing a misleading universal setup.",
    },
  ],
  checklist: [
    "One canonical skill source is shared across all three agent paths.",
    "The portable workflow is separated from agent-specific setup notes.",
    "Every compatibility claim names an observed environment and review date.",
    "The same fixture and pass/fail checks were used for each agent.",
    "A failed agent path can be paused without forking the canonical skill.",
    "The team can discover the recommendation without knowing its install location in advance.",
  ],
  sources: [
    {
      label: "OpenAI: Skills in ChatGPT",
      href: "https://help.openai.com/en/articles/20001066",
      note: "Explains the reusable and shareable skill model, the open standard, and support across OpenAI products including Codex.",
    },
    {
      label: "Anthropic: Extend Claude with skills",
      href: "https://code.claude.com/docs/en/slash-commands",
      note: "Documents Claude Code skill files, project and personal discovery, invocation controls, and sharing patterns.",
    },
    {
      label: "Cursor 2.4: Skills support",
      href: "https://cursor.com/changelog/2-4",
      note: "Announces Agent Skills in Cursor editor and CLI, using SKILL.md files with instructions, scripts, and commands.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Confirms Agent Skills as an open standard used across multiple AI systems and documents shared repository locations.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · Cross-agent operations",
    title: [
      { text: "One skill source for" },
      { text: "Claude, Codex & Cursor.", accent: true },
    ],
    description:
      "Manage SKILL.md workflows across agents without confusing portability with automatic synchronization.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["Compatibility matrix", "Rollout plan"],
  },
  ogAlt: "Skills Board guide: manage skills across Claude Code, Codex, and Cursor.",
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}
