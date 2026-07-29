import type { CSSProperties } from "react"

import styles from "@/components/landing/styles/closing.module.css"

/**
 * The closing plate — the team library, written down and marked.
 *
 * The same example skills the hero scatters across the board, filed as a
 * compact index with one entry carrying the team's mark: the page's question
 * answered in the product's own vocabulary, which is what the copy beside it
 * says in words. Decorative, so the plate is hidden from assistive tech; its
 * static state is the finished index and the controller only adds the writing.
 */
const entries = [
  { index: "01", name: "code-review", marked: true },
  { index: "02", name: "pdf-extraction", marked: false },
  { index: "03", name: "brand-voice", marked: false },
  { index: "04", name: "sql-migrations", marked: false },
  { index: "05", name: "release-notes", marked: false },
] as const

export function ClosingPlate() {
  return (
    <div className={styles.plate}>
      <div
        className={styles.plateFrame}
        data-view-progress="closing"
        aria-hidden="true"
      >
        <div className={styles.plateHead}>
          <span className={styles.plateHeadLabel}>Team library</span>
          <span className={styles.plateLegend}>
            <span className={styles.plateMark} data-legend="" />
            <span className={styles.plateHeadLabel}>Recommended</span>
          </span>
        </div>
        <span className={styles.plateHeadRule} />

        <ul className={styles.plateRows}>
          {entries.map((entry, i) => (
            <li
              key={entry.index}
              className={styles.plateRow}
              data-marked={entry.marked ? "" : undefined}
              style={{ "--i": i } as CSSProperties}
            >
              <span className={styles.plateMark} />
              <span className={styles.plateIndex}>{entry.index}</span>
              <span className={styles.plateName}>{entry.name}</span>
              <span className={styles.plateRule} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
