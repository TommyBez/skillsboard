import type { OgTemplateContent } from "@/lib/og/template"
import { agentSkillsByTheNumbersPath } from "@/lib/seo/agent-skills-by-the-numbers/types"
import {
  type EcosystemSnapshot,
  formatCount,
  formatDay,
  formatMonth,
  latestSnapshot,
  monthlyChange,
  snapshotDay,
  snapshotTime,
  topicChange,
} from "@/lib/seo/agent-skills-by-the-numbers/snapshots"
import { agentSkillsPath } from "@/lib/seo/agent-skills/types"
import { anthropicSkillsPath } from "@/lib/seo/anthropic-skills/types"
import { bestClaudeSkillsPath } from "@/lib/seo/best-claude-skills/types"
import { claudeSkillsPath } from "@/lib/seo/claude-skills/types"
import { type ComparePath, comparePaths } from "@/lib/seo/compare/types"
import { guidePaths, type GuidePath } from "@/lib/seo/guides/types"
import { manageAiSkillsPath } from "@/lib/seo/manage-ai-skills/types"
import { whereToFindClaudeSkillsPath } from "@/lib/seo/where-to-find-claude-skills/types"

export {
  agentSkillsByTheNumbersPath,
  type AgentSkillsByTheNumbersCtaPlacement,
  type AgentSkillsByTheNumbersPath,
} from "@/lib/seo/agent-skills-by-the-numbers/types"

export interface AgentSkillsByTheNumbersSource {
  /** Stable key referenced by the sections the source supports. */
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

/** One contextual link out of a section, rendered as a sentence. */
export interface AgentSkillsByTheNumbersInlineLink {
  lead: string
  label: string
  href:
    | GuidePath
    | ComparePath
    | typeof agentSkillsPath
    | typeof anthropicSkillsPath
    | typeof bestClaudeSkillsPath
    | typeof claudeSkillsPath
    | typeof manageAiSkillsPath
    | typeof whereToFindClaudeSkillsPath
  trail: string
}

export interface AgentSkillsByTheNumbersTableSection {
  title: string
  intro: string
  columns: readonly string[]
  rows: readonly {
    label: string
    cells: readonly string[]
  }[]
  /** Prose that follows the table, one paragraph per entry. */
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
    | typeof anthropicSkillsPath
    | typeof claudeSkillsPath
    | typeof whereToFindClaudeSkillsPath
  )[]
  eyebrow: string
  title: string
  /** Full document title, including the brand suffix. */
  seoTitle: string
  description: string
  /** The line under the headline that dates the figures. */
  dataNote: string
  intro: readonly string[]
  /** Answer-first summary of the snapshot, sized for extraction. */
  answer: string
  answerNotes: readonly string[]
  answerSourceIds: readonly string[]
  declarations: AgentSkillsByTheNumbersTableSection
  repositories: AgentSkillsByTheNumbersTableSection
  downloads: AgentSkillsByTheNumbersTableSection
  method: {
    title: string
    intro: string
    steps: readonly string[]
    sourceIds: readonly string[]
  }
  faq: readonly AgentSkillsByTheNumbersFaqEntry[]
  sources: readonly AgentSkillsByTheNumbersSource[]
  related: readonly AgentSkillsByTheNumbersRelatedLink[]
  closing: {
    title: string
    body: string
  }
  og: OgTemplateContent
  ogAlt: string
  publishedAt: string
  modifiedAt: string
}

const snapshot: EcosystemSnapshot = latestSnapshot
const readOn = snapshotDay(snapshot)
const readOnLabel = formatDay(readOn)
const usage = snapshot.declaredUsage
const topicsRead = snapshot.repositoryTopics
const months = snapshot.monthlyDownloads.months

function topicCount(topic: string): string {
  return formatCount(
    topicsRead.find((entry) => entry.topic === topic)?.repositories ?? 0,
  )
}

const readmeMatches = formatCount(usage.readmeMatches)
const downloadsLastMonth = formatCount(usage.npmDownloadsLastMonth)
const perProject = formatCount(usage.downloadsPerDeclaringProject)
const npmWindow = `${formatDay(usage.npmWindowStart)} to ${formatDay(usage.npmWindowEnd)}`

const firstMonth = months[0]
const stepIndex = months.reduce((best, month, index) => {
  if (index === 0) return best
  const growth = month.downloads / months[index - 1].downloads
  const bestGrowth = months[best].downloads / months[best - 1].downloads
  return !month.partial && growth > bestGrowth ? index : best
}, 1)
const stepMonth = months[stepIndex]
const beforeStep = months[stepIndex - 1]
const stepFactor = (stepMonth.downloads / beforeStep.downloads).toFixed(1)
const afterStep = months.filter(
  (month) => !month.partial && month.month > stepMonth.month,
)
const settledFloor = afterStep.reduce(
  (low, month) => (month.downloads < low.downloads ? month : low),
  afterStep[0] ?? stepMonth,
)
const settledPeak = afterStep.reduce(
  (high, month) => (month.downloads > high.downloads ? month : high),
  afterStep[0] ?? stepMonth,
)

export const agentSkillsByTheNumbers: AgentSkillsByTheNumbersDefinition = {
  path: agentSkillsByTheNumbersPath,
  contentType: "article",
  topics: [
    "agent skills statistics",
    "agent skills adoption",
    "skills cli downloads",
    "agent skills repositories",
  ],
  relatedGuidePaths: [
    agentSkillsPath,
    anthropicSkillsPath,
    whereToFindClaudeSkillsPath,
    guidePaths.installClaudeSkills,
  ],
  eyebrow: "By the numbers",
  title: "Agent skills by the numbers",
  seoTitle:
    "Agent Skills by the Numbers: Repositories, Declarations, and Downloads | Skills Board",
  description: `Three figures for the agent skills ecosystem, read on ${readOnLabel}: ${topicCount("agent-skills")} public repositories tagged agent-skills, about ${readmeMatches} public READMEs printing npx skills, and ${downloadsLastMonth} npm downloads of the same CLI in a month. Collected by a script in our repository and refreshed once a month.`,
  dataNote: `Snapshot read on ${readOnLabel}`,
  intro: [
    `Is the agent skills ecosystem growing, or are the download counts growing? On ${readOnLabel} the npm registry reported ${downloadsLastMonth} downloads of the \`${usage.npmPackage}\` CLI over the previous month, and GitHub code search returned about ${readmeMatches} public READMEs that print \`npx ${usage.npmPackage}\` as an install step. That is roughly ${perProject} downloads a month for each project that declares the CLI in public.`,
    `Three figures follow, each with the endpoint it came from and the day it was read: how many projects declare the CLI, how many public repositories file themselves under a skills topic, and what the download curve looks like month by month across 2026. A script in our repository writes one JSON file a month, and this page renders whichever months are committed.`,
    `This is the first monthly snapshot, so the tables report levels. From the next one on, each figure sits beside its movement since the month before.`,
  ],
  answer: `On ${readOnLabel}, GitHub carried ${topicCount("agent-skills")} public repositories tagged \`agent-skills\`, ${topicCount("claude-skills")} tagged \`claude-skills\`, and ${topicCount("claude-code-skills")} tagged \`claude-code-skills\`. About ${readmeMatches} public READMEs print \`npx ${usage.npmPackage}\`, while npm served ${downloadsLastMonth} downloads of that package in the month ending ${formatDay(usage.npmWindowEnd)}, a ratio of roughly ${perProject} downloads for every project that declares it.`,
  answerNotes: [
    `The 2026 download curve runs from ${formatCount(firstMonth.downloads)} in ${formatMonth(firstMonth.month)} to ${formatCount(stepMonth.downloads)} in ${formatMonth(stepMonth.month)}, then holds between ${formatCount(settledFloor.downloads)} and ${formatCount(settledPeak.downloads)} through the summer. The step from ${formatMonth(beforeStep.month)} to ${formatMonth(stepMonth.month)} is about ${stepFactor} times in a single month, which is the shape automated traffic tends to make. That reading is a hypothesis worth stating, and public data does not settle it either way.`,
    `The two GitHub endpoints report at different precisions, and the tables label which is which. Repository search returns an exact \`total_count\`. Code search rounds \`total_count\` into buckets of roughly four significant figures, so ${readmeMatches} marks a range rather than an exact register.`,
  ],
  answerSourceIds: ["github-repo-search", "github-code-search", "npm-point"],
  declarations: {
    title: "How many projects declare it",
    intro: `The install command for the \`${usage.npmPackage}\` CLI, published on npm by Vercel Labs from the vercel-labs/skills repository, is \`npx ${usage.npmPackage}\`. A public repository that prints that command in its README belongs to an author who expects a human to run it, which makes README matches the closest public proxy for stated use.`,
    columns: ["Measure", "Value", "Precision", "Read on"],
    rows: [
      {
        label: "READMEs printing the command",
        cells: [
          `About ${readmeMatches}`,
          "Bucketed by GitHub code search",
          readOnLabel,
        ],
      },
      {
        label: "npm downloads, last month",
        cells: [
          downloadsLastMonth,
          `Exact for the window npm reports, ${npmWindow}`,
          readOnLabel,
        ],
      },
      {
        label: "Downloads per declaring project",
        cells: [
          `About ${perProject}`,
          "Derived from the two rows above",
          readOnLabel,
        ],
      },
    ],
    notes: [
      `The ratio is where the two sides pull apart. One project that writes the command into its README corresponds to roughly a thousand package downloads a month, which is more traffic than a team of people running an installer would produce. A registry counts machines and a README records an intention, so the numerator and the denominator are drawn from different populations by construction.`,
      `Both figures carry a shape worth knowing. GitHub code search rounds its total into buckets, so about ${readmeMatches} marks a range rather than an exact register. The npm figure covers the window npm chose, ${npmWindow}, which is why it differs slightly from any calendar month in the series further down.`,
      `Code search reads public repositories that GitHub has indexed. Private repositories, packages documented on a website instead of a README, and monorepo subdirectories without a README of their own all sit outside the count.`,
    ],
    link: {
      lead: "If the command itself is new to you,",
      label: "the Agent Skills standard page",
      href: agentSkillsPath,
      trail: " covers what a skill is and which agents load one.",
    },
    sourceIds: ["github-code-search", "npm-point"],
  },
  repositories: {
    title: "How many repositories are tagged as skills",
    intro:
      "A GitHub topic is applied by the repository owner, so a topic count records how many authors decided their work belongs to the category. Repository search returns an exact total, so this is the count on the page with no rounding in it.",
    columns: ["Topic", "Public repositories", "Change", "Read on"],
    rows: topicsRead.map((entry) => ({
      label: entry.topic,
      cells: [
        formatCount(entry.repositories),
        topicChange(entry.topic),
        readOnLabel,
      ],
    })),
    notes: [
      "The three topics overlap. A repository can carry `agent-skills` and `claude-skills` at the same time, so the totals describe three labels rather than three populations, and adding them together produces a number that means nothing.",
      "What sits under a topic is mixed: individual skills, collections of skills, tooling that reads a SKILL.md, and repositories that added the topic to be found. The count measures how many people file work under the category, and it moves at the speed a person edits a repository.",
      "A single snapshot only gives a level. The curve appears from the second month on, which is why the script runs monthly and every month stays in the repository as its own file.",
    ],
    link: {
      lead: "For the repositories worth opening rather than counting,",
      label: "our register of Claude skills",
      href: bestClaudeSkillsPath,
      trail: " reads each one from its own SKILL.md.",
    },
    sourceIds: ["github-repo-search"],
  },
  downloads: {
    title: "Downloads month by month",
    intro: `The 2026 download curve for the \`${snapshot.monthlyDownloads.package}\` package, aggregated by calendar month from the npm daily range endpoint between ${formatDay(snapshot.monthlyDownloads.rangeStart)} and ${formatDay(snapshot.monthlyDownloads.rangeEnd)}.`,
    columns: ["Month", "Downloads", "Change on the month before"],
    rows: months.map((month, index) => ({
      label: formatMonth(month.month),
      cells: [formatCount(month.downloads), monthlyChange(months, index)],
    })),
    notes: [
      `${formatMonth(stepMonth.month)} is where the curve changes shape. Downloads went from ${formatCount(beforeStep.downloads)} to ${formatCount(stepMonth.downloads)} inside one month and then held in that band. A step of that size that stays at its new level is what automated traffic looks like: a package pulled into a widely copied template, a continuous integration job that installs on every run, or a registry mirror. Public download data carries no attribution, so the ${formatMonth(stepMonth.month)} step is recorded here as an open question.`,
      `The months before it behave differently. ${formatMonth(firstMonth.month)} through ${formatMonth(beforeStep.month)} runs from ${formatCount(firstMonth.downloads)} to ${formatCount(beforeStep.downloads)}, roughly doubling every month or two, at a scale a spreading command line tool can plausibly reach.`,
      "The last row covers a few days of a month that was still running when the snapshot was taken, which is why it sits far below the rows above it.",
    ],
    link: {
      lead: "Download counts say little about which skills a team ends up using, and",
      label: "our guide to choosing a first team skill",
      href: guidePaths.chooseFirstTeamSkill,
      trail: " works through that decision.",
    },
    sourceIds: ["npm-range"],
  },
  method: {
    title: "How these numbers are collected",
    intro:
      "Everything above comes from three public endpoints, read in one pass by `scripts/ecosystem-stats/collect.mjs` in our repository.",
    steps: [
      "Repository counts: `GET /search/repositories?q=topic:<topic>&per_page=1` on the GitHub API, once per topic. The `total_count` field on repository search is exact.",
      'README counts: `GET /search/code?q="npx skills" filename:README.md` on the same API. Code search quantizes `total_count` into buckets of roughly four significant figures, so that number is approximate and the table says so beside it.',
      "Downloads: `api.npmjs.org/downloads/point/last-month/skills` for the ratio, and `api.npmjs.org/downloads/range/2026-01-01:<today>/skills` aggregated by calendar month for the series.",
      `Snapshot: the run behind this page finished on ${readOnLabel} at ${snapshotTime(snapshot)} and was written to \`lib/seo/agent-skills-by-the-numbers/data/${snapshot.snapshot}.json\`.`,
      "Schedule: one snapshot a month, committed as its own JSON file. The page renders whichever months are in the folder, so the change column fills itself in from the second month onward.",
    ],
    sourceIds: [
      "github-repo-search",
      "github-code-search",
      "npm-point",
      "npm-range",
      "collector",
    ],
  },
  faq: [
    {
      question: `Do ${downloadsLastMonth} downloads a month mean that many people use agent skills?`,
      answer: `They do not. npm counts every fetch of the package, so one continuous integration pipeline installing it on each run can produce thousands of downloads by itself. The figure tracks machines rather than people. The count of about ${readmeMatches} public READMEs printing the command is the closer public proxy for how many projects a person chose it for.`,
    },
    {
      question: "How many public repositories are tagged as agent skills?",
      answer: `On ${readOnLabel}, GitHub returned ${topicCount("agent-skills")} public repositories carrying the \`agent-skills\` topic, ${topicCount("claude-skills")} carrying \`claude-skills\`, and ${topicCount("claude-code-skills")} carrying \`claude-code-skills\`. Owners apply topics themselves and one repository can carry several of them, so the three totals overlap and adding them together gives a number without a meaning.`,
    },
    {
      question: `Why did downloads jump ${stepFactor} times in ${formatMonth(stepMonth.month)}?`,
      answer: `Downloads moved from ${formatCount(beforeStep.downloads)} in ${formatMonth(beforeStep.month)} to ${formatCount(stepMonth.downloads)} in ${formatMonth(stepMonth.month)} and stayed near that level afterwards. A step that large inside a single month usually comes from automation, such as a package pulled into a widely copied template or a mirror on a schedule. Public data carries no attribution, so the cause stays an open question.`,
    },
  ],
  sources: [
    {
      id: "github-repo-search",
      label: "GitHub repository search API",
      href: "https://docs.github.com/en/rest/search/search#search-repositories",
      note: "Topic counts. `total_count` on this endpoint is exact.",
    },
    {
      id: "github-code-search",
      label: "GitHub code search API",
      href: "https://docs.github.com/en/rest/search/search#search-code",
      note: "README counts. `total_count` on this endpoint is quantized into buckets.",
    },
    {
      id: "npm-point",
      label: "npm downloads, last month, package skills",
      href: "https://api.npmjs.org/downloads/point/last-month/skills",
      note: "The single month figure used for the ratio, over the window npm reports.",
    },
    {
      id: "npm-range",
      label: "npm downloads, daily range, package skills",
      href: "https://api.npmjs.org/downloads/range/2026-01-01:2026-09-03/skills",
      note: "Daily counts, aggregated here by calendar month for the 2026 series.",
    },
    {
      id: "collector",
      label: "The collector script in our repository",
      href: "https://github.com/TommyBez/skillsboard/blob/main/scripts/ecosystem-stats/collect.mjs",
      note: "Reads the endpoints above and writes one JSON snapshot per month.",
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
      label: "Anthropic skills: the first-party catalog",
      href: anthropicSkillsPath,
      description:
        "Every skill Anthropic publishes itself, in three sets, with what each one does and where it loads.",
    },
    {
      label: "Where to find Claude skills",
      href: whereToFindClaudeSkillsPath,
      description:
        "The places a skill actually comes from, and what each one is good for.",
    },
    {
      label: "Claude skills vs plugins",
      href: comparePaths.skillsVsPlugins,
      description:
        "Two ways to extend Claude Code, and which one a given piece of work belongs in.",
    },
  ],
  closing: {
    title: "The skills your team actually uses",
    body: "Skills Board is the web app where a team keeps and shares its AI skills, and creating a library for your team is free.",
  },
  og: {
    eyebrow: "By the numbers",
    title: [{ text: "Agent skills" }, { text: "by the numbers", accent: true }],
    description: `${topicCount("agent-skills")} tagged repositories, about ${readmeMatches} READMEs printing the install command, and ${downloadsLastMonth} npm downloads in a month.`,
    contextLabel: "skillsboard.sh",
    chips: ["Public endpoints", "Refreshed monthly"],
    footnote: `Snapshot read on ${readOnLabel}`,
    variant: "ink",
  },
  ogAlt: `Agent skills by the numbers, a monthly snapshot from Skills Board read on ${readOnLabel}`,
  publishedAt: readOn,
  modifiedAt: readOn,
}

/** Guard: every section has to cite a source the page lists. */
const knownSourceIds = new Set(
  agentSkillsByTheNumbers.sources.map((source) => source.id),
)

for (const ids of [
  agentSkillsByTheNumbers.answerSourceIds,
  agentSkillsByTheNumbers.declarations.sourceIds,
  agentSkillsByTheNumbers.repositories.sourceIds,
  agentSkillsByTheNumbers.downloads.sourceIds,
  agentSkillsByTheNumbers.method.sourceIds,
]) {
  for (const id of ids) {
    if (!knownSourceIds.has(id)) {
      throw new Error(`Unknown source id on the statistics page: ${id}`)
    }
  }
}
