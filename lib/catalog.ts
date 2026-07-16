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
