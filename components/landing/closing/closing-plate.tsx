import type { CSSProperties } from "react"

import styles from "@/components/landing/styles/closing.module.css"

/**
 * The closing plate — the team library, written down and marked.
 *
 * The same example skills the hero scatters across the board, filed as a
 * compact index that opens on a legend and closes on the answer: the page's
 * question resolved in the product's own vocabulary, which is what the copy
 * beside it says in words. Decorative, so the plate is hidden from assistive
 * tech; its static state is the finished index and the controller only adds
 * the writing.
 */
const entries = [
  { index: "01", name: "code-review", source: "acme", marked: true },
  { index: "02", name: "pdf-extraction", source: "anthropics", marked: false },
  { index: "03", name: "brand-voice", source: "acme", marked: false },
  { index: "04", name: "sql-migrations", source: "drizzle-team", marked: false },
  { index: "05", name: "release-notes", source: "vercel", marked: false },
] as const

const answer = entries.find((entry) => entry.marked) ?? entries[0]

export function ClosingPlate() {
  return (
    <div className={styles.plate}>
      <div className={styles.plateFrame} aria-hidden="true">
        <div className={styles.plateBar}>
          <span className={styles.plateLabel}>Team library</span>
          <span className={styles.plateLegend}>
            <span className={styles.plateMark} data-legend="" />
            <span className={styles.plateLabel}>Recommended</span>
          </span>
        </div>
        <span className={styles.plateEdge} data-edge="head" />

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
              <span className={styles.plateSource}>{entry.source}</span>
            </li>
          ))}
        </ul>

        {/* The index closes on the entry it recommends — the heading's
            question, answered once and filed. Mirrors the bar above it
            exactly, so the sheet is bracketed by two rules of one weight. */}
        <span className={styles.plateEdge} data-edge="foot" />
        <div className={styles.plateBar} data-foot="">
          <span className={styles.plateLabel}>Answer</span>
          <span className={styles.plateLegend}>
            <span className={styles.plateMark} data-legend="" />
            <span className={styles.plateAnswer}>{answer.name}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
