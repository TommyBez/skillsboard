import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const aiCodingTeamOnboardingGuide: GuideDefinition = {
  path: guidePaths.aiCodingTeamOnboarding,
  contentType: "guide",
  topics: ["team onboarding", "AI coding tools", "workflow standardization", "mixed-agent teams"],
  relatedGuidePaths: [
    guidePaths.aiCodingGuidelinesTemplate,
    guidePaths.aiSkillUseCases,
    guidePaths.onboardNewTeammateSkills,
  ],
  eyebrow: "AI coding operations",
  title: "How to onboard your engineering team to AI coding tools",
  seoTitle: "AI Coding Team Onboarding Guide | Skills Board",
  description:
    "A practical AI coding team onboarding plan: choose one workflow, provide trusted context, set review gates, and measure adoption before expanding tool access.",
  intro:
    "Buying seats is not an onboarding strategy. Teams adopt AI coding tools when they can use them on a real task, with trusted context, clear review boundaries, and a visible definition of success. This guide turns an individual experiment into a repeatable team rollout.",
  answer:
    "Onboard an engineering team to AI coding tools around one recurring, reviewable workflow—not a feature tour. Give the pilot trusted context, explicit review gates, a shared fixture, and a clear definition of success. Expand only after a second engineer can repeat the workflow.",
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
  og: {
    variant: "ink",
    eyebrow: "Guide · AI coding operations",
    title: [
      { text: "Onboard your team to" },
      { text: "AI coding tools.", accent: true },
    ],
    description:
      "Start with one workflow, trusted context, clear review gates, and evidence another engineer can reproduce.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["6-step rollout", "Onboarding record"],
  },
  ogAlt: "Skills Board guide: how to onboard an engineering team to AI coding tools.",
  publishedAt: "2026-07-27",
  modifiedAt: "2026-08-06",
}
