/**
 * Every published figure on /agent-skills-adoption, in one place.
 *
 * The page is dated and refreshed monthly. Keeping the numbers here rather
 * than in the copy or the JSX means a refresh is an edit to this file: change
 * `value`, change `measuredOn`, and the table, the Markdown twin, the JSON-LD
 * dates, and the tests all move with it. Prose in `index.ts` never repeats a
 * figure it cannot reach from here.
 *
 * Rules for adding a row:
 *  - `sourceId` has to exist in `agentSkillsAdoption.sources`, or the page
 *    fails its own test.
 *  - `measuredOn` is the day the figure was read, not the day it was written.
 *  - a figure that could not be read on refresh day is deleted, not carried
 *    forward with an old date.
 */

export interface AdoptionDatapoint {
  /** Stable key, used by the tests and by the prose that refers to a row. */
  id: string
  /** Row label in the table. */
  label: string
  /** The figure, already formatted for display. */
  value: string
  /** What the figure counts, and what it does not. */
  detail: string
  /** ISO date the figure was read from its source. */
  measuredOn: string
  /** Id of the entry in the page's source list. */
  sourceId: string
}

/** The window the server-log figures cover, in UTC. */
export const crawlWindow = {
  start: "2026-08-26",
  end: "2026-09-02",
  days: 7,
} as const

/** Counts that anyone can reproduce from a public first-party source. */
export const ecosystemDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "clients",
    label: "Clients on the showcase",
    value: "46",
    detail:
      "Agent products listed on the Client Showcase published with the Agent Skills specification. Vendor self-listing, not a test of whether each one loads a SKILL.md the same way.",
    measuredOn: "2026-09-02",
    sourceId: "agentskills-clients",
  },
  {
    id: "anthropic-skills",
    label: "Skills in anthropics/skills",
    value: "19",
    detail:
      "Folders with a SKILL.md under skills/ in the reference repository, read at commit 5304866. A twentieth SKILL.md sits under template/ and is a scaffold, so it is excluded.",
    measuredOn: "2026-09-02",
    sourceId: "anthropic-skills-repo",
  },
  {
    id: "anthropic-skills-change",
    label: "Change in that repository since August 18",
    value: "0",
    detail:
      "The same 19 folders were present when we counted them on August 18, 2026. The reference repository is not where the format is growing.",
    measuredOn: "2026-09-02",
    sourceId: "anthropic-skills-repo",
  },
  {
    id: "skills-sh-skills",
    label: "Skills on the skills.sh all-time leaderboard",
    value: "9,704",
    detail:
      "The skill count the all-time view of the public directory run by Vercel reports in its own page data, read on September 2, 2026. A skill enters it once somebody installs it through the npx skills add command, forks and copies are flagged rather than merged, and the trending view of the same site reported 9,922 the same day, so the figure moves with the view.",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "skills-sh-total",
    label: "Unlabelled total printed beside that leaderboard tab",
    value: "1,297,018",
    detail:
      "The number skills.sh prints as All Time (1,297,018) beside its own tab, with no unit given on the page or in its API reference. It is not a count of skills, because the same page data reports 9,704 of those, and it is not a sum of install counts, because the leaderboard's top skill alone reported 3,220,754 installs the same day. It is published here only so that nobody quotes it as a number of skills.",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
]

/**
 * Server-side request logs for skillsboard.sh. One event per page-route
 * invocation, so the counts are a floor rather than an exact request total.
 */
export const crawlerDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "ai-content-hits",
    label: "AI crawler requests for content",
    value: "690",
    detail:
      "Requests to a page path over seven days from 11 named AI crawlers: ChatGPT-User, PerplexityBot, OAI-SearchBot, Amazonbot, meta-externalagent, DuckAssistBot, GoogleOther, Claude-User, ClaudeBot, Bytespider, and GPTBot. Requests to /api/mcp and /.well-known are excluded, because those are protocol handshakes rather than reading.",
    measuredOn: "2026-09-02",
    sourceId: "posthog-log-drain",
  },
  {
    id: "search-content-hits",
    label: "Googlebot and bingbot requests for content",
    value: "117",
    detail:
      "The same window, the same path filter, the two classic search crawlers: bingbot 86, Googlebot 31.",
    measuredOn: "2026-09-02",
    sourceId: "posthog-log-drain",
  },
  {
    id: "ai-vs-search-ratio",
    label: "AI crawlers per classic search crawler request",
    value: "5.9x",
    detail:
      "690 divided by 117. On the same site over the week of August 18 to 25, 2026 the ratio was 9.3x, so it moves week to week and a single figure from a single site should not be read as a trend.",
    measuredOn: "2026-09-02",
    sourceId: "posthog-log-drain",
  },
  {
    id: "top-ai-crawler",
    label: "Busiest single AI crawler",
    value: "322",
    detail:
      "ChatGPT-User, the agent OpenAI sends when a user asks a question that needs a live page. It reads more of this site than Googlebot and bingbot together.",
    measuredOn: "2026-09-02",
    sourceId: "posthog-log-drain",
  },
  {
    id: "noise",
    label: "Requests excluded as noise",
    value: "23,365",
    detail:
      "Requests in the same window from a Codex MCP client stuck in an authentication retry loop against /api/mcp. It touches no page of content. Counted as AI crawling, it would have turned the ratio above into roughly 200 to 1, describing traffic that read no page.",
    measuredOn: "2026-09-02",
    sourceId: "posthog-log-drain",
  },
]

/**
 * Search demand as it reaches one small site. Absolute values are tiny by
 * design of the site, not of the market: the useful part is the shape.
 */
export const searchDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "impressions-july",
    label: "Google impressions, July 2026",
    value: "98",
    detail:
      "Impressions for skillsboard.sh across all queries, with 2 clicks. The site had a handful of pages about the format at that point.",
    measuredOn: "2026-09-02",
    sourceId: "gsc-search-analytics",
  },
  {
    id: "impressions-august",
    label: "Google impressions, August 2026",
    value: "3,919",
    detail:
      "Same property, same method, with 23 clicks and an average position of 23.4. Roughly 40 times July, on a base small enough that the multiple says more about the base than about the market.",
    measuredOn: "2026-09-02",
    sourceId: "gsc-search-analytics",
  },
  {
    id: "ai-impressions",
    label: "Impressions inside Google AI features",
    value: "226",
    detail:
      "Impressions in AI Overviews and AI Mode over three months, from the Search Console beta report that covers them. 210 of the 226, or 93 percent, fell in the last ten days of August. The report has no click column and is a beta.",
    measuredOn: "2026-08-31",
    sourceId: "gsc-ai-report",
  },
  {
    id: "ai-impressions-top-page",
    label: "Single page taking half of those",
    value: "114",
    detail:
      "The /claude-skills explainer, out of 16 pages with any AI-feature impression at all. The next page had 39.",
    measuredOn: "2026-08-31",
    sourceId: "gsc-ai-report",
  },
]

/** Table rows for a section, derived so a figure is written once. */
export function datapointRows(
  datapoints: readonly AdoptionDatapoint[],
): readonly { label: string; cells: readonly string[] }[] {
  return datapoints.map((datapoint) => ({
    label: datapoint.label,
    cells: [datapoint.value, datapoint.detail, datapoint.measuredOn],
  }))
}

export const datapointColumns = [
  "Figure",
  "Value",
  "What it counts",
  "Read on",
] as const

/** Every datapoint the page publishes, in the order it publishes them. */
export const allDatapoints: readonly AdoptionDatapoint[] = [
  ...ecosystemDatapoints,
  ...crawlerDatapoints,
  ...searchDatapoints,
]
