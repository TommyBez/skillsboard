import type { OgTemplateContent } from "@/lib/og/template"

export const homeOgContent: OgTemplateContent = {
  eyebrow: "Skills selected by your team",
  title: [
    { text: "Your team’s skills." },
    { text: "All in one place.", accent: true },
  ],
  description:
    "Keep your team's AI skills in one searchable library and connect it to your agent through MCP.",
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

export const signUpOgContent: OgTemplateContent = {
  eyebrow: "Create your free account",
  title: [
    { text: "Start your team’s" },
    { text: "skill library today.", accent: true },
  ],
  description:
    "Collect your team's skills so colleagues can find them and install them in the setup they already use.",
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
    "Sign in with a one-time email code to open your team's skills library.",
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
    "A teammate wants to share their team's AI skills. Accept the invite to browse and install them in your setup.",
  contextLabel: "skillsboard.sh",
  chips: ["Claude", "Codex", "Cursor", "MCP"],
}
