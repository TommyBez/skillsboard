import { GitForkIcon, SearchIcon } from "lucide-react"

import styles from "@/components/landing/styles/flow.module.css"

/**
 * Three purpose-built micro-diagrams for the workflow chapter. Each one is
 * assembled from real product vocabulary (a pasted GitHub URL, the SkillDossier
 * card, the team search field, the four consumption routes) rather than stock
 * illustration, and each is decorative — the step copy carries the message, so
 * the whole visual is aria-hidden.
 *
 * All three are pure markup + CSS. They render in their finished, composed
 * state by default; `flow.module.css` only re-stages them when the shared
 * motion controller has armed the `flow` group, so no-JS and reduced-motion
 * viewers get the resting diagram with nothing hidden.
 */

/* 01 — a pasted GitHub URL resolving into a populated skill card. */
export function PasteResolveVisual() {
  return (
    <div className={styles.viz} aria-hidden="true">
      <p className={styles.vizLabel}>
        url <span className={styles.vizArrow}>{"->"}</span> skill
      </p>
      <div className={styles.vizBody}>
        <div className={styles.pasteField}>
          <span className={styles.pasteFlash} />
          <span className={styles.pasteUrl}>
            <span className={styles.pasteDim}>github.com/</span>
            anthropics/skills
          </span>
          <span className={styles.fieldKbd}>⌘V</span>
        </div>

        <span className={styles.pasteWire}>
          <span className={styles.pasteWireHead} />
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
    </div>
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
    <div className={styles.viz} aria-hidden="true">
      <p className={styles.vizLabel}>
        query <span className={styles.vizArrow}>{"->"}</span> match
      </p>
      <div className={styles.vizBody}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchQueryWrap}>
            <span className={styles.searchQuery}>pdf</span>
            <span className={styles.searchCaret} />
          </span>
          <span className={styles.fieldKbd}>⌘K</span>
        </div>

        <ul className={styles.resultList}>
          <li className={styles.resultRow} data-match="true">
            <span className={styles.resultName}>
              <span className={styles.resultMark}>pdf</span>-extraction
            </span>
            <span className={styles.resultRepo}>anthropics/skills</span>
          </li>
          {libraryRows.map((row) => (
            <li key={row.name} className={styles.resultRow} data-match="false">
              <span className={styles.resultName}>{row.name}</span>
              <span className={styles.resultRepo}>{row.repo}</span>
            </li>
          ))}
        </ul>

        <p className={styles.searchCount}>
          <span className={styles.countPrev}>24 skills</span>
          <span className={styles.countNow}>1 match / 24 skills</span>
        </p>
      </div>
    </div>
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
    <div className={styles.viz} aria-hidden="true">
      <p className={styles.vizLabel}>
        skill <span className={styles.vizArrow}>{"->"}</span> routes
      </p>
      <div className={styles.vizBody}>
        <p className={styles.fanNode}>
          <GitForkIcon className={styles.fanMark} aria-hidden="true" />
          pdf-extraction
        </p>
        <ul className={styles.fanList}>
          {routes.map((route) => (
            <li key={route.key} className={styles.fanRow}>
              <span className={styles.fanKey}>{route.key}</span>
              <span className={styles.fanVal}>{route.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
