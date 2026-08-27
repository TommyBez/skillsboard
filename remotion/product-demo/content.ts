import { buildInstallCommand } from "@/lib/install-command";

/**
 * Every string that reaches the screen. Repositories and skill names are real
 * (`anthropics/skills` ships `pdf`, `docx` and `xlsx`), so nothing on screen
 * promises a source that does not exist.
 */

const SKILLS_REPO = "https://github.com/anthropics/skills";

export const hook = {
  /** Split by hand: an automatic wrap breaks after "is" and orphans the verb. */
  lines: [
    ["The", "best", "skill", "your", "team", "found"],
    ["is", "buried", "in", "a", "chat."],
  ],
  accentWord: "buried",
  chatter: [
    "have you seen that skill?",
    "i'll send it over later",
    "it's in my bookmarks somewhere",
  ],
} as const;

export const brand = {
  wordmark: "Skills Board",
  tagline: "Your team's skills. All in one place.",
  domain: "skillsboard.sh",
  closing: "One place for the skills your team chooses.",
} as const;

export const saveDialog = {
  title: "Save a skill",
  description:
    "Add its GitHub repository or direct skill link. Skills Board finds the installable skills and keeps the selected source, command, and ZIP together.",
  urlLabel: "GitHub repository or skill URL",
  url: SKILLS_REPO,
  listLabel: "Skills in this repository",
  discovered: [
    { name: "pdf", description: "Fill forms, extract tables, and generate PDF reports." },
    { name: "docx", description: "Read and write Word documents with tracked changes." },
    { name: "xlsx", description: "Build and edit spreadsheets, formulas included." },
  ],
  noteLabel: "Note for your team",
  note: "Use it for the board deck. It keeps table formatting intact.",
  promptLabel: "Example prompt",
  prompt: "Extract the tables from this quarterly report into a summary.",
  tagsLabel: "Tags",
  tags: "docs, reporting",
  submit: "Save a skill",
  toast: "Skill saved to your team library",
} as const;

export const cards = [
  {
    source: "anthropics/skills",
    metric: "1,204 stars",
    title: "PDF",
    description:
      "Fill forms, extract tables, and generate PDF reports from a document or a prompt.",
    note: saveDialog.note,
    prompt: saveDialog.prompt,
    tags: ["docs", "reporting"],
    addedBy: "Marta R.",
    command: buildInstallCommand(SKILLS_REPO, "pdf"),
  },
  {
    source: "anthropics/skills",
    metric: "1,204 stars",
    title: "DOCX",
    description: "Read and write Word documents with tracked changes and comments.",
    note: "Our contract redlines run through this one.",
    prompt: "Turn these meeting notes into a formatted brief.",
    tags: ["docs", "legal"],
    addedBy: "Sami K.",
    command: buildInstallCommand(SKILLS_REPO, "docx"),
  },
] as const;

/**
 * The query and the tag each have to change the result set, so the two steps
 * read as one narrowing: three skills → the two about reports → the one the
 * docs tag keeps.
 */
export const find = {
  label: "Search team library",
  placeholder: "Search by name, prompt, note, or tag",
  query: "report",
  tags: ["docs", "reporting", "legal", "finance"],
  activeTag: "docs",
  line: "Search by the task, then narrow by tag.",
  results: [
    {
      title: "PDF",
      source: "anthropics/skills",
      description: "Fill forms, extract tables, and generate PDF reports from a document.",
      tags: ["docs", "reporting"],
      addedBy: "Marta R.",
      matchesQuery: true,
      matchesTag: true,
    },
    {
      title: "DOCX",
      source: "anthropics/skills",
      description: "Read and write Word documents with tracked changes and comments.",
      tags: ["docs", "legal"],
      addedBy: "Sami K.",
      matchesQuery: false,
      matchesTag: true,
    },
    {
      title: "XLSX",
      source: "anthropics/skills",
      description: "Build spreadsheets and reporting models, formulas included.",
      tags: ["reporting", "finance"],
      addedBy: "Nina T.",
      matchesQuery: true,
      matchesTag: false,
    },
  ],
} as const;

export const handoff = {
  paths: ["Open source", "Copy install command", "Download ZIP"],
  line: "Same skill, any agent.",
  agents: ["Claude", "Codex", "Cursor"],
} as const;

export const collections = {
  line: "Group them the way your team works.",
  items: [
    { title: "Onboarding", from: "6 skills", to: "7 skills", members: ["docx", "xlsx"] },
    { title: "Contract review", from: "4 skills", to: "4 skills", members: ["docx"] },
  ],
} as const;

export const agent = {
  line: "Your agent reads the team library.",
  prompt: "which skill do we use for quarterly reports?",
  call: 'search_team_skills("quarterly report")',
  result: "PDF",
  resultMeta: "added by Marta R.",
  note: saveDialog.note,
  agents: handoff.agents,
} as const;

/** The landing-page loop: save → share → find, one beat each. */
export const teamLoop = {
  share: {
    line: "Now in your team library.",
    teammates: ["Marta R.", "Sami K.", "Nina T."],
  },
  find: {
    line: "Every teammate picks their own handoff.",
  },
} as const;
