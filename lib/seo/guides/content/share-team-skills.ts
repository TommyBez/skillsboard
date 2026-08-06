import { guidePaths, type GuideDefinition } from "@/lib/seo/guides/types"

export const shareTeamSkillsGuide: GuideDefinition = {
  path: guidePaths.shareTeamSkills,
  contentType: "guide",
  topics: ["team operations", "skill sharing", "governance", "mixed-agent teams"],
  relatedGuidePaths: [
    guidePaths.manageCrossAgentSkills,
    guidePaths.chooseFirstTeamSkill,
    guidePaths.onboardNewTeammateSkills,
  ],
  eyebrow: "Team skill operations",
  title: "How to share AI agent skills with your team",
  seoTitle: "How to Share AI Agent Skills With Your Team | Skills Board",
  description:
    "A practical workflow to share AI agent skills across a team, set ownership, compare distribution models, and keep one visible team recommendation library.",
  intro:
    "Sharing a skill is easy. Making it inspectable, discoverable, and reusable by the next teammate is the real job. This guide gives you a lightweight operating model that works whether your team uses one agent or several.",
  answer:
    "Share an agent skill through one versioned canonical source and one visible team recommendation. Record its purpose, owner, reviewed setup paths, and status. Test the agent paths teammates use, then link to the source instead of copying SKILL.md into multiple places.",
  citations: {
    answer: ["openai-skills", "anthropic-skills", "github-agent-skills"],
    decision: ["openai-skills", "anthropic-skills", "github-agent-skills"],
    steps: {
      4: ["openai-skills", "anthropic-skills", "github-agent-skills"],
    },
  },
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
    { label: "Use paths", value: "Source, install command, ZIP, connected-agent search through MCP, or agent-specific instructions that actually exist." },
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
      id: "openai-skills",
      label: "OpenAI: Using skills",
      href: "https://openai.com/academy/skills/",
      note: "Defines skills as reusable workflows and SKILL.md as a portable, versionable playbook.",
    },
    {
      id: "anthropic-skills",
      label: "Anthropic: Extend Claude with skills",
      href: "https://code.claude.com/docs/en/slash-commands",
      note: "Documents skill structure, discovery, sharing, invocation, and supporting resources in Claude Code.",
    },
    {
      id: "github-agent-skills",
      label: "GitHub: About agent skills",
      href: "https://docs.github.com/en/copilot/concepts/agents/about-agent-skills",
      note: "Describes the open Agent Skills standard and repository or personal skill locations supported by Copilot.",
    },
  ],
  og: {
    variant: "ink",
    eyebrow: "Guide · Team skill operations",
    title: [
      { text: "Share agent skills" },
      { text: "with your team.", accent: true },
    ],
    description:
      "A practical workflow to share AI agent skills, set ownership, compare distribution models, and keep one trusted library.",
    contextLabel: "skillsboard.sh/guides",
    chips: ["6-step workflow", "Skill record template"],
  },
  ogAlt: "Skills Board guide: how to share AI agent skills with your team.",
  publishedAt: "2026-07-22",
  modifiedAt: "2026-08-06",
}
