export const guidePaths = {
  shareTeamSkills: "/guides/share-agent-skills-with-your-team",
  manageCrossAgentSkills: "/guides/manage-skills-across-claude-codex-cursor",
  aiCodingTeamOnboarding: "/guides/ai-coding-team-onboarding",
  aiCodingGuidelinesTemplate: "/guides/ai-coding-guidelines-template",
} as const

export type GuidePath = (typeof guidePaths)[keyof typeof guidePaths]

export interface GuideDefinition {
  path: GuidePath
  contentType: "guide"
  topics: readonly string[]
  eyebrow: string
  title: string
  description: string
  intro: string
  corePrinciple: string
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
  copyTemplate?: string
  pitfallsTitle: string
  pitfalls: readonly {
    title: string
    body: string
  }[]
  checklist: readonly string[]
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
  contentType: "guide",
  topics: ["team operations", "skill sharing", "governance", "mixed-agent teams"],
  eyebrow: "Team skill operations",
  title: "How to share AI agent skills with your team",
  description:
    "A practical workflow to share AI agent skills across a team, set ownership, compare distribution models, and keep one trusted recommendation library.",
  intro:
    "Sharing a skill is easy. Making it trustworthy, discoverable, and reusable by the next teammate is the real job. This guide gives you a lightweight operating model that works whether your team uses one agent or several.",
  corePrinciple:
    "One canonical source. One visible recommendation. Explicit setup for every agent path.",
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
  contentType: "guide",
  topics: ["team operations", "skill sharing", "compatibility", "mixed-agent teams"],
  eyebrow: "Cross-agent operations",
  title: "Manage skills across Claude Code, Codex, and Cursor",
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
  publishedAt: "2026-07-22",
  modifiedAt: "2026-07-22",
}

export const aiCodingTeamOnboardingGuide: GuideDefinition = {
  path: guidePaths.aiCodingTeamOnboarding,
  contentType: "guide",
  topics: ["team onboarding", "AI coding tools", "workflow standardization", "mixed-agent teams"],
  eyebrow: "AI coding operations",
  title: "How to onboard your engineering team to AI coding tools",
  description:
    "A practical AI coding team onboarding plan: choose one workflow, provide trusted context, set review gates, and measure adoption before expanding tool access.",
  intro:
    "Buying seats is not an onboarding strategy. Teams adopt AI coding tools when they can use them on a real task, with trusted context, clear review boundaries, and a visible definition of success. This guide turns an individual experiment into a repeatable team rollout.",
  corePrinciple:
    "Standardize one useful workflow before standardizing a tool.",
  problem:
    "Most rollouts start with access and end with uneven habits: a few people build elaborate personal setups, others stop after weak first results, and nobody can explain which context or review step made the difference. The fix is to onboard around one repeated engineering workflow, not a generic tour of features.",
  decisionTitle: "Choose the smallest rollout that can teach you something",
  decisionIntro:
    "A workflow-first pilot creates comparable evidence without forcing every engineer into the same tool. Start with a recurring, reviewable task and make the context, quality bar, and human approval point explicit.",
  comparisonColumns: ["Rollout model", "What it optimizes", "Main risk"],
  comparisonRows: [
    {
      label: "Company-wide tool launch",
      cells: [
        "Fast account provisioning and a visible launch date.",
        "Seats look like adoption while workflows, context, and review practices remain undefined.",
      ],
    },
    {
      label: "Unstructured experimentation",
      cells: [
        "Individual freedom and rapid discovery by enthusiasts.",
        "Useful techniques stay private and results cannot be compared across the team.",
      ],
    },
    {
      label: "Workflow-first pilot",
      cells: [
        "One repeated task, shared context, and a measurable quality bar.",
        "It feels narrower at first, but produces reusable evidence for the next rollout.",
      ],
    },
  ],
  stepsTitle: "A six-step AI coding onboarding plan",
  stepsIntro:
    "Run the first cycle with a small group and one workflow. The goal is not maximum usage; it is a team playbook that another engineer can follow and improve.",
  steps: [
    {
      title: "Choose one repeated engineering task",
      body: "Pick work that happens often and has a reviewable output, such as writing a focused test, preparing a migration plan, explaining an unfamiliar module, or drafting release notes. Avoid a first pilot that requires broad production access.",
      output: "One task with a clear trigger, input, expected result, and owner.",
    },
    {
      title: "Capture the current baseline",
      body: "Run or review the task without the new workflow. Record the time, rework, common failure modes, and reviewer effort that matter to your team. A lightweight baseline is enough; invented precision is not.",
      output: "A before snapshot with one speed measure and one quality measure.",
    },
    {
      title: "Prepare a trusted context pack",
      body: "Give the agent only the conventions, examples, architecture notes, and constraints needed for the task. Keep the source versioned and remove secrets or stale instructions before the pilot.",
      output: "A small, reviewable context set with a named owner.",
    },
    {
      title: "Run the same fixture across the pilot",
      body: "Use a representative input and the same acceptance checks for each participant or tool. Let people vary their interaction, but preserve the task and review criteria so the team can compare outcomes.",
      output: "Comparable attempts with observed tool, context, and review differences.",
    },
    {
      title: "Turn the winning path into a playbook",
      body: "Write down when to use the workflow, the required context, the steps that mattered, the human review gate, and the failures that should stop execution. Keep it short enough to run again next week.",
      output: "A reusable team playbook linked to its canonical context and examples.",
    },
    {
      title: "Expand only after a second person succeeds",
      body: "Ask someone who did not design the pilot to run the playbook. If they cannot reproduce the result, repair the instructions before adding more tools, people, or workflows.",
      output: "A reproduced result, an explicit revision, or a decision to stop the rollout.",
    },
  ],
  templateTitle: "The minimum useful onboarding record",
  templateIntro:
    "Use this record for every pilot. It keeps the team focused on a workflow people can reproduce instead of a collection of disconnected tips.",
  templateFields: [
    { label: "Workflow", value: "The repeated task, trigger, input, and expected output." },
    { label: "Baseline", value: "Current time, rework, reviewer effort, and the most costly failure." },
    { label: "Context pack", value: "Versioned conventions, examples, constraints, and their owner." },
    { label: "Tool path", value: "The agent, environment, permissions, and setup actually tested." },
    { label: "Review gate", value: "The human decision that must happen before the output is used." },
    { label: "Success measure", value: "One adoption signal and one quality signal for the next cycle." },
  ],
  pitfallsTitle: "What makes AI coding onboarding stall",
  pitfalls: [
    {
      title: "Measuring seats instead of useful work",
      body: "Provisioning and logins show access. They do not show that a teammate completed a real workflow with an acceptable result.",
    },
    {
      title: "Teaching prompts without context",
      body: "A clever prompt cannot compensate for missing conventions, examples, architecture boundaries, or a clear definition of done.",
    },
    {
      title: "Optimizing only for speed",
      body: "Faster drafts can increase reviewer effort or defects. Pair a speed measure with a quality or rework measure.",
    },
    {
      title: "Keeping the best workflow personal",
      body: "If the playbook, context, and owner live only in one engineer’s setup, the team has not created an operating capability.",
    },
  ],
  checklist: [
    "The pilot starts from a repeated task, not a generic product demo.",
    "The current workflow has a lightweight speed and quality baseline.",
    "Context is versioned, scoped to the task, and free of secrets.",
    "Every participant uses the same fixture and acceptance checks.",
    "The playbook names its owner, review gate, and stop conditions.",
    "A second person reproduced the workflow before the rollout expanded.",
  ],
  sources: [
    {
      label: "IBM: Standardize AI code generation across a development team",
      href: "https://www.ibm.com/think/insights/standardize-ai-code-generation-across-your-development-team",
      note: "Discusses moving from individual AI coding use to shared team standards, context, governance, and reusable practices.",
    },
    {
      label: "LinkedIn Engineering: Contextual agent playbooks and tools",
      href: "https://www.linkedin.com/blog/engineering/ai/contextual-agent-playbooks-and-tools-how-linkedin-gave-ai-coding-agents-organizational-context",
      note: "Describes how organizational context and repeatable playbooks make coding agents more useful inside an engineering environment.",
    },
    {
      label: "OpenAI: Workspace agents in ChatGPT",
      href: "https://openai.com/index/introducing-workspace-agents-in-chatgpt/",
      note: "Shows the shift from personal AI use toward shared, governed agent workflows connected to team knowledge and tools.",
    },
  ],
  publishedAt: "2026-07-27",
  modifiedAt: "2026-07-27",
}

export const aiCodingGuidelinesTemplateGuide: GuideDefinition = {
  path: guidePaths.aiCodingGuidelinesTemplate,
  contentType: "guide",
  topics: [
    "AI coding tools",
    "workflow standardization",
    "team operations",
    "agent instructions",
  ],
  eyebrow: "AI coding standards",
  title: "AI coding guidelines template for engineering teams",
  description:
    "Use this AI coding guidelines template to define allowed work, trusted context, verification, human handoffs, and ownership for a team using coding agents.",
  intro:
    "A useful AI coding policy should make everyday engineering decisions easier. It should tell people and agents which work is appropriate, which context is authoritative, how output is verified, and when a human must take over. This template gives a small team a practical starting point without pretending one file can replace security, privacy, or legal review.",
  corePrinciple:
    "Keep universal rules short. Put detailed procedures in focused, testable playbooks.",
  problem:
    "Teams often jump from individual experimentation to one large policy document. The document mixes security boundaries, coding style, tool setup, prompts, and review advice until nobody knows which rule applies to the task in front of them. A layered model works better: stable boundaries for every workflow, repository or path instructions for local context, and focused playbooks for repeated tasks.",
  decisionTitle: "Separate guidance from enforcement",
  decisionIntro:
    "An instruction can shape behavior, but it does not guarantee compliance. Put conventions in readable guidance, encode objective invariants in automated checks, and use real permissions or sandboxing when an action must be impossible.",
  comparisonColumns: ["Layer", "Use it for", "What it cannot do alone"],
  comparisonRows: [
    {
      label: "Markdown instructions",
      cells: [
        "Purpose, conventions, trusted context, commands, examples, and task-specific guidance.",
        "Prevent a forbidden tool call, data transfer, or destructive action with certainty.",
      ],
    },
    {
      label: "Automated checks",
      cells: [
        "Tests, linters, type checks, policy checks, and other objective repository invariants.",
        "Judge requirements, intent, or risks that the team has not encoded into the check.",
      ],
    },
    {
      label: "Access controls",
      cells: [
        "Tool permissions, protected branches, sandbox boundaries, secrets, and production access.",
        "Teach the agent how to complete an allowed workflow well or verify its output quality.",
      ],
    },
  ],
  stepsTitle: "Build the guidelines in six passes",
  stepsIntro:
    "Start from a real workflow and the failures you need to prevent. The first version should be short enough to test this week and explicit enough that a teammate can tell when to stop.",
  steps: [
    {
      title: "Set the non-negotiable boundaries",
      body: "List prohibited data, destinations, credentials, production actions, and legal or security decisions. Name the approved escalation path. Do not hide these boundaries inside a general style guide.",
      output: "A short boundary section reviewed by the people who own security, privacy, and production access.",
    },
    {
      title: "Separate guidance by scope",
      body: "Keep rules that apply everywhere at the organization or repository level. Put directory-specific architecture notes near the relevant code, and move detailed task procedures into focused playbooks or skills.",
      output: "A small map showing which instruction source owns each kind of decision.",
    },
    {
      title: "Define the task contract",
      body: "For each repeated workflow, state the trigger, required inputs, expected output, allowed tools, and definition of done. A task contract is more actionable than a collection of prompt tips.",
      output: "One repeatable task with observable inputs, outputs, and stop conditions.",
    },
    {
      title: "Name authoritative context",
      body: "Point to the current architecture notes, conventions, examples, commands, and source files the agent should trust. Prefer links and scoped references over copying large documents into every instruction file.",
      output: "A minimal context pack with a canonical source and owner.",
    },
    {
      title: "Make verification and handoff explicit",
      body: "List the checks the agent can run, the evidence it must report, and the decisions a human still owns. Require a stop when permissions, requirements, sensitive data, or destructive effects are unclear.",
      output: "A verification checklist plus an unambiguous human handoff rule.",
    },
    {
      title: "Test, publish, and assign an owner",
      body: "Run the same representative fixture with the intended tools and a teammate who did not write the guidelines. Fix ambiguous instructions, publish the working version, and define the events that trigger review.",
      output: "A reproducible result, named owner, review date, and change trigger.",
    },
  ],
  templateTitle: "A copyable AI coding guidelines template",
  templateIntro:
    "Replace the brackets with your team’s reality. Delete sections that do not change a decision, and link repeated procedures to focused playbooks instead of expanding this file indefinitely.",
  templateFields: [
    {
      label: "Purpose and scope",
      value: "Who and which repositories or workflows these guidelines cover.",
    },
    {
      label: "Allowed work",
      value: "Tasks agents may perform and the permissions each task can use.",
    },
    {
      label: "Data boundaries",
      value:
        "Secrets, personal data, customer data, and destinations that are prohibited or restricted.",
    },
    {
      label: "Authoritative context",
      value: "Canonical conventions, architecture notes, commands, examples, and owners.",
    },
    {
      label: "Verification and handoff",
      value: "Required checks, evidence, stop conditions, and decisions reserved for humans.",
    },
    {
      label: "Ownership",
      value: "Maintainer, review date, and events that require the guidelines to be tested again.",
    },
  ],
  copyTemplate: `# AI-assisted development guidelines

Owner: [team or person]
Applies to: [repositories, paths, and workflows]
Last reviewed: [date]

## 1. Allowed work
- Agents may: [approved tasks]
- Agents may use: [approved tools and access]
- A human must approve: [decisions or effects]

## 2. Data and access boundaries
- Never provide: [secrets, personal data, customer data]
- Never send data to: [prohibited destinations]
- Stop when: [permission or identity is unclear]

## 3. Authoritative context
- Repository guidance: [canonical file or URL]
- Architecture and conventions: [canonical sources]
- Commands and fixtures: [tested sources]

## 4. Working rules
- Inspect the relevant code and instructions before editing.
- Keep changes inside the requested scope.
- Do not invent requirements, APIs, metrics, or compatibility claims.
- Report assumptions and conflicts before they affect the result.

## 5. Verification
- Run: [tests, type checks, linters, or review fixture]
- Confirm: [security, privacy, performance, or product checks]
- Report: [evidence required with the handoff]

## 6. Stop and hand off
Stop when the task requires [production access, destructive action,
unclear authority, sensitive data, or another team-owned decision].
Escalate to: [role or team]

## 7. Reusable workflows
For each repeated task, link one focused playbook or skill with its
trigger, inputs, output, tools, checks, canonical source, and owner.

## 8. Review triggers
Test these guidelines again when [tool, model, repository architecture,
permissions, regulation, or repeated failure] changes.`,
  pitfallsTitle: "What makes guidelines fail",
  pitfalls: [
    {
      title: "Turning policy into security theater",
      body: "A long list of warnings is not a control. Bind sensitive actions to real permissions, protected data paths, verification, and a named escalation owner.",
    },
    {
      title: "Loading every rule into every task",
      body: "Universal instructions should stay short. Path-specific context and task-specific playbooks reduce noise and make conflicts easier to find.",
    },
    {
      title: "Assuming one file works in every agent",
      body: "Instruction locations and supported features vary by product and surface. Keep the team rule canonical, then document and test each actual agent path.",
    },
    {
      title: "Publishing rules nobody has reproduced",
      body: "A plausible guideline is still a hypothesis. Run a representative fixture and ask a second person to follow it before treating it as the team workflow.",
    },
  ],
  checklist: [
    "The guidelines name their owner, scope, and review trigger.",
    "Sensitive data, access, and prohibited actions are explicit.",
    "Organization, repository, path, and task guidance are kept separate.",
    "Each repeated workflow has a trigger, expected output, and stop condition.",
    "Verification requires observable checks and a truthful handoff.",
    "A second teammate reproduced the workflow with the intended agent path.",
  ],
  sources: [
    {
      label: "GitHub: Support for custom instruction types",
      href: "https://docs.github.com/en/copilot/reference/custom-instructions-support",
      note: "Maps repository-wide, path-specific, agent, organization, and personal instruction support across Copilot surfaces.",
    },
    {
      label: "Anthropic: How Claude remembers your project",
      href: "https://code.claude.com/docs/en/memory",
      note: "Separates repository guidance from enforceable controls and documents scoped instruction files and modular rules.",
    },
    {
      label: "Google Cloud and DORA: AI Capabilities Model",
      href: "https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model",
      note: "Reports organizational capabilities associated with stronger AI-assisted software outcomes, including clear policy, small batches, and version control.",
    },
    {
      label: "OpenAI: Harness engineering",
      href: "https://openai.com/index/harness-engineering/",
      note: "Shows a small repository entrypoint, progressively disclosed guidance, and automated checks for important invariants.",
    },
    {
      label: "GitHub: Review AI-generated code",
      href: "https://docs.github.com/en/enterprise-cloud@latest/copilot/tutorials/review-ai-generated-code",
      note: "Recommends human review together with tests, static analysis, security checks, and validation against project requirements.",
    },
  ],
  publishedAt: "2026-07-27",
  modifiedAt: "2026-07-27",
}
