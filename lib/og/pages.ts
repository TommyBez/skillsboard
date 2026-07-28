import type { OgTemplateContent } from "@/lib/og/template"

export const homeOgContent: OgTemplateContent = {
  eyebrow: "Skills selected by your team",
  title: [
    { text: "Your team’s skills." },
    { text: "All in one place.", accent: true },
  ],
  description:
    "Keep team-recommended AI skills in one searchable library and connect it to your agent through MCP.",
  chips: ["Claude", "Codex", "Cursor", "MCP"],
}

export const resourcesOgContent: OgTemplateContent = {
  eyebrow: "Guides & resources",
  title: [
    { text: "Playbooks for teams" },
    { text: "running AI skills.", accent: true },
  ],
  description:
    "Practical resources for sharing, reviewing, and managing reusable AI skills across your team and agent workflows.",
  contextLabel: "skillsboard.sh/resources",
  chips: ["Guides", "Workflows", "Templates"],
}

export const chooseFirstTeamSkillGuideOgContent: OgTemplateContent = {
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
}

export const shareTeamSkillsGuideOgContent: OgTemplateContent = {
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
}

export const manageCrossAgentSkillsGuideOgContent: OgTemplateContent = {
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
}

export const aiCodingTeamOnboardingGuideOgContent: OgTemplateContent = {
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
}

export const aiCodingGuidelinesTemplateGuideOgContent: OgTemplateContent = {
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
}

export const signUpOgContent: OgTemplateContent = {
  eyebrow: "Create your free account",
  title: [
    { text: "Start your team’s" },
    { text: "skill library today.", accent: true },
  ],
  description:
    "Collect the skills your team recommends so colleagues can find them and install them in the setup they already use.",
  contextLabel: "skillsboard.sh/sign-up",
  chips: ["Free forever", "Open source"],
  footnote: "No credit card required",
}

export const signInOgContent: OgTemplateContent = {
  eyebrow: "Welcome back",
  title: [
    { text: "Your team’s picks," },
    { text: "ready when you are.", accent: true },
  ],
  description:
    "Sign in with a one-time email code to open the shared library of skills your team recommends.",
  contextLabel: "skillsboard.sh/sign-in",
  chips: ["Claude", "Codex", "Cursor", "MCP"],
}

export const inviteOgContent: OgTemplateContent = {
  eyebrow: "Team invitation",
  title: [
    { text: "You’re invited to a" },
    { text: "shared skill library.", accent: true },
  ],
  description:
    "A teammate wants to share the AI skills their team recommends. Accept the invite to browse and install them in your setup.",
  contextLabel: "skillsboard.sh",
  chips: ["Claude", "Codex", "Cursor", "MCP"],
}
