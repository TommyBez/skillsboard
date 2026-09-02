/**
 * Every published figure on /agent-skills-by-the-numbers, in one place.
 *
 * The page is dated and refreshed monthly. Keeping the numbers here rather
 * than in the copy or the JSX means a refresh is an edit to this file: change
 * `value`, change `measuredOn`, and the tables, the Markdown twin, the JSON-LD
 * dates, and the tests all move with it. Prose in `index.ts` never repeats a
 * figure it cannot reach from here.
 *
 * Rules for adding a row:
 *  - every figure comes from a source a reader can open. Nothing on this page
 *    is measured from this site's own instrumentation.
 *  - `sourceId` has to exist in `agentSkillsByTheNumbers.sources`, or the page
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
  /** What the figure counts, or for an install row, where the skill lives. */
  detail: string
  /** ISO date the figure was read from its source. */
  measuredOn: string
  /** Id of the entry in the page's source list. */
  sourceId: string
}

/** The day the refresh behind this revision read its sources. */
export const readOn = "2026-09-02" as const

/** How many agent products read a SKILL.md file, at two levels of evidence. */
export const clientDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "showcase-clients",
    label: "Products on the Agent Skills client showcase",
    value: "46",
    detail:
      "Agent products listed on the Client Showcase published with the Agent Skills specification, counted from the entries on the published page. Vendors list themselves there, so the figure records declared support rather than tested behavior, and it says nothing about how many people use the feature inside each product.",
    measuredOn: "2026-09-02",
    sourceId: "agentskills-clients",
  },
  {
    id: "documented-clients",
    label: "Of those, products whose own documentation states it",
    value: "11",
    detail:
      "Claude Code, the Claude apps and Claude API, Claude Cowork, Codex, Cursor, GitHub Copilot, VS Code, Gemini CLI, OpenCode, goose, and Amp. Each vendor's own published documentation was fetched and read on August 20, 2026, and the eleven rows sit in the register behind our compatibility matrix. The other thirty-five showcase entries were not checked at that level.",
    measuredOn: "2026-08-20",
    sourceId: "skillsboard-support-register",
  },
]

/** The size of the public directory of installable skills. */
export const directoryDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "skills-sh-total",
    label: "Skills on the public skills.sh directory",
    value: "9,704",
    detail:
      "The totalSkills figure the directory reports in its own home page data. A skill enters the count once somebody installs it at least once through the npx skills add command, and forks and copies are flagged as separate entries rather than merged into the original. A skill kept inside a company, passed around as a copied folder, or installed by pointing an agent straight at a repository never appears.",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
]

/**
 * The eight most installed skills on that directory, in its own order. The
 * only per-skill usage figures anyone publishes for this format.
 */
export const installDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "install-find-skills",
    label: "find-skills",
    value: "3,220,754",
    detail: "vercel-labs/skills, flagged official",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-grill-me",
    label: "grill-me",
    value: "1,037,417",
    detail: "mattpocock/skills",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-grill-with-docs",
    label: "grill-with-docs",
    value: "884,311",
    detail: "mattpocock/skills",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-improve-codebase-architecture",
    label: "improve-codebase-architecture",
    value: "849,307",
    detail: "mattpocock/skills",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-frontend-design",
    label: "frontend-design",
    value: "845,287",
    detail: "anthropics/skills, flagged official",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-tdd",
    label: "tdd",
    value: "821,677",
    detail: "mattpocock/skills",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-agent-browser",
    label: "agent-browser",
    value: "773,602",
    detail: "vercel-labs/agent-browser, flagged official",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
  {
    id: "install-setup-matt-pocock-skills",
    label: "setup-matt-pocock-skills",
    value: "757,707",
    detail: "mattpocock/skills",
    measuredOn: "2026-09-02",
    sourceId: "skills-sh",
  },
]

/**
 * The repositories the format is written against, and the attention they have
 * collected. Stars are a proxy for attention and for nothing else.
 */
export const repositoryDatapoints: readonly AdoptionDatapoint[] = [
  {
    id: "anthropic-skills-count",
    label: "Skills published in anthropics/skills",
    value: "19",
    detail:
      "Folders holding a SKILL.md under skills/ in Anthropic's reference repository, read from the git tree at commit 5304866. A twentieth SKILL.md sits under template/ and is a scaffold, so it is excluded. The same nineteen were there when we counted on August 18, 2026, so the first-party catalog is stable rather than growing.",
    measuredOn: "2026-09-02",
    sourceId: "anthropic-skills-repo",
  },
  {
    id: "claude-code-bundled",
    label: "Bundled skills documented in Claude Code",
    value: "15",
    detail:
      "Entries marked as a bundled skill in the Claude Code commands reference: batch, claude-api, code-review, dataviz, debug, design, design-sync, doctor, fewer-permission-prompts, loop, run, run-skill-generator, simplify, verify, and workflow-authoring. Thirteen were documented there on August 18, 2026, so this is the first-party count that moved.",
    measuredOn: "2026-09-02",
    sourceId: "claude-code-commands",
  },
  {
    id: "stars-superpowers",
    label: "GitHub stars, obra/superpowers",
    value: "280,721",
    detail:
      "A third-party skills framework and development methodology, and the most starred repository in this set. Read from the public GitHub REST API. A star records that somebody bookmarked a repository once, which is attention rather than installation, and it never expires.",
    measuredOn: "2026-09-02",
    sourceId: "github-rest-api",
  },
  {
    id: "stars-anthropic-skills",
    label: "GitHub stars, anthropics/skills",
    value: "173,173",
    detail:
      "Anthropic's reference repository for the format, the one holding the nineteen skills counted above. Read from the public GitHub REST API in the same pass as the other three repositories in this table.",
    measuredOn: "2026-09-02",
    sourceId: "github-rest-api",
  },
  {
    id: "stars-vercel-labs-skills",
    label: "GitHub stars, vercel-labs/skills",
    value: "30,228",
    detail:
      "The npx skills command line tool, which is what produces the install figures in the table above. Read from the public GitHub REST API. Its own find-skills is the most installed entry on the directory that tool feeds.",
    measuredOn: "2026-09-02",
    sourceId: "github-rest-api",
  },
  {
    id: "stars-agentskills-spec",
    label: "GitHub stars, agentskills/agentskills",
    value: "24,968",
    detail:
      "The repository holding the Agent Skills specification and the client showcase counted at the top of this page. Read from the public GitHub REST API. It is the least starred repository here and the one every other entry implements.",
    measuredOn: "2026-09-02",
    sourceId: "github-rest-api",
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

/** Columns for a table of counts. */
export const datapointColumns = [
  "Figure",
  "Value",
  "What it counts",
  "Read on",
] as const

/** Columns for the per-skill install table, where the detail is a repository. */
export const installColumns = [
  "Skill",
  "Installs",
  "Published from",
  "Read on",
] as const

/**
 * Datapoints whose detail column is a repository name rather than a sentence
 * about what the figure counts. The tests hold the others to a full sentence.
 */
export const shortDetailIds: ReadonlySet<string> = new Set(
  installDatapoints.map((datapoint) => datapoint.id),
)

/** Every datapoint the page publishes, in the order it publishes them. */
export const allDatapoints: readonly AdoptionDatapoint[] = [
  ...clientDatapoints,
  ...directoryDatapoints,
  ...installDatapoints,
  ...repositoryDatapoints,
]
