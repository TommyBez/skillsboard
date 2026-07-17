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

export interface CatalogPage {
  skills: CatalogSkill[]
  page: number
  perPage: number
  hasMore: boolean
  source: "leaderboard" | "search" | "curated"
  view?: Exclude<CatalogView, "curated">
  query?: string
}

export const CATALOG_PAGE_SIZE = 24
export const SEARCH_PAGE_SIZE = 24
export const SEARCH_MAX_LIMIT = 96
