export interface CatalogSkill {
  id: string
  name: string
  slug: string
  description: string
  source: string
  owner: string
  repo: string
  installUrl: string
  installs: number
  isDuplicate?: boolean
}

export interface CatalogSkillDetail {
  id: string
  source: string
  slug: string
  name: string
  description: string
  installs: number
}

/** skills.sh detail ids are `{source}/{slug}` (slash-delimited, no "."/".." segments). */
const SKILL_ID_PATTERN = /^(?!.*(?:^|\/)\.\.?(?:\/|$))[\w.-]+(?:\/[\w.-]+)+$/

export function isCatalogSkillId(value: string) {
  return value.length <= 200 && SKILL_ID_PATTERN.test(value)
}

export function catalogSkillDetailId(source: string, slug: string) {
  return `${source}/${slug}`
}

export type CatalogView = "trending" | "hot" | "all-time" | "curated"

/** One block of a paged catalog listing. */
export interface CatalogPageWindow {
  skills: CatalogSkill[]
  page: number
  perPage: number
  hasMore: boolean
}

export interface CatalogPage extends CatalogPageWindow {
  source: "leaderboard" | "search" | "curated"
  view?: CatalogView
  query?: string
}

export const CATALOG_PAGE_SIZE = 24
/** The largest block a single catalog page request may ask for. */
export const CATALOG_MAX_PAGE_SIZE = 100
export const SEARCH_PAGE_SIZE = 24
export const SEARCH_MAX_LIMIT = 96

/** Clamp a requested page and page size to the bounds every catalog listing serves. */
export function clampCatalogPageRequest(page: number, perPage: number) {
  return {
    page: Number.isFinite(page) ? Math.max(0, Math.floor(page)) : 0,
    perPage: Number.isFinite(perPage)
      ? Math.min(CATALOG_MAX_PAGE_SIZE, Math.max(1, Math.floor(perPage)))
      : CATALOG_PAGE_SIZE,
  }
}

/**
 * Drop repeated ids from a fully loaded listing, keeping the first occurrence
 * and otherwise the order the listing arrived in. Pages are cut from that
 * order as given, so each listing keeps its own ranking (the curated view
 * keeps the curator's order) and consecutive pages neither overlap nor skip.
 */
export function dedupeCatalogSkills(skills: CatalogSkill[]): CatalogSkill[] {
  const seen = new Set<string>()
  return skills.filter((skill) => {
    if (seen.has(skill.id)) return false
    seen.add(skill.id)
    return true
  })
}

/**
 * Cut one page out of a listing that is held in full, in the order given, so
 * it is served in the same blocks as the paged upstream views. One row past
 * the page is read to decide whether another page follows.
 */
export function paginateCatalogSkills(
  skills: CatalogSkill[],
  page = 0,
  perPage = CATALOG_PAGE_SIZE,
): CatalogPageWindow {
  const bounds = clampCatalogPageRequest(page, perPage)
  const start = bounds.page * bounds.perPage
  const rows = skills.slice(start, start + bounds.perPage + 1)

  return {
    skills: rows.slice(0, bounds.perPage),
    page: bounds.page,
    perPage: bounds.perPage,
    hasMore: rows.length > bounds.perPage,
  }
}
