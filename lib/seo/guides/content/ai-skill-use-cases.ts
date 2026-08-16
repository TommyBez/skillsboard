import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const aiSkillUseCasesGuide: GuideDefinition = {
  path: guidePaths.aiSkillUseCases,
  contentType: "guide",
  topics: ["AI agent skills", "team workflows", "use cases", "team operations", "AI coding tools"],
  relatedGuidePaths: [
    guidePaths.chooseFirstTeamSkill,
    guidePaths.shareTeamSkills,
    guidePaths.aiCodingGuidelinesTemplate,
  ],
  eyebrow: "Team skill use cases",
  title: "AI agent skill use cases for teams: 8 repeatable workflows",
  seoTitle: "AI Agent Skill Use Cases for Teams | Skills Board",
  description:
    "Explore eight practical AI agent skill use cases for teams, with clear triggers, safe inputs, reviewable outputs, human checks, and stop boundaries.",
  intro:
    "The most useful agent skills do not start as clever prompts. They start as recurring team workflows with recognizable inputs, a result someone can review, and enough stable guidance to help a second person repeat the work. These eight use cases show what that pattern looks like across engineering, product, research, design, and go-to-market work.",
  answer:
    "A strong AI agent skill captures a repeatable procedure with known inputs and a reviewable output. Good team use cases include pull-request preflight, release notes, bug triage, research synthesis, feedback triage, specification review, design and accessibility review, and launch QA. Keep accountable decisions human.",
  citations: {
    answer: ["openai-skills", "anthropic-agent-skills-sdk", "github-agent-skills"],
    decision: [
      "openai-skills",
      "anthropic-agent-skills-sdk",
      "github-agent-skills",
      "dora-ai-capabilities",
    ],
  },
  corePrinciple:
    "A skill-worthy use case repeats, starts from known inputs, and ends in a reviewable result.",
  problem:
    "Teams often collect broad ideas such as research assistant, coding helper, or marketing agent. Those labels hide the trigger, context, output, and human decision that make a workflow reusable. A useful use case is narrower: it names when the work starts, which approved sources the agent can use, what it must produce, and where a person must review or stop it.",
  decisionTitle: "Separate reusable workflows from one-off requests and human decisions",
  decisionIntro:
    "Use a skill when the procedure will recur and the output can be checked. Use a one-off prompt for temporary exploration. Keep consequential decisions with an authorized person even when a skill prepares evidence or a draft.",
  comparisonColumns: ["Work type", "Good fit", "Boundary"],
  comparisonRows: [
    {
      label: "Reusable skill",
      cells: [
        "A repeated trigger, bounded approved inputs, stable steps, a reviewable output, and a known reviewer.",
        "The skill prepares or verifies work; it does not erase permissions, source review, or human accountability.",
      ],
    },
    {
      label: "One-off prompt",
      cells: [
        "A temporary question, exploratory draft, or unusual task whose procedure is unlikely to repeat.",
        "Do not force a permanent workflow around an exception or store private context merely to make it reusable.",
      ],
    },
    {
      label: "Human-owned decision",
      cells: [
        "Approval, hiring, legal judgment, production access, customer commitments, or another accountable decision.",
        "A skill may organize evidence, but the authorized person keeps the decision and its consequences.",
      ],
    },
  ],
  stepsAreSequential: false,
  stepsTitle: "Eight practical team skill use cases",
  stepsIntro:
    "Treat these as workflow patterns, not claims that a particular public skill is available or approved. For each one, define the team's own sources, constraints, fixture, and reviewer before recommending an implementation.",
  steps: [
    {
      title: "Pull-request preflight",
      body: "Trigger the workflow when a focused change is ready for review. Give it the diff, repository instructions, and approved check commands. Ask for a concise summary of scope, failed checks, risky assumptions, and missing evidence, while keeping approval and merge with the reviewer.",
      output: "A review packet with changed behavior, check results, risks, and unresolved questions tied to repository evidence.",
    },
    {
      title: "Release-note drafting",
      body: "Start from merged changes, issue references, and the product's approved language. Produce a customer-safe draft that separates shipped behavior from internal implementation and flags anything unsupported by the source. A product owner reviews claims before publication.",
      output: "A scoped changelog draft with source links, audience language, and unsupported claims called out.",
    },
    {
      title: "Bug triage and reproduction planning",
      body: "Use an authorized report, relevant logs, and known environment details to extract observed behavior, expected behavior, reproduction steps, and missing information. Do not let the workflow invent a root cause or expose private diagnostics outside the approved context.",
      output: "A reproducible issue brief that separates observations, hypotheses, unknowns, and the next safe diagnostic step.",
    },
    {
      title: "Source-backed research synthesis",
      body: "Give the workflow a bounded question and an approved source set or search boundary. Require citations near each material claim, separate source facts from inference, preserve contradictions, and state what remains unproven instead of smoothing uncertainty away.",
      output: "A decision-ready research brief with attributable evidence, competing interpretations, and explicit unknowns.",
    },
    {
      title: "Customer-feedback triage",
      body: "Use only feedback the team is authorized to process, with personal or sensitive information removed when it is not needed. Group comments by the underlying job or friction, retain traceable evidence, and leave product priority and individual follow-up to the responsible team.",
      output: "A privacy-safe theme map with evidence counts, representative paraphrases, contradictions, and no invented customer conclusions.",
    },
    {
      title: "Product-spec completeness review",
      body: "Provide the current spec, product contract, dependencies, and acceptance format. Ask the workflow to find missing states, conflicting requirements, unowned decisions, and verification gaps. It should produce questions and checks, not silently choose product behavior.",
      output: "A structured gap review covering states, dependencies, acceptance criteria, owners, and open decisions.",
    },
    {
      title: "Design and accessibility review",
      body: "Supply the relevant interface, design-system rules, supported breakpoint, and named accessibility criteria. Ask for observable issues, evidence, severity, and a suggested check. A designer or engineer confirms context and owns any final design change.",
      output: "An evidence-based review list with affected elements, applicable rules, severity, and verification steps.",
    },
    {
      title: "Content and launch QA",
      body: "Start from a draft plus the current product-truth, brand, channel, and legal sources. Check claims, links, dates, voice, consent-sensitive language, and channel limits. Return corrections and unresolved approvals without publishing or inventing proof.",
      output: "A source-linked QA report with corrected copy, unsupported claims removed, and owner decisions still visible.",
    },
  ],
  templateTitle: "A compact team skill use-case brief",
  templateIntro:
    "Use one row per recurring workflow. Keep it small enough to compare across the team, and do not include secrets, unnecessary personal data, or unapproved customer material.",
  templateFields: [
    {
      label: "Trigger",
      value: "The recurring event that starts the workflow and how often it happens.",
    },
    {
      label: "Approved inputs",
      value: "The minimum authoritative sources, safe fixture, and data boundary the workflow needs.",
    },
    {
      label: "Reviewable output",
      value: "The exact artifact, format, and observable conditions for a useful result.",
    },
    {
      label: "Human checkpoint",
      value: "The person or role that verifies, approves, publishes, merges, sends, or decides.",
    },
    {
      label: "Stop boundary",
      value: "The permission, uncertainty, sensitive data, or consequential decision that ends autonomous work.",
    },
    {
      label: "Team recommendation",
      value: "The reviewed source, tested environment, owner, limits, and event that triggers another review.",
    },
  ],
  copyTemplate: `# Team skill use-case brief

Owner: [person or team]
Review date: [date]

## Workflow
- Use case: [specific repeated task]
- Trigger: [event that starts it]
- Frequency: [how often it occurs]
- Current friction: [failure, delay, or repeated effort]

## Approved inputs
- Authoritative sources: [files, URLs, systems, or records]
- Safe fixture: [representative input]
- Data that must not be used: [boundary]

## Reviewable output
- Artifact and format: [expected result]
- Acceptance checks: [observable conditions]
- Evidence required: [citations, commands, screenshots only when authorized, or logs]

## Human checkpoint
- Reviewer: [person or role]
- Decision they retain: [approval, merge, publication, send, or other effect]

## Stop boundary
- Stop when: [permission, requirement, sensitive data, or consequential decision is unclear]
- Escalate to: [owner]

## Recommendation record
- Canonical source: [URL and reviewed source state]
- Tested environment: [observed agent and setup]
- Known limits: [unsupported or untested behavior]
- Review trigger: [source, tool, policy, or workflow change]`,
  pitfallsTitle: "What weakens a use-case library",
  pitfalls: [
    {
      title: "Listing vague agent roles",
      body: "Researcher, coding assistant, and marketer are categories, not repeatable workflows. Name the trigger, source, output, and reviewer for each use case.",
    },
    {
      title: "Turning examples into availability claims",
      body: "A useful workflow pattern does not prove that a matching public skill exists, passed review, or works in the team's environment.",
    },
    {
      title: "Using sensitive data by default",
      body: "Customer feedback, logs, incidents, and internal research may contain protected material. Minimize, redact, or keep it outside the workflow when authorization is absent.",
    },
    {
      title: "Automating the accountable decision",
      body: "A skill can prepare evidence and drafts. It should not silently own approval, hiring, legal judgment, production access, publication, or customer commitments.",
    },
  ],
  checklist: [
    "Every use case has a recurring trigger and a bounded, team-relevant outcome.",
    "Approved sources and prohibited data are explicit before the workflow runs.",
    "The output has observable checks and a named human reviewer.",
    "The stop boundary preserves permissions and consequential decisions.",
    "Examples are presented as patterns, not as catalog availability or compatibility claims.",
    "A saved team recommendation records the reviewed source, tested setup, limits, owner, and review trigger.",
  ],
  sources: [
    {
      id: "openai-skills",
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Introduces skills as reusable workflows and starts skill creation from a repeatable task with a clear input and output.",
    },
    {
      id: "anthropic-agent-skills-sdk",
      label: "Anthropic: Agent Skills in the SDK",
      href: "https://code.claude.com/docs/en/agent-sdk/skills",
      note: "Documents SKILL.md, supporting resources, discovery, and the environment in which a reusable skill runs.",
    },
    {
      id: "github-agent-skills",
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes Agent Skills as folders of instructions, scripts, and resources that improve repeatable specialized tasks.",
    },
    {
      id: "dora-ai-capabilities",
      label: "Google Cloud and DORA: AI Capabilities Model",
      href: "https://cloud.google.com/blog/products/ai-machine-learning/introducing-doras-inaugural-ai-capabilities-model",
      note: "Connects stronger AI-assisted outcomes with clear policy, versioned work, user focus, and small, reviewable batches.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · Team skill use cases",
    title: [
      { text: "Eight workflows worth" },
      { text: "turning into skills.", accent: true },
    ],
    description:
      "Practical examples with clear triggers, safe inputs, reviewable outputs, human checks, and stop boundaries.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["8 use cases", "Copyable brief"],
  },
  ogAlt: "Skills Board guide: eight repeatable AI agent skill use cases for teams.",
  publishedAt: "2026-07-29",
  modifiedAt: "2026-08-06",
}
