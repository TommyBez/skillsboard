import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const aiCodingGuidelinesTemplateGuide: GuideDefinition = {
  path: guidePaths.aiCodingGuidelinesTemplate,
  contentType: "guide",
  topics: [
    "AI coding tools",
    "workflow standardization",
    "team operations",
    "agent instructions",
  ],
  relatedGuidePaths: [
    guidePaths.aiCodingTeamOnboarding,
    guidePaths.aiSkillUseCases,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "AI coding standards",
  title: "AI coding guidelines template for engineering teams",
  seoTitle: "AI Coding Guidelines Template for Teams | Skills Board",
  description:
    "Use this AI coding guidelines template to define allowed work, trusted context, verification, human handoffs, and ownership for a team using coding agents.",
  intro:
    "A useful AI coding policy should make everyday engineering decisions easier. It should tell people and agents which work is appropriate, which context is authoritative, how output is verified, and when a human must take over. This template gives a small team a practical starting point without pretending one file can replace security, privacy, or legal review.",
  answer:
    "Effective AI coding guidelines separate short, universal boundaries from repository context and task-specific playbooks. Define permitted work, authoritative context, verification, human handoffs, and ownership. Then test the guidance on real work; one policy file cannot replace security or review.",
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
  og: {
    variant: "ink",
    eyebrow: "Guide · AI coding standards",
    title: [
      { text: "AI coding guidelines" },
      { text: "your team can run.", accent: true },
    ],
    description:
      "A copyable template for allowed work, trusted context, verification, human handoffs, and ownership.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["Copyable template", "6-step workflow"],
  },
  ogAlt: "Skills Board guide: AI coding guidelines template for engineering teams.",
  publishedAt: "2026-07-27",
  modifiedAt: "2026-08-06",
}
