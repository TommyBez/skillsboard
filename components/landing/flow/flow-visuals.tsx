import { GitForkIcon, LinkIcon, SearchIcon } from "lucide-react"

import styles from "@/components/landing/styles/flow.module.css"

/**
 * Three purpose-built micro-diagrams for the workflow chapter. Each one is
 * assembled from real product vocabulary (a pasted GitHub URL, the SkillDossier
 * card, the team search field, the four consumption routes) rather than stock
 * illustration, and each is decorative — the step copy carries the message, so
 * the whole visual is aria-hidden.
 *
 * Every column is built from the same three registers, and they share grid rows
 * with their neighbours, so the three diagrams line up register for register:
 *
 *   1. a captioned rule   (`URL -> SKILL` + hairline to the column's edge)
 *   2. the diagram body   (absorbs all the slack, so the three bottom out level)
 *   3. a key/value readout (a second captioned rule, closing the column)
 *
 * They also share two vertical axes inside the column: `--axis-mark` — the
 * centre of the leading glyph in each column's opening control, which is also
 * where the connectors hang — and `--row-pad`, where every row's text starts.
 *
 * All three are pure markup + CSS. They render in their finished, composed
 * state by default; `flow.module.css` only re-stages them when the shared
 * motion controller has armed the `flow` group, so no-JS and reduced-motion
 * viewers get the resting diagram with nothing hidden.
 */

/** A caption followed by a hairline that runs to the column's right edge. */
function VizLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className={styles.vizLabel}>
      <span className={styles.labelText}>{children}</span>
      <span className={styles.labelRule} />
    </p>
  )
}

/** The same object, closing the column: one measured fact about the diagram. */
function VizFoot({ label, value }: { label: string; value: string }) {
  return (
    <p className={`${styles.vizLabel} ${styles.vizFoot}`}>
      <span className={styles.labelText}>{label}</span>
      <span className={styles.labelRule} />
      <span className={styles.footVal}>{value}</span>
    </p>
  )
}

const Arrow = () => <span className={styles.vizArrow}>{"->"}</span>

/* 01 — a pasted GitHub URL resolving into a populated skill card. */
export function PasteResolveVisual() {
  return (
    <>
      <VizLabel>
        url <Arrow /> skill
      </VizLabel>
      <div className={styles.vizBody}>
        <div className={styles.pasteField}>
          <span className={styles.pasteFlash} />
          <LinkIcon className={styles.ctrlIcon} aria-hidden="true" />
          <span className={styles.pasteUrl}>
            <span className={styles.pasteDim}>github.com/</span>
            anthropics/skills
          </span>
        </div>

        <span className={styles.pasteLink}>
          <span className={styles.pasteWire}>
            <span className={styles.pasteWireHead} />
          </span>
          <span className={styles.pasteWireNote}>resolve</span>
        </span>

        <div className={styles.miniCard}>
          <div className={styles.miniBody}>
            <div className={styles.miniMeta}>
              <span className={styles.miniSource}>
                <GitForkIcon className={styles.miniFork} aria-hidden="true" />
                anthropics/skills
              </span>
              <span className={styles.miniStars}>8.4k stars</span>
            </div>
            <p className={styles.miniName}>pdf-extraction</p>
            <p className={styles.miniDesc}>
              Pull text, tables, and metadata from PDF documents.
            </p>
            <div className={styles.miniTags}>
              <span className={styles.miniTag}>documents</span>
              <span className={styles.miniTag}>parsing</span>
            </div>
          </div>
          <div className={styles.miniFoot}>
            <code className={styles.miniCmd}>
              npx skills add anthropics/skills --skill pdf-extraction
            </code>
          </div>
        </div>
      </div>
      <VizFoot label="kept" value="4 fields" />
    </>
  )
}

/* 02 — a query filtering the team library down to one match. */
const libraryRows = [
  { name: "code-review", repo: "acme/engineering" },
  { name: "brand-voice", repo: "acme/brand-kit" },
  { name: "sql-migrations", repo: "drizzle-team" },
  { name: "release-notes", repo: "vercel/skills" },
] as const

export function SearchFilterVisual() {
  return (
    <>
      <VizLabel>
        query <Arrow /> match
      </VizLabel>
      <div className={styles.vizBody}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.ctrlIcon} aria-hidden="true" />
          <span className={styles.searchQueryWrap}>
            <span className={styles.searchQuery}>pdf</span>
            <span className={styles.searchCaret} />
          </span>
        </div>

        <ul className={styles.resultList}>
          <li className={styles.resultRow} data-match="true">
            <span className={styles.resultName}>
              <span className={styles.resultMark}>pdf</span>-extraction
            </span>
            <span className={styles.resultRepo}>anthropics/skills</span>
          </li>
        </ul>

        <p className={`${styles.vizLabel} ${styles.resultCut}`}>
          <span className={styles.labelText}>filtered out</span>
          <span className={styles.labelRule} />
        </p>

        <ul className={`${styles.resultList} ${styles.resultRest}`}>
          {libraryRows.map((row) => (
            <li key={row.name} className={styles.resultRow} data-match="false">
              <span className={styles.resultName}>{row.name}</span>
              <span className={styles.resultRepo}>{row.repo}</span>
            </li>
          ))}
        </ul>
      </div>
      <VizFoot label="matched" value="1 / 24" />
    </>
  )
}

/* 03 — one saved skill branching into the four ways out of Skills Board. */
const routes = [
  { key: "source", value: "anthropics/skills" },
  { key: "install", value: "npx skills add" },
  { key: "zip", value: "skill.zip · 12 kB" },
  { key: "mcp", value: "tools/get_skill" },
] as const

export function RouteFanVisual() {
  return (
    <>
      <VizLabel>
        skill <Arrow /> routes
      </VizLabel>
      <div className={styles.vizBody}>
        <p className={styles.fanNode}>
          <GitForkIcon className={styles.ctrlIcon} aria-hidden="true" />
          pdf-extraction
        </p>
        <span className={styles.fanStem} />
        <ul className={styles.fanList}>
          {routes.map((route) => (
            <li key={route.key} className={styles.fanRow}>
              <span className={styles.fanKey}>{route.key}</span>
              <span className={styles.fanVal}>{route.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <VizFoot label="routes" value="4 open" />
    </>
  )
}
