import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const onboardNewTeammateSkillsGuide: GuideDefinition = {
  path: guidePaths.onboardNewTeammateSkills,
  contentType: "guide",
  topics: [
    "team onboarding",
    "AI agent skills",
    "skill sharing",
    "AI coding tools",
    "mixed-agent teams",
  ],
  relatedGuidePaths: [
    guidePaths.shareTeamSkills,
    guidePaths.chooseFirstTeamSkill,
    guidePaths.manageCrossAgentSkills,
  ],
  eyebrow: "New teammate handoff",
  title: "AI skills onboarding checklist for a new teammate",
  seoTitle: "AI Skills Onboarding Checklist for New Teammates | Skills Board",
  description:
    "Use this AI skills onboarding checklist to help a new teammate find one team-recommended skill, choose a suitable path, and verify it on a real task.",
  intro:
    "Onboarding a new teammate to AI skills should not begin with a catalog tour or a folder of setup notes. Give them one real task, one recommendation the team already uses, and enough context to choose a suitable path. The handoff works when they can find, inspect, and use the skill without private guidance.",
  answer:
    "Onboard a new teammate to AI skills with one real task and one reviewed recommendation—not a catalog tour. Give them the canonical source, a supported access path, the expected result, and clear safety boundaries. The handoff works when they can complete it without private guidance.",
  citations: {
    answer: ["openai-skills", "anthropic-agent-skills-sdk", "github-agent-skills"],
    decision: ["openai-skills", "anthropic-agent-skills-sdk", "github-agent-skills"],
    steps: {
      4: [
        "skills-board-repository",
        "openai-skills",
        "anthropic-agent-skills-sdk",
        "github-agent-skills",
      ],
    },
  },
  corePrinciple:
    "Give one teammate one real task and let them complete the handoff themselves.",
  problem:
    "An invitation, copied command, or installed file proves access, not useful onboarding. The teammate still needs to know which problem the skill addresses, why the team recommends it, where its latest source lives, and what a good result looks like. A bounded handoff makes each of those decisions visible and tests whether the recommendation works without the original author filling in missing context.",
  decisionTitle: "Choose a handoff that ends in independent use",
  decisionIntro:
    "A useful handoff gives the teammate enough context to make a real choice without doing the task for them. Use one existing recommendation, one representative fixture, and one observable result instead of treating account access or installation as completion.",
  comparisonColumns: ["Handoff model", "What the teammate receives", "Main risk"],
  comparisonRows: [
    {
      label: "Links in chat",
      cells: [
        "A direct link and a short explanation from an experienced teammate.",
        "The context disappears into conversation, and the next person has to ask again.",
      ],
    },
    {
      label: "Agent setup tour",
      cells: [
        "A working configuration and a walkthrough for one agent environment.",
        "Setup becomes the goal, and the handoff may not transfer to a teammate using another agent.",
      ],
    },
    {
      label: "Library-led handoff",
      cells: [
        "One findable recommendation, its visible source, available use paths, and a real test task.",
        "It requires a bounded first task and an honest result instead of a quick access check.",
      ],
    },
  ],
  stepsAreSequential: true,
  stepsTitle: "A six-step new teammate handoff",
  stepsIntro:
    "Assume the team library and at least one recommendation already exist. The new teammate should make the important discovery and usage decisions while an owner supplies the task, boundaries, and review criteria.",
  steps: [
    {
      title: "Choose one real first task",
      body: "Pick a task the teammate will actually encounter soon, with a clear input and reviewable output. Keep the first task narrow, free of sensitive data, and small enough to complete in one session. Define the acceptable result before introducing the skill.",
      output: "One task brief with a trigger, safe fixture, expected result, and reviewer.",
    },
    {
      title: "Prepare one team recommendation",
      body: "Choose one skill the team already recommends for that task. Confirm that its description, tags, original source, notes, and available use paths are current. Explain why it was selected without presenting the recommendation as a security review or compatibility guarantee.",
      output: "One complete, searchable recommendation tied to the first task.",
    },
    {
      title: "Invite the teammate and set the boundary",
      body: "Invite the teammate to the team library and explain the task, expected result, and human review point. Make the product contract explicit: Skills Board points to the latest source, and the teammate still needs to inspect that source and choose a path that fits their setup.",
      output: "Confirmed library access plus a short brief covering purpose, limits, and review.",
    },
    {
      title: "Ask them to find and inspect the skill",
      body: "Give the teammate the task language or expected tag, then let them search the library instead of sending a private deep link. Ask them to open the original source and review SKILL.md, supporting files, required tools, permissions, and data paths before use.",
      output: "An independently found recommendation with the relevant source and limits identified.",
    },
    {
      title: "Let them choose a path and test the skill",
      body: "The teammate opens the original source, copies a compatible install command, or downloads the latest files as a ZIP. If their agent supports MCP, they can use it to find the same recommendation and retrieve the command. After setting up the skill outside Skills Board, they run the safe fixture and compare the result with the acceptance criteria.",
      output: "One observed access and setup path, plus a pass, partial, or fail result from the fixture.",
    },
    {
      title: "Record the result and next step",
      body: "Capture the path and environment used, what the teammate could complete without help, and where the recommendation or setup was unclear. Keep, revise, or replace the recommendation, then name the owner and the source, agent, or workflow change that should trigger another review.",
      output: "A handoff decision with evidence, an owner, and a review trigger.",
    },
  ],
  templateTitle: "New teammate AI skills handoff checklist",
  templateIntro:
    "Use one copy per teammate and first workflow. Record only the context needed to improve the handoff, and keep personal or sensitive information out of the checklist.",
  templateFields: [
    {
      label: "First task",
      value: "The trigger, safe fixture, expected output, and person who will review the result.",
    },
    {
      label: "Team recommendation",
      value: "The skill, why the team recommends it, its search tags, source, and known limits.",
    },
    {
      label: "Access and boundary",
      value: "Library access, allowed data and tools, human review point, and explicit stop conditions.",
    },
    {
      label: "Independent discovery",
      value: "The task language used to search and whether the teammate found the recommendation without a private link.",
    },
    {
      label: "Use path and fixture",
      value: "The source, compatible command, or ZIP path chosen; whether MCP helped find it; and the observed fixture result.",
    },
    {
      label: "Outcome and owner",
      value: "Keep, revise, or replace, with gaps, next action, owner, and review trigger.",
    },
  ],
  copyTemplate: `# New teammate AI skills handoff

Owner: [person or team]
Teammate role: [role, not personal data]
Handoff date: [date]

## 1. First task
- Trigger: [when this task starts]
- Safe fixture: [representative, non-sensitive input]
- Expected output: [observable result]
- Reviewer: [person or role]

## 2. Team recommendation
- Skill: [name]
- Why the team recommends it: [specific task fit]
- Search terms or tags: [terms the teammate should try]
- Original source: [canonical URL]
- Known limits: [what is untested or unsupported]

## 3. Access and boundary
- Team library access confirmed: [yes/no]
- Allowed tools and data: [scope]
- Human review point: [decision before use]
- Stop when: [permission, data, or requirement is unclear]
- Reminder: a saved skill is a team recommendation, not a security review or compatibility guarantee.

## 4. Independent discovery and review
- Found without a private link: [yes/no]
- Source files inspected: [SKILL.md, scripts, references, templates]
- Required permissions and data paths understood: [yes/no plus notes]
- Latest-source behavior understood: [yes/no]

## 5. Use path and fixture
- Path chosen: [source / compatible command / ZIP]
- Found through MCP: [yes/no/not applicable]
- Agent and environment: [observed setup]
- Acceptance criteria: [pass conditions]
- Result: [pass / partial / fail plus evidence]

## 6. Outcome and follow-up
- What worked without help: [evidence]
- What was unclear: [gap]
- Decision: [keep / revise / replace]
- Next action and owner: [action]
- Review again when: [source, agent, permissions, or workflow changes]`,
  pitfallsTitle: "What weakens a new teammate handoff",
  pitfalls: [
    {
      title: "Showing the whole catalog",
      body: "A long list shifts the work of choosing onto the newest person. Start with one real task and one recommendation the team can explain.",
    },
    {
      title: "Completing the handoff for them",
      body: "A deep link, copied setup, and guided run can hide gaps in search terms, source notes, and instructions. Let the teammate complete the important steps.",
    },
    {
      title: "Treating recommendation as approval",
      body: "A saved skill records the team’s choice. It does not certify security, guarantee compatibility, or preserve the exact upstream version someone used before.",
    },
    {
      title: "Stopping at installation",
      body: "A command completing or a ZIP downloading does not prove useful work. End the handoff with a representative task and a reviewed result.",
    },
  ],
  checklist: [
    "The handoff starts with one real task, safe fixture, expected result, and reviewer.",
    "One team recommendation has current tags, notes, source, use paths, and known limits.",
    "The teammate has library access and understands the data, tool, and human review boundaries.",
    "The teammate found the recommendation by task or tag and inspected its original source.",
    "The teammate chose a suitable use path and ran the fixture in their actual environment.",
    "The team recorded the result, remaining gap, decision, owner, and review trigger.",
  ],
  sources: [
    {
      id: "skills-board-repository",
      label: "Skills Board: Open-source repository",
      href: "https://github.com/TommyBez/skillsboard",
      note: "Documents the team library, source visibility, available handoff paths, recommendation limits, and optional MCP access implemented by Skills Board.",
    },
    {
      id: "openai-skills",
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Introduces skills as reusable workflows and starts skill design from a repeatable task with a clear input and output.",
    },
    {
      id: "anthropic-agent-skills-sdk",
      label: "Anthropic: Agent Skills in the SDK",
      href: "https://code.claude.com/docs/en/agent-sdk/skills",
      note: "Documents SKILL.md, supporting files, skill discovery, and the environment in which a skill runs.",
    },
    {
      id: "github-agent-skills",
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes the open Agent Skills standard and the repository and personal locations supported by Copilot coding agent.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · New teammate handoff",
    title: [
      { text: "Onboard one teammate" },
      { text: "through one useful skill.", accent: true },
    ],
    description:
      "A copyable checklist for finding, inspecting, testing, and improving one team-recommended skill handoff.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["Copyable checklist", "Independent handoff"],
  },
  ogAlt: "Skills Board guide: onboard a new teammate through one useful AI skill.",
  publishedAt: "2026-07-29",
  modifiedAt: "2026-08-06",
}
