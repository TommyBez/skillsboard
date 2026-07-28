import { SearchIcon } from "lucide-react"

import styles from "@/components/landing/sections/product-slab.module.css"

const rows = [
  {
    name: "code-review",
    owner: "acme/engineering-skills",
    summary: "Review PRs for correctness, style, and missing tests.",
    tags: ["review", "ci"],
  },
  {
    name: "pdf-extraction",
    owner: "anthropics/skills",
    summary: "Pull text, tables, and metadata from PDF documents.",
    tags: ["documents"],
  },
  {
    name: "brand-voice",
    owner: "acme/brand-kit",
    summary: "Rewrite copy to match the team brand voice guide.",
    tags: ["writing", "brand"],
  },
  {
    name: "sql-migrations",
    owner: "drizzle-team/skills",
    summary: "Draft safe schema migrations and rollback plans.",
    tags: ["database"],
  },
] as const

/**
 * The evidence module. Linear beat us here: it puts real product surface in
 * every module, and we showed the product nowhere. Synthetic library contents,
 * real library chrome.
 */
export function ProductSlab() {
  return (
    <section aria-labelledby="product-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>The library</p>
          <h2 id="product-heading" className={styles.heading}>
            Everything the team saved, in one searchable place.
          </h2>
        </div>

        <div className={styles.slab} aria-hidden="true">
          <div className={styles.chrome}>
            <span className={styles.search}>
              <SearchIcon className={styles.searchIcon} />
              <span className={styles.searchText}>Search skills</span>
            </span>
            <span className={styles.count}>12 skills</span>
          </div>

          <ul className={styles.rows}>
            {rows.map((row) => (
              <li key={row.name} className={styles.row}>
                <span className={styles.rowOwner}>{row.owner}</span>
                <span className={styles.rowName}>{row.name}</span>
                <span className={styles.rowSummary}>{row.summary}</span>
                <span className={styles.rowTags}>
                  {row.tags.map((tag) => (
                    <span key={tag} className={styles.rowTag}>
                      {tag}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
