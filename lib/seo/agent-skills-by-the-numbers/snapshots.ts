import september2026 from "@/lib/seo/agent-skills-by-the-numbers/data/2026-09.json" with { type: "json" }

/**
 * Monthly ecosystem snapshots for /agent-skills-by-the-numbers.
 *
 * `scripts/ecosystem-stats/collect.mjs` writes one JSON file per month into
 * `./data`. Adding a month means running the script and adding the import
 * below; everything downstream, including the change columns, follows from the
 * list. The module is written for N snapshots from the first one, so the
 * second month needs no change beyond the import.
 */

export interface EcosystemTopicCount {
  /** The GitHub topic, exactly as it is spelled on a repository. */
  topic: string
  /** Exact `total_count` from the repository search endpoint. */
  repositories: number
}

export interface EcosystemDeclaredUsage {
  query: string
  /**
   * Matching README files, not repositories: GitHub code search counts files,
   * so a repository with several matching READMEs is counted once for each.
   * Bucketed by code search rather than exact.
   */
  readmeMatches: number
  readmeMatchPrecision: "bucketed" | "exact"
  npmPackage: string
  npmDownloadsLastMonth: number
  npmWindowStart: string
  npmWindowEnd: string
  /** Downloads divided by matching README files, not by distinct projects. */
  downloadsPerMatchingReadme: number
}

export interface EcosystemMonth {
  /** `YYYY-MM`. */
  month: string
  downloads: number
  /** True while the month is still running on the day of the snapshot. */
  partial: boolean
}

export interface EcosystemMonthlyDownloads {
  package: string
  rangeStart: string
  rangeEnd: string
  months: readonly EcosystemMonth[]
}

export interface EcosystemSnapshot {
  /** `YYYY-MM`, matching the file name. */
  snapshot: string
  /** ISO timestamp of the collection run. */
  collectedAt: string
  repositoryTopics: readonly EcosystemTopicCount[]
  declaredUsage: EcosystemDeclaredUsage
  monthlyDownloads: EcosystemMonthlyDownloads
  notes: readonly string[]
}

/** Oldest first, so the last entry is always the current one. */
export const ecosystemSnapshots: readonly EcosystemSnapshot[] = [
  september2026 as EcosystemSnapshot,
].toSorted((left, right) => left.snapshot.localeCompare(right.snapshot))

export const latestSnapshot: EcosystemSnapshot =
  ecosystemSnapshots[ecosystemSnapshots.length - 1]

export const previousSnapshot: EcosystemSnapshot | undefined =
  ecosystemSnapshots.length > 1
    ? ecosystemSnapshots[ecosystemSnapshots.length - 2]
    : undefined

/** No comparison exists yet, and the change column says so in words. */
export const noComparisonYet = "First snapshot, no comparison yet"

const countFormatter = new Intl.NumberFormat("en-US")

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
})

/** `20783` becomes `20,783`. */
export function formatCount(value: number): string {
  return countFormatter.format(value)
}

/** `2026-01` becomes `January 2026`. */
export function formatMonth(month: string): string {
  return monthFormatter.format(new Date(`${month}-01T00:00:00Z`))
}

/** `2026-09-03` becomes `September 3, 2026`. */
export function formatDay(day: string): string {
  return dayFormatter.format(new Date(`${day.slice(0, 10)}T00:00:00Z`))
}

/** The calendar day a snapshot was collected, as a `YYYY-MM-DD` string. */
export function snapshotDay(snapshot: EcosystemSnapshot): string {
  return snapshot.collectedAt.slice(0, 10)
}

/** The clock time of a collection run, as `19:26 UTC`. */
export function snapshotTime(snapshot: EcosystemSnapshot): string {
  return `${snapshot.collectedAt.slice(11, 16)} UTC`
}

function repositoriesFor(
  snapshot: EcosystemSnapshot | undefined,
  topic: string,
): number | undefined {
  return snapshot?.repositoryTopics.find((entry) => entry.topic === topic)
    ?.repositories
}

/**
 * How a topic moved since the snapshot before it. With one snapshot committed
 * there is nothing to subtract from, so the column carries `noComparisonYet`
 * until a second month lands.
 */
export function topicChange(topic: string): string {
  const current = repositoriesFor(latestSnapshot, topic)
  const earlier = repositoriesFor(previousSnapshot, topic)

  if (current === undefined || earlier === undefined || !previousSnapshot) {
    return noComparisonYet
  }

  const difference = current - earlier
  const sign = difference >= 0 ? "+" : "minus "
  const since = formatMonth(previousSnapshot.snapshot)

  return `${sign}${formatCount(Math.abs(difference))} since ${since}`
}

/**
 * The line that tells a reader what a page built on `count` snapshots can and
 * cannot show. One snapshot only carries levels; from the second one on every
 * figure sits beside its movement.
 */

/** Each month beside the multiple it represents on the month before it. */
export function monthlyChange(
  months: readonly EcosystemMonth[],
  index: number,
): string {
  const month = months[index]

  if (month.partial) {
    return `Partial month, through ${formatDay(latestSnapshot.monthlyDownloads.rangeEnd)}`
  }

  if (index === 0) {
    return "First month in the range"
  }

  const earlier = months[index - 1]
  if (earlier.downloads === 0) {
    return noComparisonYet
  }

  return `${(month.downloads / earlier.downloads).toFixed(1)} times the month before`
}
