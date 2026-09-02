import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsByTheNumbersPath } from "@/lib/seo/agent-skills-by-the-numbers/types"
import {
  allDatapoints,
  clientDatapoints,
  datapointColumns,
  datapointRows,
  directoryDatapoints,
  installColumns,
  installDatapoints,
  readOn,
  repositoryDatapoints,
} from "@/lib/seo/agent-skills-by-the-numbers/datapoints"
import { agentSkillsSupportPath } from "@/lib/seo/agent-skills-support/types"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  agentSkillsByTheNumbersPath,
  type AgentSkillsByTheNumbersCtaPlacement,
  type AgentSkillsByTheNumbersPath,
} from "@/lib/seo/agent-skills-by-the-numbers/types"

export interface AgentSkillsByTheNumbersSource {
  /** Stable key referenced by the sections and datapoints it backs. */
  id: string
  label: string
  href: string
  note: string
}

export interface AgentSkillsByTheNumbersFaqEntry {
  question: string
  answer: string
}

export interface AgentSkillsByTheNumbersRelatedLink {
  label: string
  href: string
  description: string
}

/**
 * One contextual link out of a section, rendered as a sentence. The href union
 * is the set of internal destinations this page is allowed to point at, so a
 * path that does not exist fails the build instead of shipping as a dead link.
 */
export interface AgentSkillsByTheNumbersInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof manageAiSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

/** One rendered table of figures. */
export interface AgentSkillsByTheNumbersTable {
  caption: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
}

/** One section of figures, with the prose and the sources behind it. */
export interface AgentSkillsByTheNumbersSection {
  title: string
  intro: string
  tables: readonly AgentSkillsByTheNumbersTable[]
  /** Prose that follows the tables, one paragraph per entry. */
  notes: readonly string[]
  link: AgentSkillsByTheNumbersInlineLink
  sourceIds: readonly string[]
}

export interface AgentSkillsByTheNumbersDefinition {
  path: typeof agentSkillsByTheNumbersPath
  contentType: "article"
  topics: readonly string[]
  relatedGuidePaths: readonly (
    | GuidePath
    | typeof agentSkillsPath
    | typeof agentSkillsSupportPath
    | typeof manageAiSkillsPath
    | typeof whereToFindClaudeSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** The dateline printed under the title and repeated in the Markdown twin. */
  dataNote: string
  /** Scannable positioning above the fold. */
  intro: readonly string[]
  /** Answer-first summary, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  clients: AgentSkillsByTheNumbersSection
  installs: AgentSkillsByTheNumbersSection
  repositories: AgentSkillsByTheNumbersSection
  notDocumented: {
    title: string
    intro: string
    entries: readonly {
      title: string
      body: string
    }[]
    sourceIds: readonly string[]
  }
  faq: readonly AgentSkillsByTheNumbersFaqEntry[]
  sources: readonly AgentSkillsByTheNumbersSource[]
  related: readonly AgentSkillsByTheNumbersRelatedLink[]
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

export const agentSkillsByTheNumbers: AgentSkillsByTheNumbersDefinition = {
  path: agentSkillsByTheNumbersPath,
  contentType: "article",
  topics: [
    "agent skills",
    "ecosystem data",
    "install counts",
    "statistics",
    "SKILL.md",
  ],
  relatedGuidePaths: [
    agentSkillsPath,
    agentSkillsSupportPath,
    whereToFindClaudeSkillsPath,
  ],
  eyebrow: "Ecosystem data",
  title: "Agent skills by the numbers",
  seoTitle: "Agent Skills by the Numbers | Skills Board",
  description:
    "Public, dated counts for the agent skills ecosystem with the source beside each one: 46 products on the official client showcase, 9,704 skills on the public skills.sh directory, and find-skills at 3,220,754 installs, all read on September 2, 2026.",
  dataNote: "Data as of September 2, 2026, refreshed monthly.",
  intro: [
    "Forty-six agent products now appear on the showcase published with the Agent Skills specification, the public skills.sh directory lists 9,704 skills, and one skill on that directory has passed 3.2 million installs. Those are the figures anyone can check today, and this page puts them in one place with the source and the reading date beside each one.",
    "Everything here is a public count: a published showcase page, a directory's own page data, a git tree, the GitHub REST API, and a vendor's own command reference. Nothing is estimated, and nothing comes from private telemetry.",
  ],
  answer:
    "On September 2, 2026 the Agent Skills client showcase listed 46 agent products, eleven of which document reading a SKILL.md file in their own published documentation. The public skills.sh directory reported 9,704 skills the same day, counting a skill once somebody has installed it at least once through the npx skills add command. The most installed entry on that directory is find-skills, published from vercel-labs/skills, at 3,220,754 installs.",
  answerNotes: [
    "The figures sit at different levels of checkability, and each table says which. A showcase page, a git tree, and a star count are things you can open and count yourself. The install figures come from one tool's telemetry, which sees a skill only after that tool installs it, so nothing on this page counts a skill that stays inside a company.",
    "Skills Board, the agent-native skills registry for teams, publishes this page and refreshes it monthly. A figure that cannot be read on refresh day is removed rather than carried forward with an old date.",
  ],
  answerSourceIds: [
    "agentskills-clients",
    "skillsboard-support-register",
    "skills-sh",
  ],
  clients: {
    title: "Products that read SKILL.md",
    intro:
      "The same population counted twice, at two levels of evidence, starting from the showcase published with the specification.",
    tables: [
      {
        caption:
          "Agent products listed as supporting the Agent Skills format, and the subset whose own documentation states it.",
        columns: [...datapointColumns],
        rows: datapointRows(clientDatapoints),
      },
    ],
    notes: [
      "The showcase is the most stable source on this page and the least informative about usage. A vendor appears once it says it reads SKILL.md, and it stays there whether one person or a million use the feature. It counts products on the supply side, not use on the demand side.",
      "The gap between 46 and 11 is the part worth reading. Thirty-five entries are on the list without anybody here having opened the vendor's own documentation, so the defensible statement is that at least eleven products publish instructions you can follow today, and the rest have told the showcase they belong on it.",
    ],
    link: {
      lead: "The eleven documented clients are unpacked one by one in",
      label: "which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      trail: ", with the exact directories each vendor names.",
    },
    sourceIds: [
      "agentskills-clients",
      "agentskills-spec",
      "skillsboard-support-register",
    ],
  },
  installs: {
    title: "Public skills and installs",
    intro:
      "The skills.sh directory is the only place anybody publishes a per-skill usage figure for this format, which makes it the strongest public adoption signal that exists and the one most worth reading carefully.",
    tables: [
      {
        caption:
          "The size of the public directory, and what its count includes.",
        columns: [...datapointColumns],
        rows: datapointRows(directoryDatapoints),
      },
      {
        caption:
          "The eight most installed skills on the directory, in its own order, read from its home page data on September 2, 2026.",
        columns: [...installColumns],
        rows: datapointRows(installDatapoints),
      },
    ],
    notes: [
      "These are telemetry from one tool. The directory sees a skill only when somebody runs npx skills add, so a team keeping skills in a private repository, copying a folder between machines, or pointing an agent straight at a GitHub URL contributes nothing to any figure in this section. Read the counts as a floor for public installable skills.",
      "An install is also not a use. The count records the moment a file landed on a disk. It cannot say whether an agent ever loaded the skill, whether the person kept it, or whether it helped, and it does not decrease when somebody deletes the file.",
      "One publisher holds five of the top eight. mattpocock/skills accounts for grill-me, grill-with-docs, improve-codebase-architecture, tdd, and setup-matt-pocock-skills. That is what a young distribution channel looks like: a small number of authors with an audience move most of the volume, and one popular bundle can reshape the order in a week.",
    ],
    link: {
      lead: "The catalogs these installs come from, and what each one screens, are covered in",
      label: "where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      trail: ".",
    },
    sourceIds: ["skills-sh", "skills-sh-api"],
  },
  repositories: {
    title: "Reference repositories",
    intro:
      "What the first-party catalogs hold, and how much attention the repositories behind the format have collected.",
    tables: [
      {
        caption:
          "First-party skill counts and public star counts for the four repositories the format is written against.",
        columns: [...datapointColumns],
        rows: datapointRows(repositoryDatapoints),
      },
    ],
    notes: [
      "The reference repository is worth watching because it barely moves. Anthropic published nineteen skills in anthropics/skills on August 18, 2026 and publishes the same nineteen today, while the set bundled into Claude Code went from thirteen to fifteen. Growth in this format is happening in other people's repositories, which is why a directory built on install telemetry lists thousands while the first-party catalog holds nineteen.",
      "Stars measure attention and nothing else. obra/superpowers carries more than ten times the stars of agentskills/agentskills, the repository holding the specification it implements. That tells you which repository people bookmark after reading about it, and nothing about which one runs on more machines.",
      "One thing worth tracking has no number yet. SEP-2640, the proposal to carry skills over the Model Context Protocol, was still an open draft on September 2, 2026, opened on April 23 and last updated on August 29 with 33 comments on the pull request. If it lands, these counts gain a second distribution channel to measure.",
    ],
    link: {
      lead: "What the specification in that last repository actually defines is covered in",
      label: "Agent Skills, the open standard",
      href: agentSkillsPath,
      trail: ".",
    },
    sourceIds: [
      "anthropic-skills-repo",
      "claude-code-commands",
      "github-rest-api",
      "agentskills-repo",
      "vercel-labs-skills-repo",
      "superpowers-repo",
      "mcp-sep-2640",
    ],
  },
  notDocumented: {
    title: "What none of this measures",
    intro:
      "Five questions this page does not answer, and the reason each one is out of reach.",
    entries: [
      {
        title: "How many agent skills exist",
        body: "No source counts them. The 9,704 on skills.sh is the largest public figure, and it sees a skill only after its own command line tool installs it, so private skills, copied folders, and skills installed straight from a repository URL are all missing, while a fork appears as an entry of its own. It is a floor for public installable skills, not a census.",
      },
      {
        title: "How many people use agent skills",
        body: "No vendor publishes it. Anthropic, OpenAI, Cursor, and the rest document that their products read SKILL.md and report nothing about how often. The showcase counts products, not seats. Any user figure in circulation is either a vendor's private number or somebody's estimate, and this page has neither.",
      },
      {
        title: "Whether an install means a skill gets used",
        body: "It does not. An install count records a file arriving on a disk. It cannot say whether an agent loaded the skill, whether the person kept it, or whether it changed any outcome, and it never goes down when somebody deletes the file.",
      },
      {
        title: "Whether stars mean adoption",
        body: "They do not. A star is a bookmark somebody left once, usually after reading about a repository rather than running it, and it never expires. Stars appear here because they are the only dated, public, cross-repository figure available, and they are labelled as attention for exactly that reason.",
      },
      {
        title: "Anything happening inside a company",
        body: "Every figure on this page counts something published. A skill in a private repository, a skill on one engineer's laptop, and a skill circulated inside a company are invisible to the showcase, to the directory, and to the star counts alike. A large share of real usage most likely sits there, and nothing public measures it.",
      },
    ],
    sourceIds: [
      "skills-sh",
      "skills-sh-api",
      "agentskills-clients",
      "github-rest-api",
    ],
  },
  faq: [
    {
      question: "How many agent skills exist?",
      answer:
        "No source counts them all. The largest public figure is the skills.sh directory, which reported 9,704 skills on September 2, 2026. It counts a skill once somebody installs it through its own command line tool, and counts forks separately, so private and hand-copied skills never appear in it.",
    },
    {
      question: "How many products support agent skills?",
      answer:
        "The client showcase published with the Agent Skills specification listed 46 agent products on September 2, 2026. Eleven of those publish documentation of their own that states they read a SKILL.md file, checked on August 20, 2026. The remaining thirty-five are vendor self-listings that nobody here has verified.",
    },
    {
      question: "What is the most installed agent skill?",
      answer:
        "On the public skills.sh directory it is find-skills, published from vercel-labs/skills, with 3,220,754 installs on September 2, 2026. Four more of the top eight come from mattpocock/skills, led by grill-me at 1,037,417. The figures count installs through one command line tool only.",
    },
    {
      question: "How many skills does Anthropic publish?",
      answer:
        "Nineteen in the anthropics/skills repository, counted as folders holding a SKILL.md under the skills directory at commit 5304866 on September 2, 2026. A twentieth is a template scaffold. Claude Code separately documents fifteen bundled skills in its commands reference, up from thirteen on August 18, 2026.",
    },
    {
      question: "How often is this page updated?",
      answer:
        "Monthly. Every figure was read from its source on September 2, 2026 and carries that date beside it. On each refresh the numbers are read again, and a figure whose source has become unreachable is deleted rather than carried forward with a stale date, so the page never ages quietly.",
    },
  ],
  sources: [
    {
      id: "agentskills-clients",
      label: "Agent Skills Client Showcase",
      href: "https://agentskills.io/clients",
      note: "The list of agent products that support the format, published with the specification. Counted from the published page on September 2, 2026.",
    },
    {
      id: "agentskills-spec",
      label: "Agent Skills specification",
      href: "https://agentskills.io/specification",
      note: "The format those clients implement, and what a file has to contain to be a skill at all.",
    },
    {
      id: "agentskills-repo",
      label: "agentskills/agentskills on GitHub",
      href: "https://github.com/agentskills/agentskills",
      note: "The repository holding the specification and the showcase. Star count read on September 2, 2026.",
    },
    {
      id: "skillsboard-support-register",
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: "https://www.skillsboard.sh/agent-skills-support",
      note: "Our own register of the eleven clients whose published documentation states they read SKILL.md, each vendor page fetched and read on August 20, 2026.",
    },
    {
      id: "skills-sh",
      label: "skills.sh, the agent skills directory",
      href: "https://www.skills.sh/",
      note: "The public directory run by Vercel. Its totalSkills figure and its per-skill install counts were read from the home page data on September 2, 2026.",
    },
    {
      id: "skills-sh-api",
      label: "skills.sh API reference",
      href: "https://www.skills.sh/docs/api",
      note: "States that the directory ranks skills by install count and flags forks and copies with an isDuplicate field rather than merging them.",
    },
    {
      id: "anthropic-skills-repo",
      label: "anthropics/skills on GitHub",
      href: "https://github.com/anthropics/skills",
      note: "Anthropic's reference repository. Skill folders counted from the git tree at commit 5304866 on September 2, 2026.",
    },
    {
      id: "claude-code-commands",
      label: "Claude Code commands reference",
      href: "https://code.claude.com/docs/en/commands",
      note: "Lists bundled skills alongside built-in commands and marks each one as a skill. Counted on September 2, 2026.",
    },
    {
      id: "github-rest-api",
      label: "GitHub REST API, repositories endpoint",
      href: "https://docs.github.com/en/rest/repos/repos",
      note: "The endpoint behind every star count on this page, read for all four repositories on September 2, 2026.",
    },
    {
      id: "vercel-labs-skills-repo",
      label: "vercel-labs/skills on GitHub",
      href: "https://github.com/vercel-labs/skills",
      note: "The npx skills command line tool that produces the install counts, and the source of the most installed skill in the table.",
    },
    {
      id: "superpowers-repo",
      label: "obra/superpowers on GitHub",
      href: "https://github.com/obra/superpowers",
      note: "A third-party skills framework, included because it is the most starred repository in this set by a wide margin.",
    },
    {
      id: "mcp-sep-2640",
      label: "SEP-2640: Skills Extension",
      href: "https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2640",
      note: "The open draft proposal to carry skills over the Model Context Protocol. Opened April 23, 2026, last updated August 29, 2026, still labelled draft when read on September 2, 2026.",
    },
  ],
  related: [
    {
      label: "Agent Skills: the open standard",
      href: agentSkillsPath,
      description:
        "What the specification defines, which agents implement it, and where each one looks on disk.",
    },
    {
      label: "Agent Skills support: which AI clients read SKILL.md",
      href: agentSkillsSupportPath,
      description:
        "The eleven documented clients as a compatibility matrix, with the directories each vendor names.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The catalogs and repositories these counts draw from, and what each one screens.",
    },
    {
      label: "Claude skills: what they are and how to write one",
      href: claudeSkillsPath,
      description:
        "The format behind every skill any of these sources counts, from frontmatter to installation.",
    },
    {
      label: "Manage AI skills across your organization",
      href: manageAiSkillsPath,
      description:
        "What each vendor's distribution mechanism covers, and the selection layer none of them records.",
    },
    {
      label: "Best Claude skills: a curated register",
      href: bestClaudeSkillsPath,
      description:
        "A worked example of counting carefully: entries read one by one against stated criteria.",
    },
    {
      label: "How to write a SKILL.md file",
      href: guidePaths.writeSkillMd,
      description:
        "The frontmatter fields and description rules behind every skill counted on this page.",
    },
  ],
  og: {
    eyebrow: "Ecosystem data",
    title: [{ text: "Agent skills" }, { text: "by the numbers", accent: true }],
    description:
      "46 products on the official client showcase, 9,704 skills on the public skills.sh directory, and one skill past 3.2 million installs. Public sources only, each one dated.",
    contextLabel: "skillsboard.sh",
    chips: ["Public sources", "Dated", "Refreshed monthly"],
    footnote: "Data as of September 2, 2026",
    variant: "ink",
  },
  ogAlt:
    "Agent skills by the numbers, a dated statistics page from Skills Board with the public source beside every figure.",
  publishedAt: "2026-09-02",
  modifiedAt: "2026-09-02",
}

/** Guard: every datapoint has to point at a source the page lists. */
const sourceIds = new Set(
  agentSkillsByTheNumbers.sources.map((source) => source.id),
)

for (const datapoint of allDatapoints) {
  if (!sourceIds.has(datapoint.sourceId)) {
    throw new Error(
      `Datapoint ${datapoint.id} cites an unknown source: ${datapoint.sourceId}`,
    )
  }
}

export { allDatapoints, readOn }
