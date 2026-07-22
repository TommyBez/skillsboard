export const guidePaths = {
  shareTeamSkills: "/guides/share-agent-skills-with-your-team",
  manageCrossAgentSkills: "/guides/manage-skills-across-claude-codex-cursor",
} as const

export type GuidePath = (typeof guidePaths)[keyof typeof guidePaths]

export interface GuideDefinition {
  path: GuidePath
  eyebrow: string
  title: string
  description: string
  intro: string
  problem: string
  decisionTitle: string
  decisionIntro: string
  comparisonColumns: readonly string[]
  comparisonRows: readonly {
    label: string
    cells: readonly string[]
  }[]
  stepsTitle: string
  stepsIntro: string
  steps: readonly {
    title: string
    body: string
    output: string
  }[]
  templateTitle: string
  templateIntro: string
  templateFields: readonly {
    label: string
    value: string
  }[]
  pitfallsTitle: string
  pitfalls: readonly {
    title: string
    body: string
  }[]
  checklist: readonly string[]
  relatedGuide: {
    href: GuidePath
    label: string
    description: string
  }
  sources: readonly {
    label: string
    href: string
    note: string
  }[]
  publishedAt: string
  modifiedAt: string
}

export const shareTeamSkillsGuide: GuideDefinition = {
  path: guidePaths.shareTeamSkills,
  eyebrow: "Team skill operations",
  title: "How to share AI agent skills with your team",
  description:
    "A practical workflow to share AI agent skills across a team, set ownership, compare distribution models, and keep one trusted recommendation library.",
  intro:
    "Sharing a skill is easy. Making it trustworthy, discoverable, and reusable by the next teammate is the real job. This guide gives you a lightweight operating model that works whether your team uses one agent or several.",
  problem:
    "A link in chat answers “where is the file?” once. It does not say who owns the skill, what problem it solves, which agents were tested, or whether the team should still use it. Treat the skill artifact, its distribution path, and the team recommendation as three separate layers.",
  decisionTitle: "Choose the sharing model that matches your team",
  decisionIntro:
    "Most teams need a combination: a versioned source for the artifact and a shared catalog for discovery and recommendation. Vendor-native sharing is useful when everyone works in the same managed environment.",
  comparisonColumns: ["Sharing model", "Best fit", "Trade-off"],
  comparisonRows: [
    {
      label: "Vendor-native sharing",
      cells: [
        "One managed agent environment with central administration.",
        "Simple inside that environment, but the recommendation can fragment when the team adds another agent.",
      ],
    },
    {
      label: "Versioned repository",
      cells: [
        "Teams that already review operational files in Git.",
        "Strong history and ownership, but installation and discovery still need a documented workflow.",
      ],
    },
    {
      label: "Shared recommendation library",
      cells: [
        "Mixed-agent teams that need one place to decide which skill to use.",
        "Improves discovery and context; it does not automatically provision the skill into every agent.",
      ],
    },
  ],
  stepsTitle: "A six-step sharing workflow",
  stepsIntro:
    "Keep the first rollout small. One useful skill with a clear owner teaches you more than a large directory nobody is responsible for.",
  steps: [
    {
      title: "Start with a repeated team problem",
      body: "Name the recurring task, the expected output, and the failure the skill should prevent. A skill called “release notes” is weaker than one that consistently turns merged pull requests into a customer-safe changelog.",
      output: "One sentence describing the trigger, workflow, and expected result.",
    },
    {
      title: "Keep one canonical source",
      body: "Store the SKILL.md file and its supporting resources in one versioned location. Share links to that source instead of copying the files into chat, docs, and private folders.",
      output: "A canonical repository URL with visible history and ownership.",
    },
    {
      title: "Review the artifact before recommending it",
      body: "Check the instructions, bundled scripts, tool permissions, data handling, and final verification steps. Treat an externally sourced skill like code or automation—not like a harmless prompt snippet.",
      output: "A named reviewer and a recorded review date.",
    },
    {
      title: "Publish a minimal recommendation record",
      body: "Record what the skill is for, why the team recommends it, its source, install or access path, tested agents, owner, and current status. Keep operational notes next to the recommendation rather than in a separate chat thread.",
      output: "A searchable team record that points back to the canonical source.",
    },
    {
      title: "Test the actual team paths",
      body: "Install or open the skill using the paths your teammates will use. Verify at least one representative task per supported agent and document any agent-specific setup instead of claiming universal compatibility.",
      output: "A small compatibility note based on observed behavior.",
    },
    {
      title: "Review, update, or retire",
      body: "Give every recommendation an owner and a review trigger. Source changes, tool changes, repeated failures, or a better replacement should start a new review—not leave two competing copies in circulation.",
      output: "An active, needs-review, or retired lifecycle state.",
    },
  ],
  templateTitle: "The minimum useful skill record",
  templateIntro:
    "This record is deliberately small enough to maintain. Add fields only when they change a decision or reduce rollout risk.",
  templateFields: [
    { label: "Problem", value: "The repeated task this skill helps the team complete." },
    { label: "Recommendation", value: "Why the team prefers this skill over the current alternative." },
    { label: "Canonical source", value: "The repository path or source URL for the reviewed artifact." },
    { label: "Use paths", value: "Source, install command, ZIP, MCP, or agent-specific instructions that actually exist." },
    { label: "Compatibility", value: "Agents and environments the team has tested—never an assumed universal claim." },
    { label: "Owner and status", value: "The person responsible plus active, needs-review, or retired." },
  ],
  pitfallsTitle: "What usually breaks",
  pitfalls: [
    {
      title: "Copying instead of linking",
      body: "Every copied SKILL.md becomes a possible fork. Keep one canonical source and let recommendation records point to it.",
    },
    {
      title: "Calling availability approval",
      body: "A skill appearing in a marketplace or repository does not mean your team has reviewed its scripts, permissions, or output quality.",
    },
    {
      title: "Ignoring mixed-agent reality",
      body: "A portable format helps, but discovery, invocation, installation, and administration can still differ by agent and version.",
    },
    {
      title: "Growing the catalog without owners",
      body: "More entries create more ambiguity when nobody is accountable for reviewing changes or retiring stale recommendations.",
    },
  ],
  checklist: [
    "The skill solves a repeated team problem with a concrete expected output.",
    "One canonical source is versioned and accessible to the intended teammates.",
    "Scripts, permissions, and data handling were reviewed before recommendation.",
    "The recommendation says which agents were actually tested.",
    "The record has an owner, status, and review trigger.",
    "The next teammate can find and use it without searching chat history.",
  ],
  relatedGuide: {
    href: guidePaths.manageCrossAgentSkills,
    label: "Manage skills across Claude Code, Codex, and Cursor",
    description: "Turn the shared-source model into a practical cross-agent operating system.",
  },
  sources: [
    {
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Defines skills as reusable workflows and SKILL.md as a portable, versionable playbook.",
    },
    {
      label: "Anthropic: Extend Claude with skills",
      href: "https://code.claude.com/docs/en/slash-commands",
      note: "Documents skill structure, discovery, sharing, invocation, and supporting resources in Claude Code.",
    },
    {
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes the open Agent Skills standard and repository or personal skill locations supported by Copilot.",
    },
  ],
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}

export const manageCrossAgentSkillsGuide: GuideDefinition = {
  path: guidePaths.manageCrossAgentSkills,
  eyebrow: "Cross-agent operations",
  title: "Manage skills across Claude Code, Codex, and Cursor",
  description:
    "Use one source of truth to manage SKILL.md workflows across Claude Code, Codex, and Cursor without confusing portability with automatic synchronization.",
  intro:
    "Claude Code, Codex, and Cursor can all work with reusable skills, but “supported” does not mean “kept in sync.” A durable team setup separates the shared skill source from each agent’s installation and discovery rules.",
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
  relatedGuide: {
    href: guidePaths.shareTeamSkills,
    label: "Share AI agent skills with your team",
    description: "Set ownership, review, discovery, and lifecycle rules before adding more agent paths.",
  },
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
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}
