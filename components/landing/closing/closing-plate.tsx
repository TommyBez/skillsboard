import type { CSSProperties } from "react"


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
  { name: "code-review", source: "acme", marked: true },
  { name: "pdf-extraction", source: "anthropics", marked: false },
  { name: "brand-voice", source: "acme", marked: false },
  { name: "sql-migrations", source: "drizzle-team", marked: false },
  { name: "release-notes", source: "vercel", marked: false },
] as const

const answer = entries.find((entry) => entry.marked) ?? entries[0]

export function ClosingPlate() {
  return (
    <div className="lp-closing-plate">
      <div className="lp-closing-plate-frame" aria-hidden="true">
        <div className="lp-closing-plate-bar">
          <span className="lp-closing-plate-label">Team library</span>
          <span className="flex min-w-0 items-center gap-[0.55rem]">
            <span className="lp-closing-plate-mark" data-legend="" />
            <span className="lp-closing-plate-label">Recommended</span>
          </span>
        </div>
        <span className="lp-closing-plate-edge" data-edge="head" />

        <ul className="lp-closing-plate-rows">
          {entries.map((entry, i) => (
            <li
              key={entry.name}
              className="lp-closing-plate-row"
              data-marked={entry.marked ? "" : undefined}
              style={{ "--i": i } as CSSProperties}
            >
              <span className="lp-closing-plate-mark" />
              <span className="lp-closing-plate-name">{entry.name}</span>
              <span className="lp-closing-plate-rule" />
              <span className="lp-closing-plate-source">{entry.source}</span>
            </li>
          ))}
        </ul>

        {/* The index closes on the entry it recommends — the heading's
            question, answered once and filed. Mirrors the bar above it
            exactly, so the sheet is bracketed by two rules of one weight. */}
        <span className="lp-closing-plate-edge" data-edge="foot" />
        <div className="lp-closing-plate-bar" data-foot="">
          <span className="lp-closing-plate-label">Answer</span>
          <span className="flex min-w-0 items-center gap-[0.55rem]">
            <span className="lp-closing-plate-mark" data-legend="" />
            <span className="lp-closing-plate-answer">{answer.name}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
