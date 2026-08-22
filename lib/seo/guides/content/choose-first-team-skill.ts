import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export const chooseFirstTeamSkillGuide: GuideDefinition = {
  path: guidePaths.chooseFirstTeamSkill,
  contentType: "guide",
  topics: ["team operations", "skill selection", "AI agent skills", "team onboarding"],
  relatedGuidePaths: [
    guidePaths.aiSkillUseCases,
    guidePaths.shareTeamSkills,
    guidePaths.onboardNewTeammateSkills,
  ],
  eyebrow: "First team skill",
  title: "How to choose the first AI agent skill for your team",
  seoTitle: "Choose Your Team’s First AI Agent Skill | Skills Board",
  description:
    "Evaluate AI agent skills with a selection scorecard, source review, disqualifier check, and teammate test before your team settles on one.",
  intro:
    "The best first skill is not the most impressive one in a catalog. It is the smallest repeatable workflow your team can inspect, test, and hand to a second teammate with a clear expected result. This guide turns that choice into an observable team decision.",
  answer:
    "Choose your first AI agent skill around one repeated team problem. Compare a small set of inspectable candidates, reject unsafe or opaque options, and test the winner on a representative task. Adopt it only after a second teammate reproduces the result.",
  answerLink: {
    lead: "For where the candidates come from in the first place, and what each source screens before it lists one, see",
    label: "Where to find Claude skills",
    href: whereToFindClaudeSkillsPath,
    trail: ".",
  },
  citations: {
    answer: ["openai-skills", "anthropic-agent-skills-sdk", "github-add-agent-skills"],
    decision: ["openai-skills", "anthropic-agent-skills-sdk", "github-add-agent-skills"],
  },
  corePrinciple:
    "Choose the repeated problem first. Validate the skill with a second teammate.",
  problem:
    "Popularity, novelty, and agent compatibility can help you discover candidates, but none proves that a skill solves your team’s problem. A useful first choice connects one recurring task to one inspectable source, one representative test, and one independent teammate handoff. That gives the team evidence it can use before expanding the library.",
  decisionTitle: "Choose the problem before the skill",
  decisionIntro:
    "Use popularity and agent support as filters, not as the decision. Set the scoring rule before reviewing candidates: no disqualifier and at least 8 of 10 points across problem fit, source inspectability, required access, reproducibility, and team setup.",
  comparisonColumns: ["Starting point", "What it optimizes", "Main risk"],
  comparisonRows: [
    {
      label: "Most popular skill",
      cells: [
        "Fast discovery and social proof from other users.",
        "Popularity may reflect a different workflow, risk profile, or team context.",
      ],
    },
    {
      label: "Agent-first choice",
      cells: [
        "A convenient setup path for the tool the selector already uses.",
        "The team may choose around one tool instead of the shared problem and expected result.",
      ],
    },
    {
      label: "Repeated problem first",
      cells: [
        "A measurable improvement to a task the team already performs.",
        "It requires a small test and honest review before the skill is shared.",
      ],
    },
  ],
  stepsAreSequential: true,
  stepsTitle: "A six-step selection test",
  stepsIntro:
    "Compare no more than three candidates for one real task. Reject unsafe or uninspectable options first, score the remainder, and hand only the winner to a teammate who did not select it.",
  steps: [
    {
      title: "Name one repeated problem",
      body: "Pick a task that already recurs, costs attention, and has a recognizable output. Write down the current approach and the failure you want the skill to prevent. Avoid broad goals such as ‘improve engineering’ that cannot be tested in one sitting.",
      output: "One sentence naming the trigger, current friction, and expected result.",
    },
    {
      title: "Build a shortlist of three or fewer",
      body: "Find candidates through trusted sources, catalogs, or teammate suggestions, then stop at three. Record each canonical source and claimed use case. A short list forces a real comparison and prevents popularity from becoming the default decision.",
      output: "A bounded candidate list tied to the same problem and expected result.",
    },
    {
      title: "Apply the disqualifier gate",
      body: "Read SKILL.md and every referenced script, template, example, and external tool. Reject a candidate when the source cannot be inspected, required access exceeds the task, data handling is unacceptable, or the instructions conceal a dependency the team cannot authorize.",
      output: "A pass or reject decision with the exact disqualifier, if any.",
    },
    {
      title: "Score the surviving candidates",
      body: "Give each candidate 0, 1, or 2 points for problem fit, source inspectability, least required access, reproducibility, and fit with the team’s actual setup. Use the rule set before comparison: a candidate needs at least 8 of 10 and no disqualifier.",
      output: "A comparable score with one sentence of evidence for every dimension.",
    },
    {
      title: "Run the winner on one fixture",
      body: "Use an input that resembles the team’s real work and define the acceptable output before running the skill. Record the exact commit or tag reviewed, the review date, the agent, and the setup. Skills Board surfaces the latest upstream files, so an upstream change requires another review.",
      output: "A before-and-after example with an observable pass or fail result and reviewed source state.",
    },
    {
      title: "Save and test the team handoff",
      body: "Save the winner in Skills Board with the visible source, score, review date, an honest note on what it is for, and a search tag. Invite a second teammate and ask them to choose the source, compatible install command, or ZIP path for their setup. Keep the entry only if they can find it and reproduce the expected result.",
      output: "One searchable entry plus an independent keep, revise, or reject result.",
    },
  ],
  stepsLink: {
    lead: "When no published candidate fits the problem you named, the next move is to write the skill yourself, which is the subject of",
    label: "how to write a SKILL.md file",
    href: guidePaths.writeSkillMd,
    trail: ".",
  },
  templateTitle: "First-skill selection scorecard",
  templateIntro:
    "Score evidence, not enthusiasm. A candidate is ready for the library only when the source is inspectable, the fixture passes, and another teammate can reproduce the path.",
  templateFields: [
    {
      label: "Repeated problem",
      value: "The task trigger, current friction, frequency, and expected output.",
    },
    {
      label: "Candidate source",
      value: "The canonical URL, reviewed commit or tag, review date, and exact instructions, scripts, permissions, and data paths inspected.",
    },
    {
      label: "Disqualifier gate",
      value: "Inspectable source, acceptable access and data handling, authorized dependencies, and no concealed setup requirement.",
    },
    {
      label: "Selection score",
      value: "0 to 2 points each for problem fit, inspectability, least access, reproducibility, and team setup, with an 8 of 10 threshold.",
    },
    {
      label: "Fixture and handoff",
      value: "The test input and result, invited teammate, access path chosen, and whether they reproduced it without private context.",
    },
    {
      label: "Decision",
      value: "Keep, revise, or reject, with an owner and the event that should trigger another review.",
    },
  ],
  copyTemplate: `# First AI agent skill scorecard

## Repeated problem
- Trigger: [when this task starts]
- Current friction: [time, inconsistency, or failure]
- Expected output: [observable result]
- Frequency: [how often the team does it]

## Candidate source
- Skill: [name]
- Canonical source: [URL]
- Reviewed commit or tag: [source state]
- Review date: [date]
- Instructions and supporting files reviewed: [yes/no plus notes]
- Scripts, permissions, and data paths reviewed: [yes/no plus notes]

## Disqualifier gate
- Complete source is inspectable: [yes/no]
- Required access fits the task: [yes/no]
- Data handling is acceptable: [yes/no]
- External dependencies are authorized and visible: [yes/no]
- Result: [pass/reject plus evidence]

## Selection score
- Problem fit: [0/1/2 plus evidence]
- Source inspectability: [0/1/2 plus evidence]
- Least required access: [0/1/2 plus evidence]
- Reproducibility: [0/1/2 plus evidence]
- Team setup fit: [0/1/2 plus evidence]
- Total: [0-10; threshold is 8 with no disqualifier]

## Representative fixture
- Test input: [realistic, non-sensitive example]
- Acceptable result: [pass criteria]
- Agent and setup tested: [observed path only]
- Result: [pass/fail plus evidence]

## Team entry
- Why we keep it: [specific reason]
- What remains untested: [limits]
- Upstream note: Skills Board surfaces the latest source files; re-review after changes.
- Search tag: [term a teammate will use]
- Owner: [person or team]

## Independent handoff
- Teammate invited: [name or role]
- Path chosen: [source, compatible command, or ZIP]
- Could they find and run it without private context? [yes/no]
- Second result: [pass/fail plus evidence]

## Decision
[Keep / revise / reject]
Review again when: [source, agent, permissions, or workflow changes]`,
  pitfallsTitle: "What weakens the first choice",
  pitfalls: [
    {
      title: "Starting from the leaderboard",
      body: "A leaderboard is useful for building the shortlist, but it cannot define your team’s repeated problem, clear a disqualifier, or supply an acceptable result.",
    },
    {
      title: "Reviewing only SKILL.md",
      body: "Supporting scripts, examples, templates, permissions, and external tools can change the behavior and risk score of the workflow.",
    },
    {
      title: "Letting the selector run both tests",
      body: "The author remembers context that the saved entry may not contain. A second teammate exposes missing setup and unclear language.",
    },
    {
      title: "Treating a save as certification",
      body: "The team entry makes a choice visible. It does not certify security, guarantee compatibility, or freeze the upstream source.",
    },
  ],
  checklist: [
    "The candidate solves one repeated problem with an observable expected result.",
    "The shortlist contains no more than three candidates for the same expected result.",
    "The complete source passed every disqualifier and the candidate scored at least 8 of 10.",
    "The test recorded a representative fixture, reviewed source state, date, and actual agent path.",
    "The Skills Board note explains the score, the reason to keep it, the limits, and the upstream re-review trigger.",
    "A second teammate found the entry and reproduced it, or the candidate was revised or rejected.",
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
      note: "Documents the SKILL.md structure, supporting files, discovery, and progressive loading used by Claude Agent SDK.",
    },
    {
      id: "github-add-agent-skills",
      label: "GitHub: Add agent skills",
      href: "https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills",
      note: "Documents skill folders, SKILL.md requirements, supporting resources, and repository-level sharing for Copilot coding agent.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · First team skill",
    title: [
      { text: "Choose your team’s" },
      { text: "first agent skill.", accent: true },
    ],
    description:
      "A practical scorecard to choose, review, test, and hand one useful skill to a second teammate.",
    contextLabel: "skillsboard.sh/guides",
    titleSize: 76,
    chips: ["Selection scorecard", "Team handoff test"],
  },
  ogAlt: "Skills Board guide: choose the first AI agent skill for your team.",
  publishedAt: "2026-07-28",
  modifiedAt: "2026-08-06",
}
